
import { Router } from 'express';
import multer from 'multer';
import { storage, databases } from '@/appwrite';
import { ID } from 'node-appwrite';

const router = Router();
// We'll store the files in memory for now and let multer handle the parsing
const upload = multer({ storage: multer.memoryStorage() });

const REQUESTS_COLLECTION_ID = 'requests';
const DATABASE_ID = '68e64920003173cabdb1';

router.post('/upload-receipt/:requestId', upload.single('receipt'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const { requestId } = req.params;

  try {
    // 1. Upload the file to Appwrite Storage
    const file = await storage.createFile(
        process.env.APPWRITE_RECEIPTS_BUCKET_ID!,
        ID.unique(),
        req.file.buffer
    );

    // 2. Update the request document with the receipt ID
    await databases.updateDocument(
        DATABASE_ID,
        REQUESTS_COLLECTION_ID,
        requestId,
        {
            payment_status: 'pending_verification',
            receiptId: file.$id,
        }
    );

    res.status(200).json({ message: 'Receipt uploaded successfully.' });

  } catch (error) {
    console.error('Error uploading receipt:', error);
    res.status(500).json({ message: 'Failed to upload receipt.' });
  }
});

export default router;
