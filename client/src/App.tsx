import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
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
import Community from "./pages/Community";
import CreatePost from "./pages/CreatePost";
import PostDetail from "./pages/PostDetail";
import Admin from "./pages/Admin";
import AddLocation from "./pages/AddLocation";
import Terms from "./pages/Terms";
import FindMyFood from "./pages/FindMyFood";
import Store from "./pages/Store";
import Favorites from "./pages/Favorites";
import Unauthorized from "./pages/Unauthorized";
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
                <Route path="/" component={FindMyFood} />
                <Route path="/register" component={Register} />
                <Route path="/terms" component={Terms} />
                <Route path="/unauthorized" component={Unauthorized} />
                <Route path="/onboarding" component={Onboarding} />{" "}
                {/* Legacy route for compatibility */}
                <Route path="/preferences">
                    <RequireAuth component={Preferences} redirectTo="/unauthorized" />
                </Route>
                {/* Protected routes */}
                <Route path="/search">
                    <RequireAuth component={Shop} redirectTo="/unauthorized" />
                </Route>
                <Route path="/find-my-food" component={FindMyFood} />
                <Route path="/results" component={Results} />
                <Route path="/contact">
                    <RequireAuth component={Contact} redirectTo="/unauthorized" />
                </Route>
                <Route path="/resources">
                    <RequireAuth component={Resources} redirectTo="/unauthorized" />
                </Route>
                <Route path="/services">
                    <RequireAuth component={NewServices} redirectTo="/unauthorized" />
                </Route>
                <Route path="/events">
                    <RequireAuth component={Events} redirectTo="/unauthorized" />
                </Route>
                <Route path="/add-location">
                    <RequireAuth component={AddLocation} redirectTo="/unauthorized" />
                </Route>
                <Route path="/store/:id">
                    <RequireAuth component={Store} redirectTo="/unauthorized" />
                </Route>
                <Route path="/favorites">
                    <RequireAuth component={Favorites} redirectTo="/unauthorized" />
                </Route>
                <Route path="/community">
                    <RequireAuth component={Community} redirectTo="/unauthorized" />
                </Route>
                <Route path="/community/create/:section?">
                    <RequireAuth component={CreatePost} redirectTo="/unauthorized" />
                </Route>
                <Route path="/community/post/:id">
                    <RequireAuth component={PostDetail} redirectTo="/unauthorized" />
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
                    <Router />
                </TooltipProvider>
            </AuthProvider>
        </QueryClientProvider>
    );
}

export default App;
