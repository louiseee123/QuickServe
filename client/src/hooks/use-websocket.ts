import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { DocumentRequest } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

type StatusUpdatePayload = {
  type: "STATUS_UPDATE";
  documentRequest: DocumentRequest;
};

type NewRequestPayload = {
  type: "NEW_REQUEST";
  documentRequest: DocumentRequest;
};

type WSPayload = StatusUpdatePayload | NewRequestPayload;

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    // This will work both on Replit and locally
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host || "localhost:5000";
    const wsUrl = `${protocol}//${host}/ws`;

    console.log("Connecting to WebSocket:", wsUrl);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data) as WSPayload;

      if (payload.type === "STATUS_UPDATE") {
        // Update the requests cache
        queryClient.setQueryData<DocumentRequest[]>(["/api/requests"], (old) => {
          if (!old) return [payload.documentRequest];
          return old.map((request) =>
            request.id === payload.documentRequest.id
              ? payload.documentRequest
              : request
          );
        });

        // Show toast notification for status update
        toast({
          title: "Request Status Updated",
          description: `Document request #${payload.documentRequest.queueNumber} status updated to ${payload.documentRequest.status}`
        });
      } else if (payload.type === "NEW_REQUEST") {
        // Add to the requests cache
        queryClient.setQueryData<DocumentRequest[]>(["/api/requests"], (old) => {
          if (!old) return [payload.documentRequest];
          return [payload.documentRequest, ...old];
        });

        // Show toast notification for new request
        toast({
          title: "New Document Request",
          description: `A new document request #${payload.documentRequest.queueNumber} has been submitted.`
        });
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [queryClient, toast]);

  return wsRef.current;
}