
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface Document {
  $id: string;
  name: string;
  price: number;
  processingTimeDays: number;
  $createdAt: string;
  $updatedAt: string;
}

const fetchDocuments = async (): Promise<Document[]> => {
  const { data } = await axios.get('/api/documents');
  return data;
};

export const useDocuments = () => {
  return useQuery({
    queryKey: ['documents'],
    queryFn: fetchDocuments,
  });
};
