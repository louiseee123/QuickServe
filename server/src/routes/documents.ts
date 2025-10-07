import { Router } from 'express';
import { db } from '../../firebase';
import { COLLECTIONS } from '../constants';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const snapshot = await db.collection(COLLECTIONS.DOCUMENTS).get();
    const documents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;
