
import { Router, Request, Response } from 'express';
import { db } from './firebase';
import { doc, getDoc, collection, addDoc, getDocs, updateDoc, query, where, orderBy } from 'firebase/firestore';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { insertRequestSchema } from '@shared/schema';
import express from 'express';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const router = Router();

// Documents endpoint
router.get('/documents', async (req: Request, res: Response) => {
  try {
    const querySnapshot = await getDocs(collection(db, 'documents'));
    const documents = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).send(documents);
  } catch (error: any) {
    res.status(400).send({ error: error.message });
  }
});

// Create a new document request
router.post('/request', async (req: Request, res: Response) => {
    try {
        // 1. Validate the entire request body, including the documents array.
        const validatedRequest = insertRequestSchema.parse(req.body);

        // 2. Create the complete request object to be saved.
        const newRequest = {
            ...validatedRequest, // This now includes the 'documents' array.
            requestedAt: new Date(),
            status: 'pending_payment',
            paymentStatus: 'unpaid',
            // This random number is not safe for production, but we'll leave it for now.
            queueNumber: Math.floor(Math.random() * 1000), 
        };
        
        // 3. Add the single, complete request document to the 'requests' collection.
        const docRef = await addDoc(collection(db, 'requests'), newRequest);
        
        // 4. Return the newly created request, including its new ID.
        const newRequestWithId = { id: docRef.id, ...newRequest };
        res.status(201).send(newRequestWithId);

    } catch (error: any) {
        // Handle validation errors from Zod
        if (error.errors) {
            return res.status(400).send({ error: error.errors });
        }
        // Handle other errors
        console.error("Error creating request:", error);
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
        const q = query(collection(db, "requests"), where("userId", "==", userId), orderBy("requestedAt", "desc"));
        const querySnapshot = await getDocs(q);
        const requests = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).send(requests);
    } catch (error: any) {
        res.status(400).send({ error: error.message });
    }
});


// Create a checkout session with Stripe
router.post('/create-checkout-session', async (req, res) => {
  const { requestId } = req.body;

  try {
    const requestDocRef = doc(db, 'requests', requestId);
    const requestDoc = await getDoc(requestDocRef);
    
    if (!requestDoc.exists()) {
      return res.status(404).send({ error: 'Request not found' });
    }

    const request = requestDoc.data();
    // Corrected to check for totalAmount and allow it to be 0
    if (!request || typeof request.totalAmount === 'undefined') {
      return res.status(404).send({ error: 'Request data or totalAmount not found' });
    }
    
    // If the total is 0, we can't create a Stripe session. 
    // We'll handle this case on the frontend, but as a safeguard:
    if (request.totalAmount === 0) {
        // Here, we could auto-approve the request, but for now, we'll send an error.
        return res.status(400).send({ error: "Cannot create a checkout session for a free request." });
    }
    
    // Corrected to read document names from the documents array on the main request object
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
            // Corrected to use totalAmount and ensure it's in cents
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
        const requestRef = doc(db, 'requests', requestId);
        // Update the request status upon successful payment
        await updateDoc(requestRef, {
          paymentStatus: 'paid',
          status: 'processing', // Move to processing once paid
        });

        // Record the payment in a separate 'payments' collection for auditing
        await addDoc(collection(db, 'payments'), {
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
