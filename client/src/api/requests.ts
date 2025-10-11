
import { DocumentRequest } from "@shared/schema";

const API_URL = "/api"; 

export const getRequestById = async (id: string): Promise<DocumentRequest> => {
    const response = await fetch(`${API_URL}/request/${id}`);
    if (!response.ok) {
        throw new Error("Failed to fetch request");
    }
    return response.json();
};

export const getDocuments = async (): Promise<any[]> => {
    const response = await fetch(`${API_URL}/documents`);
    if (!response.ok) {
        throw new Error("Failed to fetch documents");
    }
    return response.json();
};

export const uploadReceipt = async (requestId: string, file: File) => {
    const formData = new FormData();
    formData.append('receipt', file);

    const response = await fetch(`${API_URL}/request/${requestId}/upload-receipt`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error("Failed to upload receipt");
    }

    return response.json();
};
