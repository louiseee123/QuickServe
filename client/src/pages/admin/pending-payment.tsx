
import { useQuery } from '@tanstack/react-query';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { databases, DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID } from "@/lib/appwrite";

export default function PendingPayments() {
  const { data: requests = [], isLoading } = useQuery<any[]>({
      queryKey: ['requests', 'pending-payment'],
      queryFn: async () => {
        const response = await databases.listDocuments(
            DATABASE_ID,
            DOCUMENT_REQUESTS_COLLECTION_ID
        );
        return response.documents
          .filter(doc => doc) // Filter out null/undefined documents
          .map(doc => {
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
        })
        .filter(doc => doc.status === 'pending_payment');
      },
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
          const formattedStatus = status.replace(/_/g, ' ').replace(/\b\w/g, (char: string) => char.toUpperCase());
          return (
            <Badge
              className={`text-white bg-gray-400 ${
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
          );
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
            <CardTitle className="text-3xl font-bold text-gray-800">Pending Payments</CardTitle>
            <CardDescription className="text-gray-600">Requests that have been approved and are awaiting payment.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={requests} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
