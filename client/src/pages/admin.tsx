import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { DocumentRequest, requestStatus } from "@shared/schema";
import { DataTable } from "@/components/ui/data-table";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { generateExcelReport } from '@/lib/completereportGenerator';
import * as XLSX from 'xlsx';
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
  processing: "bg-blue-100 text-blue-800",
  ready: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
};
const exportCompletedRequests = () => {
  // Filter only completed requests
  const completedRequests = requests.filter(request => request.status === 'processing');
  
  // Prepare data for Excel
  const data = completedRequests.map(request => ({
    'Queue #': request.queueNumber,
    'Student ID': request.studentId,
    'Student Name': request.studentName,
    'Document Type': request.documentType,
    'Course': request.course,
    'Requested At': format(new Date(request.requestedAt), "MMM d, yyyy h:mm a"),
    'Completed At': request.updatedAt ? format(new Date(request.updatedAt), "MMM d, yyyy h:mm a") : 'N/A',
    'Notes': request.notes || 'N/A'
  }));

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(data);
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Completed Requests");
  
  // Generate Excel file
  XLSX.writeFile(wb, `Completed_Requests_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
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
  // Update your filteredRequests calculation to include more searchable fields
const filteredRequests = requests.filter(request => {
  // Enhanced search - checks multiple fields
  const matchesSearch = searchTerm === "" || 
    request.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.documentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.queueNumber.toString().includes(searchTerm) ||
    (request.notes && request.notes.toLowerCase().includes(searchTerm.toLowerCase()));
  
  // Date filter logic (unchanged)
  const matchesDate = dateFilter === "all" ? true : 
    dateFilter === "today" ? new Date(request.requestedAt).toDateString() === new Date().toDateString() :
    dateFilter === "week" ? new Date(request.requestedAt) > subDays(new Date(), 7) :
    dateFilter === "month" ? new Date(request.requestedAt) > subDays(new Date(), 30) : true;
  
  // Status filter logic (updated for our new statuses)
  const matchesStatus = statusFilter === "all" ? true : request.status === statusFilter;
  
  return matchesSearch && matchesDate && matchesStatus;
});
const [isFiltering, setIsFiltering] = useState(false);
// Add this function to your component
const clearFilters = () => {
  setSearchTerm("");
  setDateFilter("all");
  setStatusFilter("all");
};
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

 
const requestStats = {
  total: requests.length,
  processing: requests.filter(r => r.status === 'processing').length,
  ready: requests.filter(r => r.status === 'ready').length,
  completed: requests.filter(r => r.status === 'completed').length,
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
    processing: dayRequests.filter(r => r.status === 'processing').length,
    ready: dayRequests.filter(r => r.status === 'ready').length,
    completed: dayRequests.filter(r => r.status === 'completed').length,
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
      <SelectContent className="text-gray-700 bg-white border-[#0056b3]/20">
        <SelectItem 
          value="processing"
          className={`hover:bg-blue-50 ${statusColors.processing}`}
        >
          Processing
        </SelectItem>
        <SelectItem 
          value="ready"
          className={`hover:bg-yellow-50 ${statusColors.ready}`}
        >
          Ready
        </SelectItem>
        <SelectItem 
          value="completed"
          className={`hover:bg-green-50 ${statusColors.completed}`}
        >
          Completed
        </SelectItem>
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
            <Button 
  variant="outline" 
  className="border-[#0056b3] text-[#0056b3] hover:bg-[#0056b3]/10 gap-2"
  onClick={() => {
    const count = exportCompletedRequests();
    toast({
      title: "Report Generated",
      description: `Exported ${count} completed requests`,
    });
  }}
  disabled={requests.filter(r => r.status === 'completed').length === 0}
>
  <FileText className="h-4 w-4" />
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
      placeholder="Search by name, ID, document, course..."
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
      <SelectItem value="processing">Processing</SelectItem>
      <SelectItem value="ready">Ready</SelectItem>
      <SelectItem value="completed">Completed</SelectItem>
    </SelectContent>
  </Select>
  
  <Button 
    variant="outline" 
    className="border-[#0056b3] text-[#0056b3] hover:bg-[#0056b3]/10"
    onClick={clearFilters}
    disabled={searchTerm === "" && dateFilter === "all" && statusFilter === "all"}
  >
    Clear Filters
  </Button>
</div>
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
        <CardTitle className="text-[#003366]">Document Requests</CardTitle>
        <p className="text-sm text-gray-500 mt-1">
          Showing {filteredRequests.length} of {requests.length} requests
          {(searchTerm !== "" || dateFilter !== "all" || statusFilter !== "all") && (
            <span className="text-[#0056b3] ml-2">
              (filtered)
            </span>
          )}
        </p>
      </div>
      {/* ... rest of your header ... */}
    </CardHeader>
    {/* ... rest of your table ... */}
  </Card>
</motion.div>

          {/* Stats Cards */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
    transition={{ delay: 0.3 }}
  >
    <Card className="border-[#0056b3]/20 hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">Ready</CardTitle>
        <Clock className="h-5 w-5 text-yellow-500" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-[#003366]">{requestStats.ready}</div>
        <p className="text-xs text-gray-500 mt-1">Ready for pickup</p>
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
                <Card className="text-gray-500 border-[#0056b3]/20 h-full">
                  <CardHeader>
                    <CardTitle className="text-[#003366]">Requests by Status</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
  { name: 'Processing', value: requestStats.processing },
  { name: 'Ready', value: requestStats.ready },
  { name: 'Completed', value: requestStats.completed },
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
                        // In the pie chart:
<Pie
  data={[
    { name: 'Processing', value: requestStats.processing },
    { name: 'Ready', value: requestStats.ready },
    { name: 'Completed', value: requestStats.completed },
  ]}
  // ... rest of the pie chart props
>
  {[0, 1, 2].map((entry, index) => (
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