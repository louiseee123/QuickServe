
import { Router, Request, Response } from 'express';
import { databases } from '../../appwrite';
import { ID } from 'node-appwrite';
import { insertRequestSchema } from '@shared/schema';

const router = Router();

const DATABASE_ID = '68e64920003173cabdb1';
const REQUESTS_COLLECTION_ID = 'requests';

// Create a new document request
router.post('/', async (req: Request, res: Response) => {
    try {
        const validatedRequest = insertRequestSchema.parse(req.body);

        const newRequestData = {
            ...validatedRequest,
            requestedAt: new Date().toISOString(),
            document_status: 'pending_approval',
            payment_status: 'unpaid',
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

export default router;
