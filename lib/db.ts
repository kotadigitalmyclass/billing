import mongoose from "mongoose";

let isReady: number | null = null;

export const connectDB = async (): Promise<void> => {
  try {
    if (isReady === 1) {
      console.log("DB already connected");
      return;
    }

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    const connection = await mongoose.connect(process.env.MONGODB_URI);

    isReady = connection.connections[0].readyState; 
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
