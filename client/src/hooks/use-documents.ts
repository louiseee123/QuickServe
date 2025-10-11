
import { useQuery } from '@tanstack/react-query';

export interface Document {
  $id: string;
  name: string;
  price: number;
  processingTimeDays: number;
  $createdAt: string;
  $updatedAt: string;
}

const fetchDocuments = async (): Promise<Document[]> => {
  const response = await fetch('/api/documents');
  if (!response.ok) {
    throw new Error('Failed to fetch documents');
  }
  return response.json();
};

export const useDocuments = () => {
  return useQuery({
    queryKey: ['documents'],
    queryFn: fetchDocuments,
  });
};
