
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clock, CreditCard, Hourglass, ShoppingCart, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { databases, DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID } from "@/lib/appwrite";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Query } from 'appwrite';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const statusConfig = {
    pending_payment: {
      icon: <CreditCard className="h-4 w-4 mr-2" />,
      text: "Pending Payment",
      color: "bg-yellow-500",
    },
    pending_verification: {
      icon: <Clock className="h-4 w-4 mr-2" />,
      text: "Pending Verification",
      color: "bg-indigo-500",
    },
    processing: {
      icon: <Hourglass className="h-4 w-4 mr-2" />,
      text: "Processing",
      color: "bg-blue-500",
    },
    ready_for_pickup: {
        icon: <ShoppingCart className="h-4 w-4 mr-2" />,
        text: "Ready for Pickup",
        color: "bg-teal-500",
    },
    completed: {
        icon: <CheckCircle2 className="h-4 w-4 mr-2" />,
        text: "Completed",
        color: "bg-green-500",
    },
    denied: {
        icon: <XCircle className="h-4 w-4 mr-2" />,
        text: "Denied",
        color: "bg-red-500",
    },
    unknown: {
        icon: <FileText className="h-4 w-4 mr-2" />,
        text: "Unknown",
        color: "bg-gray-400",
    }
  };

export default function OngoingRequests() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDenyModalOpen, setIsDenyModalOpen] = useState(false);
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [yearLevelFilter, setYearLevelFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("most-recent");

  const { data: requests = [], isLoading } = useQuery<any[]>({
      queryKey: ['requests', 'ongoing'],
      queryFn: async () => {
        const response = await databases.listDocuments(
            DATABASE_ID,
            DOCUMENT_REQUESTS_COLLECTION_ID,
            [Query.equal('status', ['pending_payment', 'pending_verification', 'processing', 'ready_for_pickup'])]
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
            return {
                ...doc,
                documents: parsedDocuments,
                receiptUrl: doc.receipt
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
        queryClient.invalidateQueries({ queryKey: ['requests', 'ongoing'] });
        queryClient.invalidateQueries({ queryKey: ['requests', 'all'] });

        let message = 'Request status has been updated.';
        if (variables.status === 'processing') {
            message = 'Payment has been confirmed.';
        } else if (variables.status === 'denied') {
            message = 'Payment has been denied.';
        } else if (variables.status === 'ready_for_pickup') {
            message = 'Request is now ready for pickup.';
        } else if (variables.status === 'completed') {
          message = 'Request has been marked as completed.';
        }
        toast.success(message);
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

  const openPickupModal = (request: any) => {
    setSelectedRequest(request);
    setIsPickupModalOpen(true);
  };

  const openCompletionModal = (request: any) => {
    setSelectedRequest(request);
    setIsCompletionModalOpen(true);
  };
  
  const courses = [...new Set(requests.map(req => req.course))];
  const yearLevels = [...new Set(requests.map(req => req.yearLevel))];

  const sortedAndFilteredRequests = requests
  .filter(request => {
    const statusMatch = statusFilter === "all" || request.status === statusFilter;
    const courseMatch = courseFilter === "all" || request.course === courseFilter;
    const yearLevelMatch = yearLevelFilter === "all" || request.yearLevel === yearLevelFilter;
    return statusMatch && courseMatch && yearLevelMatch;
  })
  .sort((a, b) => {
    const dateA = new Date(a.$createdAt).getTime();
    const dateB = new Date(b.$createdAt).getTime();
    return sortOrder === 'most-recent' ? dateB - dateA : dateA - dateB;
  });

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
            const { icon, text, color } = statusConfig[status] || statusConfig.unknown;
    
            return (
              <div className="flex items-center justify-center h-full">
                <Badge className={`text-black text-center flex items-center ${color}`}>
                  {icon}
                  <span>{text}</span>
                </Badge>
              </div>
            );
        },
      },
      {
        header: "Action",
        cell: (row: any) => {
            const request = row;
            if (request.status === 'pending_verification') {
                return (
                    <Button variant="secondary" size="sm" onClick={() => openModal(request)} disabled={!request.receiptUrl}>
                        View
                    </Button>
                );
            }
            if (request.status === 'pending_payment') {
                return (
                    <Button variant="outline" size="sm" disabled>
                        Awaiting Payment
                    </Button>
                );
            }
            if (request.status === 'processing') {
              return (
                <Button variant="secondary" size="sm" onClick={() => openPickupModal(request)}>
                    Set as Ready
                </Button>
              );
            }
            if (request.status === 'ready_for_pickup') {
              return (
                  <Button variant="secondary" size="sm" onClick={() => openCompletionModal(request)}>
                      Complete
                  </Button>
              );
            }
            return <span className="text-sm text-gray-500">No action</span>;
        },
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
            <CardTitle className="text-3xl font-bold text-gray-800">Ongoing Requests</CardTitle>
            <CardDescription className="text-gray-600">Manage and track all active document requests.</CardDescription>
          </CardHeader>
          <CardContent>
          <div className="flex flex-wrap justify-end gap-4 mb-4">
              <Select onValueChange={setStatusFilter} value={statusFilter}>
                <SelectTrigger className="w-[200px] bg-gray-100 text-gray-800 border-gray-300 focus:ring-blue-500">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.keys(statusConfig).filter(key => ['pending_payment', 'pending_verification', 'processing', 'ready_for_pickup'].includes(key)).map(status => (
                    <SelectItem key={status} value={status}>
                      <div className="flex items-center">
                        {statusConfig[status].icon}
                        <span>{statusConfig[status].text}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select onValueChange={setCourseFilter} value={courseFilter}>
                <SelectTrigger className="w-[200px] bg-gray-100 text-gray-800 border-gray-300 focus:ring-blue-500">
                  <SelectValue placeholder="Filter by course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map(course => (
                    <SelectItem key={course} value={course}>{course}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select onValueChange={setYearLevelFilter} value={yearLevelFilter}>
                <SelectTrigger className="w-[200px] bg-gray-100 text-gray-800 border-gray-300 focus:ring-blue-500">
                  <SelectValue placeholder="Filter by year level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Year Levels</SelectItem>
                  {yearLevels.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select onValueChange={setSortOrder} value={sortOrder}>
                <SelectTrigger className="w-[200px] bg-gray-100 text-gray-800 border-gray-300 focus:ring-blue-500">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="most-recent">Most Recent</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DataTable columns={columns} data={sortedAndFilteredRequests} />
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

        {selectedRequest && (
            <Dialog open={isPickupModalOpen} onOpenChange={setIsPickupModalOpen}>
                <DialogContent className="bg-white text-gray-800">
                    <DialogHeader>
                        <DialogTitle className="text-blue-900">Mark as Ready for Pickup</DialogTitle>
                        <DialogDescription className="text-gray-600 pt-2">
                            Are you sure this request is ready for pickup? The user will be notified of the change in status.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 sm:justify-end gap-2">
                        <Button variant="ghost" onClick={() => setIsPickupModalOpen(false)}>Cancel</Button>
                        <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => { handleAction(selectedRequest.$id, "ready_for_pickup"); setIsPickupModalOpen(false); }}>Confirm</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )}

        {selectedRequest && (
            <Dialog open={isCompletionModalOpen} onOpenChange={setIsCompletionModalOpen}>
                <DialogContent className="bg-white text-gray-800">
                    <DialogHeader>
                        <DialogTitle className="text-green-900">Confirm Completion</DialogTitle>
                        <DialogDescription className="text-gray-600 pt-2">
                            Are you sure you want to mark this request as completed? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 sm:justify-end gap-2">
                        <Button variant="ghost" onClick={() => setIsCompletionModalOpen(false)}>Cancel</Button>
                        <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => { handleAction(selectedRequest.$id, "completed"); setIsCompletionModalOpen(false); }}>Confirm Completion</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )}
      </main>
    </div>
  );
}
