
import { Router } from 'express';
import documentsRouter from './src/routes/documents';
import requestsRouter from './src/routes/requests';

const router = Router();

router.use('/documents', documentsRouter);
router.use('/request', requestsRouter);

export default router;
