import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import apiRoutes from './api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', apiRoutes);

// Serve static files from the 'client/dist/client' directory
app.use(express.static(path.join(__dirname, '../client/dist/client')));

// For any other request, serve the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/client', 'index.html'));
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
