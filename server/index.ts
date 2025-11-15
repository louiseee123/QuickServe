
import express from 'express';
import cors from 'cors';
import documentsRouter from './src/routes/documents.js';
import requestsRouter from './src/routes/requests.js';
import uploadsRouter from './src/routes/uploads.js';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use('/api/documents', documentsRouter);
app.use('/api/requests', requestsRouter);
app.use('/api/uploads', uploadsRouter);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
