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
import { format, subDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  User,
  ArrowUpRight,
  Download,
  BarChart2,
  PieChart as PieChartIcon,
  Calendar,
  Filter,
  Search
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Pie,
  PieChart,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { motion } from "framer-motion";
import Nav from "@/components/nav";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Admin() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: requests = [], isLoading } = useQuery<DocumentRequest[]>({
    queryKey: ["/api/requests"],
  });

  // Filter requests based on search and filters
  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.documentType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = dateFilter === "all" ? true : 
      dateFilter === "today" ? new Date(request.requestedAt).toDateString() === new Date().toDateString() :
      dateFilter === "week" ? new Date(request.requestedAt) > subDays(new Date(), 7) :
      dateFilter === "month" ? new Date(request.requestedAt) > subDays(new Date(), 30) : true;
    
    const matchesStatus = statusFilter === "all" ? true : request.status === statusFilter;
    
    return matchesSearch && matchesDate && matchesStatus;
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

  // Analytics data
  const requestStats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    processing: requests.filter(r => r.status === 'processing').length,
    completed: requests.filter(r => r.status === 'completed').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  // Document type distribution
  const documentTypeData = requests.reduce((acc, request) => {
    const existing = acc.find(item => item.name === request.documentType);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ name: request.documentType, count: 1 });
    }
    return acc;
  }, [] as {name: string, count: number}[]);

  // Daily request trend (last 7 days)
  const dailyTrendData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateString = format(date, 'MMM dd');
    const count = requests.filter(r => 
      new Date(r.requestedAt).toDateString() === date.toDateString()
    ).length;
    return { date: dateString, count };
  });

  // Status change over time (last 7 days)
  const statusTrendData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateString = format(date, 'MMM dd');
    const dayRequests = requests.filter(r => 
      new Date(r.requestedAt).toDateString() === date.toDateString()
    );
    
    return {
      date: dateString,
      pending: dayRequests.filter(r => r.status === 'pending').length,
      processing: dayRequests.filter(r => r.status === 'processing').length,
      completed: dayRequests.filter(r => r.status === 'completed').length,
      rejected: dayRequests.filter(r => r.status === 'rejected').length,
    };
  });

  // Processing time analysis (for completed requests)
  const completedRequests = requests.filter(r => r.status === 'completed');
  const processingTimes = completedRequests.map(r => {
    const requested = new Date(r.requestedAt);
    const completed = new Date(r.updatedAt || new Date());
    return (completed.getTime() - requested.getTime()) / (1000 * 60 * 60); // in hours
  });
  const avgProcessingTime = processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length || 0;

  const columns = [
    {
      header: "Queue #",
      cell: (row: DocumentRequest) => (
        <span className="font-medium text-[#003366]">#{row.queueNumber}</span>
      ),
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
      cell: (row: DocumentRequest) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-[#0056b3]" />
          <span>{row.documentType}</span>
        </div>
      ),
    },
    {
      header: "Requested At",
      cell: (row: DocumentRequest) => (
        <span className="text-sm text-gray-600">
          {format(new Date(row.requestedAt), "MMM d, yyyy h:mm a")}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (row: DocumentRequest) => (
        <Select
          defaultValue={row.status}
          onValueChange={(status) => updateStatus.mutate({ id: row.id, status })}
        >
          <SelectTrigger className={`w-[140px] ${statusColors[row.status as keyof typeof statusColors]}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white border-[#0056b3]/20">
            {requestStatus.map((status) => (
              <SelectItem 
                key={status} 
                value={status}
                className={`hover:bg-[#0056b3]/10 ${statusColors[status as keyof typeof statusColors]}`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      header: "Actions",
      cell: (row: DocumentRequest) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="text-[#0056b3] hover:bg-[#0056b3]/10">
            <ArrowUpRight className="h-4 w-4" />
          </Button>
          {row.status === 'completed' && (
            <Button variant="ghost" size="sm" className="text-green-600 hover:bg-green-600/10">
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Nav />
        <div className="container mx-auto pt-24 p-8 flex justify-center">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-[#0056b3]/20"></div>
            <div className="h-4 w-32 bg-[#0056b3]/20 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Nav />
      
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto pt-24 px-8 pb-8"
      >
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#003366]">Document Requests Dashboard</h1>
              <p className="text-[#0056b3]">Manage and track all document requests</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-[#0056b3] text-[#0056b3] hover:bg-[#0056b3]/10 gap-2">
                <Calendar className="h-4 w-4" />
                Generate Report
              </Button>
              <Button className="bg-[#0056b3] hover:bg-[#003366] text-white gap-2">
                <Download className="h-4 w-4" />
                Export Data
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search requests..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#0056b3]" />
                  <SelectValue placeholder="Date Range" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-[#0056b3]" />
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="border-[#0056b3] text-[#0056b3] hover:bg-[#0056b3]/10">
              Clear Filters
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-[#0056b3]/20 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Requests</CardTitle>
                  <FileText className="h-5 w-5 text-[#0056b3]" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#003366]">{requestStats.total}</div>
                  <p className="text-xs text-gray-500 mt-1">All time document requests</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-[#0056b3]/20 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
                  <Clock className="h-5 w-5 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#003366]">{requestStats.pending}</div>
                  <p className="text-xs text-gray-500 mt-1">Awaiting processing</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-[#0056b3]/20 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Processing</CardTitle>
                  <User className="h-5 w-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#003366]">{requestStats.processing}</div>
                  <p className="text-xs text-gray-500 mt-1">Currently being processed</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-[#0056b3]/20 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#003366]">{requestStats.completed}</div>
                  <p className="text-xs text-gray-500 mt-1">Successfully fulfilled</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-[#0056b3]/20 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Avg. Processing</CardTitle>
                  <Clock className="h-5 w-5 text-[#0056b3]" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#003366]">
                    {avgProcessingTime.toFixed(1)}h
                  </div>
                  <p className="text-xs text-gray-500 mt-1">For completed requests</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Analytics Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-[#0056b3]/10">
              <TabsTrigger value="overview" className="data-[state=active]:bg-[#0056b3] data-[state=active]:text-white">
                <BarChart2 className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="types" className="data-[state=active]:bg-[#0056b3] data-[state=active]:text-white">
                <PieChartIcon className="h-4 w-4 mr-2" />
                Document Types
              </TabsTrigger>
              <TabsTrigger value="trends" className="data-[state=active]:bg-[#0056b3] data-[state=active]:text-white">
                <BarChart2 className="h-4 w-4 mr-2" />
                Daily Trends
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <Card className="border-[#0056b3]/20 h-full">
                  <CardHeader>
                    <CardTitle className="text-[#003366]">Requests by Status</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Pending', value: requestStats.pending },
                        { name: 'Processing', value: requestStats.processing },
                        { name: 'Completed', value: requestStats.completed },
                        { name: 'Rejected', value: requestStats.rejected },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white',
                            borderColor: '#0056b3',
                            borderRadius: '0.5rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Bar 
                          dataKey="value" 
                          fill="#0056b3" 
                          radius={[4, 4, 0, 0]}
                          animationDuration={1500}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-[#0056b3]/20 h-full">
                  <CardHeader>
                    <CardTitle className="text-[#003366]">Status Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChartIcon>
                        <Pie
                          data={[
                            { name: 'Pending', value: requestStats.pending },
                            { name: 'Processing', value: requestStats.processing },
                            { name: 'Completed', value: requestStats.completed },
                            { name: 'Rejected', value: requestStats.rejected },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {[0, 1, 2, 3].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white',
                            borderColor: '#0056b3',
                            borderRadius: '0.5rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Legend />
                      </PieChartIcon>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="types">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <Card className="border-[#0056b3]/20 h-full">
                  <CardHeader>
                    <CardTitle className="text-[#003366]">Document Type Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={documentTypeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white',
                            borderColor: '#003366',
                            borderRadius: '0.5rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Bar 
                          dataKey="count" 
                          fill="#003366" 
                          radius={[4, 4, 0, 0]}
                          animationDuration={1500}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-[#0056b3]/20 h-full">
                  <CardHeader>
                    <CardTitle className="text-[#003366]">Document Types</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChartIcon>
                        <Pie
                          data={documentTypeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {documentTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white',
                            borderColor: '#0056b3',
                            borderRadius: '0.5rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Legend />
                      </PieChartIcon>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trends">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <Card className="border-[#0056b3]/20 h-full">
                  <CardHeader>
                    <CardTitle className="text-[#003366]">Daily Request Trend</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dailyTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white',
                            borderColor: '#0056b3',
                            borderRadius: '0.5rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="count" 
                          stroke="#0056b3" 
                          strokeWidth={2}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-[#0056b3]/20 h-full">
                  <CardHeader>
                    <CardTitle className="text-[#003366]">Status Trend (Last 7 Days)</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={statusTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white',
                            borderColor: '#0056b3',
                            borderRadius: '0.5rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="pending" 
                          stroke="#FFBB28" 
                          strokeWidth={2}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="processing" 
                          stroke="#0088FE" 
                          strokeWidth={2}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="completed" 
                          stroke="#00C49F" 
                          strokeWidth={2}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="rejected" 
                          stroke="#FF8042" 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Requests Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6"
          >
            <Card className="border-[#0056b3]/20">
              <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle className="text-[#003366]">Recent Requests</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    Showing {filteredRequests.length} of {requests.length} requests
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>Last updated: {format(new Date(), "MMM d, yyyy h:mm a")}</span>
                </div>
              </CardHeader>
              <CardContent>
                <DataTable 
                  data={filteredRequests} 
                  columns={columns} 
                  className="border-none"
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}