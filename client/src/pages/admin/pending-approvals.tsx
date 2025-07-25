import { useQuery, useMutation } from "@tanstack/react-query";
import type { DocumentRequest } from "@shared/schema";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Loader2, FileText, Clock, AlertCircle, CheckCircle, User, ChevronDown } from "lucide-react";
import { useState } from "react";
import { RequestDetailsDialog } from "@/components/request-details-dialog";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Nav from "@/components/nav";
import { Button } from "@/components/ui/button";
import { generateExcelReport } from '@/lib/reportGenerator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const statusIcons = {
  pending: <Clock className="h-4 w-4 text-yellow-500" />,
  processing: <User className="h-4 w-4 text-blue-500" />,
  completed: <CheckCircle className="h-4 w-4 text-green-500" />,
  rejected: <AlertCircle className="h-4 w-4 text-red-500" />,
};

export default function PendingApprovals() {
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<DocumentRequest | null>(null);

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

  const pendingApprovalRequests = requests.filter(
    (request) => request.status === "pending"
  );

  // Stats calculations
  const requestStats = {
  accepted: requests.filter(r => r.status === 'completed').length,
  denied: requests.filter(r => r.status === 'rejected').length,
  total: requests.filter(r => r.status === 'completed' || r.status === 'rejected').length,
};

  const columns = [
    {
      header: "Queue #",
      cell: (row: DocumentRequest) => (
        <span className="font-medium text-[#003366]">#{row.queueNumber}</span>
      ),
    },
    {
      header: "Student",
      cell: (row: DocumentRequest) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-[#0056b3]" />
          <div>
            <div className="font-medium">{row.studentName}</div>
            <div className="text-xs text-gray-500">{row.studentId}</div>
          </div>
        </div>
      ),
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
      header: "Details",
      cell: (row: DocumentRequest) => (
        <div className="text-sm">
          <Badge variant="outline" className="border-[#0056b3]/30 text-[#003366]">
            {row.course}
          </Badge>
          <div className="text-xs text-gray-500 mt-1">
            {format(new Date(row.requestedAt), "MMM d, yyyy h:mm a")}
          </div>
        </div>
      ),
    },
   {
  header: "Status",
  cell: (row: DocumentRequest) => (
    <Select
      defaultValue={row.status}
      onValueChange={(status) => updateStatus.mutate({ id: row.id, status })}
    >
      <SelectTrigger className={`w-[150px] ${statusColors[row.status as keyof typeof statusColors]}`}>
        <div className="flex items-center gap-2">
          {statusIcons[row.status as keyof typeof statusIcons]}
          <SelectValue />
          <ChevronDown className="h-4 w-4 opacity-50" />
        </div>
      </SelectTrigger>
      <SelectContent className="bg-white border-[#0056b3]/20 shadow-lg">
        <SelectItem 
          value="completed"
          className={`hover:bg-green-50 ${statusColors.completed}`}
        >
          <div className="flex items-center gap-2">
            {statusIcons.completed}
            Accept
          </div>
        </SelectItem>
        <SelectItem 
          value="rejected"
          className={`hover:bg-red-50 ${statusColors.rejected}`}
        >
          <div className="flex items-center gap-2">
            {statusIcons.rejected}
            Deny
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  ),
},
    {
      header: "Actions",
      cell: (row: DocumentRequest) => (
        <Button 
          variant="outline" 
          size="sm" 
          className="border-[#0056b3] text-[#0056b3] hover:bg-[#0056b3]/10"
          onClick={() => setSelectedRequest(row)}
        >
          Review
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Nav />
        <div className="container mx-auto pt-24 flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-[#0056b3]" />
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
              <h1 className="text-3xl font-bold text-[#003366]">Pending Approvals Dashboard</h1>
              <p className="text-[#0056b3]">Review and manage all pending document requests</p>
            </div>
            <div className="flex gap-3">
              <Button 
  variant="outline" 
  className="border-[#0056b3] text-[#0056b3] hover:bg-[#0056b3]/10 gap-2"
  onClick={() => generateExcelReport(requests.filter(r => 
    r.status === 'completed' || r.status === 'rejected'
  ))}
>
  <FileText className="h-4 w-4" />
  Generate Report
</Button>
            </div>
          </div>

         {/* Stats Cards */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
  >
    <Card className="border-[#0056b3]/20 hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">Total Decisions</CardTitle>
        <FileText className="h-5 w-5 text-[#0056b3]" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-[#003366]">{requestStats.total}</div>
        <p className="text-xs text-gray-500 mt-1">All approval decisions</p>
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
        <CardTitle className="text-sm font-medium text-gray-600">Accepted</CardTitle>
        <CheckCircle className="h-5 w-5 text-green-500" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-[#003366]">{requestStats.accepted}</div>
        <p className="text-xs text-gray-500 mt-1">Approved requests</p>
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
        <CardTitle className="text-sm font-medium text-gray-600">Denied</CardTitle>
        <AlertCircle className="h-5 w-5 text-red-500" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-[#003366]">{requestStats.denied}</div>
        <p className="text-xs text-gray-500 mt-1">Rejected requests</p>
      </CardContent>
    </Card>
  </motion.div>
</div>

          {/* Requests Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6"
          >
            <Card className="border-[#0056b3]/20">
              <CardHeader>
                <CardTitle className="text-[#003366]">Pending Approval Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingApprovalRequests.length === 0 ? (
                  <div className="text-center py-8 text-[#0056b3]">
                    No requests pending approval
                  </div>
                ) : (
                  <DataTable 
                    data={pendingApprovalRequests} 
                    columns={columns} 
                    className="border-none"
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
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