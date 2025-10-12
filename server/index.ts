import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import apiRoutes from './api';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- Middleware ---
app.use(cors({
  origin: 'https://quickserve.appwrite.network',
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- API Routes ---
// API routes must be registered before the frontend routes.
app.use('/api', apiRoutes);


// --- Client Serving ---
// In production, the server serves the built client files.
const clientDistPath = path.join(__dirname, '../client');

// Serve static assets from the client build directory.
app.use(express.static(clientDistPath));

// For any other GET request, send the client's index.html file.
// This is the catch-all for the single-page application.
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});


// --- Server Start ---
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
