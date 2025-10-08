import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import Stripe from "stripe";

// This map stores the prices for each document in PHP.
// Documents not in this list are considered free.
const documentPrices: {[key: string]: number} = {
  "Certificate of Grades": 50,
  "Transcript of Records": 150,
  "Honorable Dismissal": 100,
};

// Stripe's fee rate for GCash (3%).
const STRIPE_FEE_RATE = 0.03;

// Initialize Stripe with your secret key from Firebase environment variables.
const stripe = new Stripe(functions.config().stripe.secret_key, {
  apiVersion: "2025-09-30.clover" as const,
});

interface PaymentRequestData {
  documentType: string;
  documentId: string;
}

export const createPaymentIntent = functions.https.onCall(
  async (request: functions.https.CallableRequest<PaymentRequestData>) => {
    if (!request.auth) {
      throw new functions.https.HttpsError("unauthenticated",
        "You must be logged in to make a payment.");
    }

    const {documentType, documentId} = request.data;

    if (!documentType || !documentId) {
      throw new functions.https.HttpsError("invalid-argument",
        "Missing required data: documentType and documentId.");
    }

    const basePrice = documentPrices[documentType];

    // If there's no price, the document is free.
    if (!basePrice) {
      throw new functions.https.HttpsError("invalid-argument",
        "This document does not require payment.");
    }

    // Calculate the total amount to charge to cover Stripe's fee.
    const finalAmount =
      Math.ceil(basePrice / (1 - STRIPE_FEE_RATE) * 100) / 100;
    const fee = finalAmount - basePrice;

    // Stripe expects amount in smallest currency unit (centavos for PHP).
    const amountInCentavos = Math.round(finalAmount * 100);

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCentavos,
        currency: "php",
        payment_method_types: ["gcash"],
        metadata: {
          userId: request.auth.uid,
          documentId: documentId,
        },
      });

      return {
        clientSecret: paymentIntent.client_secret,
        basePrice: basePrice,
        fee: fee,
        finalAmount: finalAmount,
      };
    } catch (error) {
      console.error("Stripe PaymentIntent creation failed:", error);
      throw new functions.https.HttpsError("internal",
        "Failed to create payment intent.");
    }
  });

export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers["stripe-signature"] as string;

  // Get the webhook signing secret from Firebase environment variables.
  const endpointSecret = functions.config().stripe.webhook_secret;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).send(`Webhook Error: ${err.message}`);
    } else {
      res.status(400).send("An unknown webhook error occurred");
    }
    return;
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const documentId = paymentIntent.metadata.documentId;

    if (documentId) {
      try {
        // Use a Firestore transaction to safely update the document
        await admin.firestore().runTransaction(async (transaction) => {
          const docRef = admin.firestore().collection("document_requests")
            .doc(documentId);
          transaction.update(docRef, {paymentStatus: "Paid"});
        });
        console.log(
          "Successfully updated payment status for document: " + documentId
        );
      } catch (error) {
        console.error("Failed to update document payment status:", error);
        res.status(500).send(
          "Internal server error while updating payment status."
        );
        return;
      }
    }
  }

  res.status(200).send();
});
