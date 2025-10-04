import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import WhatsAppChat from "./WhatsAppChat";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col w-full max-w-full overflow-x-hidden bg-background">
            <Header />
            <main className="flex-grow w-full max-w-full">{children}</main>
            <WhatsAppChat />
            <Footer />
        </div>
    );
};

export default Layout;
