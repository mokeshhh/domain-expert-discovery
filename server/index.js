import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import expertRoutes from './routes/experts.js';
import domainsRoutes from './routes/domains.js';
import authRoutes from './routes/auth.js';
import chatRoute from './routes/chat.js'; // Your chat logic as a separate route file

// __dirname replacement in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware setup
app.use(cors());
app.use(express.json());

// Serve React static files
app.use(express.static(path.join(__dirname, '../client/dist')));

// API route mounting
app.use('/api/auth', authRoutes);
app.use('/api/experts', expertRoutes);
app.use('/api/domains', domainsRoutes);
app.use('/api/chat', chatRoute);  // Fireworks chat API integration here

// Root test route
app.get('/', (req, res) => {
  res.send('API is running');
});

// Catch-all to serve React app for client-side routes
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  res.status(500).json({ message: 'Server Error' });
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Successfully connected to MongoDB');

  const server = app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });

  const shutdown = async () => {
    console.log('Closing MongoDB connection');
    await mongoose.connection.close();
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
