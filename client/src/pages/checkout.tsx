import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import QrCodeImage from "/src/pages/qr-placeholder.jpg"; // Import the image
import { useRequest } from "@/hooks/use-request";
import { Skeleton } from "@/components/ui/skeleton";

export default function Checkout() {
  const [path] = useLocation();
  const search = path.split('?')[1] || '';
  const queryParams = new URLSearchParams(search);
  const requestId = queryParams.get("requestId");
  
  // Fetch the request details using the new hook
  const { data: request, isLoading, isError } = useRequest(requestId || '');

  // Calculate total amount from the fetched request
  const totalAmount = request?.totalAmount || 0;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-lg">
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
              {isLoading ? (
                  <Skeleton className="h-8 w-32 mx-auto" />
              ) : isError ? (
                  <p className="text-red-500 font-bold">Error fetching amount</p>
              ) : (
                  <p className="text-lg text-center font-bold text-zinc-900">Total Amount: ₱{totalAmount.toFixed(2)}</p>
              )}
            </div>
          </div>
          <div className="text-center">
            <a href={`/upload-receipt?requestId=${requestId}`} className="text-blue-600 hover:underline">
              Already paid? Upload your receipt here.
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
