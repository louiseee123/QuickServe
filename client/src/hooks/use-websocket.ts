import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { DocumentRequest } from "@shared/schema";

type StatusUpdatePayload = {
  type: "STATUS_UPDATE";
  documentRequest: DocumentRequest;
};

type WSPayload = StatusUpdatePayload;

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

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
        const toast = document.createElement("div");
        toast.textContent = `Document request #${payload.documentRequest.queueNumber} status updated to ${payload.documentRequest.status}`;
        // You can customize this based on your toast implementation
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [queryClient]);

  return wsRef.current;
}
