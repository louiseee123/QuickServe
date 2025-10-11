
import { Router, Request, Response } from 'express';
import { databases, storage } from './appwrite';
import { ID, Query, InputFile } from 'node-appwrite';
import { insertRequestSchema } from '@shared/schema';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

const DATABASE_ID = '68e64920003173cabdb1';
const REQUESTS_COLLECTION_ID = 'requests';
const RECEIPTS_BUCKET_ID = 'receipts';

// Create a new document request
router.post('/request', async (req: Request, res: Response) => {
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

// Get all document requests for admin
router.get('/requests/all', async (req: Request, res: Response) => {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            REQUESTS_COLLECTION_ID,
            [Query.orderDesc('$createdAt')]
        );
        res.status(200).send(response.documents);
    } catch (error: any) {
        res.status(400).send({ error: error.message });
    }
});

// Get document requests for a user
router.get('/requests', async (req: Request, res: Response) => {
    const userId = req.query.userId as string;
    if (!userId) {
        return res.status(400).send({ error: 'userId is required' });
    }
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            REQUESTS_COLLECTION_ID,
            [Query.equal('userId', userId), Query.orderDesc('$createdAt')]
        );
        res.status(200).send(response.documents);
    } catch (error: any) {
        res.status(400).send({ error: error.message });
    }
});

// Get a single document request by ID
router.get('/request/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const document = await databases.getDocument(
            DATABASE_ID,
            REQUESTS_COLLECTION_ID,
            id
        );
        const { $id, ...rest } = document;
        res.status(200).send({ id: $id, ...rest });
    } catch (error: any) {
        if (error.code === 404) {
            res.status(404).send({ error: 'Request not found' });
        } else {
            res.status(500).send({ error: 'message' });
        }
    }
});

// Update request status
router.patch('/request/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
        return res.status(400).send({ error: 'status is required' });
    }
    try {
        await databases.updateDocument(
            DATABASE_ID,
            REQUESTS_COLLECTION_ID,
            id,
            { document_status: status }
        );
        res.status(200).send({ message: 'Request status updated successfully' });
    } catch (error: any) {
        res.status(400).send({ error: error.message });
    }
});

// Upload a payment receipt
router.post('/request/:id/upload-receipt', upload.single('receipt'), async (req, res) => {
    const { id } = req.params;

    if (!req.file) {
        return res.status(400).send({ error: 'No receipt file uploaded.' });
    }

    try {
        const file = await storage.createFile(
            RECEIPTS_BUCKET_ID,
            ID.unique(),
            InputFile.fromBuffer(req.file.buffer, req.file.originalname)
        );

        await databases.updateDocument(
            DATABASE_ID,
            REQUESTS_COLLECTION_ID,
            id,
            { 
                payment_status: 'pending_verification',
                receiptId: file.$id 
            }
        );

        res.status(200).send({ message: 'Receipt uploaded successfully. Awaiting verification.' });

    } catch (error: any) {
        console.error("Error uploading receipt:", error);
        res.status(500).send({ error: 'Failed to upload receipt.' });
    }
});

export default router;
