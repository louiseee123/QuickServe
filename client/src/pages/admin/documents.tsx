import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Nav from "@/components/nav";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Edit, Trash2, PlusCircle, Loader2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

const fetchDocuments = async () => {
    const querySnapshot = await getDocs(collection(db, "documents"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const ManageDocumentsPage = () => {
    const queryClient = useQueryClient();
    const { data: documents = [], isLoading } = useQuery({ queryKey: ["documents"], queryFn: fetchDocuments });

    const [isDialogOpen, setDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [formData, setFormData] = useState({ name: "", price: 0, processingTimeDays: 0, requiresDetails: false });

    const mutation = useMutation({
        mutationFn: async (docData) => {
            if (selectedDocument && selectedDocument.id) {
                // Update
                const docRef = doc(db, "documents", selectedDocument.id);
                await updateDoc(docRef, docData);
                toast.success("Document updated successfully!");
            } else {
                // Create
                await addDoc(collection(db, "documents"), docData);
                toast.success("Document created successfully!");
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["documents"] });
            setDialogOpen(false);
            setSelectedDocument(null);
        },
        onError: (error) => toast.error(error.message || "An error occurred.")
    });

    const deleteMutation = useMutation({
        mutationFn: async (docId) => {
            await deleteDoc(doc(db, "documents", docId));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["documents"] });
            toast.success("Document deleted successfully");
            setDeleteDialogOpen(false);
            setSelectedDocument(null);
        },
        onError: (error) => toast.error(error.message || "Failed to delete document.")
    });

    const handleSave = () => {
        mutation.mutate(formData);
    };

    const handleDelete = () => {
        if (selectedDocument && selectedDocument.id) {
            deleteMutation.mutate(selectedDocument.id);
        }
    };

    const openDialogForCreate = () => {
        setSelectedDocument(null);
        setFormData({ name: "", price: 0, processingTimeDays: 0, requiresDetails: false });
        setDialogOpen(true);
    };

    const openDialogForUpdate = (doc) => {
        setSelectedDocument(doc);
        setFormData({ name: doc.name, price: doc.price, processingTimeDays: doc.processingTimeDays, requiresDetails: doc.requiresDetails });
        setDialogOpen(true);
    };

    const openDeleteDialog = (doc) => {
        setSelectedDocument(doc);
        setDeleteDialogOpen(true);
    };

    const columns = [
        { header: "Name", cell: ({ row }) => <span>{row.original.name}</span> },
        { header: "Price", cell: ({ row }) => <span>PHP {row.original.price.toFixed(2)}</span> },
        { header: "Processing Time", cell: ({ row }) => <span>{row.original.processingTimeDays} days</span> },
        { header: "Requires Details", cell: ({ row }) => <Checkbox checked={row.original.requiresDetails} disabled /> },
        {
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => openDialogForUpdate(row.original)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="destructive" size="icon" onClick={() => openDeleteDialog(row.original)}><Trash2 className="h-4 w-4" /></Button>
                </div>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Nav />
            <main className="container mx-auto py-8 pt-32">
                <Card className="shadow-lg rounded-xl">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-3xl font-bold text-gray-800">Manage Documents</CardTitle>
                            <CardDescription>Add, edit, or remove document types available for request.</CardDescription>
                        </div>
                        <Button onClick={openDialogForCreate} className="flex items-center gap-2">
                            <PlusCircle className="h-5 w-5" />
                            Add Document
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center items-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
                        ) : (
                            <DataTable columns={columns} data={documents} />
                        )}
                    </CardContent>
                </Card>
            </main>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedDocument ? "Edit Document" : "Create New Document"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">Price (PHP)</Label>
                            <Input id="price" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="processingTime" className="text-right">Processing Time (Days)</Label>
                            <Input id="processingTime" type="number" value={formData.processingTimeDays} onChange={(e) => setFormData({ ...formData, processingTimeDays: parseInt(e.target.value) || 0 })} className="col-span-3" />
                        </div>
                        <div className="flex items-center space-x-2 justify-end mt-2">
                            <Label htmlFor="requires-details" className="font-medium">Requires additional details from student?</Label>
                            <Switch id="requires-details" checked={formData.requiresDetails} onCheckedChange={(checked) => setFormData({ ...formData, requiresDetails: checked })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={mutation.isPending}>
                            {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><AlertTriangle className="text-red-500" />Are you absolutely sure?</DialogTitle>
                        <DialogDescription>This action cannot be undone. This will permanently delete the document <span className="font-semibold text-gray-800">{selectedDocument?.name}</span>.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
                            {deleteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Yes, delete it
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ManageDocumentsPage;
