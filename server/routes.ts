import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRequestSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { setupAuth } from "./auth";

function isAuthenticated(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
}

function isAdmin(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
  if (req.user?.role === "admin") {
    return next();
  }
  res.status(403).json({ message: "Not authorized" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes and middleware
  setupAuth(app);

  // Protected routes
  app.post("/api/requests", isAuthenticated, async (req, res) => {
    try {
      const requestData = insertRequestSchema.parse(req.body);
      const request = await storage.createRequest({
        ...requestData,
        userId: req.user?.id
      });
      res.status(201).json(request);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get("/api/requests", isAuthenticated, async (req, res) => {
    try {
      const requests = await storage.getAllRequests();
      const userRequests = req.user?.role === "admin" 
        ? requests 
        : requests.filter(r => r.userId === req.user?.id);
      res.json(userRequests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch requests" });
    }
  });

  app.patch("/api/requests/:id/status", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const request = await storage.updateRequestStatus(id, status);
      res.json(request);
    } catch (error) {
      res.status(404).json({ message: "Request not found" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}