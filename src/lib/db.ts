import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

// Production Check: Ensure URI is provided
if (!MONGODB_URI) {
  const error = "❌ FATAL: MONGODB_URI is not defined in .env.local";
  console.error(error);
  throw new Error(error);
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
let cached: MongooseCache = (global as any).__mongoose_cache;

if (!cached) {
  cached = (global as any).__mongoose_cache = { conn: null, promise: null };
}

async function dbConnect(): Promise<typeof mongoose> {
  // If connection is already established, return it
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection promise is in progress, wait for it
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, some modern systems have trouble with IPv6 lookups for Atlas
    };

    console.log("[DB] ⚡ INITIALIZING: Connecting to MongoDB Atlas...");
    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((m) => {
      console.log("[DB] ✅ SUCCESS: Connected to MongoDB Atlas");
      return m;
    }).catch((err) => {
      console.error("[DB] ❌ FAILURE: Connection could not be established:", err.message);
      cached.promise = null; // Reset on failure
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e: any) {
    cached.promise = null;
    throw e;
  }
}

export default dbConnect;
