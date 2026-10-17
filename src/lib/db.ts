import "server-only";
import mongoose from "mongoose";

// Reuse one connection across hot reloads in dev and across invocations on a warm serverless instance.
const g = globalThis as unknown as { _mongoose?: Promise<typeof mongoose> };

export function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  if (!g._mongoose) {
    g._mongoose = mongoose.connect(uri, { bufferCommands: false, maxPoolSize: 10 }).catch((err) => {
      g._mongoose = undefined;
      throw err;
    });
  }
  return g._mongoose;
}
