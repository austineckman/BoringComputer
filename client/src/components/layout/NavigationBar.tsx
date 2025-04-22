import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, LogOut, User, Volume2, VolumeX } from "lucide-react";

const NavigationBar = () => {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { playSound, muted, toggleMute } = useSoundEffects();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Quests", path: "/quests" },
    { name: "Inventory", path: "/inventory" },
    { name: "Workshop", path: "/workshop" },
    { name: "Achievements", path: "/achievements" },
  ];

  const handleNavClick = () => {
    playSound("click");
  };

  const handleNavHover = () => {
    playSound("hover");
  };

  const userLevel = user?.level || 1;
  const userTitle = userLevel <= 1 ? 'Novice'
    : userLevel <= 3 ? 'Cadet'
    : userLevel <= 5 ? 'Engineer'
    : userLevel <= 7 ? 'Commander'
    : 'Master';

  return (
    <nav className="bg-space-darkest border-b border-brand-orange/30 px-4 py-2 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" onClick={handleNavClick} onMouseEnter={handleNavHover}>
          <a className="flex items-center">
            <svg className="h-10 w-10 mr-2">
              <use href="#logo" />
            </svg>
            <div>
              <div className="text-brand-orange font-bold">CraftingTable</div>
              <div className="text-xs">The Quest Giver</div>
            </div>
          </a>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="space-x-6 hidden md:flex">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              onClick={handleNavClick}
              onMouseEnter={handleNavHover}
            >
              <a className={`transition ${location === item.path ? 'text-brand-orange' : 'text-brand-light hover:text-brand-yellow'}`}>
                {item.name}
              </a>
            </Link>
          ))}
        </div>
        
        {/* User Section */}
        {user ? (
          <div className="flex items-center space-x-4">
            {/* Sound Toggle Button - New! */}
            <button 
              className="p-2 text-brand-light/70 hover:text-brand-orange transition-colors"
              onClick={() => {
                toggleMute();
                if (!muted) playSound("click");
              }}
              title={muted ? "Unmute Sound Effects" : "Mute Sound Effects"}
            >
              {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            
            <div className="flex items-center bg-space-mid rounded-full px-3 py-1">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              <span className="text-xs">Level {userLevel} {userTitle}</span>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center cursor-pointer" onMouseEnter={handleNavHover}>
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt="User Avatar" 
                      className="h-8 w-8 rounded-full border-2 border-brand-orange"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full border-2 border-brand-orange bg-space-mid flex items-center justify-center">
                      <User size={16} />
                    </div>
                  )}
                  <ChevronDown className="ml-2 text-gray-400 hover:text-brand-orange h-4 w-4" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-space-mid border border-brand-orange/30">
                <DropdownMenuItem 
                  onClick={() => { playSound("click"); logout(); }}
                  className="text-brand-light hover:text-brand-orange cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <Link href="/login">
            <Button 
              variant="default" 
              className="bg-brand-orange hover:bg-brand-yellow text-space-darkest"
              onClick={handleNavClick}
              onMouseEnter={handleNavHover}
            >
              Login with Discord
            </Button>
          </Link>
        )}
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-brand-light"
          onClick={() => {
            setMobileMenuOpen(!mobileMenuOpen);
            playSound("click");
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden py-3 px-4 bg-space-mid mt-2 rounded-lg">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              onClick={() => {
                handleNavClick();
                setMobileMenuOpen(false);
              }}
            >
              <a className={`block py-2 ${location === item.path ? 'text-brand-orange' : 'text-brand-light'}`}>
                {item.name}
              </a>
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default NavigationBar;
