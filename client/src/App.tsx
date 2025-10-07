
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
import Layout from "./components/layout"; // Import the main layout
import FooterOnlyLayout from "./components/footer-only-layout";

const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  return (
      <Switch>
        <Route path="/">
          {user ? <Layout><Home /></Layout> : <Redirect to="/login" />}
        </Route>
        <Route path="/login">
          {!user ? <FooterOnlyLayout><AuthPage /></FooterOnlyLayout> : <Redirect to="/" />}
        </Route>
        <Route path="/signup">
          {!user ? <FooterOnlyLayout><AuthPage /></FooterOnlyLayout> : <Redirect to="/" />}
        </Route>
        <Route path="/request">
          {user ? <Layout><RequestDocument /></Layout> : <Redirect to="/login" />}
        </Route>
        <Route path="/my-requests">
          {user ? <Layout><MyRequests /></Layout> : <Redirect to="/login" />}
        </Route>
        <Route path="/checkout/:id">
          {user ? <Layout><CheckoutPage /></Layout> : <Redirect to="/login" />}
        </Route>
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard">
          {user?.role === "admin" ? <Layout><AdminDashboard /></Layout> : <Redirect to="/" />}
        </Route>
        <Route path="/admin/pending-approvals">
          {user?.role === "admin" ? <Layout><PendingApprovals /></Layout> : <Redirect to="/" />}
        </Route>
        <Route path="/admin/payment-logs">
          {user?.role === "admin" ? <Layout><PaymentLogs /></Layout> : <Redirect to="/" />}
        </Route>

        {/* Redirect any other path to home */}
        <Route>
          <Redirect to="/" />
        </Route>
      </Switch>
  );
};

export default App;
