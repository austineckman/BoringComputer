import React, { useState, useRef, useEffect } from "react";
import { ChevronRight, LogOut, Settings, User, FileText, ShoppingBag, Tool } from "lucide-react";
import { useNavigate } from "wouter";
import { useAuth } from "@/hooks/useAuth";

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
  const { user, logoutMutation } = useAuth();
  const navigate = useNavigate();
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
      id: "inventory",
      label: "Inventory & Crafting",
      icon: <ShoppingBag size={16} />,
      submenu: [
        {
          id: "inventory",
          label: "View Inventory",
          icon: <ShoppingBag size={16} />,
          path: "/inventory"
        },
        {
          id: "loot-crates",
          label: "Loot Crates",
          icon: <ShoppingBag size={16} />,
          path: "/lootboxes"
        },
        {
          id: "crafting",
          label: "Crafting Table",
          icon: <Tool size={16} />,
          path: "/crafting"
        }
      ]
    },
    {
      id: "admin",
      label: "Admin Tools",
      icon: <Settings size={16} />,
      submenu: user?.roles?.includes("admin") ? [
        {
          id: "quest-admin",
          label: "Quest Management",
          icon: <Settings size={16} />,
          path: "/admin/quests"
        },
        {
          id: "item-admin",
          label: "Item Database",
          icon: <Settings size={16} />,
          path: "/admin/items"
        },
        {
          id: "kit-admin",
          label: "Component Kits",
          icon: <Settings size={16} />,
          path: "/admin/kits"
        },
        {
          id: "user-admin",
          label: "User Management",
          icon: <User size={16} />,
          path: "/admin/users"
        },
        {
          id: "quest-generator",
          label: "AI Quest Generator",
          icon: <Settings size={16} />,
          path: "/admin/quest-generator"
        }
      ] : []
    },
    {
      id: "profile",
      label: "My Profile",
      icon: <User size={16} />,
      path: "/profile"
    },
    {
      id: "logout",
      label: "Log Out",
      icon: <LogOut size={16} />,
      onClick: () => {
        logoutMutation.mutate();
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
        <div className="bg-gray-200 text-blue-700 w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl">
          {user?.username?.[0]?.toUpperCase() || "U"}
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
        © The Quest Giver v1.0.0
      </div>
    </div>
  );
};

export default RetroStartMenu;