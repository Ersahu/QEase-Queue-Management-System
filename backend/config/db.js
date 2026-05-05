const path = require('path');
// Ensure backend/.env is loaded when this module is required from any cwd (e.g. seed, tests).
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');

/**
 * Database connection configuration
 * Handles connection events and error management
 */
const connectDB = async () => {
  const uri = String(process.env.MONGODB_URI || '').trim();
  if (!uri) {
    const msg =
      'MONGODB_URI is not set. Create backend/.env (copy from .env.example) and set MONGODB_URI to your MongoDB Atlas connection string.';
    console.error(msg);
    throw new Error(msg);
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10_000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    process.once('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
