
import { Router } from 'express';
import { account, databases } from '../../appwrite';
import { Client, Account, ID } from 'node-appwrite';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const router = Router();
const DATABASE_ID = "68e64920003173cabdb1";
const USERS_COLLECTION_ID = "users";

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const newUser = await account.create(ID.unique(), email, password, name);

    await databases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        newUser.$id,
        {
            name,
            email,
        }
    );

    const session = await account.createEmailPasswordSession(email, password);

    res.status(201).json({ newUser, session });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Login and create a session
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const session = await account.createEmailPasswordSession(email, password);
    res.status(200).json(session);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Logout and delete a session
router.post('/logout', async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }
    await account.deleteSession(sessionId);
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get the currently logged in user
router.get('/me', async (req, res) => {
  try {
    const sessionSecret = req.headers['x-appwrite-session'] as string;
    if (!sessionSecret) {
      return res.status(401).json({ error: 'Not authenticated: session secret is missing' });
    }

    const userClient = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT!)
      .setProject(process.env.APPWRITE_PROJECT_ID!)
      .setSession(sessionSecret);

    const userAccount = new Account(userClient);
    const user = await userAccount.get();
    res.status(200).json(user);
  } catch (error: any) {
    res.status(401).json({ error: 'Not authenticated: ' + error.message });
  }
});

export default router;
