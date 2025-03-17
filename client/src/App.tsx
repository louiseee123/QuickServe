import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import Layout from "@/components/layout";
import Home from "@/pages/home";
import Request from "@/pages/request";
import Admin from "@/pages/admin";
import PendingApprovals from "@/pages/admin/pending-approvals";
import Auth from "@/pages/auth";
import MyRequests from "@/pages/my-requests";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "./components/protected-route";


function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/auth" component={Auth} />
        <ProtectedRoute path="/" component={Home} />
        <ProtectedRoute path="/request" component={Request} />
        <ProtectedRoute path="/admin" component={Admin} />
        <ProtectedRoute path="/pending-approvals" component={PendingApprovals} />
        <ProtectedRoute path="/my-requests" component={MyRequests} />
        <Route component={PendingApprovals} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;