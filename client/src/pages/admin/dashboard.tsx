
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface Document {
  name: string;
  price: number;
}

export default function AdminDashboardPage() {
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch("/api/documents");
        const data = await response.json();
        setDocuments(data);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };

    fetchDocuments();
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
                        {documents.map((doc, index) => (
                            <Card key={index}>
                                <CardContent>
                                    <p>{doc.name}</p>
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
