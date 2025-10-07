import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { format, subDays } from "date-fns";
import { FileText, Calendar, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import { RequestDetailsDialog } from "@/components/request-details-dialog";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Nav from "@/components/nav";
import { Button } from "@/components/ui/button";
import { generateExcelReport } from "@/lib/reportGenerator";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function AdminDashboard() {
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [dateRange, setDateRange] = useState({ from: subDays(new Date(), 20), to: new Date() });

    const { data: requests = [], isLoading } = useQuery({
        queryKey: ["/api/requests"],
        queryFn: async () => {
            const res = await fetch("/api/requests");
            if (!res.ok) {
                throw new Error("Network response was not ok");
            }
            return res.json();
        }
    });

    const filteredRequests = useMemo(() => {
        if (!dateRange?.from || !dateRange.to) return [];
        return requests.filter(r => {
            const requestedAt = r.requestedAt?.seconds ? new Date(r.requestedAt.seconds * 1000) : new Date(r.requestedAt);
            if (isNaN(requestedAt.getTime())) return false;
            return requestedAt >= dateRange.from && requestedAt <= dateRange.to;
        });
    }, [requests, dateRange]);

    const chartData = useMemo(() => {
        const stats = {
            accepted: filteredRequests.filter(r => r.status === 'completed' || r.status === 'ready').length,
            denied: filteredRequests.filter(r => r.status === 'denied').length,
            processing: filteredRequests.filter(r => r.status === 'processing').length,
        };
        return [
            { name: 'Completed', count: stats.accepted, fill: 'hsl(var(--chart-1))' },
            { name: 'Processing', count: stats.processing, fill: 'hsl(var(--chart-2))' },
            { name: 'Denied', count: stats.denied, fill: 'hsl(var(--chart-3))' },
        ];
    }, [filteredRequests]);

    const pieChartData = useMemo(() => {
        const documentTypeCounts = filteredRequests.reduce((acc, req) => {
            acc[req.documentType] = (acc[req.documentType] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(documentTypeCounts).map(([name, value]) => ({ name, value }));
    }, [filteredRequests]);

    const columns = useMemo(() => [
        {
            header: "Queue #",
            accessorKey: "queueNumber",
            cell: ({ row }) => <div className="font-mono text-muted-foreground">#{row.original.queueNumber}</div>,
        },
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
            header: "Document",
            accessorKey: "documentType",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{row.original.documentType}</span>
                </div>
            ),
        },
        {
            header: "Requested",
            accessorKey: "requestedAt",
            cell: ({ row }) => {
                const date = row.original.requestedAt?.seconds
                    ? new Date(row.original.requestedAt.seconds * 1000)
                    : new Date(row.original.requestedAt);
                if (isNaN(date.getTime())) {
                    return (
                        <div className="flex items-center gap-2 text-sm text-destructive">
                            <Calendar className="h-4 w-4" />
                            <span>Invalid Date</span>
                        </div>
                    );
                }
                return (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{format(date, "MMM d, yyyy")}</span>
                    </div>
                );
            },
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
                <Nav />
                <div className="container mx-auto pt-24 flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300">
            <Nav />
            
            <motion.main
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="container mx-auto pt-32 px-4 pb-8"
            >
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-blue-900">Admin Dashboard</h1>
                            <p className="text-blue-800/90">An overview of the document requests.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <DateRangePicker range={dateRange} onUpdate={setDateRange} />
                            <Button variant="outline" className="gap-2" onClick={() => generateExcelReport(filteredRequests)}>
                                <FileText className="h-4 w-4" />
                                Generate Report
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="bg-white/90 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-blue-900">Request Overview</CardTitle>
                                <CardDescription className="text-blue-800/90">Status of requests in the selected date range.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                                        <Legend />
                                        <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                        <Card className="bg-white/90 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-blue-900">Document Types</CardTitle>
                                <CardDescription className="text-blue-800/90">Distribution of requested document types.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                            {pieChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

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

                <RequestDetailsDialog
                    request={selectedRequest}
                    open={!!selectedRequest}
                    onOpenChange={(open) => !open && setSelectedRequest(null)}
                    mode="approval"
                />
            </motion.main>
        </div>
    );
}
