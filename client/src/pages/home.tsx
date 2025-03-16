import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { FileText, Clock, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto">
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold mb-4">Welcome, Consolatricians!</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Streamline your document requests with QuickServe - CCTC's efficient queue management system
        </p>
        <Link href="/request">
          <Button size="lg" className="font-semibold">
            Request Document
          </Button>
        </Link>
      </section>

      <section className="grid md:grid-cols-3 gap-6 py-12">
        <Card>
          <CardContent className="pt-6">
            <div className="text-primary mb-4">
              <FileText className="h-12 w-12" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Easy Requests</h2>
            <p className="text-muted-foreground">
              Submit your document requests quickly and easily through our online platform.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-primary mb-4">
              <Clock className="h-12 w-12" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Real-time Updates</h2>
            <p className="text-muted-foreground">
              Track your request status and receive notifications when your documents are ready.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-primary mb-4">
              <CheckCircle className="h-12 w-12" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Efficient Processing</h2>
            <p className="text-muted-foreground">
              Get your documents faster with our streamlined processing system.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="py-12">
        <div className="aspect-video rounded-lg overflow-hidden relative">
          <img
            src="https://images.unsplash.com/photo-1729907920088-5c6042b714c5"
            alt="CCTC Campus"
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-primary/20" />
        </div>
      </section>
    </div>
  );
}
