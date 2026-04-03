import mongoose from "mongoose";
export const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to DB successfully");
  } catch (error) {
    console.log(error.message);
    console.log("Failed to connect to DB");
  }
};
