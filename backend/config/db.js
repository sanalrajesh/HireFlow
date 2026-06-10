const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hireflow';

  // Connection event listeners for logging and monitoring status
  mongoose.connection.on('connected', () => {
    console.log(`Mongoose default connection open to host: ${mongoose.connection.host}`);
  });

  mongoose.connection.on('error', (err) => {
    console.error(`Mongoose default connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('Mongoose default connection disconnected. Attempting to reconnect...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('Mongoose default connection reconnected successfully.');
  });

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Keep trying to connect for 5 seconds before failing
      socketTimeoutMS: 45000,         // Close sockets after 45 seconds of inactivity
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Initial MongoDB Connection Error: ${error.message}`);
    // Do not crash the application in development, let auto-reconnect handle it
    // but log the initial failure.
  }
};

module.exports = connectDB;
