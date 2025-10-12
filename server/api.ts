
import { Router, Request, Response } from 'express';
import { storage } from './appwrite';
import { ID, InputFile } from 'node-appwrite';
import multer from 'multer';
import requestsRouter from './src/routes/requests';
import { DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID as REQUESTS_ID } from './src/db';
import { getAvailableDocuments } from './src/db';

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

const RECEIPTS_BUCKET_ID = 'receipts';

// Delegate all /requests routes to the dedicated router
router.use('/requests', requestsRouter);

// Get all available documents
router.get('/documents', async (req: Request, res: Response) => {
    try {
        const documents = await getAvailableDocuments();
        res.status(200).send(documents);
    } catch (error: any) {
        res.status(400).send({ error: error.message });
    }
});

// Upload a payment receipt
router.post('/requests/:id/upload-receipt', upload.single('receipt'), async (req, res) => {
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
            REQUESTS_ID,
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
