import express, { Request, Response } from 'express';
import cors from 'cors';
import { config } from './config/config';
import { connectDB } from './config/db';
import { seedDatabase } from './seed/seedData';
import { apiLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';

// Import Routes
import authRoutes from './routes/authRoutes';
import projectRoutes from './routes/projectRoutes';
import monitoringRoutes from './routes/monitoringRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import aiRoutes from './routes/aiRoutes';
import issueRoutes from './routes/issueRoutes';
import milestoneRoutes from './routes/milestoneRoutes';
import financialRoutes from './routes/financialRoutes';
import reportRoutes from './routes/reportRoutes';
import userRoutes from './routes/userRoutes';

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // Allow frontend dev & prod
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting in non-test env
if (process.env.NODE_ENV !== 'test') {
  app.use('/api', apiLimiter);
}

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    service: 'DevFlow AI Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Mount API Modules
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/milestones', milestoneRoutes);
app.use('/api/financials', financialRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);

// Centralized error handling
app.use(errorHandler);

// Server initialization
const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();

    app.listen(config.port, () => {
      console.log(`=======================================================`);
      console.log(`🚀 DevFlow AI Backend Running on Port ${config.port}`);
      console.log(`📡 Health Check: http://localhost:${config.port}/health`);
      console.log(`⚡ AI-Powered Software Development & Project Intelligence Platform Active`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Failed to start DevFlow AI server:', error);
    process.exit(1);
  }
};

startServer();

export default app;

