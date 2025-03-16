import { WebSocketServer } from "ws";
import type { Server } from "http";
import type { DocumentRequest } from "@shared/schema";

type StatusUpdatePayload = {
  type: "STATUS_UPDATE";
  documentRequest: DocumentRequest;
};

type WSPayload = StatusUpdatePayload;

export function setupWebSocket(httpServer: Server) {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws) => {
    console.log("Client connected to WebSocket");

    ws.on("close", () => {
      console.log("Client disconnected from WebSocket");
    });
  });

  return {
    broadcastStatusUpdate: (documentRequest: DocumentRequest) => {
      const payload: WSPayload = {
        type: "STATUS_UPDATE",
        documentRequest,
      };

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(payload));
        }
      });
    },
  };
}
