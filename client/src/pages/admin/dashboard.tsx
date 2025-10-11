import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
        <main className="container mx-auto py-8 pt-32">
            <Card className="bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-gray-800">Admin Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600">Welcome to the admin dashboard. This page is still under construction.</p>
                </CardContent>
            </Card>
        </main>
    </div>
  );
}
