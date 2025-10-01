import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import type { DocumentRequest } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import Nav from "@/components/nav";

const CheckoutPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: request, isLoading, error } = useQuery<DocumentRequest>({ 
    queryKey: ["/api/request", id], 
  });

  const { mutate: updateRequest, isLoading: isUpdating } = useMutation(
    async (data: any) => {
      const res = await fetch(`/api/request/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update request");
      return res.json();
    },
    {
      onSuccess: () => {
        navigate("/my-requests");
      },
    }
  );

  const handleFreeCheckout = () => {
    updateRequest({ paymentStatus: "Paid", status: "processing" });
  };

  const handleStripeCheckout = async () => {
    // Create a Stripe checkout session on the backend
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: id }),
    });
    const { url } = await res.json();
    window.location.href = url;
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-10 w-10 animate-spin" /></div>;
  if (error) return <div className="flex justify-center items-center h-screen"><AlertTriangle className="h-10 w-10 text-red-500" /></div>;

  if (request && request.price === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 to-green-300">
        <Nav />
        <div className="container mx-auto pt-32 px-4 pb-8 flex flex-col items-center">
          <Card className="w-full max-w-lg bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl overflow-hidden text-center">
            <CardHeader>
              <CheckCircle className="h-16 w-16 mx-auto text-green-500"/>
              <CardTitle className="text-3xl font-bold text-green-900">Free Document</CardTitle>
              <CardDescription className="text-green-800/90 pt-2">This document is free of charge.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <p className="mb-4">Your request for a <strong>{request.documentType}</strong> is being processed.</p>
              <Button onClick={handleFreeCheckout} disabled={isUpdating}>
                {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Complete"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300">
      <Nav />
      <div className="container mx-auto pt-32 px-4 pb-8 flex flex-col items-center">
        <Card className="w-full max-w-lg bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-blue-900">Complete Your Payment</CardTitle>
            <CardDescription className="text-blue-800/90 pt-2">To finalize your request, please proceed with the payment.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <p className="text-lg">Document: <strong>{request?.documentType}</strong></p>
              <p className="text-2xl font-bold">Price: ₱{request?.price.toFixed(2)}</p>
            </div>
            <Button onClick={handleStripeCheckout} className="w-full">
              Pay with Stripe
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckoutPage;
