
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import QrCodeImage from "/src/pages/qr-placeholder.jpg";
import { useEffect, useState } from "react";
import { ScanLine, ShieldCheck, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { databases, storage, DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID, RECEIPTS_BUCKET_ID } from "@/lib/appwrite";
import { toast } from "sonner";
import { ID } from "appwrite";
import { useLocation } from "wouter";

export default function Checkout() {
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [requestId, setRequestId] = useState<string>("");
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const id = queryParams.get("requestId");
    const amountStr = queryParams.get("totalAmount");

    if (id) {
      setRequestId(id);
    }
    
    if (amountStr) {
      const amount = parseFloat(amountStr);
      if (!isNaN(amount)) {
        setTotalAmount(amount);
      }
    }
  }, []);

  const mutation = useMutation({
    mutationFn: async (file: File) => {
        if (!requestId) throw new Error('Request ID is not available.');

        // 1. Create a unique ID for the file
        const fileId = ID.unique();

        // 2. Upload the file to the 'receipts' bucket
        await storage.createFile(RECEIPTS_BUCKET_ID, fileId, file);

        // 3. Get the public URL of the uploaded file
        const receiptUrl = storage.getFileView(RECEIPTS_BUCKET_ID, fileId);

        // 4. Update the document with the URL in the 'receipt' field
        const response = await databases.updateDocument(
            DATABASE_ID,
            DOCUMENT_REQUESTS_COLLECTION_ID,
            requestId,
            { receipt: receiptUrl.href, status: 'pending_verification' } // CORRECTED
        );

        return response;
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['requests', 'all'] });
        queryClient.invalidateQueries({ queryKey: ['requests', 'pending_payment'] });
        setIsModalOpen(false);
        setIsSuccessModalOpen(true);
        setSelectedFile(null);
    },
    onError: (error) => {
        console.error("Upload failed:", error);
        toast.error(error.message || "Failed to upload receipt. Please check the console for details.");
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
        setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
        mutation.mutate(selectedFile);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex flex-col items-center justify-start p-4 pt-32 pb-24">
      {/* 3-Step Guide */}
      <div className="w-full max-w-5xl mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                  <div className="bg-white rounded-full p-4 mb-4 shadow-md border">
                      <ScanLine className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-lg text-zinc-800">Step 1: Scan QR Code</h3>
                  <p className="text-sm text-zinc-600 px-2">Use your GCash app to scan the QR code provided below.</p>
              </div>
              <div className="flex flex-col items-center">
                  <div className="bg-white rounded-full p-4 mb-4 shadow-md border">
                      <ShieldCheck className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-lg text-zinc-800">Step 2: Confirm Amount</h3>
                  <p className="text-sm text-zinc-600 px-2">Ensure the payment amount in GCash matches the total on this page.</p>
              </div>
              <div className="flex flex-col items-center">
                  <div className="bg-white rounded-full p-4 mb-4 shadow-md border">
                      <Upload className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-lg text-zinc-800">Step 3: Upload Receipt</h3>
                  <p className="text-sm text-zinc-600 px-2">Once paid, save a screenshot and use the button below to upload it.</p>
              </div>
          </div>
      </div>

      <Card className="w-full max-w-lg shadow-lg mt-8">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-zinc-900">Complete Your Payment</CardTitle>
          <CardDescription className="text-zinc-600">Follow the instructions below to complete your payment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-lg text-zinc-900">Payment Instructions</h3>
            <p className="text-sm text-zinc-700">Please transfer the total amount to the following GCash account:</p>
            <div className="flex items-center justify-center py-4">
              <img src={QrCodeImage} alt="GCash QR Code" className="w-48 h-48"/>
            </div>
            <p className="text-sm text-center font-semibold text-zinc-900">Account Name: John Louise Bergabena</p>
            <div className="text-center">
                <p className="text-lg text-center font-bold text-zinc-900">Total Amount: ₱{totalAmount.toFixed(2)}</p>
            </div>
          </div>
          <div className="text-center">
            {requestId && (
                 <Button onClick={() => setIsModalOpen(true)} className="text-white bg-blue-600 hover:bg-blue-700">
                 Upload Receipt
               </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white text-gray-800">
            <DialogHeader>
                <DialogTitle className="text-blue-900">Upload Payment Receipt</DialogTitle>
                <DialogDescription className="text-gray-600 pt-2">
                    Select the screenshot of your GCash transaction.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleFileChange}
                    className="bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                {selectedFile && (
                    <p className="text-sm text-gray-500 mt-2">Selected file: {selectedFile.name}</p>
                )}
            </div>
            <DialogFooter className="mt-4 sm:justify-end gap-2">
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button
                    disabled={!selectedFile || mutation.isPending}
                    onClick={handleUpload}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    {mutation.isPending ? "Uploading..." : "Upload & Submit"}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <DialogContent className="bg-white text-gray-800">
            <DialogHeader>
                <DialogTitle className="text-blue-900">Upload Successful!</DialogTitle>
                <DialogDescription className="text-gray-600 pt-2">
                    Your receipt has been uploaded and is now pending verification.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4 sm:justify-end gap-2">
                <Button
                    onClick={() => navigate('/my-requests')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    Done
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </div>
  );
}
