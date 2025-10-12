
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Loader2, FileText, Clock, CheckCircle } from "lucide-react";
import { useLocation, Link } from "wouter";
import { databases, DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID } from "@/lib/appwrite";
import SuccessModal from "@/components/SuccessModal";

const columns = [
  {
    header: "Document Name",
    accessorKey: "documents",
    cell: ({ row }: any) => (
      <ul className="list-disc pl-4">
        {row.original.documents.map((doc: any) => (
          <li key={doc.id}>{doc.name}</li>
        ))}
      </ul>
    ),
  },
  {
    header: "Purpose of Request",
    accessorKey: "purpose",
  },
  {
    header: "Name of the Requestor",
    accessorKey: "studentName",
  },
  {
    header: "Price",
    accessorKey: "totalAmount",
    cell: ({ row }: any) => (
      <span>₱{row.original.totalAmount.toFixed(2)}</span>
    ),
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }: any) => (
      <Badge
        className={`capitalize text-white bg-gray-400 ${
          {
            pending_approval: "bg-orange-400",
            pending_payment: "bg-yellow-500",
            processing: "bg-blue-500",
            completed: "bg-green-500",
            denied: "bg-red-500",
          }[row.original.status]
        }`}
      >
        {row.original.status.replace(/_/g, ' ')}
      </Badge>
    ),
  },
  {
    header: "Action",
    cell: () => <Button variant="outline" size="sm">Action</Button>,
  },
];

export default function MyRequests() {
  const [location, navigate] = useLocation();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      setIsSuccessModalOpen(true);
    }
  }, [location]);

  const { data: requests = [], isLoading } = useQuery<any[]>({
      queryKey: ['requests', 'all'],
      queryFn: async () => {
        const response = await databases.listDocuments(
            DATABASE_ID,
            DOCUMENT_REQUESTS_COLLECTION_ID
        );
        return response.documents.map(doc => ({
            ...doc,
            documents: JSON.parse(doc.documents)
        })) as any[];
      },
  });

  const handleCloseModal = () => {
    setIsSuccessModalOpen(false);
    navigate("/my-requests"); // Navigate back to the main page
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300">
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto pt-24 px-4 pb-8 flex flex-col items-center"
      >
        {/* 3-Step Guide */}
        <div className="w-full max-w-5xl mb-12">
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
        <Card className="w-full max-w-5xl bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="text-center p-8 bg-blue-50">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}>
              <CardTitle className="text-3xl font-bold text-blue-900">All Document Requests</CardTitle>
              <CardDescription className="text-blue-800/90 pt-2">A list of all past and current document requests from all users.</CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent className="p-8">
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
                    <Link to="/request">
                      <Button className="mt-4">Make a New Request</Button>
                    </Link>
                </div>
            )}

          </CardContent>
        </Card>
      </motion.main>
      <SuccessModal isOpen={isSuccessModalOpen} onClose={handleCloseModal} />
    </div>
  );
}
