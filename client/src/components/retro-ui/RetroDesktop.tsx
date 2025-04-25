import React, { useState, useEffect } from "react";
import { X, Maximize2, Minimize2, Info, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

type WindowPosition = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type RetroWindow = {
  id: string;
  title: string;
  icon: string;
  content: React.ReactNode;
  position: WindowPosition;
  isMinimized: boolean;
  isActive: boolean;
};

const RetroDesktop: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [windows, setWindows] = useState<RetroWindow[]>([]);
  const [activeDesktopIcons] = useState([
    { id: "quests", name: "Quests", icon: "📜", path: "/quests" },
    { id: "inventory", name: "Inventory", icon: "🎒", path: "/inventory" },
    { id: "crafting", name: "Crafting", icon: "⚒️", path: "/crafting" },
    { id: "lootboxes", name: "Loot Crates", icon: "🎁", path: "/lootboxes" },
    { id: "shop", name: "Shop", icon: "🛒", path: "/shop" },
  ]);
  
  // Admin icons only shown to admin users
  const [adminIcons] = useState([
    { id: "admin-quests", name: "Quest Admin", icon: "🧪", path: "/admin/quests" },
    { id: "admin-items", name: "Item Database", icon: "💾", path: "/admin/items" },
    { id: "admin-kits", name: "Component Kits", icon: "🔌", path: "/admin/kits" },
    { id: "admin-users", name: "User Admin", icon: "👥", path: "/admin/users" },
    { id: "admin-generator", name: "AI Generator", icon: "🤖", path: "/admin/quest-generator" },
  ]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const openWindow = (id: string, title: string, content: React.ReactNode, icon: string) => {
    // Make all other windows inactive
    const updatedWindows = windows.map(window => ({
      ...window,
      isActive: false,
    }));
    
    // Check if window already exists
    const existingWindowIndex = updatedWindows.findIndex(w => w.id === id);
    
    if (existingWindowIndex !== -1) {
      // If window exists and is minimized, restore it
      if (updatedWindows[existingWindowIndex].isMinimized) {
        updatedWindows[existingWindowIndex].isMinimized = false;
      }
      // Set this window as active
      updatedWindows[existingWindowIndex].isActive = true;
      setWindows(updatedWindows);
      return;
    }
    
    // Create a new window with random position
    const newWindow: RetroWindow = {
      id,
      title,
      icon,
      content,
      position: {
        x: 50 + Math.random() * 100,
        y: 50 + Math.random() * 100,
        width: 600,
        height: 400,
      },
      isMinimized: false,
      isActive: true,
    };
    
    setWindows([...updatedWindows, newWindow]);
  };
  
  const closeWindow = (id: string) => {
    setWindows(windows.filter(window => window.id !== id));
  };
  
  const minimizeWindow = (id: string) => {
    setWindows(
      windows.map(window => 
        window.id === id 
          ? { ...window, isMinimized: true, isActive: false } 
          : window
      )
    );
  };
  
  const activateWindow = (id: string) => {
    setWindows(
      windows.map(window => 
        window.id === id 
          ? { ...window, isActive: true, isMinimized: false } 
          : { ...window, isActive: false }
      )
    );
  };
  
  const startDrag = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    activateWindow(id);
    
    const windowElement = document.getElementById(`window-${id}`);
    if (!windowElement) return;
    
    const rect = windowElement.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    const onMouseMove = (e: MouseEvent) => {
      setWindows(
        windows.map(window => 
          window.id === id 
            ? { 
                ...window, 
                position: {
                  ...window.position,
                  x: e.clientX - offsetX,
                  y: e.clientY - offsetY,
                } 
              } 
            : window
        )
      );
    };
    
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };
  
  const handleIconClick = (icon: { id: string, name: string, icon: string, path: string }) => {
    // For demonstration, just navigate to the path
    navigate(icon.path);
  };
  
  const openWelcomeWindow = () => {
    const welcomeContent = (
      <div className="p-4 retro-window-content">
        <h1 className="text-xl font-bold mb-4">Welcome to The Quest Giver!</h1>
        <p className="mb-3">Your portal to exciting learning adventures with digital components.</p>
        
        <div className="mb-4 border-t border-b border-gray-300 py-2">
          <h2 className="font-bold">Current Stats:</h2>
          <p>Level: {user?.level || 1}</p>
          <p>XP: {user?.xp || 0} / {user?.xpToNextLevel || 300}</p>
          <div className="w-full bg-gray-200 h-2 rounded-full mt-1 mb-3">
            <div 
              className="bg-green-500 h-2 rounded-full" 
              style={{ 
                width: `${Math.min(100, ((user?.xp || 0) / (user?.xpToNextLevel || 300)) * 100)}%` 
              }}
            ></div>
          </div>
          <p>Items in inventory: {user?.inventory ? Object.values(user.inventory).reduce((a, b) => a + b, 0) : 0}</p>
        </div>
        
        <p className="text-sm">Double-click on icons to get started, or use the start menu.</p>
      </div>
    );
    
    openWindow("welcome", "Welcome", welcomeContent, "💻");
  };

  useEffect(() => {
    // Open welcome window on component mount
    setTimeout(() => {
      openWelcomeWindow();
    }, 800);
  }, []);
  
  return (
    <div className="retro-desktop relative min-h-[80vh] overflow-hidden bg-[#008080] text-black">
      {/* Desktop Icons */}
      <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-8 gap-3 p-3">
        {activeDesktopIcons.map((icon) => (
          <div 
            key={icon.id}
            className="desktop-icon flex flex-col items-center justify-center p-2 cursor-pointer hover:bg-blue-200/40 active:bg-blue-300/40 rounded"
            onClick={() => handleIconClick(icon)}
            onDoubleClick={() => navigate(icon.path)}
          >
            <div className="text-4xl mb-1">{icon.icon}</div>
            <div className="text-center text-sm font-bold text-navy bg-white/80 px-1 py-0.5 rounded shadow-sm w-full">
              {icon.name}
            </div>
          </div>
        ))}
        
        {user?.roles?.includes('admin') && adminIcons.map((icon) => (
          <div 
            key={icon.id}
            className="desktop-icon flex flex-col items-center justify-center p-2 cursor-pointer hover:bg-yellow-200/40 active:bg-yellow-300/40 rounded"
            onClick={() => handleIconClick(icon)}
            onDoubleClick={() => navigate(icon.path)}
          >
            <div className="text-4xl mb-1">{icon.icon}</div>
            <div className="text-center text-sm font-bold text-red-900 bg-yellow-100/80 px-1 py-0.5 rounded shadow-sm w-full">
              {icon.name}
            </div>
          </div>
        ))}
      </div>
      
      {/* Windows */}
      {windows.map((window) => (
        !window.isMinimized && (
          <div 
            id={`window-${window.id}`}
            key={window.id}
            className={`absolute rounded-md border-2 bg-gray-100 shadow-xl overflow-hidden ${
              window.isActive ? 'border-blue-600 z-50' : 'border-gray-400 z-40'
            }`}
            style={{
              top: `${window.position.y}px`,
              left: `${window.position.x}px`,
              width: `${window.position.width}px`,
              height: `${window.position.height}px`,
            }}
            onClick={() => activateWindow(window.id)}
          >
            {/* Window Title Bar */}
            <div 
              className={`flex items-center justify-between px-2 py-1 ${
                window.isActive ? 'bg-gradient-to-r from-blue-700 to-blue-500' : 'bg-gradient-to-r from-gray-500 to-gray-400'
              } text-white`}
              onMouseDown={(e) => startDrag(e, window.id)}
            >
              <div className="flex items-center">
                <span className="mr-2">{window.icon}</span>
                <span className="font-bold text-sm truncate">{window.title}</span>
              </div>
              <div className="flex space-x-1">
                <button 
                  className="w-4 h-4 flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-700 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    minimizeWindow(window.id);
                  }}
                >
                  <Minimize2 size={12} />
                </button>
                <button 
                  className="w-4 h-4 flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-700 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    // In a full implementation, this would maximize the window
                  }}
                >
                  <Maximize2 size={12} />
                </button>
                <button 
                  className="w-4 h-4 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeWindow(window.id);
                  }}
                >
                  <X size={12} />
                </button>
              </div>
            </div>
            
            {/* Window Content */}
            <div className="retro-window-body p-1 overflow-auto" style={{ height: 'calc(100% - 28px)' }}>
              {window.content}
            </div>
          </div>
        )
      ))}
      
      {/* Start Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-gray-200 border-t border-gray-400 flex justify-between items-center px-2 shadow-md">
        <div className="flex">
          <button 
            className="flex items-center bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-1 rounded-sm mr-3"
            onClick={openWelcomeWindow}
          >
            <span className="mr-1">🚀</span>
            <span>Start</span>
          </button>
          
          {/* Minimized Windows */}
          <div className="flex space-x-1">
            {windows.filter(w => w.isMinimized).map(window => (
              <button 
                key={window.id}
                className="flex items-center bg-gray-300 hover:bg-gray-400 border border-gray-500 px-2 py-1 text-xs"
                onClick={() => activateWindow(window.id)}
              >
                <span className="mr-1">{window.icon}</span>
                <span className="truncate max-w-[80px]">{window.title}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Clock */}
        <div className="bg-gray-300 border border-gray-400 rounded-sm px-2 py-1 text-xs font-mono">
          {currentTime.toLocaleTimeString()} | {currentTime.toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default RetroDesktop;