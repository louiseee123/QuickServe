
import { Route, Switch, Redirect, useLocation } from "wouter";
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

const queryClient = new QueryClient();

// This component contains the routing logic and waits for auth to load.
const AppRouter = () => {
  const { user, isLoading, isAdmin } = useAuth();
  const [location] = useLocation();

  // Show a loading screen while the user's auth state is being determined.
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // --- Redirect Logic ---
  const isAuthRoute = location === '/login' || location === '/auth';

  // If the user is NOT logged in and is trying to access a protected page
  if (!user && !isAuthRoute) {
    return <Redirect to="/login" />;
  }

  // If the user IS logged in and tries to access the login/auth page
  if (user && isAuthRoute) {
    return <Redirect to="/" />;
  }

  // If a non-admin user tries to access any admin route
  if (user && !isAdmin && location.startsWith('/admin')) {
    return <Redirect to="/" />;
  }

  // All checks passed, render the main application layout and routes
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={AuthPage} />
        <Route path="/auth" component={AuthPage} /> {/* Legacy route */}
        <Route path="/request" component={RequestPage} />
        <Route path="/my-requests" component={MyRequests} />
        <Route path="/checkout" component={CheckoutPage} />

        {/* Admin Routes - protected by the redirect logic above */}
        <Route path="/admin/dashboard" component={AdminDashboardPage} />
        <Route path="/admin/pending-approvals" component={PendingApprovals} />
        <Route path="/admin/documents" component={ManageDocumentsPage} />

        {/* Catch-all 404 Route */}
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
