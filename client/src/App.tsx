import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
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
import AddLocation from "./pages/AddLocation";
import Terms from "./pages/Terms";
import FindMyFood from "./pages/FindMyFood";
import Store from "./pages/Store";
import Favorites from "./pages/Favorites";
import NotFound from "./pages/not-found";
import { useEffect } from "react";

// Authentication guard component
const RequireAuth = ({
    component: Component,
    redirectTo,
}: {
    component: React.ComponentType;
    redirectTo: string;
}) => {
    const [, setLocation] = useLocation();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            console.log("User not authenticated, redirecting to:", redirectTo);
            setLocation(redirectTo);
        }
    }, [isAuthenticated, isLoading, setLocation, redirectTo]);

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Only render component if authenticated
    return isAuthenticated ? <Component /> : null;
};

function Router() {
    return (
        <Layout>
            <Switch>
                {/* Public routes */}
                <Route path="/" component={Register} />
                <Route path="/terms" component={Terms} />
                <Route path="/onboarding" component={Onboarding} />{" "}
                {/* Legacy route for compatibility */}
                <Route path="/preferences">
                    <RequireAuth component={Preferences} redirectTo="/" />
                </Route>
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
                <Route path="/favorites">
                    <RequireAuth component={Favorites} redirectTo="/" />
                </Route>
                {/* Admin routes */}
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
            <AuthProvider>
                <TooltipProvider>
                    <Toaster />
                    <Router />
                </TooltipProvider>
            </AuthProvider>
        </QueryClientProvider>
    );
}

export default App;
