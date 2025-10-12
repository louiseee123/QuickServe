
import { databases, DATABASE_ID, DOCUMENTS_COLLECTION_ID } from '../lib/appwrite';

export async function getDocuments() {
  const response = await databases.listDocuments(
    DATABASE_ID,
    DOCUMENTS_COLLECTION_ID
  );
  return response.documents;
}
