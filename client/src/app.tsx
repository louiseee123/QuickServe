
import { Route, Switch } from "wouter";
import Home from "@/pages/home";
import AuthPage from "@/pages/auth";
import RequestPage from "@/pages/request";
import MyRequests from "@/pages/my-requests";
import CheckoutPage from "@/pages/checkout";
import AdminDashboardPage from "@/pages/admin/dashboard";
import PendingApprovals from "@/pages/admin/pending-approvals";
import ManageDocumentsPage from "@/pages/admin/documents";
import { AuthProvider } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "@/components/layout"; // Import the Layout component

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Layout> {/* Wrap the routes with the Layout component */}
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/login" component={AuthPage} /> {/* Corrected login route */}
            <Route path="/request" component={RequestPage} />
            <Route path="/my-requests" component={MyRequests} />
            <Route path="/checkout" component={CheckoutPage} />
            <Route path="/admin/login" component={AuthPage} /> {/* Corrected admin login route */}
            <Route path="/admin/dashboard" component={AdminDashboardPage} />
            <Route
              path="/admin/pending-approvals"
              component={PendingApprovals}
            />
            <Route
              path="/admin/documents"
              component={ManageDocumentsPage}
            />
          </Switch>
        </Layout>
        <Toaster richColors />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
