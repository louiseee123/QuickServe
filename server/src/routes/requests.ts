
import { Router, Request, Response } from 'express';
import { databases } from '../../appwrite';
import { ID, Query } from 'node-appwrite';
import { insertRequestSchema } from '@shared/schema';

const router = Router();

const DATABASE_ID = '68e64920003173cabdb1';
const REQUESTS_COLLECTION_ID = 'requests';

// GET /pending-approvals
router.get('/pending-approvals', async (req: Request, res: Response) => {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            REQUESTS_COLLECTION_ID,
            [Query.equal('status', 'pending_approval')]
        );
        res.send(response.documents);
    } catch (error: any) {
        console.error("Error fetching pending approval requests:", error);
        res.status(500).send({ error: 'Failed to fetch pending approval requests' });
    }
});

// GET /
router.get('/', async (req: Request, res: Response) => {
    try {
        const { userId } = req.query;
        const queries = [];
        if (userId) {
            queries.push(Query.equal('userId', userId as string));
        }

        const response = await databases.listDocuments(
            DATABASE_ID,
            REQUESTS_COLLECTION_ID,
            queries
        );
        res.send(response.documents);
    } catch (error: any) {
        console.error("Error fetching requests:", error);
        res.status(500).send({ error: 'Failed to fetch requests' });
    }
});

// GET /:id
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const document = await databases.getDocument(
            DATABASE_ID,
            REQUESTS_COLLECTION_ID,
            id
        );
        res.send(document);
    } catch (error: any) {
        console.error(`Error fetching request ${req.params.id}:`, error);
        res.status(500).send({ error: `Failed to fetch request ${req.params.id}` });
    }
});

// POST /
router.post('/', async (req: Request, res: Response) => {
    try {
        const validatedRequest = insertRequestSchema.parse(req.body);

        const newRequestData = {
            ...validatedRequest,
            userId: req.body.userId, // Make sure userId is passed from the frontend
            status: 'pending_approval',
            createdAt: new Date().toISOString(),
        };
        
        const document = await databases.createDocument(
            DATABASE_ID,
            REQUESTS_COLLECTION_ID,
            ID.unique(),
            newRequestData
        );
        
        res.status(201).send(document);

    } catch (error: any) {
        if (error.errors) {
            return res.status(400).send({ error: error.errors });
        }
        console.error("Error creating request:", error);
        res.status(400).send({ error: error.message });
    }
});

// PUT /:id/status
router.put('/:id/status', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).send({ error: 'Status is required' });
        }
        
        const document = await databases.updateDocument(
            DATABASE_ID,
            REQUESTS_COLLECTION_ID,
            id,
            { status }
        );
        
        res.send(document);

    } catch (error: any) {
        console.error(`Error updating status for request ${req.params.id}:`, error);
        res.status(500).send({ error: `Failed to update status for request ${req.params.id}` });
    }
});


export default router;
