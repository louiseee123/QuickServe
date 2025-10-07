
import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useParams } from "wouter";
import Nav from "@/components/nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import type { DocumentRequest } from "@shared/schema";

const fetchRequestDetails = async (requestId: string): Promise<DocumentRequest> => {
  const docRef = doc(db, "document_requests", requestId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as DocumentRequest;
  }
  throw new Error("Request not found");
};

const RequestSuccessPage = () => {
  const params = useParams();
  const requestId = params.requestId as string;

  const { data: request, isLoading, error } = useQuery<DocumentRequest, Error>({
    queryKey: ["request", requestId],
    queryFn: () => fetchRequestDetails(requestId),
  });

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
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin"/></div>
            ) : error ? (
              <div className="text-center text-red-500">Error: {error.message}</div>
            ) : request && (
              <div className="space-y-4 text-left bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg border-b pb-2 mb-4">Request Summary</h3>
                <div><strong>Request ID:</strong> {request.id}</div>
                <div><strong>Student Name:</strong> {request.studentName}</div>
                <div><strong>Date Requested:</strong> {format(new Date(request.createdAt), 'PPp')}</div>
                <div className="font-semibold pt-4 mt-4 border-t"><strong>Total Amount:</strong> PHP {request.totalAmount.toFixed(2)}</div>
              </div>
            )}
             <p className="text-center mt-6 text-gray-600">You will be notified via email once your document is ready for pickup. You can also track the status of your request on the "My Requests" page.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default RequestSuccessPage;
