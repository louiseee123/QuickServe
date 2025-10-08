import { Router } from 'express';
import { databases } from '../../appwrite';

const router = Router();

const DATABASE_ID = '68e64920003173cabdb1';
const DOCUMENTS_COLLECTION_ID = 'documents';

router.get('/', async (_req, res) => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      DOCUMENTS_COLLECTION_ID
    );
    res.json(response.documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;
