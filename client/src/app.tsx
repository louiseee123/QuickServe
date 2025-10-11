
import { Route, Switch, useLocation } from "wouter";
import Home from "@/pages/home";
import AuthPage from "@/pages/auth";
import RequestPage from "@/pages/request";
import MyRequests from "@/pages/my-requests";
import CheckoutPage from "@/pages/checkout";
import AdminDashboardPage from "@/pages/admin/dashboard";
import PendingApprovals from "@/pages/admin/pending-approvals";
import ManageDocumentsPage from "@/pages/admin/documents";
import useAuth from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "@/components/layout";
import { useEffect } from "react";

const queryClient = new QueryClient();

const AppRouter = () => {
  const { user, isLoading, isAdmin } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;

    const isAuthRoute = location === '/login' || location === '/auth';

    if (!user && !isAuthRoute) {
      setLocation("/login");
    } else if (user && isAuthRoute) {
      setLocation("/");
    } else if (user && !isAdmin && location.startsWith('/admin')) {
      setLocation("/");
    }
  }, [user, isLoading, isAdmin, location, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={AuthPage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/request" component={RequestPage} />
        <Route path="/my-requests" component={MyRequests} />
        <Route path="/checkout" component={CheckoutPage} />

        {isAdmin && (
          <>
            <Route path="/admin/dashboard" component={AdminDashboardPage} />
            <Route path="/admin/pending-approvals" component={PendingApprovals} />
            <Route path="/admin/documents" component={ManageDocumentsPage} />
          </>
        )}

        <Route>
          <div className="text-center py-10">
            <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
            <p className="mt-4">The page you're looking for doesn't exist.</p>
          </div>
        </Route>
      </Switch>
    </Layout>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <Toaster richColors />
    </QueryClientProvider>
  );
}

export default App;
