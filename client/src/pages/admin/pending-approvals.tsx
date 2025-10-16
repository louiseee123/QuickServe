
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Loader2, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { databases, DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID } from "@/lib/appwrite";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function PendingApprovals() {
  const queryClient = useQueryClient();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [isDenyModalOpen, setIsDenyModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isConfirmApproveModalOpen, setIsConfirmApproveModalOpen] = useState(false);

  const { data: requests = [], isLoading, isError, error } = useQuery<any[]>({
      queryKey: ['requests', 'pending-approvals'],
      queryFn: async () => {
        const response = await databases.listDocuments(
            DATABASE_ID,
            DOCUMENT_REQUESTS_COLLECTION_ID
        );
        return response.documents
          .filter(doc => doc.status === 'pending_approval')
          .map(doc => {
            let parsedDocuments = [];
            try {
              if (doc.documents && typeof doc.documents === 'string') {
                const parsed = JSON.parse(doc.documents);
                parsedDocuments = Array.isArray(parsed) ? parsed : [];
              } else if (Array.isArray(doc.documents)) {
                parsedDocuments = doc.documents;
              }
            } catch (e) {
              console.error(`Failed to parse documents for request ${doc.$id}:`, e);
            }
            return {
                ...doc,
                documents: parsedDocuments
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
      queryClient.invalidateQueries({ queryKey: ['requests', 'pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['requests', 'pending-payment'] });
      if (variables.status === 'denied') {
        toast.success(`Request has been denied.`);
      } else {
        toast.success(`Request has been ${variables.status === 'pending_payment' ? 'approved' : 'updated'}.`);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleAction = (id: string, status: string, rejectionReason?: string) => {
    mutation.mutate({ id, status, rejectionReason });
  };

  const handleViewDetails = (request: any) => {
    setSelectedRequest(request);
    setIsViewModalOpen(true);
  };

  const columns = [
    {
        header: "Requestor",
        cell: (request) => <span className="text-gray-900">{request.studentName}</span>,
    },
    {
        header: "Purpose",
        cell: (request) => <span className="text-gray-900">{request.purpose}</span>,
    },
    {
        header: "Documents",
        cell: (request) => {
            const docs = request.documents;
            if (!Array.isArray(docs) || docs.length === 0) {
                return <span className="text-gray-500">No documents</span>;
            }
            return (
                <ul className="list-disc pl-5 text-gray-900">
                    {docs.map((doc: any, index: number) => (
                        <li key={index}>{doc.name}</li>
                    ))}
                </ul>
            );
        },
    },
    {
        header: "Total Amount",
        cell: (request) => {
            const amount = request.totalAmount;
            return <span className="text-gray-900">{typeof amount === 'number' ? `₱${amount.toFixed(2)}` : 'N/A'}</span>;
        },
    },
    {
        header: "Status",
        cell: (request) => {
          const status = request.status || "unknown";
          const formattedStatus = status.replace(/_/g, ' ').replace(/\b\w/g, (char: string) => char.toUpperCase());
          return <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">{formattedStatus}</Badge>;
        },
      },
    {
      header: "Actions",
      cell: (request) => {
        return (
            <div className="flex items-center gap-2">
                 <Button variant="secondary" size="sm" onClick={() => handleViewDetails(request)}>
                    Manage
                </Button>
            </div>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (isError) {
      return (
        <div className="flex justify-center items-center h-screen text-red-500">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Error Loading Requests</h2>
                <p>{error?.message || "An unexpected error occurred."}</p>
            </div>
        </div>
      )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <main className="container mx-auto py-8 pt-32">
        <Card className="bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-gray-800">Pending Approvals</CardTitle>
            <CardDescription className="text-gray-600">Review and approve or deny document requests.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={requests} />
          </CardContent>
        </Card>

        {selectedRequest && (
          <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
            <DialogContent className="max-w-3xl bg-gradient-to-br from-gray-50 to-blue-100 border-blue-200 text-gray-800">
              <DialogHeader>
                <DialogTitle className="text-blue-900 text-2xl">Request Details</DialogTitle>
                <p className="text-xs text-gray-500 pt-1">Request ID: {selectedRequest.$id}</p>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 py-4 max-h-[60vh] overflow-y-auto px-2 -mx-2">
                <div className="bg-white/50 p-3 rounded-lg border border-blue-200/30">
                  <h3 className="font-semibold text-blue-900/70 mb-1 text-sm">Student Name</h3>
                  <p className="text-blue-900 font-medium">{selectedRequest.studentName}</p>
                </div>
                 <div className="bg-white/50 p-3 rounded-lg border border-blue-200/30">
                  <h3 className="font-semibold text-blue-900/70 mb-1 text-sm">Student ID</h3>
                  <p className="text-blue-900 font-medium">{selectedRequest.studentId}</p>
                </div>
                 <div className="bg-white/50 p-3 rounded-lg border border-blue-200/30">
                  <h3 className="font-semibold text-blue-900/70 mb-1 text-sm">Course & Year</h3>
                  <p className="text-blue-900 font-medium">{selectedRequest.course} - {selectedRequest.yearLevel}</p>
                </div>
                <div className="bg-white/50 p-3 rounded-lg border border-blue-200/30">
                  <h3 className="font-semibold text-blue-900/70 mb-1 text-sm">Email</h3>
                  <p className="text-blue-900 font-medium">{selectedRequest.email}</p>
                </div>
                <div className="md:col-span-2 bg-white/50 p-4 rounded-lg border border-blue-200/30">
                  <h3 className="font-semibold text-blue-900/70 mb-1 text-sm">Purpose of Request</h3>
                  <p className="text-blue-900 font-medium">{selectedRequest.purpose}</p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="font-semibold text-blue-900/70 mb-2 text-sm">Requested Documents</h3>
                  <ul className="space-y-2">
                    {selectedRequest.documents.map((doc: any, index: number) => (
                      <li key={index} className="flex justify-between items-center bg-white/60 p-3 rounded-lg border border-blue-200/50">
                        <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-blue-600"/>
                            <span className="text-blue-900">{doc.name}</span>
                        </div>
                        <span className="font-semibold text-blue-900">₱{doc.price?.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                 <div className="md:col-span-2 text-right mt-4 pr-2">
                    <h3 className="font-bold text-xl text-blue-900">Total Amount: ₱{selectedRequest.totalAmount.toFixed(2)}</h3>
                </div>
              </div>
              <DialogFooter className="mt-4 sm:justify-start gap-2">
                 <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => setIsConfirmApproveModalOpen(true)}
                >
                    Approve
                </Button>
                <Button 
                    variant="destructive" 
                    onClick={() => setIsDenyModalOpen(true)}
                >
                    Deny
                </Button>
                <Button 
                    variant="ghost" 
                    className="text-gray-600 hover:bg-gray-200/50"
                    onClick={() => setIsViewModalOpen(false)}
                >
                    Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {selectedRequest && (
            <Dialog open={isConfirmApproveModalOpen} onOpenChange={setIsConfirmApproveModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Approval</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to approve this request?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsConfirmApproveModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => {
                                handleAction(selectedRequest.$id, "pending_payment");
                                setIsConfirmApproveModalOpen(false);
                                setIsViewModalOpen(false);
                            }}
                        >
                            Yes, Approve
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )}

        {selectedRequest && (
            <Dialog open={isDenyModalOpen} onOpenChange={setIsDenyModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Deny Request</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for denying this request. This will be sent to the student.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="reason" className="text-right">
                                Reason
                            </Label>
                            <Textarea
                                id="reason"
                                placeholder="Enter reason for rejection..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="col-span-3 min-h-[100px]"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDenyModalOpen(false)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            disabled={!rejectionReason.trim()}
                            onClick={() => {
                                handleAction(selectedRequest.$id, "denied", rejectionReason);
                                setIsDenyModalOpen(false);
                                setIsViewModalOpen(false);
                                setRejectionReason(""); // Reset reason
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
