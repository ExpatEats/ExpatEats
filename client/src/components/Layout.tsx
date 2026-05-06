import React, { useEffect } from "react";
import { useLocation } from "wouter";
import Header from "./Header";
import Footer from "./Footer";
import WhatsAppChat from "./WhatsAppChat";
import { AnnouncementBar } from "./home/AnnouncementBar";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [location] = useLocation();

    // Scroll to top on route change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location]);

    // Check if current page is home
    const isHomePage = location === "/";

    return (
        <div className="min-h-screen flex flex-col w-full max-w-full overflow-x-hidden bg-background">
            <Header />
            <AnnouncementBar />
            <main className={`flex-grow w-full max-w-full ${!isHomePage ? "pt-[calc(64px+36px)] sm:pt-[calc(64px+38px)] md:pt-[calc(64px+42px)]" : ""}`}>{children}</main>
            <WhatsAppChat />
            <Footer />
        </div>
    );
};

export default Layout;
