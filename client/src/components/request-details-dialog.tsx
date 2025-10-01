import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { DocumentRequest } from "@shared/schema";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface RequestDetailsDialogProps {
  request: DocumentRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "view" | "approval";
}

export function RequestDetailsDialog({
  request,
  open,
  onOpenChange,
  mode = "view",
}: RequestDetailsDialogProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [rejectionReason, setRejectionReason] = useState("");

  const statusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      rejectionReason,
    }: {
      id: number;
      status: "pending" | "denied";
      rejectionReason?: string;
    }) => {
      const payload: { status: string; rejectionReason?: string } = { status };
      if (rejectionReason) {
        payload.rejectionReason = rejectionReason;
      }
      const res = await apiRequest("PATCH", `/api/requests/${id}/status`, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
      onOpenChange(false);
      setRejectionReason("");
      toast({
        title: "Status Updated",
        description: "The request status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  if (!request) return null;

  const statusColors = {
    pending_approval: "bg-yellow-500",
    denied: "bg-red-500",
    pending: "bg-yellow-500",
    processing: "bg-blue-500",
    ready: "bg-green-500",
    completed: "bg-gray-500",
  } as const;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Document Request Details</DialogTitle>
          <DialogDescription>
            Request #{request.queueNumber} - Submitted{" "}
            {format(new Date(request.requestedAt), "MMM d, yyyy h:mm a")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Student Information</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>ID: {request.studentId}</p>
                <p>Name: {request.studentName}</p>
                <p>Course: {request.course}</p>
                <p>Year Level: {request.yearLevel}</p>
                <p>Email: {request.email}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold">Request Information</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Document Type: {request.documentType}</p>
                <p>
                  Status:{" "}
                  <Badge className={statusColors[request.status]}>
                    {request.status.charAt(0).toUpperCase() +
                      request.status.slice(1).replace("_", " ")}
                  </Badge>
                </p>
                <p>Queue Number: #{request.queueNumber}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Purpose</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {request.purpose}
            </p>
          </div>

          {request.rejectionReason && (
            <div>
              <h3 className="font-semibold">Rejection Reason</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {request.rejectionReason}
              </p>
            </div>
          )}

          {mode === "approval" && request.status === "pending_approval" && (
            <div className="grid gap-2">
              <h3 className="font-semibold">Reason for Denial</h3>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Provide a reason for denying the request..."
              />
            </div>
          )}
        </div>

        <DialogFooter>
          {mode === "approval" && request.status === "pending_approval" && (
            <>
              <Button
                variant="destructive"
                onClick={() =>
                  statusMutation.mutate({
                    id: request.id,
                    status: "denied",
                    rejectionReason,
                  })
                }
                disabled={statusMutation.isPending || rejectionReason.trim() === ""}
              >
                Deny Request
              </Button>
              <Button
                onClick={() =>
                  statusMutation.mutate({ id: request.id, status: "pending" })
                }
                disabled={statusMutation.isPending}
              >
                Approve Request
              </Button>
            </>
          )}
          {mode === "view" && (
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
