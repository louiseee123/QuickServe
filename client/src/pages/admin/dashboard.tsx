
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Document, DocumentRequest } from "@shared/schema";
import { Clock, FileText, CheckCircle, PlusCircle, Edit, Trash2, PackageCheck } from "lucide-react";
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
import { getDocuments, getAllDocumentRequests, createDocument, updateDocument, deleteDocument } from "@/api/documents";

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
    fetchDocumentsAndRequests();
  }, []);

  const fetchDocumentsAndRequests = async () => {
    try {
      const [requestsData, documentsData] = await Promise.all([
        getAllDocumentRequests(),
        getDocuments(),
      ]);
      setRequests(requestsData.map((req: any) => ({ ...req, id: req.$id })));
      setDocuments(documentsData.map((doc: any) => ({ ...doc, id: doc.$id })));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleAddDocument = async () => {
    try {
      await createDocument({
        name: newDocumentName,
        price: newDocumentPrice,
        processingTimeDays: newDocumentProcessingTime,
      });
      setAddDialogOpen(false);
      fetchDocumentsAndRequests();
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
      await updateDocument(selectedDocument.id, {
        name: newDocumentName,
        price: newDocumentPrice,
        processingTimeDays: newDocumentProcessingTime,
      });
      setEditDialogOpen(false);
      fetchDocumentsAndRequests();
    } catch (error) {
      console.error("Error editing document:", error);
    }
  };

  const handleDeleteDocument = async () => {
    if (!selectedDocument) return;
    try {
      await deleteDocument(selectedDocument.id);
      setDeleteDialogOpen(false);
      fetchDocumentsAndRequests();
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const openAddDialog = () => {
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

  const pendingRequests = requests.filter((req) => req.status === "pending_approval");
  const ongoingRequests = requests.filter((req) => req.status === "processing");
  const readyForPickupRequests = requests.filter((req) => req.status === "ready_for_pickup");
  const completedRequests = requests.filter((req) => req.status === "completed");

  const documentTableColumns = [
    { header: "Name", cell: (doc: Document) => <span className="font-medium text-gray-900">{doc.name}</span> },
    { header: "Price", cell: (doc: Document) => <span className="font-medium text-gray-900">PHP {doc.price.toFixed(2)}</span> },
    { header: "Processing Time", cell: (doc: Document) => <span className="font-medium text-gray-900">{doc.processingTimeDays} days</span> },
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
            <p className="text-gray-600 mt-2">Manage document requests and available documents.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-white/60 backdrop-blur-sm border-2 border-blue-100/50 shadow-lg rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Pending Approvals</CardTitle>
                    <Clock className="h-5 w-5 text-yellow-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-gray-800">{pendingRequests.length}</div>
                    <p className="text-xs text-gray-500 mt-1">Requests waiting for approval</p>
                </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm border-2 border-blue-100/50 shadow-lg rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Ongoing Requests</CardTitle>
                    <FileText className="h-5 w-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-gray-800">{ongoingRequests.length}</div>
                    <p className="text-xs text-gray-500 mt-1">Requests being processed</p>
                </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm border-2 border-blue-100/50 shadow-lg rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Ready for Pickup</CardTitle>
                    <PackageCheck className="h-5 w-5 text-indigo-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-gray-800">{readyForPickupRequests.length}</div>
                    <p className="text-xs text-gray-500 mt-1">Requests ready for client</p>
                </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm border-2 border-blue-100/50 shadow-lg rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Completed Requests</CardTitle>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-gray-800">{completedRequests.length}</div>
                    <p className="text-xs text-gray-500 mt-1">Successfully fulfilled requests</p>
                </CardContent>
            </Card>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold text-gray-800">Manage Documents</h2>
            <Button className="flex items-center gap-2" onClick={openAddDialog}>
              <PlusCircle className="h-5 w-5" />
              Add Document
            </Button>
          </div>
          <div className="relative z-10">
            <DataTable columns={documentTableColumns} data={documents} />
          </div>
        </div>
      </main>

      <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="bg-white/90 text-gray-800 backdrop-blur-sm border-2 border-blue-100/50 shadow-lg rounded-2xl sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800">
              Create New Document
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="grid grid-cols-1 items-center gap-3">
              <Label htmlFor="name" className="text-left text-gray-600 font-medium">Document Name</Label>
              <Input id="name" placeholder="e.g. Transcript of Records" className="col-span-3" value={newDocumentName} onChange={(e) => setNewDocumentName(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 items-center gap-3">
              <Label htmlFor="price" className="text-left text-gray-600 font-medium">Price (in PHP)</Label>
              <Input id="price" type="number" placeholder="e.g. 150.00" className="col-span-3" value={newDocumentPrice} onChange={(e) => setNewDocumentPrice(parseFloat(e.target.value))} />
            </div>
            <div className="grid grid-cols-1 items-center gap-3">
              <Label htmlFor="processingTime" className="text-left text-gray-600 font-medium">Processing Time (in Days)</Label>
              <Input id="processingTime" type="number" placeholder="e.g. 3" className="col-span-3" value={newDocumentProcessingTime} onChange={(e) => setNewDocumentProcessingTime(parseInt(e.target.value))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddDocument}>Save Document</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-white/90 text-gray-800 backdrop-blur-sm border-2 border-blue-100/50 shadow-lg rounded-2xl sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800">
              Edit Document
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="grid grid-cols-1 items-center gap-3">
              <Label htmlFor="name" className="text-left text-gray-600 font-medium">Document Name</Label>
              <Input id="name" placeholder="e.g. Transcript of Records" className="col-span-3" value={newDocumentName} onChange={(e) => setNewDocumentName(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 items-center gap-3">
              <Label htmlFor="price" className="text-left text-gray-600 font-medium">Price (in PHP)</Label>
              <Input id="price" type="number" placeholder="e.g. 150.00" className="col-span-3" value={newDocumentPrice} onChange={(e) => setNewDocumentPrice(parseFloat(e.target.value))} />
            </div>
            <div className="grid grid-cols-1 items-center gap-3">
              <Label htmlFor="processingTime" className="text-left text-gray-600 font-medium">Processing Time (in Days)</Label>
              <Input id="processingTime" type="number" placeholder="e.g. 3" className="col-span-3" value={newDocumentProcessingTime} onChange={(e) => setNewDocumentProcessingTime(parseInt(e.target.value))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditDocument}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-white/90 text-gray-800 backdrop-blur-sm border-2 border-red-100/50 shadow-lg rounded-2xl sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-red-600">Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 py-4">
            Are you sure you want to delete the document "
            <span className="font-semibold text-gray-800">{selectedDocument?.name}</span>
            "? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteDocument}>Delete Document</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
