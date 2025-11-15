import { account, DATABASE_ID, databases, DOCUMENT_REQUESTS_COLLECTION_ID, DOCUMENTS_COLLECTION_ID } from "@/lib/appwrite";
import { CreateDocumentRequest, Document } from "@shared/schema";
import { ID, Permission, Query, Role } from "appwrite";

export async function getDocuments() {
  const response = await databases.listDocuments(
    DATABASE_ID,
    DOCUMENTS_COLLECTION_ID
  );
  return response.documents;
}

export async function createDocument(data: Omit<Document, 'id'>) {
    const response = await databases.createDocument(
        DATABASE_ID,
        DOCUMENTS_COLLECTION_ID,
        ID.unique(),
        data
    );
    return response;
}

export async function updateDocument(id: string, data: Partial<Omit<Document, 'id'>>) {
    const response = await databases.updateDocument(
        DATABASE_ID,
        DOCUMENTS_COLLECTION_ID,
        id,
        data
    );
    return response;
}

export async function deleteDocument(id: string) {
    const response = await databases.deleteDocument(
        DATABASE_ID,
        DOCUMENTS_COLLECTION_ID,
        id
    );
    return response;
}

export async function getAllDocumentRequests() {
    const response = await databases.listDocuments(
        DATABASE_ID,
        DOCUMENT_REQUESTS_COLLECTION_ID,
        [Query.orderDesc('$createdAt')]
    );
    return response.documents;
}

export async function getRequestById(requestId: string) {
  const response = await databases.getDocument(
    DATABASE_ID,
    DOCUMENT_REQUESTS_COLLECTION_ID,
    requestId
  );
  return response;
}

export async function createDocumentRequest(requestData: CreateDocumentRequest) {
    try {
        const user = await account.get();
        const userId = user.$id;

        const query = await databases.listDocuments(
            DATABASE_ID,
            DOCUMENT_REQUESTS_COLLECTION_ID,
        );

        const queueNumber = query.total + 1;


        const response = await databases.createDocument(
            DATABASE_ID,
            DOCUMENT_REQUESTS_COLLECTION_ID,
            ID.unique(),
            {
                ...requestData,
                documents: JSON.stringify(requestData.documents),
                status: 'pending_approval',
                paymentStatus: 'unpaid',
                requestedAt: new Date().toISOString(),
                userId: userId,
                queueNumber: queueNumber,
            },
            [
                Permission.read(Role.user(userId)),
                Permission.update(Role.user(userId)),
            ]
        );
        return response;
    } catch (error) {
        console.error('Failed to create document request:', error);
        throw new Error('Failed to create document request');
    }
}

export async function getDocumentRequests() {
    try {
        const user = await account.get();
        const userId = user.$id;

        const response = await databases.listDocuments(
            DATABASE_ID,
            DOCUMENT_REQUESTS_COLLECTION_ID,
            [Query.equal('userId', userId), Query.orderDesc('$createdAt')]
        );

        return response.documents;
    } catch (error) {
        console.error('Failed to get document requests:', error);
        throw new Error('Failed to get document requests');
    }
}
