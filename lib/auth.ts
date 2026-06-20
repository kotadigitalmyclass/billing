import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db(); 

export const auth = betterAuth({
  secret: process.env.JWT_SECRET || process.env.BETTER_AUTH_SECRET,
  database: mongodbAdapter(db, {
    client, 
  }),
  emailAndPassword: {
    enabled: true,
  },
});
