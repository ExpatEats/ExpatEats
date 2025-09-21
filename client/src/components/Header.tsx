import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, UserCircle, LogOut, Settings, Heart } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FeedbackDialog } from "./FeedbackDialog";
import { ShareDialog } from "./ShareDialog";
import { LoginModal } from "./LoginModal";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Header = () => {
    const [location] = useLocation();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const { user, isAuthenticated, logout, isLoading } = useAuth();
    const { toast } = useToast();

    const isActive = (path: string) => {
        return location === path;
    };

    const handleNavClick = () => {
        setIsSheetOpen(false);
    };

    const handleLogout = async () => {
        try {
            await logout();
            toast({
                title: "Logged out successfully",
                description: "You have been logged out of your account.",
            });
        } catch (error) {
            console.error('Logout error:', error);
            toast({
                title: "Logout error",
                description: "There was an issue logging out. Please try again.",
                variant: "destructive",
            });
        }
    };

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50 w-full">
            <div className="w-full max-w-full px-4 py-3 flex items-center">
                {/* Left side - Logo */}
                <div className="flex items-center flex-1">
                    <Link href="/">
                        <div className="font-montserrat text-2xl tracking-wide">
                            <span className="font-light text-[#94AF9F]">
                                Expat
                            </span>
                            <span className="font-light text-[#DDB892]">
                                Eats
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Center - Navigation */}
                <nav className="hidden md:flex space-x-5 flex-shrink-0">
                    <div
                        className={`py-2 transition ${isActive("/find-my-food") ? "active-tab" : "text-gray-800 hover:text-primary"}`}
                    >
                        <Link href="/find-my-food">FIND MY FOOD</Link>
                    </div>
                    <div
                        className={`py-2 transition ${isActive("/services") ? "active-tab" : "text-gray-800 hover:text-primary"}`}
                    >
                        <Link href="/services">SERVICES</Link>
                    </div>
                    <div
                        className={`py-2 transition ${isActive("/events") ? "active-tab" : "text-gray-800 hover:text-primary"}`}
                    >
                        <Link href="/events">EVENTS</Link>
                    </div>
                    <div
                        className={`py-2 transition ${isActive("/resources") ? "active-tab" : "text-gray-800 hover:text-primary"}`}
                    >
                        <Link href="/resources">RESOURCES</Link>
                    </div>
                    <div
                        className={`py-2 transition ${isActive("/community") ? "active-tab" : "text-gray-800 hover:text-primary"}`}
                    >
                        <Link href="/community">COMMUNITY</Link>
                    </div>
                    <div
                        className={`py-2 transition ${isActive("/add-location") ? "active-tab" : "text-gray-800 hover:text-primary"}`}
                    >
                        <Link href="/add-location">ADD LOCATION</Link>
                    </div>
                </nav>

                {/* Right side - Actions */}
                <div className="flex items-center space-x-4 flex-1 justify-end">
                    <div className="hidden lg:block">
                        <ShareDialog
                            buttonVariant="outline"
                            buttonSize="sm"
                            buttonText="Share"
                        />
                    </div>

                    <div className="hidden lg:block">
                        <FeedbackDialog />
                    </div>

                    {/* Desktop Login/User Menu */}
                    <div className="hidden md:block">
                        {isAuthenticated ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="flex items-center space-x-2"
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
                                    {user?.role === "admin" && (
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
                                variant="outline"
                                size="sm"
                                onClick={() => setLoginModalOpen(true)}
                                className="bg-[#6D9075] text-white border-[#6D9075] hover:bg-[#6D9075]/90"
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
                                className="lg:hidden"
                            >
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="w-[300px] sm:w-[400px]">
                            <div className="flex items-center space-x-2 mb-6">
                                <div className="font-montserrat text-xl tracking-wide">
                                    <span className="font-light text-[#94AF9F]">
                                        Expat
                                    </span>
                                    <span className="font-light text-[#DDB892]">
                                        Eats
                                    </span>
                                </div>
                            </div>
                            <nav className="flex flex-col space-y-4 mt-8">
                                <div
                                    className={`py-2 px-4 rounded-md transition ${isActive("/find-my-food") ? "bg-primary/10 text-primary font-semibold" : "text-gray-800 hover:bg-primary/5"}`}
                                    onClick={handleNavClick}
                                >
                                    <Link href="/find-my-food">
                                        FIND MY FOOD
                                    </Link>
                                </div>
                                <div
                                    className={`py-2 px-4 rounded-md transition ${isActive("/services") ? "bg-primary/10 text-primary font-semibold" : "text-gray-800 hover:bg-primary/5"}`}
                                    onClick={handleNavClick}
                                >
                                    <Link href="/services">SERVICES</Link>
                                </div>
                                <div
                                    className={`py-2 px-4 rounded-md transition ${isActive("/events") ? "bg-primary/10 text-primary font-semibold" : "text-gray-800 hover:bg-primary/5"}`}
                                    onClick={handleNavClick}
                                >
                                    <Link href="/events">EVENTS</Link>
                                </div>
                                <div
                                    className={`py-2 px-4 rounded-md transition ${isActive("/resources") ? "bg-primary/10 text-primary font-semibold" : "text-gray-800 hover:bg-primary/5"}`}
                                    onClick={handleNavClick}
                                >
                                    <Link href="/resources">RESOURCES</Link>
                                </div>
                                <div
                                    className={`py-2 px-4 rounded-md transition ${isActive("/community") ? "bg-primary/10 text-primary font-semibold" : "text-gray-800 hover:bg-primary/5"}`}
                                    onClick={handleNavClick}
                                >
                                    <Link href="/community">COMMUNITY</Link>
                                </div>
                                <div
                                    className={`py-2 px-4 rounded-md transition ${isActive("/add-location") ? "bg-primary/10 text-primary font-semibold" : "text-gray-800 hover:bg-primary/5"}`}
                                    onClick={handleNavClick}
                                >
                                    <Link href="/add-location">
                                        ADD LOCATION
                                    </Link>
                                </div>
                                <div className="py-2 px-4 rounded-md transition text-gray-800 hover:bg-primary/5 mt-6">
                                    <ShareDialog
                                        buttonVariant="ghost"
                                        buttonText="Share"
                                    />
                                </div>
                                <div className="py-2 px-4 rounded-md transition text-gray-800 hover:bg-primary/5">
                                    <FeedbackDialog />
                                </div>
                                
                                {/* Mobile Login/User Menu */}
                                <div className="mt-6 space-y-3">
                                    {isAuthenticated ? (
                                        <>
                                            <Button className="w-full bg-[#6D9075] hover:bg-opacity-90 text-white rounded-full font-medium flex items-center justify-center gap-2">
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
                                            {user?.role === "admin" && (
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
                                            className="w-full bg-[#6D9075] hover:bg-opacity-90 text-white rounded-full font-medium"
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
        </header>
    );
};

export default Header;
