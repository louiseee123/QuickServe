
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Complete Your Payment</CardTitle>
          <CardDescription>Review your approved request and proceed to payment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-lg">Request Details Loading...</h3>
          </div>
          <div className="border-t border-b py-4 space-y-3">
             <h4 className="font-semibold">Documents:</h4>
             <p className="text-sm text-gray-500">Loading...</p>
          </div>
          <div className="flex justify-between items-center font-bold text-xl">
            <span>Total Amount:</span>
            <span className="text-blue-600">PHP 0.00</span>
          </div>
          <Button
            disabled={true}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md"
            size="lg"
          >
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span>Processing...</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
