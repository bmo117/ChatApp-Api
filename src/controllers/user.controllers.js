import asyncHandler from "express-async-handler";
import { encryptPassword, comparePassword } from "../helper/hashGenerator.js";
import { userModel } from "../model/userSchema.js";
import jwt from "jsonwebtoken";
import { messageModel } from "../model/messageSchema.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { userName, password } = req.body;
  if (!userName || !password) {
    res.status(400);
    throw new Error("userName and password are required");
  }
  const userAvailable = await userModel.findOne({ userName });
  if (userAvailable) {
    res.status(400);
    throw new Error("user already exists");
  }
  const hashPassword = await encryptPassword(password);
  const createdUser = await userModel.create({
    userName: userName,
    password: hashPassword,
  });
  const token = await jwt.sign(
    { userName: userName, userId: createdUser._id },
    process.env.JWT_SECRET,
    {}
  );
  if (token) {
    res
      .cookie("token", token, { sameSite: "none", secure: true })
      .status(201)
      .json({
        id: createdUser._id,
      });
  } else {
    res.status(400);
    throw new Error("something went wrong with the token");
  }
});

export const getProfile = asyncHandler(async (req, res) => {
  const token = req.cookies?.token;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, {}, (err, userData) => {
      if (err) throw err;
      res.json(userData);
    });
  } else {
    res.status(401).json("no token");
  }
});

export const login = asyncHandler(async (req, res) => {
  const { userName, password } = req.body;
  if (!userName || !password) {
    res.status(401).json("userName and password are required");
  }
  const userExists = await userModel.findOne({ userName });
  if (userExists) {
    const correctPassword = await comparePassword(
      password,
      userExists.password
    );
    if (correctPassword) {
      jwt.sign(
        { userId: userExists._id, userName },
        process.env.JWT_SECRET,
        {},
        (err, token) => {
          res.cookie("token", token, { sameSite: "none", secure: true }).json({
            id: userExists._id,
          });
        }
      );
    }
  } else {
    res.status(401).json("userName or password are invalid");
  }
});

export const getMessages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const token = req.cookies?.token;
  if (token) {
    const userData = await jwt.verify(token, process.env.JWT_SECRET, {});
    const ourUserId = userData.userId;
    const messages = await messageModel
      .find({
        sender: { $in: [id, ourUserId] },
        recipient: { $in: [id, ourUserId] },
      })
      .sort({ createdAt: 1 });
    res.json(messages);
  }
});

export const getPeople = asyncHandler(async (req, res) => {
  const users = await userModel.find({}, { _id: 1, userName: 1 });
  res.json(users);
});

export const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "", { sameSite: "none", secure: true }).json("ok");
});
