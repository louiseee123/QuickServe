
import { Router, Request, Response } from 'express';
import { databases } from './appwrite';
import { ID, Query } from 'node-appwrite';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { insertRequestSchema } from '@shared/schema';
import express from 'express';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const router = Router();

const DATABASE_ID = '68e64920003173cabdb1';
const REQUESTS_COLLECTION_ID = 'requests';

// Create a new document request
router.post('/request', async (req: Request, res: Response) => {
    try {
        const validatedRequest = insertRequestSchema.parse(req.body);

        const newRequestData = {
            ...validatedRequest,
            requestedAt: new Date().toISOString(),
            document_status: 'submitted', 
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
            res.status(500).send({ error: error.message });
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


// Create a checkout session with Stripe
router.post('/create-checkout-session', async (req, res) => {
  const { requestId } = req.body;

  try {
    const request = await databases.getDocument(
        DATABASE_ID,
        REQUESTS_COLLECTION_ID,
        requestId
    );
    
    if (!request) {
      return res.status(404).send({ error: 'Request not found' });
    }

    if (request.totalAmount === 0) {
        return res.status(400).send({ error: "Cannot create a checkout session for a free request." });
    }
    
    const documentNames = request.documents.map((d: any) => d.name).join(', ');

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'php',
            product_data: {
              name: `Document Request: ${documentNames}`,
              description: `Request ID: ${requestId}`,
            },
            unit_amount: request.totalAmount * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/my-requests?payment_success=true&requestId=${requestId}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/checkout/${requestId}?payment_cancelled=true`,
      metadata: {
        requestId,
      },
    });

    res.json({ url: session.url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Stripe webhook to handle payment success
router.post('/stripe-webhook', express.raw({type: 'application/json'}), async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const requestId = session.metadata?.requestId;

    if (requestId) {
      try {
        await databases.updateDocument(
            DATABASE_ID,
            REQUESTS_COLLECTION_ID,
            requestId,
            {
              payment_status: 'paid',
              document_status: 'processing',
            }
        );
      } catch (error: any) {
        console.error(`Error updating request ${requestId}: ${error.message}`);
      }
    }
  }

  res.json({ received: true });
});

export default router;
