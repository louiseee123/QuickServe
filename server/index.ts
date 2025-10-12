
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './api';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- Middleware ---
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- API Routes (for uploads, etc.) ---
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
