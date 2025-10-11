
import { Router } from 'express';
import { db } from '../db';
import { documents } from '../../../shared/schema';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const allDocuments = await db.select().from(documents);
    res.json(allDocuments);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;
