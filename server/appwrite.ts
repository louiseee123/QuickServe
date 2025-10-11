
import { Client, Account, Databases, Storage, Users } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const client = new Client();

client
    .setEndpoint(process.env.APPWRITE_ENDPOINT as string)
    .setProject(process.env.APPWRITE_PROJECT_ID as string)
    .setKey(process.env.APPWRITE_API_KEY as string);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const users = new Users(client);
