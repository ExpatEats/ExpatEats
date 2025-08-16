import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import Onboarding from "./pages/Onboarding";
import Register from "./pages/Register";
import Preferences from "./pages/Preferences";
import Search from "./pages/Search";
import Shop from "./pages/Shop";
import Results from "./pages/Results";
import Contact from "./pages/Contact";
import Resources from "./pages/Resources";
import NewServices from "./pages/NewServices";
import Events from "./pages/Events";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import AddLocation from "./pages/AddLocation";
import Terms from "./pages/Terms";
import FindMyFood from "./pages/FindMyFood";
import Store from "./pages/Store";
import NotFound from "./pages/not-found";
import { useEffect } from "react";

// Authentication guard component
const RequireAuth = ({ component: Component, redirectTo }: { component: React.ComponentType, redirectTo: string }) => {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    // Check if user is logged in by looking for userProfile in localStorage
    const userProfile = localStorage.getItem('userProfile');
    console.log('Auth check - userProfile:', userProfile);
    if (!userProfile) {
      console.log('No user profile found, redirecting to:', redirectTo);
      setLocation(redirectTo);
    }
  }, [setLocation, redirectTo]);
  
  return <Component />;
};

function Router() {
  return (
    <Layout>
      <Switch>
        {/* Public routes */}
        <Route path="/" component={Register} />
        <Route path="/terms" component={Terms} />
        <Route path="/onboarding" component={Onboarding} /> {/* Legacy route for compatibility */}
        
        {/* Protected routes */}
        <Route path="/search">
          <RequireAuth component={Shop} redirectTo="/" />
        </Route>
        <Route path="/find-my-food">
          <RequireAuth component={FindMyFood} redirectTo="/" />
        </Route>
        <Route path="/results">
          <RequireAuth component={Results} redirectTo="/" />
        </Route>
        <Route path="/contact">
          <RequireAuth component={Contact} redirectTo="/" />
        </Route>
        <Route path="/resources">
          <RequireAuth component={Resources} redirectTo="/" />
        </Route>
        <Route path="/services">
          <RequireAuth component={NewServices} redirectTo="/" />
        </Route>
        <Route path="/events">
          <RequireAuth component={Events} redirectTo="/" />
        </Route>
        <Route path="/add-location">
          <RequireAuth component={AddLocation} redirectTo="/" />
        </Route>
        <Route path="/store/:id">
          <RequireAuth component={Store} redirectTo="/" />
        </Route>
        
        {/* Admin routes - separate authentication */}
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin" component={Admin} />
        
        {/* Fallback route */}
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
