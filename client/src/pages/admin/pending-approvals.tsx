
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { DocumentRequest } from "@shared/schema";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Eye, Check, X, Loader2, Calendar as CalendarIcon, Mail, User, GraduationCap, School, FileText, Hash } from "lucide-react";
import Nav from "@/components/nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { useState } from "react";


const statusColors: { [key: string]: string } = {
    pending_payment: "bg-yellow-400",
    pending_approval: "bg-orange-400",
    approved: "bg-green-500",
    denied: "bg-red-500",
    in_progress: "bg-blue-500",
    completed: "bg-indigo-500",
};


export default function PendingApprovals() {
  const queryClient = useQueryClient();
  const { data: requests = [], isLoading } = useQuery<DocumentRequest[]>({ 
    queryKey: ["/api/requests/pending-approvals"] 
  });

  const [selectedRequest, setSelectedRequest] = useState<DocumentRequest | null>(null);
  const [isReviewOpen, setReviewOpen] = useState(false);

  const mutation = useMutation<void, Error, { id: number; status: 'pending_payment' | 'denied' }>({
    mutationFn: async ({ id, status }) => {
      const response = await fetch(`/api/requests/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error(`Failed to ${status} request`);
      }
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/requests/pending-approvals"] });
      toast.success(`Request has been ${status}.`);
      setReviewOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleAction = (id: number, status: 'pending_payment' | 'denied') => {
    mutation.mutate({ id, status });
  };

  const columns = [
    { header: "Request ID", accessorKey: "id" },
    { header: "Student Name", accessorKey: "studentName" },
    { 
      header: "Documents", 
      cell: ({ row }: any) => (
        <div className="flex flex-col">
          {row.original.documentRequests.map((dr: any) => (
            <span key={dr.id}>{dr.documentType}</span>
          ))}
        </div>
      )
    },
    { 
      header: "Date Requested", 
      accessorKey: "createdAt", 
      cell: ({ row }: any) => format(new Date(row.original.createdAt), "PPp") 
    },
    { 
        header: "Status", 
        accessorKey: "status",
        cell: ({ row }: any) => (
            <Badge className={`${statusColors[row.original.status] || 'bg-gray-400'} text-white`}>
                {row.original.status.replace('_',' ').toUpperCase()}
            </Badge>
        )
    },
    {
      header: "Actions",
      cell: ({ row }: any) => (
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => { setSelectedRequest(row.original); setReviewOpen(true); }}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-green-600 hover:bg-green-100" onClick={() => handleAction(row.original.id, 'pending_payment')} disabled={mutation.isLoading}>
            <Check className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-100" onClick={() => handleAction(row.original.id, 'denied')} disabled={mutation.isLoading}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
        <Nav />
        <main className="container mx-auto py-8 pt-24 flex justify-center items-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <Nav />
      <main className="container mx-auto py-8 pt-32">
        <Card className="bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-gray-800">Pending Approvals</CardTitle>
            <CardDescription className="text-gray-600">Review and approve or deny document requests.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={requests} />
          </CardContent>
        </Card>
      </main>

      {/* Review Dialog */}
      <Dialog open={isReviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="sm:max-w-[625px]">
            {selectedRequest && (
                <>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Review Request #{selectedRequest.id}</DialogTitle>
                        <DialogDescription>Review the student's information and requested documents before taking action.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        {/* Student Info Section */}
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4 p-4 border rounded-lg">
                            <InfoItem icon={User} label="Student Name" value={selectedRequest.studentName} />
                            <InfoItem icon={Hash} label="Student ID" value={selectedRequest.studentId} />
                            <InfoItem icon={Mail} label="Email" value={selectedRequest.email} />
                            <InfoItem icon={GraduationCap} label="Course" value={selectedRequest.course} />
                            <InfoItem icon={School} label="Year Level" value={selectedRequest.yearLevel} />
                            <InfoItem icon={CalendarIcon} label="Date Requested" value={format(new Date(selectedRequest.createdAt), "PPP")} />
                        </div>
                        
                        {/* Purpose Section */}
                         <div className="p-4 border rounded-lg">
                             <h4 className="font-semibold mb-2 flex items-center gap-2"><FileText className="h-4 w-4"/> Purpose</h4>
                            <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{selectedRequest.purpose}</p>
                        </div>
                        
                        {/* Documents Section */}
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-3">Requested Documents</h4>
                            <div className="space-y-3">
                                {selectedRequest.documentRequests.map((doc, index) => (
                                    <div key={index} className="flex justify-between items-start bg-gray-50 p-3 rounded-md">
                                        <div>
                                            <p className="font-medium">{doc.documentType}</p>
                                            {doc.details && <p className="text-sm text-gray-600 pl-2">&ndash; {doc.details}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setReviewOpen(false)}>Cancel</Button>
                        <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => handleAction(selectedRequest.id, 'denied')} disabled={mutation.isLoading}>Deny</Button>
                        <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleAction(selectedRequest.id, 'pending_payment')} disabled={mutation.isLoading}>Approve</Button>
                    </DialogFooter>
                </>
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper component for displaying info items
const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) => (
    <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 text-gray-500 mt-1" />
        <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="font-semibold text-gray-800">{value}</p>
        </div>
    </div>
);
