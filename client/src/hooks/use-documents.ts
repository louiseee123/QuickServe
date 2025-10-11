
import { useQuery } from '@tanstack/react-query';
import { getDocuments } from '../api/documents';

export interface Document {
  $id: string;
  name: string;
  price: number;
  processingTimeDays: number;
  $createdAt: string;
  $updatedAt: string;
}

export const useDocuments = () => {
  return useQuery<Document[]>({
    queryKey: ['documents'],
    queryFn: getDocuments,
  });
};
