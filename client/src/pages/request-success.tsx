
import Nav from "@/components/nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

const RequestSuccessPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <main className="container mx-auto py-8 pt-32">
        <Card className="max-w-2xl mx-auto shadow-lg rounded-xl">
          <CardHeader className="text-center">
             <div className="mx-auto bg-green-100 rounded-full h-16 w-16 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-800 mt-4">Request Successful!</CardTitle>
            <CardDescription className="text-lg">Your document request has been submitted and is now being processed.</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
             <p className="text-center mt-6 text-gray-600">You will be notified via email once your document is ready for pickup. You can also track the status of your request on the "My Requests" page.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default RequestSuccessPage;
