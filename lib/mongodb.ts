import mongoose, { type ConnectOptions, type Mongoose } from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable.")
}

type MongooseCache = {
  conn: Mongoose | null
  promise: Promise<Mongoose> | null
}

declare global {
  // Keep cache on the global object so hot-reloads don't create extra connections in development.
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
}

if (!global.mongooseCache) {
  global.mongooseCache = cached
}

export async function connectToDatabase(): Promise<Mongoose> {
  // Reuse an existing connection if one is already established.
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const options: ConnectOptions = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI, options).then((mongooseInstance) => {
      return mongooseInstance
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (error) {
    // Reset promise so future retries can attempt a fresh connection.
    cached.promise = null
    throw error
  }

  return cached.conn
}

export default connectToDatabase
