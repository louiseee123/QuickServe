
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
import { DocumentRequest } from "@shared/schema";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExternalLink } from "lucide-react";

interface RequestDetailsDialogProps {
  request: DocumentRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateRequest: (args: { id: string; status: string }) => void;
  receiptUrl: string | null;
  mode?: "view" | "approval";
}

export function RequestDetailsDialog({
  request,
  open,
  onOpenChange,
  onUpdateRequest,
  receiptUrl,
  mode = "view",
}: RequestDetailsDialogProps) {

  if (!request) return null;

  const handleStatusUpdate = (status: string) => {
    onUpdateRequest({ id: request.$id, status });
    onOpenChange(false);
  };

  const documentStatusColors: { [key: string]: string } = {
    submitted: "bg-blue-500",
    denied: "bg-red-500",
    processing: "bg-yellow-500",
    ready: "bg-green-500",
    completed: "bg-gray-500",
  };

  const paymentStatusColors: { [key: string]: string } = {
    unpaid: "bg-red-500",
    paid: "bg-green-500",
    pending_verification: "bg-yellow-500",
    payment_denied: "bg-red-700",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Document Request Details</DialogTitle>
          <DialogDescription>
            Request ID: {request.$id} - Submitted{" "}
            {format(new Date(request.$createdAt), "MMM d, yyyy h:mm a")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Student Information</h3>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Name:</span> {request.studentName}</p>
                <p><span className="font-medium">ID:</span> {request.studentId}</p>
                <p><span className="font-medium">Email:</span> {request.email}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Request Information</h3>
              <div className="text-sm space-y-2">
                 <p><span className="font-medium">Documents:</span> {request.documents.map(d => d.name).join(', ')}</p>
                <p className="flex items-center gap-2">
                  <span className="font-medium">Document Status:</span>
                  <Badge className={documentStatusColors[request.document_status]}>
                    {request.document_status.replace("_", " ")}
                  </Badge>
                </p>
                <p className="flex items-center gap-2">
                    <span className="font-medium">Payment Status:</span>
                    <Badge className={paymentStatusColors[request.payment_status]}>
                        {request.payment_status.replace("_", " ")}
                    </Badge>
                </p>
              </div>
            </div>
          </div>

          {receiptUrl && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Payment Receipt</h3>
              <div className="border rounded-lg p-2 bg-gray-50">
                  <a href={receiptUrl} target="_blank" rel="noopener noreferrer" className="block hover:opacity-90 transition-opacity">
                    <img src={receiptUrl} alt="Payment Receipt" className="max-w-full h-auto rounded-md shadow-sm" />
                  </a>
                  <a href={receiptUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline mt-2 inline-flex items-center gap-1">
                      View full size <ExternalLink className="h-4 w-4" />
                  </a>
              </div>
            </div>
          )}

          {mode === "approval" && request.payment_status === "pending_verification" && (
             <Alert>
                <AlertTitle>Payment Verification</AlertTitle>
                <AlertDescription>
                  A receipt has been uploaded for this request. Please review the receipt and approve or deny the payment.
                </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="mt-4">
          {mode === "approval" && request.payment_status === "pending_verification" && (
            <div className="flex w-full justify-end gap-2">
              <Button
                variant="destructive"
                onClick={() => handleStatusUpdate("payment_denied")}
              >
                Deny Payment
              </Button>
              <Button
                variant="success"
                onClick={() => handleStatusUpdate("paid")}
              >
                Approve Payment
              </Button>
            </div>
          )}
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
