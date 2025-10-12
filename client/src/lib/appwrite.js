
import { Client, Databases } from 'appwrite';

const VITE_APPWRITE_ENDPOINT = 'https://68eb38f20005d80dc92c.fra.appwrite.run/v1';
const VITE_APPWRITE_PROJECT_ID = '68e63c75003508ddae75';
export const DATABASE_ID = '68e64920003173cabdb1';
export const DOCUMENTS_COLLECTION_ID = 'documents';


const client = new Client()
    .setEndpoint(VITE_APPWRITE_ENDPOINT)
    .setProject(VITE_APPWRITE_PROJECT_ID);

export const databases = new Databases(client);

