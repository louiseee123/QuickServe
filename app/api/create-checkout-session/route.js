
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const { documentId, amount, name } = await request.json();

  if (!documentId || !amount || !name) {
    return NextResponse.json({ error: 'Missing required parameters: documentId, amount, and name are required.' }, { status: 400 });
  }

  try {
    // Create a Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: name, // The name of the service/product
            },
            unit_amount: amount, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${request.headers.get('origin')}/?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/?payment_canceled=true`,
      // IMPORTANT: This metadata is how our webhook knows which document to update!
      metadata: {
        documentId: documentId,
      },
    });

    // Return the session ID to the client
    return NextResponse.json({ id: session.id });
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    return NextResponse.json({ error: 'Failed to create checkout session.' }, { status: 500 });
  }
}
