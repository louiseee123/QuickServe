
import { databases, DATABASE_ID, DOCUMENTS_COLLECTION_ID, DOCUMENT_REQUESTS_COLLECTION_ID, account } from '../lib/appwrite';
import { ID, Query } from 'appwrite';

export async function getDocuments() {
  const response = await databases.listDocuments(
    DATABASE_ID,
    DOCUMENTS_COLLECTION_ID
  );
  return response.documents;
}

async function getNextQueueNumber() {
    const response = await databases.listDocuments(
        DATABASE_ID,
        DOCUMENT_REQUESTS_COLLECTION_ID,
        [
            Query.orderDesc('queueNumber'),
            Query.limit(1)
        ]
    );

    if (response.documents.length > 0) {
        return response.documents[0].queueNumber + 1;
    } else {
        return 1;
    }
}


export async function createDocumentRequest(requestData: {
    studentName: string,
    studentNumber: string,
    yearLevel: string,
    course: string,
    email: string,
    purpose: string,
    documents: any[],
    totalAmount: number,
    estimatedCompletion: string,
}) {
    const user = await account.get();
    const userId = user.$id;
    const queueNumber = await getNextQueueNumber();

    const response = await databases.createDocument(
        DATABASE_ID,
        DOCUMENT_REQUESTS_COLLECTION_ID,
        ID.unique(),
        {
            ...requestData,
            documents: JSON.stringify(requestData.documents),
            status: 'pending_payment',
            paymentStatus: 'unpaid',
            requestedAt: new Date().toISOString(),
            userId: userId,
            queueNumber: queueNumber,
        }
    );
    return response;
}
