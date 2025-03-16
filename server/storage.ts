import { documentRequests, type DocumentRequest, type InsertRequest, type RequestStatus } from "@shared/schema";

export interface IStorage {
  createRequest(request: InsertRequest): Promise<DocumentRequest>;
  getRequest(id: number): Promise<DocumentRequest | undefined>;
  getAllRequests(): Promise<DocumentRequest[]>;
  updateRequestStatus(id: number, status: RequestStatus): Promise<DocumentRequest>;
  getCurrentQueueNumber(): Promise<number>;
}

export class MemStorage implements IStorage {
  private requests: Map<number, DocumentRequest>;
  private currentId: number;
  private currentQueueNumber: number;

  constructor() {
    this.requests = new Map();
    this.currentId = 1;
    this.currentQueueNumber = 1;
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
