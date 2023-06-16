import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  userName: {
    type: String,
    require: [true, "please provide a username"],
    unique: true,
  },
  password: {
    type: String,
    require: [true, "please provide a password"],
  },
});

export const userModel = mongoose.model("User", userSchema);
