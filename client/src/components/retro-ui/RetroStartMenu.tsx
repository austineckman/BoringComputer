import React, { useState, useRef, useEffect } from "react";
import { ChevronRight, LogOut, Settings, User, FileText, ShoppingBag, Wrench, Terminal, Globe, Music } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import logoImage from "@assets/Asset 6@2x-8.png";
import jukeboxIcon from "@assets/jukebox_icon.png";

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
  
  // Filter out admin menu if user is not admin and remove the terminal item
  const filteredMenuItems = menuItems.filter(item => {
    // Remove admin menu for non-admin users
    if (item.id === "admin" && (!user?.roles || !user.roles.includes("admin"))) {
      return false;
    }
    // Remove the terminal menu item
    if (item.id === "terminal") {
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
      
      {/* Menu items */}
      <div className="max-h-[70vh] overflow-y-auto">
        {filteredMenuItems.map((item) => (
          <div key={item.id}>
            <div 
              className="flex items-center justify-between p-2 hover:bg-blue-100 cursor-pointer border-b border-gray-300"
              onClick={() => handleMenuItemClick(item)}
            >
              <div className="flex items-center">
                <span className="text-gray-700 mr-2">{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.submenu && item.submenu.length > 0 && (
                <ChevronRight 
                  size={16} 
                  className={`transform transition-transform ${activeSubmenu === item.id ? 'rotate-90' : ''}`} 
                />
              )}
            </div>
            
            {/* Submenu */}
            {activeSubmenu === item.id && item.submenu && (
              <div className="bg-gray-100 pl-4">
                {item.submenu.map((subItem) => (
                  <div 
                    key={subItem.id}
                    className="flex items-center p-2 hover:bg-blue-50 cursor-pointer border-b border-gray-200"
                    onClick={() => {
                      if (subItem.onClick) {
                        subItem.onClick();
                        onClose();
                      } else if (subItem.path) {
                        navigate(subItem.path);
                        onClose();
                      }
                    }}
                  >
                    <span className="text-gray-600 mr-2">{subItem.icon}</span>
                    <span className="text-sm">{subItem.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Footer */}
      <div className="p-2 text-center text-xs text-gray-500 border-t border-gray-300">
        © CraftingTable LLC v1.0.4815
      </div>
    </div>
  );
};

export default RetroStartMenu;