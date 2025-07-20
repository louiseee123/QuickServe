import { useQuery } from "@tanstack/react-query";
import type { DocumentRequest } from "@shared/schema";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Loader2, FileText, Clock, CheckCircle, AlertCircle, Download, CreditCard } from "lucide-react";
import { useState } from "react";
import { RequestDetailsDialog } from "@/components/request-details-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Nav from "@/components/nav"; // Make sure this path is correct

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-800",
  Denied: "bg-red-100 text-red-800",
  Accepted: "bg-blue-100 text-blue-800",
  Processing: "bg-blue-100 text-blue-800",
  Ready: "bg-green-100 text-green-800",
  Completed: "bg-gray-100 text-gray-800",
  'Payment Pending': "bg-purple-100 text-purple-800",
} as const;

const paymentRequiredDocs = [
  "Certification of Grades",
  "Transcript of Records",
  "Diploma",
  "Certification of Enrollment"
];

export default function MyRequests() {
  const [selectedRequest, setSelectedRequest] = useState<DocumentRequest | null>(null);

  const { data: requests = [], isLoading } = useQuery<DocumentRequest[]>({
    queryKey: ["/api/requests/my-requests"],
  });

  // Stats calculations
  const requestStats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'Pending').length,
    processing: requests.filter(r => r.status === 'Processing').length,
    paymentPending: requests.filter(r => 
      r.status === 'Accepted' && 
      paymentRequiredDocs.includes(r.documentType)
    ).length,
    ready: requests.filter(r => r.status === 'Ready').length,
    completed: requests.filter(r => r.status === 'Completed').length,
  };

  const columns = [
    {
      header: "Queue #",
      cell: (row: DocumentRequest) => (
        <span className="font-medium text-primary">#{row.queueNumber}</span>
      ),
    },
    {
      header: "Document",
      cell: (row: DocumentRequest) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <span>{row.documentType}</span>
        </div>
      ),
    },
    {
      header: "Details",
      cell: (row: DocumentRequest) => (
        <div className="text-sm">
          <div>{row.course} - {row.yearLevel}</div>
          <div className="text-muted-foreground">{row.purpose}</div>
        </div>
      ),
    },
    {
      header: "Requested At",
      cell: (row: DocumentRequest) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(row.requestedAt), "MMM d, yyyy h:mm a")}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (row: DocumentRequest) => {
        const status = paymentRequiredDocs.includes(row.documentType) && 
                      row.status === 'Accepted' 
                      ? 'Payment Pending' 
                      : row.status;
        
        return (
          <Badge className={`${statusColors[status]} whitespace-nowrap`}>
            {status.split('_').join(' ')}
          </Badge>
        );
      },
    },
    {
      header: "Actions",
      cell: (row: DocumentRequest) => (
        <div className="flex gap-2">
          {row.status === 'Ready' && (
            <Button variant="outline" size="sm" className="gap-1">
              <Download className="h-3.5 w-3.5" />
              Download
            </Button>
          )}
          {paymentRequiredDocs.includes(row.documentType) && 
           row.status === 'Accepted' && (
            <Button size="sm" className="gap-1 bg-purple-600 hover:bg-purple-700">
              <CreditCard className="h-3.5 w-3.5" />
              Pay Now
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
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Nav />
      
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-8"
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-primary">My Document Requests</h1>
              <p className="text-muted-foreground">Track and manage your document requests</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="gap-2">
                <FileText className="h-4 w-4" />
                New Request
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
                  <FileText className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold">{requestStats.total}</div>
                  <p className="text-xs text-muted-foreground mt-1">All your document requests</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payment</CardTitle>
                  <CreditCard className="h-5 w-5 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold">{requestStats.paymentPending}</div>
                  <p className="text-xs text-muted-foreground mt-1">Awaiting your payment</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Processing</CardTitle>
                  <Clock className="h-5 w-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold">{requestStats.processing}</div>
                  <p className="text-xs text-muted-foreground mt-1">Currently being processed</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Ready</CardTitle>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold">{requestStats.ready}</div>
                  <p className="text-xs text-muted-foreground mt-1">Ready for download</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Requests Table */}
          {requests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12 text-muted-foreground">
                You haven't made any document requests yet.
                <div className="mt-4">
                  <Button>
                    <FileText className="h-4 w-4 mr-2" />
                    Make Your First Request
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>Your Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <DataTable 
                    data={requests} 
                    columns={columns} 
                    onRowClick={(row) => setSelectedRequest(row)}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}

          <RequestDetailsDialog
            request={selectedRequest}
            open={!!selectedRequest}
            onOpenChange={(open) => !open && setSelectedRequest(null)}
            mode="view"
          />
        </motion.div>
      </div>
    </div>
  );
}