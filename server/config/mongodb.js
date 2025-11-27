import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on('connected', () => {
      console.log("MongoDB connected successfully");
    });

    mongoose.connection.on('error', (err) => {
      console.error("MongoDB connection error:", err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn("MongoDB disconnected");
    });

    await mongoose.connect(`${process.env.MONGODB_URI}/mern-auth`, {
      serverSelectionTimeoutMS: 5000, // Avoids long hang times
    });
  } catch (error) {
    console.error("Could not connect to MongoDB:", error.message);
  }
};

export default connectDB;
