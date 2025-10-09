
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { getRequestById } from "./api/requests";
import { DocumentRequest } from "@shared/schema";
import { toast } from "sonner";

export default function CheckoutPage() {
  const { requestId } = useParams();
  const [searchParams] = useSearchParams();
  const [request, setRequest] = useState<DocumentRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (searchParams.get("payment_cancelled")) {
      toast.error("Payment was cancelled. You can try again anytime.");
    }
  }, [searchParams]);

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
        if (fetchedRequest.paymentStatus === "paid") {
          toast.info("This request has already been paid.");
        }
      } catch (err) {
        setError("Failed to fetch request details.");
        console.error(err);
      }
      setIsLoading(false);
    };
    fetchRequest();
  }, [requestId]);

  const handleProceedToPayment = async () => {
    if (!request || request.paymentStatus === "paid") return;

    setIsRedirecting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: request.$id }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      toast.error("Could not redirect to payment. Please try again.");
      console.error(err);
      setIsRedirecting(false);
    }
  };

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
            <CardDescription>We couldn't load the checkout details.</CardDescription>
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

  const isPaid = request.paymentStatus === "paid";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Complete Your Payment</CardTitle>
          <CardDescription>Review your approved request and proceed to payment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-lg">Request for {request.studentName}</h3>
            <p className="text-sm text-gray-600">Student ID: {request.studentId}</p>
            <p className="text-sm text-gray-600">Email: {request.email}</p>
          </div>
          <div className="border-t border-b py-4 space-y-3">
            <h4 className="font-semibold">Documents:</h4>
            <ul className="list-disc list-inside text-sm text-gray-700">
              {request.documents.map((doc: any) => (
                <li key={doc.id}>{doc.name} (x{doc.quantity})</li>
              ))}
            </ul>
          </div>
          <div className="flex justify-between items-center font-bold text-xl">
            <span>Total Amount:</span>
            <span className="text-blue-600">{formatCurrency(request.totalAmount)}</span>
          </div>
          <Button
            onClick={handleProceedToPayment}
            disabled={isRedirecting || isPaid}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md"
            size="lg"
          >
            {isRedirecting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span>Redirecting...</span>
              </>
            ) : isPaid ? (
                "Payment Complete"
            ) : (
              "Proceed to Payment"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
