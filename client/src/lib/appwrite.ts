
import { Client, Databases, Account, Storage } from 'appwrite';

const VITE_APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;
const VITE_APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;

if (!VITE_APPWRITE_ENDPOINT || !VITE_APPWRITE_PROJECT_ID) {
  throw new Error('Missing Appwrite environment variables. Please check your .env file.');
}

export const DATABASE_ID = '68e64920003173cabdb1';
export const DOCUMENTS_COLLECTION_ID = 'documents';
export const DOCUMENT_REQUESTS_COLLECTION_ID = 'document_requests';

const client = new Client()
    .setEndpoint(VITE_APPWRITE_ENDPOINT)
    .setProject(VITE_APPWRITE_PROJECT_ID);

export const databases = new Databases(client);
export const account = new Account(client);
export const storage = new Storage(client);
