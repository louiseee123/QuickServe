import { useQuery } from "@tanstack/react-query";
import type { DocumentRequest } from "@shared/schema";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { RequestDetailsDialog } from "@/components/request-details-dialog";

export default function PendingApprovals() {
  const [selectedRequest, setSelectedRequest] = useState<DocumentRequest | null>(
    null
  );

  const { data: requests = [], isLoading } = useQuery<DocumentRequest[]>({
    queryKey: ["/api/requests"],
  });

  const pendingApprovalRequests = requests.filter(
    (request) => request.status === "pending_approval"
  );

  const columns = [
    {
      header: "Queue #",
      cell: (row: DocumentRequest) => row.queueNumber,
    },
    {
      header: "Student Name",
      cell: (row: DocumentRequest) => row.studentName,
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
      header: "Requested At",
      cell: (row: DocumentRequest) =>
        format(new Date(row.requestedAt), "MMM d, yyyy h:mm a"),
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
      <div className="flex items-center gap-4 mb-8">
        <img src="/logo.png" alt="CCTC Logo" className="w-16 h-16" />
        <div>
          <h1 className="text-3xl font-bold">Pending Approvals</h1>
          <p className="text-muted-foreground">
            Review and approve document requests
          </p>
        </div>
      </div>

      {pendingApprovalRequests.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No requests pending approval.
        </div>
      ) : (
        <DataTable
          data={pendingApprovalRequests}
          columns={columns}
          onRowClick={(row) => setSelectedRequest(row)}
        />
      )}

      <RequestDetailsDialog
        request={selectedRequest}
        open={!!selectedRequest}
        onOpenChange={(open) => !open && setSelectedRequest(null)}
        mode="approval"
      />
    </div>
  );
}
