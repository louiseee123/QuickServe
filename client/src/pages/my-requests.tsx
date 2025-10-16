import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { databases, DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID } from "@/lib/appwrite";

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
        const formattedStatus = status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
        return (
          <div className="flex items-center justify-center h-full">
            <Badge
              className={`text-white text-center ${
                {
                  pending_approval: "bg-orange-400",
                  pending_payment: "bg-yellow-500",
                  processing: "bg-blue-500",
                  completed: "bg-green-500",
                  denied: "bg-red-500",
                }[status]
              }`}
            >
              {formattedStatus}
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
