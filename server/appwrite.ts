
import { Client, Account, Databases, Storage, Users, Teams } from 'node-appwrite';
import { loadEnv } from './load-env';

// Explicitly load environment variables before initializing the client
loadEnv();

const client = new Client();

const appwriteEndpoint = process.env.APPWRITE_ENDPOINT;
const appwriteProjectId = process.env.APPWRITE_PROJECT_ID;
const appwriteApiKey = process.env.APPWRITE_API_KEY;

if (!appwriteEndpoint || !appwriteProjectId || !appwriteApiKey) {
    throw new Error("Missing Appwrite environment variables. Please check your .env file.");
}

client
    .setEndpoint(appwriteEndpoint)
    .setProject(appwriteProjectId)
    .setKey(appwriteApiKey);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const users = new Users(client);
export const teams = new Teams(client);
