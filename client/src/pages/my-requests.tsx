import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Loader2, FileText, Clock, CheckCircle, Hourglass, CreditCard, XCircle, CheckCircle2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { databases, DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID } from "@/lib/appwrite";

// Define a mapping for status properties
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
  processing: {
    icon: <Clock className="h-4 w-4 mr-2" />,
    text: "Processing",
    color: "bg-blue-500",
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

  const { data: requests = [], isLoading } = useQuery<any[]>({
    queryKey: ['requests', 'all'],
    queryFn: async () => {
      const response = await databases.listDocuments(
        DATABASE_ID,
        DOCUMENT_REQUESTS_COLLECTION_ID
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
          documents: parsedDocuments
        };
      });
    },
  });

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
            <Badge className={`text-white text-center flex items-center ${color}`}>
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
                    <Link to="/request"><Button variant="link" className="mt-2">New Request</Button></Link>
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
        <Card className="w-full bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden border border-blue-100">
          <CardHeader className="text-center p-8 bg-blue-50/80">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}>
              <CardTitle className="text-3xl font-bold text-blue-900">Your Requests</CardTitle>
              <CardDescription className="text-blue-700/90 pt-2">All of your document requests</CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            {isLoading && (
              <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
              </div>
            )}

            {!isLoading && requests.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-4">
                <DataTable columns={columns} data={requests} />
              </motion.div>
            )}

            {!isLoading && requests.length === 0 && (
                <div className="text-center py-10">
                    <p className="text-lg text-gray-600 font-semibold">There are no requests yet.</p>
                    <p className="text-muted-foreground">When new requests are made, they will appear here.</p>
                </div>
            )}

          </CardContent>
        </Card>
      </motion.main>
    </div>
  );
}
