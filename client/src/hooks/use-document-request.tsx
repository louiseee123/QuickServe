
import { useQuery } from "@tanstack/react-query";
import { getRequestById } from "@/lib/api";
import type { DocumentRequest } from "@shared/schema";

export const useDocumentRequest = (requestId?: string) => {
  return useQuery<DocumentRequest | null>({
    queryKey: ["document_request", requestId],
    queryFn: async () => {
      if (!requestId) return null;
      return getRequestById(requestId);
    },
    enabled: !!requestId,
  });
};
