
import { Client, Account, Databases, Storage } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client();

client
    .setEndpoint(process.env.APPWRITE_ENDPOINT as string) // Your Appwrite Endpoint
    .setProject(process.env.APPWRITE_PROJECT_ID as string) // Your project ID
    .setKey(process.env.APPWRITE_API_KEY as string); // Your secret API key

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
