import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";

interface RequestData {
  qr_code_url: string;
  account_name: string;
  total_amount: number;
}

export default function Checkout() {
  const [location] = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const requestId = queryParams.get("requestId");

  const [requestData, setRequestData] = useState<RequestData | null>(null);

  useEffect(() => {
    if (requestId) {
      fetch(`/api/requests/${requestId}`)
        .then((res) => res.json())
        .then((data) => setRequestData(data));
    }
  }, [requestId]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Complete Your Payment</CardTitle>
          <CardDescription className="text-gray-800">Follow the instructions below to complete your payment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-lg">Payment Instructions</h3>
            <p className="text-sm text-gray-800">Please transfer the total amount to the following GCash account:</p>
            <div className="flex items-center justify-center py-4">
              {requestData ? (
                <img src={requestData.qr_code_url} alt="GCash QR Code" className="w-48 h-48"/>
              ) : (
                <div className="w-48 h-48 bg-gray-200 animate-pulse" />
              )}
            </div>
            <p className="text-sm text-center font-semibold">Account Name: {requestData?.account_name}</p>
            <p className="text-lg text-center font-bold">Total Amount: ₱{requestData?.total_amount ? requestData.total_amount.toFixed(2) : '0.00'}</p>
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
