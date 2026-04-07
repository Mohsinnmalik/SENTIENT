import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI is not defined in .env.local");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

let cached: MongooseCache = (global as any).__mongoose_cache;

if (!cached) {
  cached = (global as any).__mongoose_cache = { conn: null, promise: null };
}

async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,   // Fail fast if Atlas is unreachable
      socketTimeoutMS: 45000,
    };

    console.log("[DB] Connecting to MongoDB Atlas...");
    cached.promise = mongoose.connect(MONGODB_URI!, opts);
  }

  try {
    cached.conn = await cached.promise;
    console.log("[DB] ✅ Connected to MongoDB Atlas");
  } catch (e: any) {
    cached.promise = null;
    console.error("[DB] ❌ Connection failed:", e.message);
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
