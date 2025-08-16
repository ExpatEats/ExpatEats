import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Menu, UserCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { FeedbackDialog } from './FeedbackDialog';
import { ShareDialog } from './ShareDialog';

const Header = () => {
  const [location] = useLocation();
  const [userName, setUserName] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  useEffect(() => {
    // Get user profile from localStorage
    const userProfile = localStorage.getItem('userProfile');
    if (userProfile) {
      const profile = JSON.parse(userProfile);
      setUserName(profile.name || null);
    }
  }, []);
  
  const isActive = (path: string) => {
    return location === path;
  };

  const handleNavClick = () => {
    setIsSheetOpen(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 w-full">
      <div className="w-full max-w-full px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/">
            <div className="font-montserrat text-2xl tracking-wide">
              <span className="font-light text-[#94AF9F]">Expat</span><span className="font-light text-[#DDB892]">Eats</span>
            </div>
          </Link>
        </div>
        
        <nav className="hidden md:flex space-x-5">
          <div className={`py-2 transition ${isActive('/find-my-food') ? 'active-tab' : 'text-gray-800 hover:text-primary'}`}>
            <Link href="/find-my-food">FIND MY FOOD</Link>
          </div>
          <div className={`py-2 transition ${isActive('/services') ? 'active-tab' : 'text-gray-800 hover:text-primary'}`}>
            <Link href="/services">SERVICES</Link>
          </div>
          <div className={`py-2 transition ${isActive('/events') ? 'active-tab' : 'text-gray-800 hover:text-primary'}`}>
            <Link href="/events">EVENTS</Link>
          </div>
          <div className={`py-2 transition ${isActive('/resources') ? 'active-tab' : 'text-gray-800 hover:text-primary'}`}>
            <Link href="/resources">RESOURCES</Link>
          </div>
          <div className={`py-2 transition ${isActive('/add-location') ? 'active-tab' : 'text-gray-800 hover:text-primary'}`}>
            <Link href="/add-location">ADD LOCATION</Link>
          </div>
        </nav>
        
        <div className="flex items-center space-x-4">
          <div className="hidden lg:block">
            <ShareDialog buttonVariant="outline" buttonSize="sm" buttonText="Share" />
          </div>
          
          <div className="hidden lg:block">
            <FeedbackDialog />
          </div>
          

          
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[300px] sm:w-[400px]">
              <div className="flex items-center space-x-2 mb-6">
                <div className="font-montserrat text-xl tracking-wide">
                  <span className="font-light text-[#94AF9F]">Expat</span><span className="font-light text-[#DDB892]">Eats</span>
                </div>
              </div>
              <nav className="flex flex-col space-y-4 mt-8">
                <div className={`py-2 px-4 rounded-md transition ${isActive('/find-my-food') ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-800 hover:bg-primary/5'}`} onClick={handleNavClick}>
                  <Link href="/find-my-food">FIND MY FOOD</Link>
                </div>
                <div className={`py-2 px-4 rounded-md transition ${isActive('/services') ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-800 hover:bg-primary/5'}`} onClick={handleNavClick}>
                  <Link href="/services">SERVICES</Link>
                </div>
                <div className={`py-2 px-4 rounded-md transition ${isActive('/events') ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-800 hover:bg-primary/5'}`} onClick={handleNavClick}>
                  <Link href="/events">EVENTS</Link>
                </div>
                <div className={`py-2 px-4 rounded-md transition ${isActive('/resources') ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-800 hover:bg-primary/5'}`} onClick={handleNavClick}>
                  <Link href="/resources">RESOURCES</Link>
                </div>
                <div className={`py-2 px-4 rounded-md transition ${isActive('/add-location') ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-800 hover:bg-primary/5'}`} onClick={handleNavClick}>
                  <Link href="/add-location">ADD LOCATION</Link>
                </div>
                <div className="py-2 px-4 rounded-md transition text-gray-800 hover:bg-primary/5 mt-6">
                  <ShareDialog buttonVariant="ghost" buttonText="Share" />
                </div>
                <div className="py-2 px-4 rounded-md transition text-gray-800 hover:bg-primary/5">
                  <FeedbackDialog />
                </div>
                <Button className="w-full bg-[#6D9075] hover:bg-opacity-90 text-white rounded-full font-medium mt-4 flex items-center justify-center gap-2">
                  <UserCircle className="h-5 w-5" />
                  {userName ? userName.split(' ')[0] : 'My Profile'}
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
