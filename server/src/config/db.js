import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

let isMemoryServer = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nwt_info';

  try {
    // Attempt connecting to the configured MongoDB URI with a short timeout
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.warn(`[MongoDB] Could not connect to primary URI (${uri}): ${err.message}`);

    // If in development or test, fall back to mongodb-memory-server seamlessly
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('[MongoDB] Starting embedded MongoDB Memory Server for local development...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create({
          binary: {
            version: process.env.MONGOMS_VERSION || '7.0.14',
          },
        });
        const memoryUri = mongod.getUri();
        const conn = await mongoose.connect(memoryUri);
        isMemoryServer = true;
        console.log(`[MongoDB] Connected to MongoDB Memory Server: ${memoryUri}`);
        return conn;
      } catch (memErr) {
        console.error(`[MongoDB] Failed to start embedded Memory Server: ${memErr.message}`);
        throw memErr;
      }
    } else {
      throw err;
    }
  }
};

export const getDbStatus = () => ({
  isConnected: mongoose.connection.readyState === 1,
  isMemoryServer,
  host: mongoose.connection.host || 'none',
  name: mongoose.connection.name || 'none',
});
