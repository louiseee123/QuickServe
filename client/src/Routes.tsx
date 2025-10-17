
import { Route, Switch } from "wouter";
import Home from "./pages/home";
import Auth from "./pages/auth";
import Checkout from "./pages/checkout";
import MyRequests from "./pages/my-requests";
import RequestSuccess from "./pages/request-success";
import Request from "./pages/request";
import AdminDashboard from "./pages/admin/dashboard";
import AdminDocuments from "./pages/admin/documents";
import AdminPaymentLogs from "./pages/admin/payment-logs";
import AdminPendingApprovals from "./pages/admin/pending-approvals";
import AdminOngoingRequests from "./pages/admin/ongoing-requests";
import AdminRequests from "./pages/admin/requests";
import NotFound from "./pages/not-found";
import { ProtectedRoute } from "./components/protected-route";

const Routes = () => (
  <Switch>
    <Route path="/auth" component={Auth} />
    <Route path="/" component={Home} />
    <ProtectedRoute path="/checkout" component={Checkout} />
    <ProtectedRoute path="/my-requests" component={MyRequests} />
    <ProtectedRoute path="/request-success" component={RequestSuccess} />
    <ProtectedRoute path="/request" component={Request} />
    <ProtectedRoute path="/admin/dashboard" component={AdminDashboard} />
    <ProtectedRoute path="/admin/documents" component={AdminDocuments} />
    <ProtectedRoute path="/admin/payment-logs" component={AdminPaymentLogs} />
    <ProtectedRoute path="/admin/pending-approvals" component={AdminPendingApprovals} />
    <ProtectedRoute path="/admin/ongoing-requests" component={AdminOngoingRequests} />
    <ProtectedRoute path="/admin/requests" component={AdminRequests} />
    <Route component={NotFound} />
  </Switch>
);

export default Routes;
