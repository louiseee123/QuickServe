
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { databases, DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID } from "@/lib/appwrite";

export default function PendingApprovals() {
  const queryClient = useQueryClient();
  const { data: requests = [], isLoading, isError, error } = useQuery<any[]>({
      queryKey: ['requests', 'pending-approvals'],
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
        .filter(doc => doc.status === 'pending_approval');
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests', 'pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['requests', 'pending-payment'] });
      toast.success(`Request status has been updated.`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleAction = (id: string, status: string) => {
    mutation.mutate({ id, status });
  };

  const columns = [
    {
      header: "Document Name",
      cell: (row: any) => {
        const docs = row.documents;
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
            const amount = row.totalAmount;
            return <span className="text-gray-700">{typeof amount === 'number' ? `₱${amount.toFixed(2)}` : 'N/A'}</span>;
        },
    },
    {
        header: "Status",
        cell: (row: any) => {
          const status = row.status || "unknown";
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
    {
      header: 'Actions',
      cell: (row: any) => {
        const { $id } = row;
        if (!$id) return null;

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">Action</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleAction($id, "pending_payment")}>
                    Accept
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAction($id, "denied")}>
                    Deny
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
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

  if (isError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
            <main className="container mx-auto py-8 pt-24 flex justify-center items-center h-screen">
                <div className="text-red-500 text-center">
                    <h2 className="text-2xl font-bold mb-2">Error</h2>
                    <p>{error?.message || "An unexpected error occurred."}</p>
                </div>
            </main>
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
      </main>
    </div>
  );
}
