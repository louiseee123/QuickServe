
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import express from "express";
import cors from "cors";
import apiRoutes from "./api";

// Initialize the Firebase Admin SDK
admin.initializeApp();

const app = express();

// Automatically allow cross-origin requests
app.use(cors({origin: true}));

// Mount the API routes
app.use("/", apiRoutes);

// Expose the Express app as a Cloud Function named "api"
export const api = functions.https.onRequest(app);
