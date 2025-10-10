
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { format, subDays } from "date-fns";
import { FileText, Calendar, Loader2, CheckCircle, XCircle, Clock, File as FileIcon } from "lucide-react";
import { useState, useMemo } from "react";
import { RequestDetailsDialog } from "@/components/request-details-dialog";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { generateExcelReport } from "@/lib/reportGenerator";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { FormLabel } from "@/components/ui/form";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, PieChart, Pie, Cell } from "recharts";
import { useWebSocket } from "@/hooks/use-websocket";
import { Toaster } from "@/components/ui/toaster";
import { Badge } from "@/components/ui/badge";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const getReceiptUrl = (receiptId: string) => {
    const endpoint = import.meta.env.VITE_APP_APPWRITE_ENDPOINT;
    const projectId = import.meta.env.VITE_APP_APPWRITE_PROJECT_ID;
    const bucketId = 'receipts'; // This can also be an environment variable if it changes

    return `${endpoint}/storage/buckets/${bucketId}/files/${receiptId}/view?project=${projectId}`;
};

export default function AdminDashboard() {
    useWebSocket();
    const queryClient = useQueryClient();
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [dateRange, setDateRange] = useState({ from: subDays(new Date(), 20), to: new Date() });

    const { data: requests = [], isLoading } = useQuery({
        queryKey: ["/api/requests/all"],
        queryFn: async () => {
            const res = await fetch("/api/requests/all");
            if (!res.ok) {
                throw new Error("Network response was not ok");
            }
            return res.json();
        }
    });

    const updateRequestStatus = useMutation(
        ({ id, status }: { id: string, status: string }) => fetch(`/api/request/${id}`, { method: 'PATCH', body: JSON.stringify({ status }), headers: { 'Content-Type': 'application/json' } }),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["/api/requests/all"]);
            },
        }
    );

    const filteredRequests = useMemo(() => {
        if (!dateRange?.from || !dateRange.to) return [];
        return requests.filter(r => {
            const requestedAt = r.$createdAt ? new Date(r.$createdAt) : new Date();
            return requestedAt >= dateRange.from && requestedAt <= dateRange.to;
        });
    }, [requests, dateRange]);

    const summaryStats = useMemo(() => {
        const stats = {
            total: filteredRequests.length,
            pending: filteredRequests.filter(r => r.document_status === 'submitted').length,
            completed: filteredRequests.filter(r => r.document_status === 'completed' || r.document_status === 'ready').length,
            denied: filteredRequests.filter(r => r.document_status === 'denied').length,
        };
        return stats;
    }, [filteredRequests]);

    const chartData = useMemo(() => {
        return [
            { name: 'Completed', count: summaryStats.completed, fill: 'hsl(var(--chart-1))' },
            { name: 'Pending', count: summaryStats.pending, fill: 'hsl(var(--chart-2))' },
            { name: 'Denied', count: summaryStats.denied, fill: 'hsl(var(--chart-3))' },
        ];
    }, [summaryStats]);

    const pieChartData = useMemo(() => {
        const documentTypeCounts = filteredRequests.reduce((acc, req) => {
            req.documents.forEach(doc => {
                acc[doc.name] = (acc[doc.name] || 0) + 1;
            });
            return acc;
        }, {});
        return Object.entries(documentTypeCounts).map(([name, value]) => ({ name, value }));
    }, [filteredRequests]);

    const columns = useMemo(() => [
        {
            header: "Student Info",
            cell: ({ row }) => (
                <div>
                    <div className="font-medium text-primary">{row.original.studentName}</div>
                    <div className="text-sm text-muted-foreground">{row.original.studentId}</div>
                </div>
            ),
        },
        {
            header: "Documents",
            accessorKey: "documents",
            cell: ({ row }) => (
                <ul className="list-disc list-inside">
                    {row.original.documents.map((doc: any, index: number) => <li key={index}>{doc.name}</li>)}
                </ul>
            ),
        },
        {
            header: "Requested",
            accessorKey: "$createdAt",
            cell: ({ row }) => (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(row.original.$createdAt), "MMM d, yyyy")}</span>
                </div>
            ),
        },
        {
            header: "Payment Status",
            accessorKey: "payment_status",
            cell: ({ row }) => (
                <Badge variant={row.original.payment_status === 'unpaid' ? 'destructive' : row.original.payment_status === 'paid' ? 'success' : 'secondary'}>
                    {row.original.payment_status.replace(/_/g, ' ')}
                </Badge>
            ),
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <Button variant="default" size="sm" onClick={() => setSelectedRequest(row.original)}>
                    Review Request
                </Button>
            ),
        },
    ], []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300">
                <div className="container mx-auto pt-24 flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300">
            <Toaster />
            <motion.main
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="container mx-auto pt-32 px-4 pb-8"
            >
                <div className="flex flex-col gap-8">
                    {/* ... header and stats ... */}

                    <Card className="bg-white/90 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-blue-900">All Requests</CardTitle>
                            <CardDescription className="text-blue-800/90">A list of all document requests within the selected date range.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DataTable data={filteredRequests} columns={columns} />
                        </CardContent>
                    </Card>
                </div>

                {selectedRequest && <RequestDetailsDialog
                    request={selectedRequest}
                    open={!!selectedRequest}
                    onOpenChange={(open) => !open && setSelectedRequest(null)}
                    onUpdateRequest={updateRequestStatus.mutate}
                    receiptUrl={selectedRequest.receiptId ? getReceiptUrl(selectedRequest.receiptId) : null}
                    mode="approval"
                />}
            </motion.main>
        </div>
    );
}
