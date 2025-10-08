
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const statusColors = {
    pending_approval: "bg-orange-500",
    pending_payment: "bg-yellow-500",
    denied: "bg-red-600",
    processing: "bg-blue-500",
    ready_for_pickup: "bg-cyan-500",
    completed: "bg-green-600",
    cancelled: "bg-gray-500",
};

const AdminRequestsPage = () => {

    const columns = [
        { header: "Tracking ID", cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
        {
            header: "Documents",
            cell: ({ row }) => (
                <ul className="list-disc list-inside">
                    {row.original.documents.map((doc, index) => <li key={index}>{doc.name}</li>)}
                </ul>
            ),
        },
        { header: "Date Requested", cell: ({ row }) => format(new Date(row.original.requestedAt), "MMM d, yyyy, h:mm a") },
        {
            header: "Status",
            cell: ({ row }) => (
                <Badge className={`${statusColors[row.original.status] || 'bg-gray-500'} text-white`}>
                    {row.original.status.replace(/_/g, ' ').toUpperCase()}
                </Badge>
            ),
        },
        { header: "Total", cell: ({ row }) => <span className="font-semibold">PHP {row.original.totalAmount.toFixed(2)}</span> },
        {
            header: "Actions",
            cell: () => (<div></div>),
        },
    ];

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">All Requests</h2>
            <DataTable columns={columns} data={[]} />
        </div>
    );
};

export default AdminRequestsPage;
