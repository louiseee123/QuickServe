
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import apiRoutes from './api'; // Corrected import

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', apiRoutes);

// The root of the project is one level up from the server directory
const projectRoot = path.join(__dirname, '..');

// Serve static files from the 'dist' directory
app.use(express.static(path.join(projectRoot, 'dist')));

// For any other request, serve the index.html file from the 'dist' directory
app.get('*', (req, res) => {
  res.sendFile(path.join(projectRoot, 'dist', 'index.html'));
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

