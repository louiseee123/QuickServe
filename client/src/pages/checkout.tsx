
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { getRequestById } from "@/api/requests";
import { DocumentRequest } from "@shared/schema";

export default function CheckoutPage() {
  const { requestId } = useParams();
  const [request, setRequest] = useState<DocumentRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequest = async () => {
      if (!requestId) {
        setError("Request ID is missing.");
        setIsLoading(false);
        return;
      }
      try {
        const fetchedRequest = await getRequestById(requestId);
        setRequest(fetchedRequest);
      } catch (err) {
        setError("Failed to fetch request details.");
        console.error(err);
      }
      setIsLoading(false);
    };
    fetchRequest();
  }, [requestId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-red-600">Error</CardTitle>
            <CardDescription>We couldn't load the payment details.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p>{error}</p>
            <Button onClick={() => window.history.back()} className="mt-6">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!request) {
    return null; // Or some other placeholder
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Complete Your Payment</CardTitle>
          <CardDescription>Follow the instructions below to complete your payment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-lg">Payment Instructions</h3>
            <p className="text-sm text-gray-600">Please transfer the total amount to the following GCash account:</p>
            <div className="flex items-center justify-center py-4">
              <img src="/gcash-qr.png" alt="GCash QR Code" className="w-48 h-48"/>
            </div>
            <p className="text-sm text-center font-semibold">Account Name: Juan Dela Cruz</p>
            <p className="text-sm text-center font-semibold">Account Number: 09123456789</p>
          </div>
          <div className="border-t border-b py-4 space-y-3">
            <h4 className="font-semibold">Request Details:</h4>
            <ul className="list-disc list-inside text-sm text-gray-700">
                <li>Request for: {request.studentName}</li>
                <li>Student ID: {request.studentId}</li>
                <li>Documents: {request.documents.map((doc: any) => doc.name).join(', ')}</li>
            </ul>
          </div>
          <div className="flex justify-between items-center font-bold text-xl">
            <span>Total Amount:</span>
            <span className="text-blue-600">{formatCurrency(request.totalAmount)}</span>
          </div>
          <Link to={`/upload-receipt/${requestId}`}>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md"
              size="lg"
            >
              Upload Receipt
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
