import React, { useState, useRef, useEffect } from "react";
import { ChevronRight, LogOut, Settings, User, FileText, ShoppingBag, Wrench, Terminal, Globe, Music, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import logoImage from "@assets/Asset 6@2x-8.png";
import jukeboxIcon from "@assets/jukebox_icon.png";
import ironBagImage from "@assets/486_Iron_Bag_Leather_B.png";
import questImage from "@assets/01_Fire_Grimoire.png";
import shopCoinImage from "@assets/22_Leperchaun_Coin.png";
import picklockImage from "@assets/Untitled design - 2025-04-26T171551.402.png";
import craftingImage from "@assets/Untitled design - 2025-04-26T171858.770.png";

type MenuItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  submenu?: MenuItem[];
  path?: string;
};

interface RetroStartMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const RetroStartMenu: React.FC<RetroStartMenuProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Close menu when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  // Define menu items
  const menuItems: MenuItem[] = [
    {
      id: "adventures",
      label: "Adventures",
      icon: <FileText size={16} />,
      submenu: [
        {
          id: "quests",
          label: "Available Quests",
          icon: <FileText size={16} />,
          path: "/quests"
        },
        {
          id: "my-quests",
          label: "My Active Quests",
          icon: <FileText size={16} />,
          path: "/my-quests"
        }
      ]
    },
    {
      id: "terminal",
      label: "Command Prompt",
      icon: <Terminal size={16} />,
      onClick: () => {
        // We'll handle this in RetroDesktop
        const event = new CustomEvent('openTerminal');
        window.dispatchEvent(event);
      }
    },
    {
      id: "browser",
      label: "Web Browser",
      icon: <Globe size={16} />,
      onClick: () => {
        // Send event to open browser
        const event = new CustomEvent('openBrowser');
        window.dispatchEvent(event);
      }
    },
    {
      id: "jukebox",
      label: "Music Player",
      icon: <Music size={16} />,
      onClick: () => {
        // Send event to open jukebox
        const event = new CustomEvent('openJukebox');
        window.dispatchEvent(event);
      }
    },
    {
      id: "inventory",
      label: "Inventory & Crafting",
      icon: <ShoppingBag size={16} />,
      submenu: [
        {
          id: "inventory",
          label: "Inventory.exe",
          icon: <ShoppingBag size={16} />,
          path: "/inventory"
        },
        {
          id: "loot-crates",
          label: "HackLock.exe",
          icon: <ShoppingBag size={16} />,
          path: "/lootboxes"
        },
        {
          id: "crafting",
          label: "Gizbo's Forge",
          icon: <Wrench size={16} />,
          path: "/crafting"
        }
      ]
    },
    {
      id: "profile",
      label: "My Profile",
      icon: <User size={16} />,
      onClick: () => {
        // Send event to open profile window
        const event = new CustomEvent('openProfile');
        window.dispatchEvent(event);
      }
    },
    {
      id: "logout",
      label: "Log Out",
      icon: <LogOut size={16} />,
      onClick: () => {
        logout();
        navigate("/auth");
        onClose();
      }
    }
  ];
  
  // Filter out admin menu if user is not admin
  const filteredMenuItems = menuItems.filter(item => {
    if (item.id === "admin" && (!user?.roles || !user.roles.includes("admin"))) {
      return false;
    }
    return true;
  });
  
  const handleMenuItemClick = (item: MenuItem) => {
    if (item.submenu && item.submenu.length > 0) {
      setActiveSubmenu(activeSubmenu === item.id ? null : item.id);
    } else if (item.onClick) {
      item.onClick();
      onClose();
    } else if (item.path) {
      navigate(item.path);
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div 
      ref={menuRef}
      className="absolute bottom-10 left-2 w-64 bg-gray-200 border border-gray-400 shadow-lg rounded overflow-hidden z-50"
    >
      {/* User info section */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white p-3 flex items-center">
        <div className="bg-gray-200 w-10 h-10 rounded-full flex items-center justify-center">
          <img 
            src={logoImage} 
            alt="Logo" 
            className="h-7 w-7 object-contain" 
          />
        </div>
        <div className="ml-3">
          <div className="font-bold">{user?.username || "User"}</div>
          <div className="text-xs">Level {user?.level || 1} Adventurer</div>
        </div>
      </div>
      
      {/* Desktop Applications Menu */}
      <div className="max-h-[70vh] overflow-y-auto">
        <div className="p-2 bg-gray-300 border-b border-gray-400 font-semibold text-gray-700">
          Desktop Applications
        </div>
        
        {/* Quests App */}
        <div 
          className="flex items-center p-3 hover:bg-blue-100 cursor-pointer border-b border-gray-300"
          onClick={() => {
            const event = new CustomEvent('openQuests');
            window.dispatchEvent(event);
            onClose();
          }}
        >
          <img 
            src={questImage} 
            alt="Quests" 
            className="w-7 h-7 mr-3 object-contain" 
            style={{ imageRendering: 'pixelated' }}
          />
          <span className="text-gray-700">Quests</span>
        </div>
        
        {/* Inventory.exe */}
        <div 
          className="flex items-center p-3 hover:bg-blue-100 cursor-pointer border-b border-gray-300"
          onClick={() => {
            navigate("/inventory");
            onClose();
          }}
        >
          <img 
            src={ironBagImage} 
            alt="Inventory" 
            className="w-7 h-7 mr-3 object-contain" 
            style={{ imageRendering: 'pixelated' }}
          />
          <span className="text-gray-700">Inventory.exe</span>
        </div>
        
        {/* Gizbo's Forge */}
        <div 
          className="flex items-center p-3 hover:bg-blue-100 cursor-pointer border-b border-gray-300"
          onClick={() => {
            navigate("/crafting");
            onClose();
          }}
        >
          <img 
            src={craftingImage} 
            alt="Gizbo's Forge" 
            className="w-7 h-7 mr-3 object-contain" 
            style={{ imageRendering: 'pixelated' }}
          />
          <span className="text-gray-700">Gizbo's Forge</span>
        </div>
        
        {/* HackLock.exe */}
        <div 
          className="flex items-center p-3 hover:bg-blue-100 cursor-pointer border-b border-gray-300"
          onClick={() => {
            const event = new CustomEvent('openLockpicking');
            window.dispatchEvent(event);
            onClose();
          }}
        >
          <img 
            src={picklockImage} 
            alt="HackLock.exe" 
            className="w-7 h-7 mr-3 object-contain" 
            style={{ imageRendering: 'pixelated' }}
          />
          <span className="text-gray-700">HackLock.exe</span>
        </div>
        
        {/* Shop */}
        <div 
          className="flex items-center p-3 hover:bg-blue-100 cursor-pointer border-b border-gray-300"
          onClick={() => {
            const event = new CustomEvent('openBrowser');
            window.dispatchEvent(event);
            onClose();
          }}
        >
          <img 
            src={shopCoinImage} 
            alt="Shop" 
            className="w-7 h-7 mr-3 object-contain" 
            style={{ imageRendering: 'pixelated' }}
          />
          <span className="text-gray-700">Shop</span>
        </div>
        
        {/* Circuit Builder */}
        <div 
          className="flex items-center p-3 hover:bg-blue-100 cursor-pointer border-b border-gray-300"
          onClick={() => {
            const event = new CustomEvent('openCircuitBuilder');
            window.dispatchEvent(event);
            onClose();
          }}
        >
          <div className="w-7 h-7 mr-3 flex items-center justify-center text-lg">🔌</div>
          <span className="text-gray-700">Circuit Builder</span>
        </div>
        
        {/* Command Prompt */}
        <div 
          className="flex items-center p-3 hover:bg-blue-100 cursor-pointer border-b border-gray-300"
          onClick={() => {
            const event = new CustomEvent('openTerminal');
            window.dispatchEvent(event);
            onClose();
          }}
        >
          <Terminal className="w-6 h-6 mr-3 text-gray-600" />
          <span className="text-gray-700">Command Prompt</span>
        </div>
        
        {/* Music Player */}
        <div 
          className="flex items-center p-3 hover:bg-blue-100 cursor-pointer border-b border-gray-300"
          onClick={() => {
            const event = new CustomEvent('openJukebox');
            window.dispatchEvent(event);
            onClose();
          }}
        >
          <img 
            src={jukeboxIcon} 
            alt="Music Player" 
            className="w-7 h-7 mr-3 object-contain" 
            style={{ imageRendering: 'pixelated' }}
          />
          <span className="text-gray-700">Music Player</span>
        </div>
        
        {/* Recycle Bin */}
        <div 
          className="flex items-center p-3 hover:bg-blue-100 cursor-pointer border-b border-gray-300"
          onClick={() => {
            const event = new CustomEvent('openRecycleBin');
            window.dispatchEvent(event);
            onClose();
          }}
        >
          <Trash2 className="w-6 h-6 mr-3 text-gray-600" />
          <span className="text-gray-700">Recycle Bin</span>
        </div>
        
        {/* Profile */}
        <div 
          className="flex items-center p-3 hover:bg-blue-100 cursor-pointer border-b border-gray-300"
          onClick={() => {
            const event = new CustomEvent('openProfile');
            window.dispatchEvent(event);
            onClose();
          }}
        >
          <User className="w-6 h-6 mr-3 text-gray-600" />
          <span className="text-gray-700">My Profile</span>
        </div>

        {/* Logout */}
        <div 
          className="flex items-center p-3 hover:bg-red-100 cursor-pointer border-b border-gray-300"
          onClick={() => {
            logout();
            navigate("/auth");
            onClose();
          }}
        >
          <LogOut className="w-6 h-6 mr-3 text-red-600" />
          <span className="text-red-600 font-medium">Log Out</span>
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-2 text-center text-xs text-gray-500 border-t border-gray-300">
        © CraftingTable LLC v1.0.4815
      </div>
    </div>
  );
};

export default RetroStartMenu;