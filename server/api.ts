
import { Router, Request, Response } from 'express';
import { db } from './firebase';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { insertRequestSchema } from '@shared/schema';
import express from 'express';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const router = Router();

// Create a new document request
router.post('/request', async (req: Request, res: Response) => {
    try {
        const validatedRequest = insertRequestSchema.parse(req.body);

        const newRequest = {
            ...validatedRequest,
            requestedAt: new Date(),
            status: 'pending',
            paymentStatus: 'unpaid',
            queueNumber: Math.floor(Math.random() * 1000), 
        };
        
        const docRef = await db.collection('requests').add(newRequest);
        
        const newRequestWithId = { id: docRef.id, ...newRequest };
        res.status(201).send(newRequestWithId);

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
        const querySnapshot = await db.collection("requests").orderBy("requestedAt", "desc").get();
        const requests = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).send(requests);
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
        const querySnapshot = await db.collection("requests").where("userId", "==", userId).orderBy("requestedAt", "desc").get();
        const requests = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).send(requests);
    } catch (error: any) {
        res.status(400).send({ error: error.message });
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
        const requestRef = db.collection('requests').doc(id);
        await requestRef.update({ status });
        res.status(200).send({ message: 'Request status updated successfully' });
    } catch (error: any) {
        res.status(400).send({ error: error.message });
    }
});


// Create a checkout session with Stripe
router.post('/create-checkout-session', async (req, res) => {
  const { requestId } = req.body;

  try {
    const requestDocRef = db.collection('requests').doc(requestId);
    const requestDoc = await requestDocRef.get();
    
    if (!requestDoc.exists) {
      return res.status(404).send({ error: 'Request not found' });
    }

    const request = requestDoc.data();
    if (!request || typeof request.totalAmount === 'undefined') {
      return res.status(404).send({ error: 'Request data or totalAmount not found' });
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
    const session = event.data.object;
    const requestId = session.metadata?.requestId;

    if (requestId) {
      try {
        const requestRef = db.collection('requests').doc(requestId);
        await requestRef.update({
          paymentStatus: 'paid',
          status: 'processing',
        });

        await db.collection('payments').add({
          requestId,
          amount: session.amount_total! / 100,
          currency: session.currency,
          stripeChargeId: session.payment_intent,
          status: session.payment_status,
          createdAt: new Date(),
        });
      } catch (error: any) {
        console.error(`Error updating request ${requestId}: ${error.message}`);
      }
    }
  }

  res.json({ received: true });
});

export default router;
