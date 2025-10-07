import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, query, orderBy, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { toast } from "sonner";

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
    const queryClient = useQueryClient();

    const { data: requests, isLoading } = useQuery({
        queryKey: ["admin_requests"],
        queryFn: async () => {
            const q = query(collection(db, "document_requests"), orderBy("requestedAt", "desc"));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        },
    });

    const mutation = useMutation({
        mutationFn: async ({ id, status, rejectionReason }) => {
            const docRef = doc(db, "document_requests", id);
            await updateDoc(docRef, { status, rejectionReason });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin_requests"] });
            toast.success("Request status updated successfully!");
        },
        onError: (err) => {
            toast.error(err.message || "Failed to update request status. Please try again.");
        },
    });

    const handleUpdateRequest = (id, status) => {
        if (status === 'denied') {
            const rejectionReason = prompt("Please provide a reason for rejection:");
            if (rejectionReason) {
                mutation.mutate({ id, status, rejectionReason });
            } else {
                toast.warning("Rejection reason is required to deny a request.");
            }
        } else {
            mutation.mutate({ id, status });
        }
    };

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
        { header: "Date Requested", cell: ({ row }) => format(new Date(row.original.requestedAt.toDate()), "MMM d, yyyy, h:mm a") },
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
            cell: ({ row }) => (
                <div className="flex gap-2">
                    {row.original.status === 'pending_approval' && (
                        <>
                            <Button size="sm" onClick={() => handleUpdateRequest(row.original.id, 'pending_payment')}>Approve</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleUpdateRequest(row.original.id, 'denied')}>Deny</Button>
                        </>
                    )}
                    {row.original.status === 'processing' && (
                        <Button size="sm" onClick={() => handleUpdateRequest(row.original.id, 'ready_for_pickup')}>Ready for Pickup</Button>
                    )}
                     {row.original.status === 'ready_for_pickup' && (
                        <Button size="sm" onClick={() => handleUpdateRequest(row.original.id, 'completed')}>Complete</Button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">All Requests</h2>
            {isLoading ? <div>Loading...</div> : <DataTable columns={columns} data={requests || []} />}
        </div>
    );
};

export default AdminRequestsPage;
