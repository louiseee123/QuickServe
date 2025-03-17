import { useQuery } from "@tanstack/react-query";
import type { DocumentRequest } from "@shared/schema";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { RequestDetailsDialog } from "@/components/request-details-dialog";

const statusColors = {
  Pending: "bg-yellow-500",
  Denied: "bg-red-500",
 Accepted: "bg-yellow-500",
  Processing: "bg-blue-500",
  Ready: "bg-green-500",
  Completed: "bg-gray-500",
} as const;

export default function MyRequests() {
  const [selectedRequest, setSelectedRequest] = useState<DocumentRequest | null>(null);

  const { data: requests = [], isLoading } = useQuery<DocumentRequest[]>({
    queryKey: ["/api/requests"],
  });

  const columns = [
    {
      header: "Queue #",
      cell: (row: DocumentRequest) => row.queueNumber,
    },
    {
      header: "Document Type",
      cell: (row: DocumentRequest) => row.documentType,
    },
    {
      header: "Course",
      cell: (row: DocumentRequest) => row.course,
    },
    {
      header: "Year Level",
      cell: (row: DocumentRequest) => row.yearLevel,
    },
    {
      header: "Email",
      cell: (row: DocumentRequest) => row.email,
    },
    {
      header: "Purpose",
      cell: (row: DocumentRequest) => row.purpose,
    },
    {
      header: "Requested At",
      cell: (row: DocumentRequest) =>
        format(new Date(row.requestedAt), "MMM d, yyyy h:mm a"),
    },
    {
      header: "Status",
      cell: (row: DocumentRequest) => (
        <Badge className={statusColors[row.status]}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1).replace("_", " ")}
        </Badge>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="CCTC Logo" className="w-12 h-12" />
          <div>
            <h1 className="text-3xl font-bold">My Document Requests</h1>
            <p className="text-muted-foreground">
              Track the status of your document requests
            </p>
          </div>
        </div>
        <p className="text-muted-foreground">
          Total Requests: {requests.length}
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          You haven't made any document requests yet.
        </div>
      ) : (
        <DataTable 
          data={requests} 
          columns={columns} 
          onRowClick={(row) => setSelectedRequest(row)}
        />
      )}

      <RequestDetailsDialog
        request={selectedRequest}
        open={!!selectedRequest}
        onOpenChange={(open) => !open && setSelectedRequest(null)}
        mode="view"
      />
    </div>
  );
}