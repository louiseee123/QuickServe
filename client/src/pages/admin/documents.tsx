
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Nav from "@/components/nav";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Edit, Trash2, PlusCircle, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";


const ManageDocumentsPage = () => {
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const columns = [
        { header: "Name", cell: ({ row }) => <span>{row.original.name}</span> },
        { header: "Price", cell: ({ row }) => <span>PHP {row.original.price.toFixed(2)}</span> },
        { header: "Processing Time", cell: ({ row }) => <span>{row.original.processingTimeDays} days</span> },
        { header: "Requires Details", cell: ({ row }) => <Checkbox checked={row.original.requiresDetails} disabled /> },
        {
            header: "Actions",
            cell: () => (
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" disabled><Edit className="h-4 w-4" /></Button>
                    <Button variant="destructive" size="icon" disabled><Trash2 className="h-4 w-4" /></Button>
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
                        <Button className="flex items-center gap-2" disabled>
                            <PlusCircle className="h-5 w-5" />
                            Add Document
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <DataTable columns={columns} data={[]} />
                    </CardContent>
                </Card>
            </main>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Document</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" className="col-span-3" disabled />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">Price (PHP)</Label>
                            <Input id="price" type="number" className="col-span-3" disabled/>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="processingTime" className="text-right">Processing Time (Days)</Label>
                            <Input id="processingTime" type="number" className="col-span-3" disabled/>
                        </div>
                        <div className="flex items-center space-x-2 justify-end mt-2">
                            <Label htmlFor="requires-details" className="font-medium">Requires additional details from student?</Label>
                            <Switch id="requires-details" disabled/>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button disabled>
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
                        <DialogDescription>This action cannot be undone. This will permanently delete the document.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" disabled>
                            Yes, delete it
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ManageDocumentsPage;
