
import {Router, Request, Response} from "express";
import * as admin from "firebase-admin";
import {UserRecord} from "firebase-admin/auth";
import {
  DocumentData,
  DocumentReference,
  Firestore,
  QueryDocumentSnapshot,
  QuerySnapshot,
} from "firebase-admin/firestore";

const router = Router(); // eslint-disable-line new-cap
const db: Firestore = admin.firestore();
const auth = admin.auth();

// User sign up
router.post("/signup", async (req: Request, res: Response) => {
  const {email, password, role} = req.body;

  try {
    const userRecord: UserRecord = await auth.createUser({
      email: email,
      password: password,
    });

    // Add user role to Firestore
    await db.collection("users").doc(userRecord.uid).set({
      email: userRecord.email,
      role: role || "user",
    });

    res.status(201).send({uid: userRecord.uid, email: userRecord.email, role});
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).send({error: error.message});
    } else {
      res.status(400).send({error: "An unknown error occurred"});
    }
  }
});

// User sign in
// IMPORTANT: The Admin SDK does not handle password verification directly.
// A proper implementation would require a custom token exchange.
// For now, we will just fetch the user to confirm they exist.
router.post("/signin", async (req: Request, res: Response) => {
  const {email} = req.body;
  try {
    const userRecord: UserRecord = await auth.getUserByEmail(email);
    const userDoc: DocumentData = await db
      .collection("users")
      .doc(userRecord.uid)
      .get();
    const userData: DocumentData | undefined = userDoc.data();
    res.status(200).send({
      uid: userRecord.uid, email: userRecord.email, role: userData?.role,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).send({error: error.message});
    } else {
      res.status(400).send({error: "An unknown error occurred"});
    }
  }
});


// Create a new document request
router.post("/request", async (req: Request, res: Response) => {
  const {studentId, documentType} = req.body;

  try {
    const newRequest = {
      studentId,
      documentType,
      dateRequested: new Date(),
      status: "pending",
    };
    const docRef: DocumentReference = await db
      .collection("requests")
      .add(newRequest);
    res.status(201).send({id: docRef.id, ...newRequest});
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).send({error: error.message});
    } else {
      res.status(400).send({error: "An unknown error occurred"});
    }
  }
});

// Get all document requests
router.get("/requests", async (req: Request, res: Response) => {
  try {
    const snapshot: QuerySnapshot = await db.collection("requests").get();
    const requests = snapshot.docs.map((doc: QueryDocumentSnapshot) => ({
      id: doc.id, ...doc.data(),
    }));
    res.status(200).send(requests);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).send({error: error.message});
    } else {
      res.status(400).send({error: "An unknown error occurred"});
    }
  }
});

// Update a document request
router.put("/request/:id", async (req: Request, res: Response) => {
  const {id} = req.params;
  const {status, lecturerId, adminId, rejectionReason, downloadUrl} = req.body;

  try {
    const requestRef: DocumentReference = db.collection("requests").doc(id);
    const updateData: {[key: string]: string} = {status};
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
    res.status(200).send({id, ...updateData});
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).send({error: error.message});
    } else {
      res.status(400).send({error: "An unknown error occurred"});
    }
  }
});

// Create a user profile
router.post("/profile", async (req: Request, res: Response) => {
  const {uid, ...profileData} = req.body;
  try {
    await db.collection("profiles").doc(uid).set(profileData);
    res.status(201).send({uid, ...profileData});
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).send({error: error.message});
    } else {
      res.status(400).send({error: "An unknown error occurred"});
    }
  }
});

// Get a user profile
router.get("/profile/:uid", async (req: Request, res: Response) => {
  const {uid} = req.params;
  try {
    const docSnap: DocumentData = await db
      .collection("profiles")
      .doc(uid)
      .get();
    if (docSnap.exists) {
      res.status(200).send(docSnap.data());
    } else {
      res.status(404).send({error: "Profile not found"});
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).send({error: error.message});
    } else {
      res.status(400).send({error: "An unknown error occurred"});
    }
  }
});

// Update a user profile
router.put("/profile/:uid", async (req: Request, res: Response) => {
  const {uid} = req.params;
  const profileData = req.body;
  try {
    await db.collection("profiles").doc(uid).update(profileData);
    res.status(200).send({uid, ...profileData});
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).send({error: error.message});
    } else {
      res.status(400).send({error: "An unknown error occurred"});
    }
  }
});

export default router;
