
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Loader2, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { databases, DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID } from "@/lib/appwrite";

export default function PendingApprovals() {
  const queryClient = useQueryClient();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

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
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
        const response = await databases.updateDocument(
            DATABASE_ID,
            DOCUMENT_REQUESTS_COLLECTION_ID,
            id,
            { status }
        );
        return response;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requests', 'pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['requests', 'pending-payment'] });
      toast.success(`Request has been ${variables.status === 'pending_payment' ? 'approved' : 'denied'}.`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleAction = (id: string, status: string) => {
    mutation.mutate({ id, status });
  };

  const handleViewDetails = (request: any) => {
    setSelectedRequest(request);
    setIsViewModalOpen(true);
  };

  const columns = [
    {
        header: "Requestor",
        cell: (request) => <span>{request.studentName}</span>,
    },
    {
        header: "Purpose",
        cell: (request) => <span>{request.purpose}</span>,
    },
    {
        header: "Documents",
        cell: (request) => {
            const docs = request.documents;
            if (!Array.isArray(docs) || docs.length === 0) {
                return <span className="text-gray-500">No documents</span>;
            }
            return (
                <ul className="list-disc pl-5">
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
            return <span>{typeof amount === 'number' ? `₱${amount.toFixed(2)}` : 'N/A'}</span>;
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
                    View Details
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleAction(request.$id, "pending_payment")}>
                            Approve Request
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => handleAction(request.$id, "denied")}>
                            Deny Request
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
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
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Request Details</DialogTitle>
                <DialogDescription>Review the full details of the request before taking action.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 py-4 max-h-[60vh] overflow-y-auto px-2">
                <div>
                  <h3 className="font-semibold text-gray-600 mb-1">Student Name</h3>
                  <p className="text-gray-900">{selectedRequest.studentName}</p>
                </div>
                 <div>
                  <h3 className="font-semibold text-gray-600 mb-1">Student ID</h3>
                  <p className="text-gray-900">{selectedRequest.studentId}</p>
                </div>
                 <div>
                  <h3 className="font-semibold text-gray-600 mb-1">Course & Year</h3>
                  <p className="text-gray-900">{selectedRequest.course} - {selectedRequest.yearLevel}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-600 mb-1">Email</h3>
                  <p className="text-gray-900">{selectedRequest.email}</p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="font-semibold text-gray-600 mb-1">Purpose of Request</h3>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md border">{selectedRequest.purpose}</p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="font-semibold text-gray-600 mb-2">Requested Documents</h3>
                  <ul className="space-y-2">
                    {selectedRequest.documents.map((doc: any, index: number) => (
                      <li key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-md border">
                        <span className="text-gray-800">{doc.name}</span>
                        <span className="font-semibold text-gray-900">₱{doc.price?.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                 <div className="md:col-span-2 text-right mt-4">
                    <h3 className="font-bold text-xl text-gray-800">Total Amount: ₱{selectedRequest.totalAmount.toFixed(2)}</h3>
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>Close</Button>
                <Button variant="destructive" onClick={() => { handleAction(selectedRequest.$id, "denied"); setIsViewModalOpen(false); }}>Deny</Button>
                <Button onClick={() => { handleAction(selectedRequest.$id, "pending_payment"); setIsViewModalOpen(false); }}>Approve</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
}
