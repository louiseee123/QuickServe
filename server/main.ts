
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { Client, Account } from 'node-appwrite';
import authRoutes from './src/routes/auth';
import documentRoutes from './src/routes/documents';
import uploadRoutes from './src/routes/uploads';

export default async ({ req, res, log, error }) => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const account = new Account(client);

  app.use('/auth', authRoutes(account));
  app.use('/documents', documentRoutes);
  app.use('/uploads', uploadRoutes);
  
  // Let Express handle the request
  app(req, res);
};
