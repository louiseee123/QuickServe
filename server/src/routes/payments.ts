
import { Router } from 'express';
import { Client, Databases } from 'node-appwrite';
import { getStripe } from '../utils/stripe';

const router = Router();

router.post('/create-checkout-session', async (req, res) => {
  const { line_items, customer_email } = req.body;

  if (!line_items || !customer_email) {
    return res.status(400).send('Missing required session parameters!');
  }

  const stripe = getStripe();

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      customer_email,
    });

    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating checkout session');
  }
});

export default router;
