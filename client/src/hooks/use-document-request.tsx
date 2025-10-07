
import { useQuery } from "@tanstack/react-query";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { DocumentRequest } from "@shared/schema";

export const useDocumentRequest = (requestId?: string) => {
  return useQuery<DocumentRequest | null>({
    queryKey: ["document_request", requestId],
    queryFn: async () => {
      if (!requestId) return null;

      const docRef = doc(db, "document_requests", requestId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          requestedAt: (data.requestedAt as Timestamp).toDate().toISOString(),
        } as DocumentRequest;
      }
      return null;
    },
    enabled: !!requestId,
  });
};
