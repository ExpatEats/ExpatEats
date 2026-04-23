import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, UserCircle, LogOut, Settings, Heart, ShoppingBag } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoginModal } from "./LoginModal";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationDialog } from "@/components/NotificationDialog";

const Header = () => {
    const [location] = useLocation();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { user, isAuthenticated, logout, isLoading } = useAuth();
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [notificationConfig, setNotificationConfig] = useState<{
        title: string;
        description?: string;
        variant: "success" | "error" | "warning" | "info";
    }>({
        title: "",
        variant: "success"
    });

    const showNotification = (title: string, description?: string, variant: "success" | "error" | "warning" | "info" = "success") => {
        setNotificationConfig({ title, description, variant });
        setNotificationOpen(true);
    };

    const isActive = (path: string) => {
        return location === path;
    };

    const handleNavClick = () => {
        setIsSheetOpen(false);
    };

    const handleLogout = async () => {
        try {
            await logout();
            showNotification("Logged out successfully", "You have been logged out of your account.", "success");
        } catch (error) {
            console.error('Logout error:', error);
            showNotification("Logout error", "There was an issue logging out. Please try again.", "error");
        }
    };

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
            isScrolled
                ? 'bg-transparent'
                : 'bg-white/95 backdrop-blur-xl border-b border-bark/10 shadow-[0_2px_24px_rgba(44,31,15,0.07)]'
        }`}>
            <div className="w-full max-w-full px-4 py-3 flex items-center">
                {/* Left side - Logo */}
                <div className="flex items-center flex-1">
                    <Link href="/">
                        <div className="font-cormorant text-2xl tracking-wide">
                            <span className={`font-semibold transition-colors ${isScrolled ? 'text-white' : 'text-soil'}`}>
                                Expat
                            </span>
                            <em className={`font-semibold italic transition-colors ${isScrolled ? 'text-bark-lt' : 'text-bark'}`}>
                                Eats
                            </em>
                        </div>
                    </Link>
                </div>

                {/* Center - Navigation */}
                <nav className="hidden md:flex space-x-5 flex-shrink-0 font-outfit">
                    <div
                        className={`py-2 transition-colors ${
                            isActive("/search")
                                ? (isScrolled ? "text-white border-b-2 border-white/20" : "text-soil border-b-2 border-bark")
                                : (isScrolled ? "text-white/80 hover:text-white" : "text-t2 hover:text-soil")
                        }`}
                    >
                        <Link href="/search">Find My Food</Link>
                    </div>
                    <div
                        className={`py-2 transition-colors ${
                            isActive("/services")
                                ? (isScrolled ? "text-white border-b-2 border-white/20" : "text-soil border-b-2 border-bark")
                                : (isScrolled ? "text-white/80 hover:text-white" : "text-t2 hover:text-soil")
                        }`}
                    >
                        <Link href="/services">Services</Link>
                    </div>
                    <div
                        className={`py-2 transition-colors ${
                            isActive("/events")
                                ? (isScrolled ? "text-white border-b-2 border-white/20" : "text-soil border-b-2 border-bark")
                                : (isScrolled ? "text-white/80 hover:text-white" : "text-t2 hover:text-soil")
                        }`}
                    >
                        <Link href="/events">Events</Link>
                    </div>
                    <div
                        className={`py-2 transition-colors ${
                            isActive("/resources")
                                ? (isScrolled ? "text-white border-b-2 border-white/20" : "text-soil border-b-2 border-bark")
                                : (isScrolled ? "text-white/80 hover:text-white" : "text-t2 hover:text-soil")
                        }`}
                    >
                        <Link href="/resources">Resources</Link>
                    </div>
                    <div
                        className={`py-2 transition-colors ${
                            isActive("/community")
                                ? (isScrolled ? "text-white border-b-2 border-white/20" : "text-soil border-b-2 border-bark")
                                : (isScrolled ? "text-white/80 hover:text-white" : "text-t2 hover:text-soil")
                        }`}
                    >
                        <Link href="/community">Community</Link>
                    </div>
                    <div
                        className={`py-2 transition-colors ${
                            isActive("/add-location")
                                ? (isScrolled ? "text-white border-b-2 border-white/20" : "text-soil border-b-2 border-bark")
                                : (isScrolled ? "text-white/80 hover:text-white" : "text-t2 hover:text-soil")
                        }`}
                    >
                        <Link href="/add-location">Add Location</Link>
                    </div>
                </nav>

                {/* Right side - Actions */}
                <div className="flex items-center space-x-4 flex-1 justify-end">
                    {/* Desktop Login/User Menu */}
                    <div className="hidden md:block">
                        {isAuthenticated ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className={`flex items-center space-x-2 transition-colors ${
                                            isScrolled
                                                ? "text-white/80 hover:text-white hover:bg-white/10"
                                                : "text-t2 hover:text-soil hover:bg-bark/10"
                                        }`}
                                        disabled={isLoading}
                                    >
                                        <UserCircle className="h-5 w-5" />
                                        <span>{user?.name?.split(" ")[0] || user?.username || "Profile"}</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                        <Link href="/favorites">
                                            <Heart className="h-4 w-4 mr-2" />
                                            Favorites
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/purchases">
                                            <ShoppingBag className="h-4 w-4 mr-2" />
                                            My Guides
                                        </Link>
                                    </DropdownMenuItem>
                                    {(user?.role === "admin" || user?.role === "superadmin") && (
                                        <DropdownMenuItem asChild>
                                            <Link href="/admin">
                                                <Settings className="h-4 w-4 mr-2" />
                                                Admin Panel
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem onClick={handleLogout} disabled={isLoading}>
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button
                                variant="default"
                                size="sm"
                                className={`transition-colors ${
                                    isScrolled
                                        ? "bg-white/20 hover:bg-white/30 text-white border border-white/20"
                                        : "bg-bark hover:bg-soil text-white"
                                }`}
                                onClick={() => setLoginModalOpen(true)}
                            >
                                Login
                            </Button>
                        )}
                    </div>

                    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={`lg:hidden transition-colors ${
                                    isScrolled
                                        ? "text-white/80 hover:text-white hover:bg-white/10"
                                        : "text-t2 hover:text-soil hover:bg-bark/10"
                                }`}
                            >
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="w-[300px] sm:w-[400px]">
                            <div className="flex items-center space-x-2 mb-6">
                                <div className="font-cormorant text-xl tracking-wide">
                                    <span className="font-light text-bark">
                                        Expat
                                    </span>
                                    <span className="font-light text-bark-lt">
                                        Eats
                                    </span>
                                </div>
                            </div>
                            <nav className="flex flex-col space-y-4 mt-8 font-outfit">
                                <div
                                    className={`py-2 px-4 rounded-lg transition-elegant ${isActive("/search") ? "bg-primary/10 text-primary font-semibold" : "text-t2 hover:bg-primary/5"}`}
                                    onClick={handleNavClick}
                                >
                                    <Link href="/search">
                                        Find My Food
                                    </Link>
                                </div>
                                <div
                                    className={`py-2 px-4 rounded-lg transition-elegant ${isActive("/services") ? "bg-primary/10 text-primary font-semibold" : "text-t2 hover:bg-primary/5"}`}
                                    onClick={handleNavClick}
                                >
                                    <Link href="/services">Services</Link>
                                </div>
                                <div
                                    className={`py-2 px-4 rounded-lg transition-elegant ${isActive("/events") ? "bg-primary/10 text-primary font-semibold" : "text-t2 hover:bg-primary/5"}`}
                                    onClick={handleNavClick}
                                >
                                    <Link href="/events">Events</Link>
                                </div>
                                <div
                                    className={`py-2 px-4 rounded-lg transition-elegant ${isActive("/resources") ? "bg-primary/10 text-primary font-semibold" : "text-t2 hover:bg-primary/5"}`}
                                    onClick={handleNavClick}
                                >
                                    <Link href="/resources">Resources</Link>
                                </div>
                                <div
                                    className={`py-2 px-4 rounded-lg transition-elegant ${isActive("/community") ? "bg-primary/10 text-primary font-semibold" : "text-t2 hover:bg-primary/5"}`}
                                    onClick={handleNavClick}
                                >
                                    <Link href="/community">Community</Link>
                                </div>
                                <div
                                    className={`py-2 px-4 rounded-lg transition-elegant ${isActive("/add-location") ? "bg-primary/10 text-primary font-semibold" : "text-t2 hover:bg-primary/5"}`}
                                    onClick={handleNavClick}
                                >
                                    <Link href="/add-location">
                                        Add Location
                                    </Link>
                                </div>

                                {/* Mobile Login/User Menu */}
                                <div className="mt-6 space-y-3">
                                    {isAuthenticated ? (
                                        <>
                                            <Button className="w-full rounded-full font-medium flex items-center justify-center gap-2">
                                                <UserCircle className="h-5 w-5" />
                                                {user?.name?.split(" ")[0] || user?.username || "My Profile"}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full rounded-full"
                                                onClick={() => {
                                                    setIsSheetOpen(false);
                                                }}
                                                asChild
                                            >
                                                <Link href="/favorites">
                                                    <Heart className="h-4 w-4 mr-2" />
                                                    Favorites
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full rounded-full"
                                                onClick={() => {
                                                    setIsSheetOpen(false);
                                                }}
                                                asChild
                                            >
                                                <Link href="/purchases">
                                                    <ShoppingBag className="h-4 w-4 mr-2" />
                                                    My Guides
                                                </Link>
                                            </Button>
                                            {(user?.role === "admin" || user?.role === "superadmin") && (
                                                <Button
                                                    variant="outline"
                                                    className="w-full rounded-full"
                                                    onClick={() => {
                                                        setIsSheetOpen(false);
                                                    }}
                                                    asChild
                                                >
                                                    <Link href="/admin">
                                                        <Settings className="h-4 w-4 mr-2" />
                                                        Admin Panel
                                                    </Link>
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                className="w-full rounded-full"
                                                onClick={() => {
                                                    setIsSheetOpen(false);
                                                    handleLogout();
                                                }}
                                                disabled={isLoading}
                                            >
                                                <LogOut className="h-4 w-4 mr-2" />
                                                Logout
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            className="w-full rounded-full font-medium"
                                            onClick={() => {
                                                setIsSheetOpen(false);
                                                setLoginModalOpen(true);
                                            }}
                                        >
                                            Login
                                        </Button>
                                    )}
                                </div>
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
            
            {/* Login Modal */}
            <LoginModal
                open={loginModalOpen}
                onOpenChange={setLoginModalOpen}
            />

            <NotificationDialog
                open={notificationOpen}
                onOpenChange={setNotificationOpen}
                title={notificationConfig.title}
                description={notificationConfig.description}
                variant={notificationConfig.variant}
            />
        </header>
    );
};

export default Header;
