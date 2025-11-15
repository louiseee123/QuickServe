
import express from 'express';
import cors from 'cors';
import documentsRouter from './routes/documents';
import requestsRouter from './routes/requests';
import uploadsRouter from './routes/uploads';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json()); // Add this line

app.use('/api/documents', documentsRouter);
app.use('/api/requests', requestsRouter);
app.use('/api/uploads', uploadsRouter);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
