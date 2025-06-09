// src/app.ts
import express, { Express } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import apiRoutes from './routes';
import { setupSwaggerDocs } from './config/swagger';

dotenv.config();

const app: Express = express();

// Enable CORS
app.use(cors({
  origin: '*', // Update to your frontend URL in production, e.g., 'http://localhost:5173'
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Allow credentials if needed for other features
}));

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

// Swagger Docs
setupSwaggerDocs(app);

// Routes
app.use('/api', apiRoutes);

export default app;