import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown, LogOut, User, Volume2, VolumeX, Award, Settings } from "lucide-react";
import logoImage from "@/assets/logo.png";

const NavigationBar = () => {
  const [location] = useLocation();
  const { user, logout, playSoundSafely } = useAuth();
  const { sounds, isMuted, toggleMute, volume, changeVolume } = useSoundEffects();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // Handle scroll event to change navbar background
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const navItems = [
    { name: "Quests", path: "/quests" },
    { name: "Inventory", path: "/inventory" },
    { name: "Gizbo's Forge", path: "/forge" },
  ];

  const handleNavClick = () => {
    try {
      sounds.click?.();
    } catch (e) {
      console.warn('Could not play click sound', e);
    }
  };

  const handleNavHover = () => {
    try {
      sounds.hover?.();
    } catch (e) {
      console.warn('Could not play hover sound', e);
    }
  };

  const userLevel = user?.level || 1;
  const userTitle = userLevel <= 1 ? 'Novice'
    : userLevel <= 3 ? 'Cadet'
    : userLevel <= 5 ? 'Engineer'
    : userLevel <= 7 ? 'Commander'
    : 'Master';

  // Determine navbar background style based on scroll position and login status
  const navBackground = user && scrolled 
    ? "bg-black border-b border-brand-orange/50 transition-all duration-300" 
    : "bg-space-darkest border-b border-brand-orange/30 transition-all duration-300";

  return (
    <nav className={`${navBackground} px-4 py-2 sticky top-0 z-50`}>
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/">
          <div 
            className="flex items-center cursor-pointer" 
            onClick={handleNavClick} 
            onMouseEnter={handleNavHover}
          >
            {/* Use the diamond logo for both logged in and non-logged in states */}
            <img 
              src={logoImage} 
              alt="The Quest Giver Logo" 
              className="h-10 w-auto mr-3"
            />
            <div className="mr-10">
              <div className="text-brand-orange font-bold">CraftingTable</div>
              <div className="text-xs">The Quest Giver</div>
            </div>
          </div>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="space-x-6 hidden md:flex">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <div
                className={`transition cursor-pointer ${location === item.path ? 'text-brand-orange' : 'text-brand-light hover:text-brand-yellow'}`}
                onClick={handleNavClick}
                onMouseEnter={handleNavHover}
              >
                {item.name}
              </div>
            </Link>
          ))}
        </div>
        
        {/* User Section */}
        {user ? (
          <div className="flex items-center space-x-4">
            {/* Sound Volume Control */}
            <Popover open={showVolumeSlider} onOpenChange={setShowVolumeSlider}>
              <PopoverTrigger asChild>
                <button 
                  className="p-2 text-brand-light/70 hover:text-brand-orange transition-colors"
                  onClick={() => {
                    if (!isMuted) {
                      try {
                        sounds.click?.();
                      } catch (e) {
                        console.warn('Could not play click sound', e);
                      }
                    }
                  }}
                  title="Sound Volume Control"
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-60 p-4 bg-space-mid border border-brand-orange/30"
                side="bottom"
                align="end"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-brand-orange">Sound Volume</h4>
                    <button 
                      onClick={toggleMute}
                      className="text-brand-light/70 hover:text-brand-orange"
                    >
                      {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                  </div>
                  
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-brand-light opacity-70">0%</span>
                      <Slider
                        defaultValue={[volume * 100]}
                        max={100}
                        step={5}
                        disabled={isMuted}
                        onValueChange={(val) => {
                          changeVolume(val[0] / 100);
                          try {
                            sounds.click?.();
                          } catch (e) {
                            console.warn('Could not play sound', e);
                          }
                        }}
                        className={`${isMuted ? 'opacity-50' : ''}`}
                      />
                      <span className="text-xs text-brand-light opacity-70">100%</span>
                    </div>
                    <div className="text-center">
                      <span className="text-xs text-brand-light/70">
                        {isMuted ? 'Muted' : `${Math.round(volume * 100)}%`}
                      </span>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
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
                <DropdownMenuLabel className="text-brand-orange">
                  {user.username}
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator className="bg-brand-orange/20" />
                
                <Link href="/achievements">
                  <DropdownMenuItem 
                    onClick={() => {
                      try {
                        sounds.click?.();
                      } catch (e) {
                        console.warn('Could not play click sound', e);
                      }
                    }}
                    className="text-brand-light hover:text-brand-orange cursor-pointer"
                  >
                    <Award className="mr-2 h-4 w-4" />
                    <span>Achievements</span>
                  </DropdownMenuItem>
                </Link>
                
                <Link href="/settings">
                  <DropdownMenuItem 
                    onClick={() => {
                      try {
                        sounds.click?.();
                      } catch (e) {
                        console.warn('Could not play click sound', e);
                      }
                    }}
                    className="text-brand-light hover:text-brand-orange cursor-pointer"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </Link>
                
                <DropdownMenuSeparator className="bg-brand-orange/20" />
                
                <DropdownMenuItem 
                  onClick={() => { 
                    try {
                      sounds.click?.();
                    } catch (e) {
                      console.warn('Could not play click sound', e);
                    }
                    logout(); 
                  }}
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
            try {
              sounds.click?.();
            } catch (e) {
              console.warn('Could not play click sound', e);
            }
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
            <Link key={item.path} href={item.path}>
              <div 
                className={`block py-2 cursor-pointer ${location === item.path ? 'text-brand-orange' : 'text-brand-light'}`}
                onClick={() => {
                  handleNavClick();
                  setMobileMenuOpen(false);
                }}
              >
                {item.name}
              </div>
            </Link>
          ))}
          
          {user && (
            <>
              <div className="h-px w-full bg-brand-orange/20 my-2"></div>
              
              <Link href="/achievements">
                <div 
                  className={`block py-2 cursor-pointer flex items-center ${location === '/achievements' ? 'text-brand-orange' : 'text-brand-light'}`}
                  onClick={() => {
                    handleNavClick();
                    setMobileMenuOpen(false);
                  }}
                >
                  <Award className="mr-2 h-4 w-4" />
                  <span>Achievements</span>
                </div>
              </Link>
              
              <Link href="/settings">
                <div 
                  className={`block py-2 cursor-pointer flex items-center ${location === '/settings' ? 'text-brand-orange' : 'text-brand-light'}`}
                  onClick={() => {
                    handleNavClick();
                    setMobileMenuOpen(false);
                  }}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </div>
              </Link>
              
              {/* Mobile Sound Volume Control */}
              <div className="py-3">
                <div className="py-2 flex items-center justify-between">
                  <div className="flex items-center">
                    <button 
                      onClick={toggleMute}
                      className="mr-2 text-brand-light hover:text-brand-orange"
                    >
                      {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                    <span className="text-brand-light text-sm">Sound Volume</span>
                  </div>
                  <span className="text-xs text-brand-orange ml-2">
                    {isMuted ? 'Muted' : `${Math.round(volume * 100)}%`}
                  </span>
                </div>
                <div className="px-2 flex items-center space-x-2">
                  <span className="text-xs text-brand-light opacity-70">0%</span>
                  <Slider
                    defaultValue={[volume * 100]}
                    max={100}
                    step={5}
                    disabled={isMuted}
                    onValueChange={(val) => {
                      changeVolume(val[0] / 100);
                      try {
                        sounds.click?.();
                      } catch (e) {
                        console.warn('Could not play sound', e);
                      }
                    }}
                    className={`flex-1 ${isMuted ? 'opacity-50' : ''}`}
                  />
                  <span className="text-xs text-brand-light opacity-70">100%</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default NavigationBar;
