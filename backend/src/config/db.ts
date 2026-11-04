import mongoose from 'mongoose';
import { config } from './config';
import { setMemoryMode } from './memoryStore';

export const connectDB = async (): Promise<string> => {
  try {
    // Attempt connecting to the configured MongoDB URI
    await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[Database] Connected to external MongoDB at ${config.mongodbUri}`);
    setMemoryMode(false);
    return config.mongodbUri;
  } catch (error) {
    console.warn(`[Database] External MongoDB not active at ${config.mongodbUri}.`);
    console.log(`[Database] 🚀 Initializing high-speed embedded in-memory database engine for InfraWatch AI.`);
    setMemoryMode(true);
    return 'in-memory://infrawatch';
  }
};

export const closeDB = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }
};
