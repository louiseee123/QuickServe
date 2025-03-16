import { documentRequests, type DocumentRequest, type InsertRequest, type RequestStatus, users, type User, type InsertUser } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  createRequest(request: InsertRequest): Promise<DocumentRequest>;
  getRequest(id: number): Promise<DocumentRequest | undefined>;
  getAllRequests(): Promise<DocumentRequest[]>;
  updateRequestStatus(id: number, status: RequestStatus): Promise<DocumentRequest>;
  getCurrentQueueNumber(): Promise<number>;

  // User methods
  createUser(user: InsertUser): Promise<User>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;

  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private requests: Map<number, DocumentRequest>;
  private users: Map<number, User>;
  private currentId: number;
  private currentQueueNumber: number;
  readonly sessionStore: session.Store;

  constructor() {
    this.requests = new Map();
    this.users = new Map();
    this.currentId = 1;
    this.currentQueueNumber = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    // Make the first user an admin
    const role = this.users.size === 0 ? "admin" : "user";
    const user: User = { ...insertUser, id, role };
    this.users.set(id, user);
    return user;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createRequest(insertRequest: InsertRequest): Promise<DocumentRequest> {
    const id = this.currentId++;
    const queueNumber = this.currentQueueNumber++;
    const request: DocumentRequest = {
      ...insertRequest,
      id,
      status: "pending",
      queueNumber,
      requestedAt: new Date(),
      userId: null,
    };
    this.requests.set(id, request);
    return request;
  }

  async getRequest(id: number): Promise<DocumentRequest | undefined> {
    return this.requests.get(id);
  }

  async getAllRequests(): Promise<DocumentRequest[]> {
    return Array.from(this.requests.values()).sort((a, b) => b.queueNumber - a.queueNumber);
  }

  async updateRequestStatus(id: number, status: RequestStatus): Promise<DocumentRequest> {
    const request = await this.getRequest(id);
    if (!request) {
      throw new Error("Request not found");
    }
    const updatedRequest = { ...request, status };
    this.requests.set(id, updatedRequest);
    return updatedRequest;
  }

  async getCurrentQueueNumber(): Promise<number> {
    return this.currentQueueNumber;
  }
}

export const storage = new MemStorage();