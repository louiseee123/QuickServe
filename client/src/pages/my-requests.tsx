import { useQuery } from "@tanstack/react-query";
import type { DocumentRequest } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { RequestDetailsDialog } from "@/components/request-details-dialog";
import Nav from "./../components/nav";

const statusColors = {
  Pending: "bg-yellow-500 text-yellow-900",
  Denied: "bg-red-500 text-red-50",
  Accepted: "bg-yellow-500 text-yellow-900",
  Processing: "bg-blue-500 text-blue-50",
  Ready: "bg-green-500 text-green-50",
  Completed: "bg-gray-500 text-gray-900",
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
        <Badge className={`px-3 py-1 rounded-full font-medium ${statusColors[row.status]}`}>
          {row.status.charAt(0).toUpperCase() +
            row.status.slice(1).replace("_", " ")}
        </Badge>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Nav className="bg-white border-b border-gray-200 shadow-sm fixed w-full z-50" />
        <div className="flex flex-1 items-center justify-center pt-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Nav className="bg-white border-b border-gray-200 shadow-sm fixed w-full z-50" />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 pt-24"> {/* 👈 Notice pt-24 */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-primary">My Document Requests</h1>
              <p className="text-sm text-gray-700">
                Track the status of your requests easily
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-700">
            Total Requests: <span className="font-semibold">{requests.length}</span>
          </p>
        </div>

        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500 border border-dashed border-gray-300 rounded-lg">
            <img src="/empty-state.svg" alt="No Requests" className="w-32 h-32 mb-4 opacity-50" />
            <p className="text-lg font-medium text-gray-700">No document requests yet</p>
            <p className="text-sm mt-1">
              Once you make a request, it will appear here for tracking.
            </p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-gray-700">
                <thead className="bg-blue-50 border-b border-blue-200">
                  <tr>
                    {columns.map((col, i) => (
                      <th
                        key={i}
                        className="px-4 py-3 text-left text-sm font-semibold text-blue-800"
                      >
                        {col.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {requests.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      onClick={() => setSelectedRequest(row)}
                      className="hover:bg-blue-50 cursor-pointer border-b last:border-0"
                    >
                      {columns.map((col, colIndex) => (
                        <td key={colIndex} className="px-4 py-3">
                          {col.cell(row)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <RequestDetailsDialog
          request={selectedRequest}
          open={!!selectedRequest}
          onOpenChange={(open) => !open && setSelectedRequest(null)}
          mode="view"
        />
      </main>
    </div>
  );
}
