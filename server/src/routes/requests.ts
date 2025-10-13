
import { Router } from 'express';
import { databases } from '../../appwrite';
import { DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID } from '../db';
import { Query } from 'node-appwrite';

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

// GET /:id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await databases.listDocuments(
            DATABASE_ID,
            DOCUMENT_REQUESTS_COLLECTION_ID,
            [Query.equal('$id', id)]
        );
        if (response.documents.length === 0) {
            return res.status(404).send({ error: 'Request not found' });
        }
        res.send(response.documents[0]);
    } catch (error) {
        console.error(`Error fetching request ${req.params.id}:`, error);
        res.status(500).send({ error: 'Failed to fetch request' });
    }
});

export default router;
