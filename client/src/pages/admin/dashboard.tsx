
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface DocumentRequest {
  $id: string;
  name: string;
  price: number;
  userId: string;
  status: string;
  requestedAt: string;
}

export default function AdminDashboardPage() {
  const [requests, setRequests] = useState<DocumentRequest[]>([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch("/api/requests/all");
        const data = await response.json();
        setRequests(data);
      } catch (error) {
        console.error("Error fetching document requests:", error);
      }
    };

    fetchRequests();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
        <main className="container mx-auto py-8 pt-32">
            <Card className="bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-gray-800">Admin Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600 mb-4">Welcome to the admin dashboard. Here you can manage document requests.</p>
                    <div className="grid grid-cols-1 gap-4">
                        {requests.map((req) => (
                            <Card key={req.$id}>
                                <CardContent className="flex justify-between items-center p-4">
                                    <div>
                                        <p className="font-semibold">{req.name}</p>
                                        <p className="text-sm text-gray-500">User: {req.userId}</p>
                                        <p className="text-sm text-gray-500">Status: {req.status}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </main>
    </div>
  );
}
