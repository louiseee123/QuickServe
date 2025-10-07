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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin = __importStar(require("firebase-admin"));
const router = (0, express_1.Router)(); // eslint-disable-line new-cap
const db = admin.firestore();
const auth = admin.auth();
// User sign up
router.post("/signup", async (req, res) => {
    const { email, password, role } = req.body;
    try {
        const userRecord = await auth.createUser({
            email: email,
            password: password,
        });
        // Add user role to Firestore
        await db.collection("users").doc(userRecord.uid).set({
            email: userRecord.email,
            role: role || "user",
        });
        res.status(201).send({ uid: userRecord.uid, email: userRecord.email, role });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).send({ error: error.message });
        }
        else {
            res.status(400).send({ error: "An unknown error occurred" });
        }
    }
});
// User sign in
// IMPORTANT: The Admin SDK does not handle password verification directly.
// A proper implementation would require a custom token exchange.
// For now, we will just fetch the user to confirm they exist.
router.post("/signin", async (req, res) => {
    const { email } = req.body;
    try {
        const userRecord = await auth.getUserByEmail(email);
        const userDoc = await db.collection("users").doc(userRecord.uid).get();
        const userData = userDoc.data();
        res.status(200).send({
            uid: userRecord.uid, email: userRecord.email, role: userData?.role,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).send({ error: error.message });
        }
        else {
            res.status(400).send({ error: "An unknown error occurred" });
        }
    }
});
// Create a new document request
router.post("/request", async (req, res) => {
    const { studentId, documentType } = req.body;
    try {
        const newRequest = {
            studentId,
            documentType,
            dateRequested: new Date(),
            status: "pending",
        };
        const docRef = await db.collection("requests").add(newRequest);
        res.status(201).send({ id: docRef.id, ...newRequest });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).send({ error: error.message });
        }
        else {
            res.status(400).send({ error: "An unknown error occurred" });
        }
    }
});
// Get all document requests
router.get("/requests", async (req, res) => {
    try {
        const snapshot = await db.collection("requests").get();
        const requests = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        res.status(200).send(requests);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).send({ error: error.message });
        }
        else {
            res.status(400).send({ error: "An unknown error occurred" });
        }
    }
});
// Update a document request
router.put("/request/:id", async (req, res) => {
    const { id } = req.params;
    const { status, lecturerId, adminId, rejectionReason, downloadUrl } = req.body;
    try {
        const requestRef = db.collection("requests").doc(id);
        const updateData = { status };
        if (lecturerId) {
            updateData.lecturerId = lecturerId;
        }
        if (adminId) {
            updateData.adminId = adminId;
        }
        if (rejectionReason) {
            updateData.rejectionReason = rejectionReason;
        }
        if (downloadUrl) {
            updateData.downloadUrl = downloadUrl;
        }
        await requestRef.update(updateData);
        res.status(200).send({ id, ...updateData });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).send({ error: error.message });
        }
        else {
            res.status(400).send({ error: "An unknown error occurred" });
        }
    }
});
// Create a user profile
router.post("/profile", async (req, res) => {
    const { uid, ...profileData } = req.body;
    try {
        await db.collection("profiles").doc(uid).set(profileData);
        res.status(201).send({ uid, ...profileData });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).send({ error: error.message });
        }
        else {
            res.status(400).send({ error: "An unknown error occurred" });
        }
    }
});
// Get a user profile
router.get("/profile/:uid", async (req, res) => {
    const { uid } = req.params;
    try {
        const docSnap = await db.collection("profiles").doc(uid).get();
        if (docSnap.exists) {
            res.status(200).send(docSnap.data());
        }
        else {
            res.status(404).send({ error: "Profile not found" });
        }
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).send({ error: error.message });
        }
        else {
            res.status(400).send({ error: "An unknown error occurred" });
        }
    }
});
// Update a user profile
router.put("/profile/:uid", async (req, res) => {
    const { uid } = req.params;
    const profileData = req.body;
    try {
        await db.collection("profiles").doc(uid).update(profileData);
        res.status(200).send({ uid, ...profileData });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).send({ error: error.message });
        }
        else {
            res.status(400).send({ error: "An unknown error occurred" });
        }
    }
});
exports.default = router;
