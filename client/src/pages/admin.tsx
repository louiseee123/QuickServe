import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { DocumentRequest, requestStatus } from "@shared/schema";
import { DataTable } from "@/components/ui/data-table";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

export default function Admin() {
  const { toast } = useToast();

  const { data: requests = [], isLoading } = useQuery<DocumentRequest[]>({
    queryKey: ["/api/requests"],
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/requests/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
      toast({ title: "Status updated successfully" });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Failed to update status",
      });
    },
  });

  const columns = [
    {
      header: "Queue #",
      cell: (row: DocumentRequest) => row.queueNumber,
    },
    {
      header: "Student ID",
      cell: (row: DocumentRequest) => row.studentId,
    },
    {
      header: "Name",
      cell: (row: DocumentRequest) => row.studentName,
    },
    {
      header: "Document",
      cell: (row: DocumentRequest) => row.documentType,
    },
    {
      header: "Requested At",
      cell: (row: DocumentRequest) =>
        format(new Date(row.requestedAt), "MMM d, yyyy h:mm a"),
    },
    {
      header: "Status",
      cell: (row: DocumentRequest) => (
        <Select
          defaultValue={row.status}
          onValueChange={(status) => updateStatus.mutate({ id: row.id, status })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {requestStatus.map((status) => (
              <SelectItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
  ];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Document Requests</h1>
      <DataTable data={requests} columns={columns} />
    </div>
  );
}
