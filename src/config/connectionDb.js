import mongoose from "mongoose";

const connectionDB = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGO_URL);
    console.log("connection db successfully");
  } catch (error) {
    console.log("something went wrong with connection db", error);
    process.exit(1);
  }
};

export default connectionDB;
