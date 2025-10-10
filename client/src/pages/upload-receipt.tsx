
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { uploadReceipt } from '@/api/requests'; // This function needs to be created

export default function UploadReceiptPage() {
  const { requestId } = useParams();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file to upload.');
      return;
    }
    if (!requestId) {
        toast.error('Request ID is missing.');
        return;
    }

    setIsUploading(true);

    try {
      await uploadReceipt(requestId, file);
      
      toast.success('Receipt uploaded successfully! Your payment is now being verified.');

      // TODO: Redirect user or give feedback

    } catch (error) {
      toast.error('Failed to upload receipt. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>Upload Payment Receipt</CardTitle>
          <CardDescription>Request ID: {requestId}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="receipt-upload" className="font-semibold">Select receipt file:</label>
            <Input id="receipt-upload" type="file" onChange={handleFileChange} className="mt-2" accept="image/png, image/jpeg, image/jpg" />
          </div>
          <Button onClick={handleUpload} disabled={isUploading || !file} className="w-full">
            {isUploading ? 'Uploading...' : 'Upload and Submit for Verification'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
