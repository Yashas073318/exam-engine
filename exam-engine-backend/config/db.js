const mongoose = require('mongoose');

/**
 * Connect to MongoDB.
 * Replica set is required for ACID multi-document transactions.
 * For local dev:  mongod --replSet rs0
 * For Atlas:      connection string already supports transactions.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Mongoose 8 no longer needs deprecated options
    });
    console.log(`✅  MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌  MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

/**
 * Helper: create a Mongoose client session for ACID transactions.
 * Usage:
 *   const session = await startSession();
 *   session.startTransaction();
 *   try { ... await session.commitTransaction(); }
 *   catch { await session.abortTransaction(); }
 *   finally { session.endSession(); }
 */
const startSession = () => mongoose.startSession();

module.exports = { connectDB, startSession };
