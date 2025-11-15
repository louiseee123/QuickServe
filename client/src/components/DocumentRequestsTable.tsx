
import { DocumentRequest } from "@shared/schema";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

const statusColors: { [key: string]: string } = {
  pending_approval: "bg-yellow-500",
  processing: "bg-blue-500",
  ready_for_pickup: "bg-indigo-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
};

const columns = [
  { header: "Queue #", cell: (row: DocumentRequest) => <span>{row.queueNumber}</span> },
  { header: "Student Name", cell: (row: DocumentRequest) => <span>{row.studentName}</span> },
  {
    header: "Documents",
    cell: (row: DocumentRequest) => (
      <ul className="list-disc list-inside">
        {JSON.parse(row.documents).map((doc: any, index: number) => (
          <li key={index}>{doc.name} (x{doc.quantity})</li>
        ))}
      </ul>
    ),
  },
  {
    header: "Status",
    cell: (row: DocumentRequest) => (
      <Badge className={`${statusColors[row.status]} text-white`}>
        {row.status.replace(/_/g, ' ')}
      </Badge>
    ),
  },
  {
    header: "Actions",
    cell: (row: DocumentRequest) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>View Details</DropdownMenuItem>
          <DropdownMenuItem>Update Status</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

interface DocumentRequestsTableProps {
  requests: DocumentRequest[];
}

export function DocumentRequestsTable({ requests }: DocumentRequestsTableProps) {
  return <DataTable columns={columns} data={requests} />;
}
