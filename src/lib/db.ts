import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  const error = "❌ FATAL: MONGODB_URI is not defined in .env.local";
  console.error(error);
  throw new Error(error);
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose!;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (cached.conn && mongoose.connection.readyState !== 1) {
    console.warn("[DB] ⚠️ Stale connection detected. Resetting...");
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
      maxPoolSize: 10,
      minPoolSize: 2,
      heartbeatFrequencyMS: 30000,
    };

    console.log("[DB] ⚡ INITIALIZING: Connecting to MongoDB Atlas...");
    cached.promise = mongoose.connect(MONGODB_URI!, opts).then(async (m) => {
      console.log("[DB] ✅ SUCCESS: Connected to MongoDB Atlas");
      try {
        await m.connection.db?.admin().command({ ping: 1 });
        console.log("[DB] 💓 Heartbeat: Atlas responding OK");
      } catch {
        console.warn("[DB] ⚠️ Initial heartbeat ping failed.");
      }
      return m;
    }).catch((err) => {
      console.error("[DB] ❌ FAILURE: Connection could not be established:", err.message);
      cached.promise = null;
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
}

export default dbConnect;
