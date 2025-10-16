
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { databases, storage, DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID, RECEIPTS_BUCKET_ID } from "@/lib/appwrite";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Query } from 'appwrite';

export default function PendingPayments() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDenyModalOpen, setIsDenyModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: requests = [], isLoading } = useQuery<any[]>({
      queryKey: ['requests', 'pending-payment'],
      queryFn: async () => {
        const response = await databases.listDocuments(
            DATABASE_ID,
            DOCUMENT_REQUESTS_COLLECTION_ID,
            [Query.equal('status', ['pending_payment', 'pending_verification'])]
        );
        return response.documents.map(doc => {
            let parsedDocuments = [];
            try {
              if (typeof doc.documents === 'string') {
                parsedDocuments = JSON.parse(doc.documents);
              } else if (Array.isArray(doc.documents)) {
                parsedDocuments = doc.documents;
              }
            } catch (e) {
              console.error(`Failed to parse documents for request ${doc.$id}:`, e);
            }
            const receiptUrl = doc.receiptId ? storage.getFileView(RECEIPTS_BUCKET_ID, doc.receiptId).href : null;
            return {
                ...doc,
                documents: parsedDocuments,
                receiptUrl: receiptUrl
            };
        });
      },
  });

  const mutation = useMutation({
    mutationFn: async ({ id, status, rejectionReason }: { id: string; status: string; rejectionReason?: string }) => {
      const payload: { status: string; rejectionReason?: string } = { status };
      if (status === 'denied' && rejectionReason) {
          payload.rejectionReason = rejectionReason;
      }
      const response = await databases.updateDocument(
          DATABASE_ID,
          DOCUMENT_REQUESTS_COLLECTION_ID,
          id,
          payload
      );
      return response;
  },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requests', 'pending-payment'] });
      queryClient.invalidateQueries({ queryKey: ['requests', 'processing'] });
      toast.success(`Payment has been ${variables.status === 'processing' ? 'confirmed' : 'denied'}.`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleAction = (id: string, status: string, rejectionReason?: string) => {
    mutation.mutate({ id, status, rejectionReason });
  };

  const openModal = (request: any) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const columns = [
    {
      header: "Document Name",
      cell: (row: any) => {
        const docs = row?.documents;
        if (!Array.isArray(docs)) {
          return <span className="text-red-500">Invalid Data</span>;
        }
        return (
          <ul className="list-disc pl-4">
            {docs.map((doc: any, index: number) => (
              <li key={doc.id || index} className="text-gray-700">{doc.name || "Unnamed Document"}</li>
            ))}
          </ul>
        );
      },
    },
    {
      header: "Purpose of Request",
      cell: (row: any) => <span className="text-gray-700">{row.purpose}</span>,
    },
    {
      header: "Name of the Requestor",
      cell: (row: any) => <span className="text-gray-700">{row.studentName}</span>,
    },
    {
      header: "Price",
      cell: (row: any) => {
        const amount = row?.totalAmount;
        return <span className="text-gray-700">{typeof amount === 'number' ? `₱${amount.toFixed(2)}` : 'N/A'}</span>;
      },
    },
    {
        header: "Status",
        cell: (row: any) => {
          const status = row?.status || "unknown";
          const formattedStatus = status.replace(/_/g, ' ').replace(/\b\w/g, (char: string) => char.toUpperCase());
          return (
            <Badge
              className={`text-white bg-gray-400 ${
                {
                  pending_approval: "bg-orange-400",
                  pending_payment: "bg-yellow-500",
                  pending_verification: "bg-indigo-500",
                  processing: "bg-blue-500",
                  completed: "bg-green-500",
                  denied: "bg-red-500",
                }[status]
              }`}
            >
              {formattedStatus}
            </Badge>
          );
        },
      },
      {
        header: "Action",
        cell: (row: any) => (
          <Button variant="secondary" size="sm" onClick={() => openModal(row)} disabled={!row.receiptId}>
            Manage
          </Button>
        ),
      },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
        <main className="container mx-auto py-8 pt-24 flex justify-center items-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <main className="container mx-auto py-8 pt-32">
        <Card className="bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-gray-800">Pending Payments</CardTitle>
            <CardDescription className="text-gray-600">Requests that are awaiting payment or verification.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={requests} />
          </CardContent>
        </Card>

        {selectedRequest && (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="max-w-2xl bg-white text-gray-800">
              <DialogHeader>
                <DialogTitle className="text-blue-900">Payment Verification</DialogTitle>
                <DialogDescription className="text-gray-600 pt-2">
                  Review the payment receipt and confirm or deny the payment.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <img src={selectedRequest.receiptUrl} alt="Payment Receipt" className="rounded-lg border border-gray-200" />
              </div>
              <DialogFooter className="mt-4 sm:justify-end gap-2">
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={() => { setIsModalOpen(false); setIsDenyModalOpen(true); }}>Deny</Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => { handleAction(selectedRequest.$id, "processing"); setIsModalOpen(false); }}>Confirm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {selectedRequest && (
            <Dialog open={isDenyModalOpen} onOpenChange={setIsDenyModalOpen}>
                <DialogContent className="bg-white text-gray-800">
                    <DialogHeader>
                        <DialogTitle className="text-red-900">Deny Payment</DialogTitle>
                        <DialogDescription className="text-gray-600 pt-2">
                            Please provide a reason for denying this payment.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="grid w-full gap-1.5">
                            <Label htmlFor="reason" className="text-gray-700">Reason for Rejection</Label>
                            <Textarea
                                id="reason"
                                placeholder="Please provide a clear reason for denying the payment..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="min-h-[120px] bg-gray-50 border-gray-300 focus:border-red-500 focus:ring-red-500"
                            />
                        </div>
                    </div>
                    <DialogFooter className="mt-4 sm:justify-end gap-2">
                        <Button variant="ghost" onClick={() => setIsDenyModalOpen(false)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            disabled={!rejectionReason.trim()}
                            onClick={() => {
                                handleAction(selectedRequest.$id, "denied", rejectionReason);
                                setIsDenyModalOpen(false);
                                setRejectionReason("");
                            }}
                        >
                            Submit Rejection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )}
      </main>
    </div>
  );
}
