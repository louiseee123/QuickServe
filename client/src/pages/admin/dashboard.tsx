
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Document, DocumentRequest } from "@shared/schema";
import { Clock, FileText, CheckCircle, PlusCircle, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/ui/data-table";

export default function AdminDashboardPage() {
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [newDocumentName, setNewDocumentName] = useState("");
  const [newDocumentPrice, setNewDocumentPrice] = useState(0);
  const [newDocumentProcessingTime, setNewDocumentProcessingTime] = useState(1);

  useEffect(() => {
    fetchRequests();
    fetchDocuments();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/requests");
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error("Error fetching document requests:", error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api/documents");
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const handleAddDocument = async () => {
    try {
      await fetch("/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newDocumentName,
          price: newDocumentPrice,
          processingTimeDays: newDocumentProcessingTime,
        }),
      });
      setAddDialogOpen(false);
      fetchDocuments();
      // Reset form
      setNewDocumentName("");
      setNewDocumentPrice(0);
      setNewDocumentProcessingTime(1);
    } catch (error) {
      console.error("Error adding document:", error);
    }
  };

  const handleEditDocument = async () => {
    if (!selectedDocument) return;
    try {
      await fetch(`/api/documents/${selectedDocument.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newDocumentName,
          price: newDocumentPrice,
          processingTimeDays: newDocumentProcessingTime,
        }),
      });
      setEditDialogOpen(false);
      fetchDocuments();
    } catch (error) {
      console.error("Error editing document:", error);
    }
  };

  const handleDeleteDocument = async () => {
    if (!selectedDocument) return;
    try {
      await fetch(`/api/documents/${selectedDocument.id}`, {
        method: "DELETE",
      });
      setDeleteDialogOpen(false);
      fetchDocuments();
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const openAddDialog = () => {
    // Reset form fields
    setSelectedDocument(null);
    setNewDocumentName("");
    setNewDocumentPrice(0);
    setNewDocumentProcessingTime(1);
    setAddDialogOpen(true);
  }

  const openEditDialog = (doc: Document) => {
    setSelectedDocument(doc);
    setNewDocumentName(doc.name);
    setNewDocumentPrice(doc.price);
    setNewDocumentProcessingTime(doc.processingTimeDays);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (doc: Document) => {
    setSelectedDocument(doc);
    setDeleteDialogOpen(true);
  };

  const pendingRequests = requests.filter(
    (req) => req.status === "pending_approval"
  ).length;
  const ongoingRequests = requests.filter(
    (req) => req.status === "processing" || req.status === "ready_for_pickup"
  ).length;
  const completedRequests = requests.filter(
    (req) => req.status === "completed"
  ).length;

  const columns = [
    { header: "Name", cell: (doc: Document) => <span>{doc.name}</span> },
    { header: "Price", cell: (doc: Document) => <span>PHP {doc.price.toFixed(2)}</span> },
    { header: "Processing Time", cell: (doc: Document) => <span>{doc.processingTimeDays} days</span> },
    {
      header: "Actions",
      cell: (doc: Document) => (
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => openEditDialog(doc)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="icon" onClick={() => openDeleteDialog(doc)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <main className="container mx-auto py-8 pt-32">
        <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Welcome to the admin dashboard. Here you can manage document
              requests.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white/60 backdrop-blur-sm border-2 border-blue-100/50 shadow-lg rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                        Pending Approvals
                    </CardTitle>
                    <Clock className="h-5 w-5 text-yellow-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-[#003366]">
                        {pendingRequests}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Requests waiting for approval
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm border-2 border-blue-100/50 shadow-lg rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                        Ongoing Requests
                    </CardTitle>
                    <FileText className="h-5 w-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-[#003366]">
                        {ongoingRequests}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Requests being processed
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm border-2 border-blue-100/50 shadow-lg rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                        Completed Requests
                    </CardTitle>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-[#003366]">
                        {completedRequests}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Successfully fulfilled requests
                    </p>
                </CardContent>
            </Card>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl mt-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold text-gray-800">
                Manage Documents
              </CardTitle>
            </div>
            <Button
              className="flex items-center gap-2"
              onClick={openAddDialog}
            >
              <PlusCircle className="h-5 w-5" />
              Add Document
            </Button>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={documents} />
          </CardContent>
        </Card>
      </main>

      {/* Add Document Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="bg-white text-gray-800">
          <DialogHeader>
            <DialogTitle>Create New Document</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                className="col-span-3"
                value={newDocumentName}
                onChange={(e) => setNewDocumentName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price (PHP)
              </Label>
              <Input
                id="price"
                type="number"
                className="col-span-3"
                value={newDocumentPrice}
                onChange={(e) => setNewDocumentPrice(parseFloat(e.target.value))}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="processingTime" className="text-right">
                Processing Time (Days)
              </Label>
              <Input
                id="processingTime"
                type="number"
                className="col-span-3"
                value={newDocumentProcessingTime}
                onChange={(e) => setNewDocumentProcessingTime(parseInt(e.target.value))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDocument}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Document Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-white text-gray-800">
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                className="col-span-3"
                value={newDocumentName}
                onChange={(e) => setNewDocumentName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price (PHP)
              </Label>
              <Input
                id="price"
                type="number"
                className="col-span-3"
                value={newDocumentPrice}
                onChange={(e) => setNewDocumentPrice(parseFloat(e.target.value))}
              />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="processingTime" className="text-right">
                Processing Time (Days)
              </Label>
              <Input
                id="processingTime"
                type="number"
                className="col-span-3"
                value={newDocumentProcessingTime}
                onChange={(e) => setNewDocumentProcessingTime(parseInt(e.target.value))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditDocument}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Document Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-white text-gray-800">
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this document?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteDocument}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
