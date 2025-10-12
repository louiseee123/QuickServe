import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import apiRoutes from './api';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- CORS Configuration ---
const corsOptions = {
  origin: 'https://quickserve.appwrite.network',
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// --- Middleware ---
// First, handle preflight requests for all routes
app.options('*', cors(corsOptions));

// Then, use CORS for all other requests
app.use(cors(corsOptions));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- API Routes ---
app.use('/api', apiRoutes);

// --- Client Serving ---
const clientDistPath = path.join(__dirname, '../client');
app.use(express.static(clientDistPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// --- Server Start ---
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
