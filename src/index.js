import express from "express";
import { config } from "dotenv";
import userRoutes from "../src/routes/user.routes.js";
import cors from "cors";
import connectionDB from "./config/connectionDb.js";
import errorHandler from "./middleware/errorHandler.js";
import cookieParser from "cookie-parser";
import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { messageModel } from "./model/messageSchema.js";
config();
connectionDB();
const app = express();
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/api/users", userRoutes);
app.use(errorHandler);
const PORT = process.env.PORT;

const server = app.listen(PORT, () =>
  console.log(`server listening on ${PORT}`)
);

const wss = new WebSocketServer({ server });

wss.on("connection", (connection, req) => {
  function notifyAboutOnlinePeople() {
    [...wss.clients].forEach((client) => {
      client.send(
        JSON.stringify({
          online: [...wss.clients].map((c) => ({
            userId: c.userId,
            userName: c.userName,
          })),
        })
      );
    });
  }

  connection.isAlive = true;

  connection.timer = setInterval(() => {
    connection.ping();
    connection.deathTimer = setTimeout(() => {
      connection.isAlive = false;
      clearInterval(connection.timer);
      connection.terminate();
      notifyAboutOnlinePeople();
    }, 1000);
  }, 5000);

  connection.on("pong", () => {
    clearTimeout(connection.deathTimer);
  });
  // reading username and userId from cookie from this connection
  const cookies = req.headers.cookie;
  const tokenString = cookies
    .split(";")
    .find((str) => str.startsWith("token="));
  if (tokenString) {
    const token = tokenString.split("=")[1];
    if (token) {
      jwt.verify(token, process.env.JWT_SECRET, {}, (err, userData) => {
        if (err) throw err;
        const { userId, userName } = userData;
        connection.userId = userId;
        connection.userName = userName;
      });
    }
  }

  connection.on("message", async (message) => {
    const messageData = JSON.parse(message.toString());
    const { recipient, text } = messageData;
    if (recipient && text) {
      const messageDocs = await messageModel.create({
        sender: connection.userId,
        recipient,
        text,
      });
      [...wss.clients]
        .filter((client) => client.userId === recipient)
        .forEach((client) =>
          client.send(
            JSON.stringify({
              text,
              sender: connection.userId,
              recipient,
              _id: messageDocs._id,
            })
          )
        );
    }
  });

  // notify  who is online
  notifyAboutOnlinePeople();
});
