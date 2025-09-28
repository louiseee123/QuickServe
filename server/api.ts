import { Router, Request, Response } from 'express';
import { auth, db, storage } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, addDoc, getDocs, updateDoc, query, where } from 'firebase/firestore';

const router = Router();

// User sign up
router.post('/signup', async (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Add user role to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      role: role || 'user', // Default to 'user' role if not provided
    });

    res.status(201).send({ uid: user.uid, email: user.email, role });
  } catch (error: any) {
    res.status(400).send({ error: error.message });
  }
});

// User sign in
router.post('/signin', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    let userData = userDoc.data();

    if (!userDoc.exists()) {
      // If the user document doesn't exist, create it with a default role
      await setDoc(userDocRef, {
        email: user.email,
        role: 'user',
      });
      userData = { email: user.email, role: 'user' };
    }

    res.status(200).send({ uid: user.uid, email: user.email, role: userData?.role });
  } catch (error: any) {
    res.status(400).send({ error: error.message });
  }
});

// Create a new document request
router.post('/request', async (req: Request, res: Response) => {
    const { studentId, documentType } = req.body;

    try {
        const newRequest = {
            studentId,
            documentType,
            dateRequested: new Date(),
            status: 'pending',
        };
        const docRef = await addDoc(collection(db, 'requests'), newRequest);
        const newRequestWithId = { id: docRef.id, ...newRequest };

        // Notify all clients
        (req.app as any).sendRequestUpdate(newRequestWithId);

        res.status(201).send(newRequestWithId);
    } catch (error: any) {
        res.status(400).send({ error: error.message });
    }
});

// Get all document requests
router.get('/requests', async (req: Request, res: Response) => {
    try {
        const querySnapshot = await getDocs(collection(db, 'requests'));
        const requests = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).send(requests);
    } catch (error: any) {
        res.status(400).send({ error: error.message });
    }
});

// Update a document request
router.put('/request/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, lecturerId, adminId, rejectionReason, downloadUrl } = req.body;

    try {
        const requestRef = doc(db, 'requests', id);
        const updateData: any = { status };
        if (lecturerId) updateData.lecturerId = lecturerId;
        if (adminId) updateData.adminId = adminId;
        if (rejectionReason) updateData.rejectionReason = rejectionReason;
        if (downloadUrl) updateData.downloadUrl = downloadUrl;
        
        await updateDoc(requestRef, updateData);

        const updatedDoc = await getDoc(requestRef);
        const updatedRequest = { id: updatedDoc.id, ...updatedDoc.data() };

        // Notify all clients
        (req.app as any).sendRequestUpdate(updatedRequest);

        res.status(200).send(updatedRequest);
    } catch (error: any) {
        res.status(400).send({ error: error.message });
    }
});


// Create a user profile
router.post('/profile', async (req: Request, res: Response) => {
  const { uid, ...profileData } = req.body;
  try {
    await setDoc(doc(db, 'profiles', uid), profileData);
    res.status(201).send({ uid, ...profileData });
  } catch (error: any) {
    res.status(400).send({ error: error.message });
  }
});

// Get a user profile
router.get('/profile/:uid', async (req: Request, res: Response) => {
  const { uid } = req.params;
  try {
    const docRef = doc(db, 'profiles', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      res.status(200).send(docSnap.data());
    } else {
      res.status(404).send({ error: 'Profile not found' });
    }
  } catch (error: any) {
    res.status(400).send({ error: error.message });
  }
});

// Update a user profile
router.put('/profile/:uid', async (req: Request, res: Response) => {
  const { uid } = req.params;
  const profileData = req.body;
  try {
    await updateDoc(doc(db, 'profiles', uid), profileData);
    res.status(200).send({ uid, ...profileData });
  } catch (error: any) {
    res.status(400).send({ error: error.message });
  }
});

export default router;
