import mongoose from "mongoose";

const messageSchema = mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: String,
  },
  { timestamps: true }
);

export const messageModel = mongoose.model("Message", messageSchema);
