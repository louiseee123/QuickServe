
import { Switch, Route, Redirect } from "wouter";
import Home from "./pages/home";
import AuthPage from "./pages/auth";
import RequestDocument from "./pages/request";
import MyRequests from "./pages/my-requests";
import AdminDashboard from "./pages/admin/dashboard";
import PendingApprovals from "./pages/admin/pending-approvals";
import PaymentLogs from "./pages/admin/payment-logs";
import { useAuth } from "./hooks/use-auth";
import CheckoutPage from "./pages/checkout";

const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  return (
    <Switch>
      <Route path="/">
        {user ? <Home /> : <Redirect to="/login" />}
      </Route>
      <Route path="/login">
        {!user ? <AuthPage /> : <Redirect to="/" />}
      </Route>
      <Route path="/signup">
        {!user ? <AuthPage /> : <Redirect to="/" />}
      </Route>
      <Route path="/request">
        {user ? <RequestDocument /> : <Redirect to="/login" />}
      </Route>
      <Route path="/my-requests">
        {user ? <MyRequests /> : <Redirect to="/login" />}
      </Route>
      <Route path="/checkout/:id">
        {user ? <CheckoutPage /> : <Redirect to="/login" />}
      </Route>
      
      {/* Admin Routes */}
      <Route path="/admin/dashboard">
        {user?.role === "admin" ? <AdminDashboard /> : <Redirect to="/" />}
      </Route>
      <Route path="/admin/pending-approvals">
        {user?.role === "admin" ? <PendingApprovals /> : <Redirect to="/" />}
      </Route>
      <Route path="/admin/payment-logs">
        {user?.role === "admin" ? <PaymentLogs /> : <Redirect to="/" />}
      </Route>

      {/* Redirect any other path to home */}
      <Route>
        <Redirect to="/" />
      </Route>
    </Switch>
  );
};

export default App;
