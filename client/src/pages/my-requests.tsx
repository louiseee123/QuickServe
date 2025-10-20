
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Loader2, FileText, Clock, CheckCircle, Hourglass, CreditCard, XCircle, CheckCircle2, ShoppingCart } from "lucide-react";
import { Link, useLocation } from "wouter";
import { databases, DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID } from "@/lib/appwrite";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProcessingProgressBar from "@/components/ui/processing-progress-bar";

const statusConfig = {
  pending_approval: {
    icon: <Hourglass className="h-4 w-4 mr-2" />,
    text: "Pending Approval",
    color: "bg-orange-400",
  },
  pending_payment: {
    icon: <CreditCard className="h-4 w-4 mr-2" />,
    text: "Pending Payment",
    color: "bg-yellow-500",
  },
  pending_verification: {
    icon: <Clock className="h-4 w-4 mr-2" />,
    text: "Pending Verification",
    color: "bg-yellow-500",
  },
  processing: {
    icon: <Clock className="h-4 w-4 mr-2" />,
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


export default function MyRequests() {
  const [, navigate] = useLocation();
  const [statusFilter, setStatusFilter] = useState("all");
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isProcessingModalOpen, setIsProcessingModalOpen] = useState(false);
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

  const { data: requests = [], isLoading } = useQuery<any[]>(['requests', 'all'], async () => {
    const response = await databases.listDocuments(DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID);
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
      };
    });
  });

  const filteredRequests = statusFilter === "all"
    ? requests
    : requests.filter(request => request.status === statusFilter);

  const handleReview = (request) => {
    setSelectedRequest(request);
    setIsRejectionModalOpen(true);
  };
  
  const handleOpenModal = (request, setModalOpen) => {
    setSelectedRequest(request);
    setModalOpen(true);
  };

  const columns = [
    {
      header: "Document Name",
      cell: (row) => {
        const docs = row.documents;
        if (!Array.isArray(docs)) {
          return <span className="text-red-500">Invalid Data</span>;
        }
        return (
          <ul className="list-disc pl-4">
            {docs.map((doc, index) => (
              <li key={doc.id || index} className="text-gray-700">{doc.name || "Unnamed Document"}</li>
            ))}
          </ul>
        );
      },
    },
    {
      header: "Purpose of Request",
      cell: (row) => <span className="text-gray-700">{row.purpose || 'N/A'}</span>,
    },
    {
      header: "Requestor",
      cell: (row) => <span className="text-gray-700">{row.studentName || 'N/A'}</span>,
    },
    {
      header: "Price",
      cell: (row) => {
        const amount = row.totalAmount;
        return <span className="text-gray-700">{typeof amount === 'number' ? `₱${amount.toFixed(2)}` : 'N/A'}</span>;
      },
    },
    {
      header: "Status",
      cell: (row) => {
        const status = row.status || "unknown";
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
      cell: (row) => {
        const handleProceed = () => {
          navigate(`/checkout?requestId=${row.$id}&totalAmount=${row.totalAmount}`);
        };

        if (row.status === 'pending_payment') {
          return (
            <Button className="bg-green-500 hover:bg-green-600 text-white rounded-md shadow-sm" size="sm" onClick={handleProceed}>
              Proceed
            </Button>
          );
        }

        if (row.status === 'pending_verification') {
            return (
              <Button variant="secondary" size="sm" onClick={() => handleOpenModal(row, setIsVerificationModalOpen)}>
                View
              </Button>
            );
        }

        if (row.status === 'processing') {
          return (
            <Button variant="secondary" size="sm" onClick={() => handleOpenModal(row, setIsProcessingModalOpen)}>
              View
            </Button>
          );
        }

        if (row.status === 'ready_for_pickup') {
            return (
              <Button variant="secondary" size="sm" onClick={() => handleOpenModal(row, setIsPickupModalOpen)}>
                View
              </Button>
            );
        }

        if (row.status === 'denied') {
          return (
            <Button variant="secondary" size="sm" onClick={() => handleReview(row)}>
              Review
            </Button>
          );
        }

        return <Button variant="outline" size="sm" disabled>Action</Button>;
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200">
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto pt-24 px-4 pb-8"
      >
        <div className="w-full max-w-5xl mb-12 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="flex flex-col items-center">
                    <div className="bg-white rounded-full p-4 mb-4 shadow-md">
                        <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-lg text-blue-800">Step 1: Submit a Request</h3>
                    <p className="text-sm text-gray-600">Start by filling out the request form.</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="bg-white rounded-full p-4 mb-4 shadow-md">
                        <Clock className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-lg text-blue-800">Step 2: Track Your Request</h3>
                    <p className="text-sm text-gray-600">Monitor the status of your request in real-time.</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="bg-white rounded-full p-4 mb-4 shadow-md">
                        <CheckCircle className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-lg text-blue-800">Step 3: Receive Documents</h3>
                    <p className="text-sm text-gray-600">Get notified when your documents are ready for pickup or download.</p>
                </div>
            </div>
        </div>
        <div className="text-center mb-12">
          <Link to="/request">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg text-lg transition-transform transform hover:scale-105">
                  Create a New Request
              </Button>
          </Link>
        </div>
        <Card className="w-full bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden border border-blue-100">
          <CardHeader className="text-center p-8 bg-blue-50/80">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}>
              <CardTitle className="text-3xl font-bold text-blue-900">Your Requests</CardTitle>
              <CardDescription className="text-blue-700/90 pt-2">All of your document requests</CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            <div className="flex justify-end mb-4">
              <Select onValueChange={setStatusFilter} value={statusFilter}>
                <SelectTrigger className="w-[200px] bg-gray-100 text-gray-800 border-gray-300 focus:ring-blue-500">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.keys(statusConfig).filter(key => key !== 'unknown').map(status => (
                    <SelectItem key={status} value={status}>
                      <div className="flex items-center">
                        {statusConfig[status].icon}
                        <span>{statusConfig[status].text}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {isLoading && (
              <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
              </div>
            )}

            {!isLoading && filteredRequests.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-4">
                <DataTable columns={columns} data={filteredRequests} />
              </motion.div>
            )}

            {!isLoading && filteredRequests.length === 0 && (
                <div className="text-center py-10">
                    <p className="text-lg text-gray-600 font-semibold">
                      {statusFilter === 'all' ? 'There are no requests yet.' : `There are no requests with the status "${statusConfig[statusFilter].text}".`}
                    </p>
                    <p className="text-muted-foreground">
                      {statusFilter === 'all' ? 'When new requests are made, they will appear here.' : 'Try selecting a different status.'}
                    </p>
                </div>
            )}

          </CardContent>
        </Card>
      </motion.main>

        {selectedRequest && (
            <Dialog open={isRejectionModalOpen} onOpenChange={setIsRejectionModalOpen}>
                <DialogContent className="bg-white text-gray-800">
                    <DialogHeader>
                        <DialogTitle className="text-red-900">Reason for Rejection</DialogTitle>
                        <DialogDescription className="text-gray-600 pt-2">
                            Your request was denied for the following reason:
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="text-gray-700 bg-gray-100 p-4 rounded-md border border-gray-200">
                        {selectedRequest.rejectionReason || "No reason provided."}
                      </p>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsRejectionModalOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )}

        <Dialog open={isVerificationModalOpen} onOpenChange={setIsVerificationModalOpen}>
            <DialogContent className="bg-white text-gray-800">
                <DialogHeader>
                    <DialogTitle className="text-blue-900">Under Verification</DialogTitle>
                    <DialogDescription className="text-gray-600 pt-2">
                        This Request is currently under verification, please come back later.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4 sm:justify-end gap-2">
                    <Button variant="ghost" onClick={() => setIsVerificationModalOpen(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog open={isProcessingModalOpen} onOpenChange={setIsProcessingModalOpen}>
            <DialogContent className="bg-white text-gray-800">
                <DialogHeader>
                    <DialogTitle className="text-blue-900">Request is Processing</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  {selectedRequest && (
                    <ProcessingProgressBar
                      processingStartedAt={selectedRequest.processingStartedAt}
                      estimatedCompletionDays={selectedRequest.estimatedCompletionDays}
                    />
                  )}
                  <p className="text-gray-600 pt-4 text-center">
                      Thank you for your payment. Your requested document is now being processed. This will take a couple of days. You will be notified when it is ready.
                  </p>
                </div>
                <DialogFooter className="mt-4 sm:justify-end gap-2">
                    <Button variant="ghost" onClick={() => setIsProcessingModalOpen(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog open={isPickupModalOpen} onOpenChange={setIsPickupModalOpen}>
            <DialogContent className="bg-white text-gray-800">
                <DialogHeader>
                    <DialogTitle className="text-teal-900">Ready for Pickup</DialogTitle>
                    <DialogDescription className="text-gray-600 pt-2">
                        Your request is now ready for pickup. Please proceed to the designated office to claim your document.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4 sm:justify-end gap-2">
                    <Button variant="ghost" onClick={() => setIsPickupModalOpen(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}
