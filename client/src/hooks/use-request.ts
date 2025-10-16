
import { useQuery } from '@tanstack/react-query';
import { getRequestById } from '../api/documents';

export const useRequest = (requestId: string) => {
  return useQuery({
    queryKey: ['request', requestId],
    queryFn: () => getRequestById(requestId),
    enabled: !!requestId, 
  });
};
