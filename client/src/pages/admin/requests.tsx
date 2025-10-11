
import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

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
    const [requests, setRequests] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchRequests = async () => {
        try {
            const response = await fetch("/api/requests/all");
            const data = await response.json();
            setRequests(data);
        } catch (error) {
            console.error("Error fetching requests:", error);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleStatusChange = async (requestId, newStatus) => {
        try {
            await fetch(`/api/request/${requestId}`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });
            fetchRequests();
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const filteredRequests = requests.filter(request => 
        request.$id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const columns = [
        { header: "Tracking ID", cell: ({ row }) => <span className="font-mono text-xs">{row.original.$id}</span> },
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
                <Badge className={`${statusColors[row.original.document_status] || 'bg-gray-500'} text-white`}>
                    {row.original.document_status.replace(/_/g, ' ').toUpperCase()}
                </Badge>
            ),
        },
        { header: "Total", cell: ({ row }) => <span className="font-semibold">PHP {row.original.totalAmount.toFixed(2)}</span> },
        {
            header: "Actions",
            cell: ({ row }) => (
                <Select onValueChange={(value) => handleStatusChange(row.original.$id, value)} defaultValue={row.original.document_status}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.keys(statusColors).map((status) => (
                            <SelectItem key={status} value={status}>
                                {status.replace(/_/g, ' ').toUpperCase()}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            ),
        },
    ];

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">All Requests</h2>
            <div className="flex items-center mb-4">
                <Input 
                    placeholder="Search by Tracking ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                />
            </div>
            <DataTable columns={columns} data={filteredRequests} />
        </div>
    );
};

export default AdminRequestsPage;
