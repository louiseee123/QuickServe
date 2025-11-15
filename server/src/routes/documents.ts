
import { Router } from 'express';
import { databases } from '../../appwrite';
import { DATABASE_ID, DOCUMENTS_COLLECTION_ID } from '../db';
import { ID } from 'node-appwrite';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      DOCUMENTS_COLLECTION_ID
    );
    res.json(response.documents.map(doc => ({
      id: doc.$id,
      name: doc.name,
      price: doc.price,
      processingTimeDays: doc.processingTimeDays
    })));
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/', async (req, res) => {
    try {
        const { name, price, processingTimeDays } = req.body;
        const response = await databases.createDocument(
            DATABASE_ID,
            DOCUMENTS_COLLECTION_ID,
            ID.unique(),
            {
                name,
                price,
                processingTimeDays,
            }
        );
        res.status(201).json(response);
    } catch (error) {
        console.error('Error creating document:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, processingTimeDays } = req.body;
        const response = await databases.updateDocument(
            DATABASE_ID,
            DOCUMENTS_COLLECTION_ID,
            id,
            {
                name,
                price,
                processingTimeDays,
            }
        );
        res.json(response);
    } catch (error) {
        console.error('Error updating document:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await databases.deleteDocument(
            DATABASE_ID,
            DOCUMENTS_COLLECTION_ID,
            id
        );
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).send('Internal Server Error');
    }
});

export default router;
