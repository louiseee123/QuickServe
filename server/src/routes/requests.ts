
import { Router } from 'express';
import { databases } from '../../appwrite';
import { DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID } from '../db';

const router = Router();

// GET /all
router.get('/all', async (req, res) => {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            DOCUMENT_REQUESTS_COLLECTION_ID
        );
        res.send(response.documents);
    } catch (error) {
        console.error("Error fetching all requests:", error);
        res.status(500).send({ error: 'Failed to fetch all requests' });
    }
});

export default router;
