
import { Router } from 'express';
import { account, databases } from '../../appwrite';
import { Client, Account, ID, Users, Query } from 'node-appwrite';

const router = Router();
const DATABASE_ID = "68e64920003173cabdb1";
const USERS_COLLECTION_ID = "users";

// Register a new user and create a session
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: "Email, password, and name are required." });
    }
    
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long." });
    }

    const users = new Users(account.client);

    // Create the user in Appwrite Auth
    const newUser = await users.create(ID.unique(), email, password, name);

    // Create the corresponding user document in the database
    const userRole = email === process.env.SUPER_ADMIN_EMAIL ? 'admin' : 'user';
    await databases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        newUser.$id,
        {
            name,
            email,
            role: userRole, 
        }
    );

    // Immediately create a session for the new user
    const session = await account.createEmailPasswordSession(email, password);

    // Return the session to the client
    res.status(201).json(session);

  } catch (error: any) {
    if (error.code === 409) { 
        return res.status(409).json({ message: 'A user with this email already exists.' });
    }
    console.error("Registration Error:", error);
    res.status(500).json({ message: error.message || "An error occurred during registration." });
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

    // Create a new Appwrite client and set the session to verify the user
    const userClient = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT!)
      .setProject(process.env.APPWRITE_PROJECT_ID!)
      .setSession(sessionSecret);

    const userAccount = new Account(userClient);
    
    // Get the user details from Appwrite
    const user = await userAccount.get();
    
    // Now, fetch the user's role from our database
    const userDocs = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal('email', user.email)]
    );

    if (userDocs.documents.length === 0) {
        return res.status(404).json({ error: "User document not found." });
    }

    const userWithRole = {
        ...user,
        role: userDocs.documents[0].role
    };

    res.status(200).json(userWithRole);

  } catch (error: any) {
    res.status(401).json({ error: 'Not authenticated: ' + error.message });
  }
});

export default router;
