import React, { useState, useEffect, useRef } from "react";
import { X, Maximize2, Minimize2, Info, ChevronRight, Volume2, VolumeX, Terminal } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import RetroStartMenu from "./RetroStartMenu";
import InventoryWindow from "./InventoryWindow";
import ItemDetailsWindow from "./ItemDetailsWindow";
import CraftingWindow from "./CraftingWindow";
import TerminalWindow from "./TerminalWindow";
import wallpaperImage from "@assets/wallpaper.png";
import backgroundMusic from "@assets/Fantasy Guild Hall.mp3";

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
  const [, navigate] = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [windows, setWindows] = useState<RetroWindow[]>([]);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [activeDesktopIcons, setActiveDesktopIcons] = useState([
    { id: "quests", name: "Quests", icon: "📜", path: "/quests", position: { x: 20, y: 20 } },
    { id: "inventory", name: "Inventory", icon: "🎒", path: "/inventory", position: { x: 20, y: 120 } },
    { id: "crafting", name: "Crafting", icon: "⚒️", path: "/crafting", position: { x: 20, y: 220 } },
    { id: "lootboxes", name: "Loot Crates", icon: "🎁", path: "/lootboxes", position: { x: 20, y: 320 } },
    { id: "shop", name: "Shop", icon: "🛒", path: "/shop", position: { x: 20, y: 420 } },
    { id: "terminal", name: "Command Prompt", icon: "💻", path: "/terminal", position: { x: 130, y: 20 } },
  ]);
  
  // Admin icons only shown to admin users
  const [adminIcons, setAdminIcons] = useState([
    { id: "admin-quests", name: "Quest Admin", icon: "🧪", path: "/admin/quests", position: { x: 100, y: 20 } },
    { id: "admin-items", name: "Item Database", icon: "💾", path: "/admin/items", position: { x: 100, y: 120 } },
    { id: "admin-kits", name: "Component Kits", icon: "🔌", path: "/admin/kits", position: { x: 100, y: 220 } },
    { id: "admin-users", name: "User Admin", icon: "👥", path: "/admin/users", position: { x: 100, y: 320 } },
    { id: "admin-generator", name: "AI Generator", icon: "🤖", path: "/admin/quest-generator", position: { x: 100, y: 420 } },
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
    // Select this icon
    setSelectedIcon(icon.id);
    
    // For double-clicks and special windows, specific handling is done elsewhere
  };
  
  // Handle double click on icons
  const handleIconDoubleClick = (icon: { id: string, name: string, icon: string, path: string }) => {
    // Handle specific icons with custom windows
    if (icon.id === "inventory") {
      openInventoryWindow();
    } else if (icon.id === "crafting") {
      openCraftingWindow();
    } else if (icon.id === "terminal") {
      openTerminalWindow();
    } else {
      // For other icons, navigate to the path
      navigate(icon.path);
    }
    
    // Clear icon selection after action
    setSelectedIcon(null);
  };
  
  // Function to start dragging desktop icons
  const startIconDrag = (e: React.MouseEvent, iconType: 'regular' | 'admin', iconId: string) => {
    e.preventDefault();
    
    // Find the icon being dragged
    const iconList = iconType === 'regular' ? activeDesktopIcons : adminIcons;
    const iconToMove = iconList.find(icon => icon.id === iconId);
    
    if (!iconToMove) return;
    
    // Get initial mouse position and icon position
    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startIconX = iconToMove.position.x;
    const startIconY = iconToMove.position.y;
    
    // Create a function to handle the mouse movement
    const onMouseMove = (e: MouseEvent) => {
      // Calculate the new position based on mouse movement
      const newX = startIconX + (e.clientX - startMouseX);
      const newY = startIconY + (e.clientY - startMouseY);
      
      // Update the appropriate icon collection
      if (iconType === 'regular') {
        setActiveDesktopIcons(
          activeDesktopIcons.map(icon => 
            icon.id === iconId 
              ? { 
                  ...icon, 
                  position: {
                    x: newX,
                    y: newY,
                  } 
                } 
              : icon
          )
        );
      } else {
        setAdminIcons(
          adminIcons.map(icon => 
            icon.id === iconId 
              ? { 
                  ...icon, 
                  position: {
                    x: newX,
                    y: newY, 
                  } 
                } 
              : icon
          )
        );
      }
    };
    
    // Function to clean up event listeners when drag ends
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    
    // Add event listeners for mouse movement and release
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };
  
  // Function to open the crafting window
  const openCraftingWindow = () => {
    const craftingContent = (
      <CraftingWindow />
    );
    
    openWindow("crafting", "Crafting Station", craftingContent, "⚒️");
  };
  
  // Function to open the inventory window
  const openInventoryWindow = () => {
    const inventoryContent = (
      <InventoryWindow openItemDetails={openItemDetailsWindow} />
    );
    
    openWindow("inventory", "Inventory", inventoryContent, "🎒");
  };
  
  // Function to open item details window
  const openItemDetailsWindow = (itemId: string, quantity: number) => {
    const itemDetailsContent = (
      <ItemDetailsWindow itemId={itemId} quantity={quantity} />
    );
    
    openWindow(`item-${itemId}`, `Item Details: ${itemId}`, itemDetailsContent, "📦");
  };
  
  // Function to open the terminal window
  const openTerminalWindow = () => {
    const terminalContent = (
      <TerminalWindow />
    );
    
    openWindow("terminal", "Command Prompt", terminalContent, "💻");
  };
  
  const openWelcomeWindow = () => {
    const welcomeContent = (
      <div className="p-4 retro-window-content">
        <h1 className="text-xl font-bold mb-4">Welcome to The Quest Giver!</h1>
        <p className="mb-3">Your portal to exciting learning adventures with digital components.</p>
        
        <div className="mb-4 border-t border-b border-gray-300 py-2">
          <h2 className="font-bold">Current Stats:</h2>
          <p>Level: {user?.level || 1}</p>
          <p>XP Progress</p>
          <div className="w-full bg-gray-200 h-2 rounded-full mt-1 mb-3">
            <div 
              className="bg-green-500 h-2 rounded-full" 
              style={{ 
                width: '35%' 
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
  
  // Initialize audio with user interaction awareness
  useEffect(() => {
    const audioElement = audioRef.current;
    
    // Setup audio element
    if (audioElement) {
      // Ensure audio is paused initially - default state is muted
      audioElement.pause();
      audioElement.currentTime = 0;
      audioElement.volume = 0.5; // Set to 50% volume by default
      
      // Add audio event listeners for better state management
      const handleAudioPlay = () => setIsMusicPlaying(true);
      const handleAudioPause = () => setIsMusicPlaying(false);
      const handleAudioEnded = () => {
        // This shouldn't normally trigger due to the loop attribute,
        // but we'll handle it just in case
        if (audioElement.loop) {
          audioElement.play().catch(err => console.warn("Auto-replay failed:", err));
        } else {
          setIsMusicPlaying(false);
        }
      };
      
      audioElement.addEventListener('play', handleAudioPlay);
      audioElement.addEventListener('pause', handleAudioPause);
      audioElement.addEventListener('ended', handleAudioEnded);
      
      // Clean up event listeners on unmount
      return () => {
        audioElement.removeEventListener('play', handleAudioPlay);
        audioElement.removeEventListener('pause', handleAudioPause);
        audioElement.removeEventListener('ended', handleAudioEnded);
        
        // Pause audio when component unmounts
        audioElement.pause();
      };
    }
  }, []);
  
  // Handle click on the desktop background to deselect icons
  const handleDesktopClick = (e: React.MouseEvent) => {
    // Only process if this is a direct click on the desktop, not on an icon
    if ((e.target as HTMLElement).classList.contains('retro-desktop')) {
      setSelectedIcon(null);
    }
  };
  
  // Toggle background music play/pause
  const toggleMusic = () => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    
    if (isMusicPlaying) {
      // If music is playing, pause it
      audioElement.pause();
      // No need to manually update state as the 'pause' event listener will do it
    } else {
      // If music is paused, reset and play it
      audioElement.currentTime = 0; // Reset to beginning to avoid multi-track issues
      
      // Play the audio
      audioElement.play().catch(error => {
        console.warn("Audio playback failed:", error);
        // Force state update in case the event listener doesn't fire
        setIsMusicPlaying(false);
      });
    }
    // State will be updated by event listeners rather than directly toggling
  };
  
  return (
    <div 
      className="retro-desktop relative min-h-[80vh] overflow-hidden text-black"
      style={{
        backgroundImage: `url(${wallpaperImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated'
      }}
      onClick={handleDesktopClick}
    >
      {/* Desktop Icons */}
      <div className="absolute top-0 left-0 right-0 bottom-0">
        {/* Regular icons */}
        {activeDesktopIcons.map((icon) => (
          <div 
            key={icon.id}
            className={`desktop-icon absolute flex flex-col items-center justify-center p-2 cursor-pointer rounded transition-all duration-150 w-24 ${
              selectedIcon === icon.id ? 'bg-blue-600/50 scale-105' : 'hover:bg-blue-600/30 hover:scale-105 active:bg-blue-700/40'
            }`}
            style={{
              top: `${icon.position.y}px`,
              left: `${icon.position.x}px`,
            }}
            onClick={() => handleIconClick(icon)}
            onDoubleClick={() => handleIconDoubleClick(icon)}
            onMouseDown={(e) => {
              // Allow single click for selection without starting drag
              if (e.button === 0 && e.detail === 1) {
                // Don't allow the drag to start immediately to distinguish from click
                const dragTimeout = setTimeout(() => {
                  startIconDrag(e, 'regular', icon.id);
                }, 200);
                
                // Clear the timeout if they release before the drag starts
                const clearDragStart = () => {
                  clearTimeout(dragTimeout);
                  window.removeEventListener('mouseup', clearDragStart);
                };
                
                window.addEventListener('mouseup', clearDragStart, { once: true });
              }
            }}
          >
            {/* Icon image - using a shadow box style for Windows-like appearance */}
            <div className="flex items-center justify-center w-12 h-12 rounded-sm bg-gradient-to-br from-blue-100 to-blue-300 border border-blue-400 shadow-md mb-1">
              <span className="text-3xl drop-shadow-md">{icon.icon}</span>
            </div>
            
            {/* Icon label */}
            <div className="text-center text-sm font-bold text-white bg-black/60 px-1 py-0.5 rounded shadow-sm w-full">
              {icon.name}
            </div>
          </div>
        ))}
        
        {/* Admin icons */}
        {user?.roles?.includes('admin') && adminIcons.map((icon) => (
          <div 
            key={icon.id}
            className={`desktop-icon absolute flex flex-col items-center justify-center p-2 cursor-pointer rounded transition-all duration-150 w-24 ${
              selectedIcon === icon.id ? 'bg-purple-600/50 scale-105' : 'hover:bg-purple-600/30 hover:scale-105 active:bg-purple-700/40'
            }`}
            style={{
              top: `${icon.position.y}px`,
              left: `${icon.position.x}px`,
            }}
            onClick={() => handleIconClick(icon)}
            onDoubleClick={() => handleIconDoubleClick(icon)}
            onMouseDown={(e) => {
              // Allow single click for selection without starting drag
              if (e.button === 0 && e.detail === 1) {
                // Don't allow the drag to start immediately to distinguish from click
                const dragTimeout = setTimeout(() => {
                  startIconDrag(e, 'admin', icon.id);
                }, 200);
                
                // Clear the timeout if they release before the drag starts
                const clearDragStart = () => {
                  clearTimeout(dragTimeout);
                  window.removeEventListener('mouseup', clearDragStart);
                };
                
                window.addEventListener('mouseup', clearDragStart, { once: true });
              }
            }}
          >
            {/* Icon image - using a shadow box style for Windows-like appearance */}
            <div className="flex items-center justify-center w-12 h-12 rounded-sm bg-gradient-to-br from-purple-100 to-purple-300 border border-purple-400 shadow-md mb-1">
              <span className="text-3xl drop-shadow-md">{icon.icon}</span>
            </div>
            
            {/* Icon label */}
            <div className="text-center text-sm font-bold text-yellow-300 bg-purple-900/70 px-1 py-0.5 rounded shadow-sm w-full">
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
            className={`absolute rounded-md border-2 bg-gray-100 shadow-2xl overflow-hidden ${
              window.isActive ? 'border-cyan-400 z-50' : 'border-blue-700 z-40'
            }`}
            style={{
              top: `${window.position.y}px`,
              left: `${window.position.x}px`,
              width: `${window.position.width}px`,
              height: `${window.position.height}px`,
              boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)'
            }}
            onClick={() => activateWindow(window.id)}
          >
            {/* Window Title Bar */}
            <div 
              className={`flex items-center justify-between px-3 py-1.5 ${
                window.isActive 
                  ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500' 
                  : 'bg-gradient-to-r from-gray-700 to-gray-600'
              } text-white`}
              onMouseDown={(e) => startDrag(e, window.id)}
            >
              <div className="flex items-center">
                <span className="mr-2 text-lg">{window.icon}</span>
                <span className="font-bold text-sm truncate">{window.title}</span>
              </div>
              <div className="flex space-x-2">
                <button 
                  className="w-5 h-5 flex items-center justify-center bg-blue-800 hover:bg-blue-700 text-white rounded-sm border border-blue-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    minimizeWindow(window.id);
                  }}
                >
                  <Minimize2 size={14} />
                </button>
                <button 
                  className="w-5 h-5 flex items-center justify-center bg-blue-800 hover:bg-blue-700 text-white rounded-sm border border-blue-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    // In a full implementation, this would maximize the window
                  }}
                >
                  <Maximize2 size={14} />
                </button>
                <button 
                  className="w-5 h-5 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white rounded-sm border border-red-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeWindow(window.id);
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>
            
            {/* Window Content */}
            <div className="retro-window-body p-2 overflow-auto bg-gray-100" style={{ height: 'calc(100% - 36px)' }}>
              {window.content}
            </div>
          </div>
        )
      ))}
      
      {/* Start Menu */}
      {isStartMenuOpen && (
        <RetroStartMenu isOpen={isStartMenuOpen} onClose={() => setIsStartMenuOpen(false)} />
      )}
      
      {/* Start Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-r from-blue-900 to-purple-900 border-t-2 border-blue-400 flex justify-between items-center px-3 shadow-lg">
        <div className="flex">
          <button 
            className="flex items-center bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold px-4 py-1.5 rounded-sm mr-4 border border-cyan-300 shadow-inner"
            onClick={() => setIsStartMenuOpen(!isStartMenuOpen)}
          >
            <span className="mr-2 text-lg">🚀</span>
            <span>Start</span>
          </button>
          
          {/* Minimized Windows */}
          <div className="flex space-x-2">
            {windows.filter(w => w.isMinimized).map(window => (
              <button 
                key={window.id}
                className="flex items-center bg-blue-800 hover:bg-blue-700 border border-blue-500 px-3 py-1.5 text-xs text-white rounded-sm transition-colors"
                onClick={() => activateWindow(window.id)}
              >
                <span className="mr-2">{window.icon}</span>
                <span className="truncate max-w-[100px]">{window.title}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Clock and Sound Controls */}
        <div className="flex items-center space-x-3">
          {/* Sound Control Button */}
          <button 
            className="bg-blue-800 border border-blue-500 rounded-sm px-2 py-1.5 text-white hover:bg-blue-700 transition-colors"
            onClick={toggleMusic}
            title={isMusicPlaying ? "Mute music" : "Play music"}
          >
            {isMusicPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          
          {/* Clock */}
          <div className="bg-blue-800 border border-blue-500 rounded-sm px-3 py-1.5 text-xs font-mono text-white">
            {currentTime.toLocaleTimeString()} | {currentTime.toLocaleDateString()}
          </div>
          
          {/* Hidden audio element */}
          <audio ref={audioRef} src={backgroundMusic} loop preload="auto" />
        </div>
      </div>
    </div>
  );
};

export default RetroDesktop;