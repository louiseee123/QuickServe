"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhook = exports.createPaymentIntent = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const stripe_1 = __importDefault(require("stripe"));
// This map stores the prices for each document in PHP.
// Documents not in this list are considered free.
const documentPrices = {
    "Certificate of Grades": 50,
    "Transcript of Records": 150,
    "Honorable Dismissal": 100,
};
// Stripe's fee rate for GCash (3%).
const STRIPE_FEE_RATE = 0.03;
// Initialize Stripe with your secret key from Firebase environment variables.
const stripe = new stripe_1.default(functions.config().stripe.secret_key, {
    apiVersion: "2024-04-10",
});
exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in to make a payment.");
    }
    const { documentType, documentId } = data;
    if (!documentType || !documentId) {
        throw new functions.https.HttpsError("invalid-argument", "Missing required data: documentType and documentId.");
    }
    const basePrice = documentPrices[documentType];
    // If there's no price, the document is free.
    if (!basePrice) {
        throw new functions.https.HttpsError("invalid-argument", "This document does not require payment.");
    }
    // Calculate the total amount to charge to cover Stripe's fee.
    const finalAmount = Math.ceil(basePrice / (1 - STRIPE_FEE_RATE) * 100) / 100;
    const fee = finalAmount - basePrice;
    // Stripe expects the amount in the smallest currency unit (centavos for PHP).
    const amountInCentavos = Math.round(finalAmount * 100);
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCentavos,
            currency: "php",
            payment_method_types: ["gcash"],
            metadata: {
                userId: context.auth.uid,
                documentId: documentId,
            },
        });
        return {
            clientSecret: paymentIntent.client_secret,
            basePrice: basePrice,
            fee: fee,
            finalAmount: finalAmount,
        };
    }
    catch (error) {
        console.error("Stripe PaymentIntent creation failed:", error);
        throw new functions.https.HttpsError("internal", "Failed to create payment intent.");
    }
});
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
    const sig = req.headers["stripe-signature"];
    // Get the webhook signing secret from Firebase environment variables.
    const endpointSecret = functions.config().stripe.webhook_secret;
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    }
    catch (err) {
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
    if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;
        const documentId = paymentIntent.metadata.documentId;
        if (documentId) {
            try {
                // Use a Firestore transaction to safely update the document
                await admin.firestore().runTransaction(async (transaction) => {
                    const docRef = admin.firestore().collection("document_requests")
                        .doc(documentId);
                    transaction.update(docRef, { paymentStatus: "Paid" });
                });
                console.log("Successfully updated payment status for document: " +
                    documentId);
            }
            catch (error) {
                console.error("Failed to update document payment status:", error);
                res.status(500).send("Internal server error while updating " +
                    "payment status.");
                return;
            }
        }
    }
    res.status(200).send();
});
