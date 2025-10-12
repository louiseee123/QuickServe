import { databases } from '../appwrite';
import { ID, Query } from 'node-appwrite';
import type { InsertRequest, RequestStatus } from '@shared/schema';

// Constants for Appwrite database and collections
export const DATABASE_ID = '68e64920003173cabdb1';
export const DOCUMENTS_COLLECTION_ID = 'documents';
export const DOCUMENT_REQUESTS_COLLECTION_ID = 'requests';
export const COUNTERS_COLLECTION_ID = 'counters';
export const USERS_COLLECTION_ID = 'users';

// --- Document Request Operations ---

// Helper to manage the request queue number
async function getNextQueueNumber(): Promise<number> {
  const counterId = 'document_request_counter';
  try {
    const counterDoc = await databases.getDocument(DATABASE_ID, COUNTERS_COLLECTION_ID, counterId);
    const nextQueueNumber = counterDoc.lastQueueNumber + 1;
    await databases.updateDocument(DATABASE_ID, COUNTERS_COLLECTION_ID, counterId, {
      lastQueueNumber: nextQueueNumber,
    });
    return nextQueueNumber;
  } catch (error) {
    // If the counter document doesn't exist, create it.
    if (error.code === 404) {
      await databases.createDocument(DATABASE_ID, COUNTERS_COLLECTION_ID, counterId, {
        lastQueueNumber: 1,
      });
      return 1;
    }
    throw error;
  }
}

export async function createRequest(request: InsertRequest): Promise<any> {
  const queueNumber = await getNextQueueNumber();

  const dataToInsert = {
    ...request,
    // Ensure documents array is stored as a string
    documents: JSON.stringify(request.documents),
    // Set initial statuses
    status: 'pending_payment',
    paymentStatus: 'unpaid',
    queueNumber,
  };

  return databases.createDocument(
    DATABASE_ID,
    DOCUMENT_REQUESTS_COLLECTION_ID,
    ID.unique(),
    dataToInsert,
  );
}

export async function getRequest(id: string): Promise<any> {
  return databases.getDocument(DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID, id);
}

export async function getAllRequests(): Promise<any[]> {
  const response = await databases.listDocuments(
    DATABASE_ID,
    DOCUMENT_REQUESTS_COLLECTION_ID,
    // Sort by queue number in descending order to show the latest requests first
    [Query.orderDesc('queueNumber')]
  );
  return response.documents;
}

export async function updateRequestStatus(id: string, status: RequestStatus): Promise<any> {
  const data = { status };

  // If the status is 'processing', set the processing start time
  if (status === 'processing') {
    data['processingStartedAt'] = new Date().toISOString();
  }
  
  // If the status is 'completed', set the completion time
  if (status === 'completed') {
    data['completedAt'] = new Date().toISOString();
  }

  return databases.updateDocument(
    DATABASE_ID,
    DOCUMENT_REQUESTS_COLLECTION_ID,
    id,
    data,
  );
}

// --- Document Operations ---

export async function getAvailableDocuments(): Promise<any[]> {
    const response = await databases.listDocuments(
        DATABASE_ID,
        DOCUMENTS_COLLECTION_ID
    );
    return response.documents;
}
