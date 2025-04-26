import React, { useState, useEffect, useRef } from "react";
import { X, Maximize2, Minimize2, Volume2, VolumeX, Music } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import RetroStartMenu from "./RetroStartMenu";
import InventoryWindow from "./InventoryWindow";
import ItemDetailsWindow from "./ItemDetailsWindow";
import CraftingWindow from "./CraftingWindow";
import TerminalWindow from "./TerminalWindow";
import WebBrowserWindow from "./WebBrowserWindow";
import ProfileWindow from "./ProfileWindow";
import PartyKittyWindow from "./PartyKittyWindow";
import JukeboxWindow from "./JukeboxWindow";
import FullscreenQuestsApp from "./FullscreenQuestsApp";
import QuestLoadingScreen from "./QuestLoadingScreen";
import wallpaperImage from "@assets/wallpaper.png";
import goldCrateImage from "@assets/goldcrate.png";
import ironBagImage from "@assets/506_Gold_Bag_Leather_B.png";
import craftingImage from "@assets/62_Ice_Armor.png";
import questImage from "@assets/01_Fire_Grimoire.png";
import shopCoinImage from "@assets/22_Leperchaun_Coin.png";
import logoImage from "@assets/Asset 6@2x-8.png";
import partyKittyImage from "@assets/partykitty.png";
import jukeboxImage from "@assets/jukebox.png";

// Type definitions
interface Position {
  x: number;
  y: number;
}

interface WindowPosition extends Position {
  width: number;
  height: number;
}

interface RetroWindow {
  id: string;
  title: string;
  icon: string;
  content: React.ReactNode;
  position: WindowPosition;
  isMinimized: boolean;
  isActive: boolean;
}

interface DesktopIcon {
  id: string;
  name: string;
  icon: string;
  path?: string;
  position: Position;
}

interface AdminFolder {
  id: string;
  name: string;
  icon: string;
  position: Position;
  isOpen: boolean;
}

const RetroDesktop: React.FC = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [windows, setWindows] = useState<RetroWindow[]>([]);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  // Single state to manage quests app status: 'closed', 'loading', or 'open'
  const [questsAppState, setQuestsAppState] = useState<'closed' | 'loading' | 'open'>('closed');
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Desktop icons (regular icons visible to all users)
  const [desktopIcons, setDesktopIcons] = useState<DesktopIcon[]>([
    { id: "quests", name: "Quests", icon: "questgrimoire", path: "/quests", position: { x: 20, y: 20 } },
    { id: "inventory", name: "loot.exe", icon: "ironbag", path: "/inventory", position: { x: 20, y: 120 } },
    { id: "crafting", name: "crafting.exe", icon: "craftingarmor", path: "/crafting", position: { x: 20, y: 220 } },
    { id: "lootboxes", name: "Loot Crates", icon: "goldcrate", path: "/lootboxes", position: { x: 20, y: 320 } },
    { id: "shop", name: "Shop", icon: "shopcoin", path: "/shop", position: { x: 20, y: 420 } },
  ]);
  
  // Admin folder (only visible to admin users)
  const [adminFolder, setAdminFolder] = useState<AdminFolder>({
    id: "admin-folder",
    name: "Admin Tools", 
    icon: "📁",
    position: { x: window.innerWidth - 100, y: 20 },
    isOpen: false
  });
  
  // Admin icons within the folder (not displayed directly on desktop)
  const adminIcons: DesktopIcon[] = [
    { id: "admin-quests", name: "Quest Admin", icon: "🧪", path: "/admin-quests", position: { x: 0, y: 0 } },
    { id: "admin-items", name: "Item Database", icon: "💾", path: "/admin-items", position: { x: 0, y: 0 } },
    { id: "admin-kits", name: "Component Kits", icon: "🔌", path: "/admin-kits", position: { x: 0, y: 0 } },
    { id: "admin-users", name: "User Admin", icon: "👥", path: "/admin-users", position: { x: 0, y: 0 } },
    { id: "admin-generator", name: "AI Generator", icon: "🤖", path: "/admin-quest-generator", position: { x: 0, y: 0 } },
    { id: "admin-dashboard", name: "Admin Panel", icon: "🖥️", path: "/admin", position: { x: 0, y: 0 } },
    { id: "admin-lootboxes", name: "Loot Boxes", icon: "🎁", path: "/admin-lootboxes", position: { x: 0, y: 0 } },
    { id: "admin-recipes", name: "Recipes", icon: "📋", path: "/admin-recipes", position: { x: 0, y: 0 } },
  ];
  
  // Update clock every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Handle window resize for admin folder position
  useEffect(() => {
    const handleResize = () => {
      setAdminFolder(prev => ({
        ...prev,
        position: { ...prev.position, x: window.innerWidth - 100 }
      }));
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Open Welcome window when component mounts
  useEffect(() => {
    setTimeout(() => {
      openWelcomeWindow();
    }, 800);
    
    // Add event listeners for windows that can be opened from Start Menu
    const handleOpenTerminal = () => {
      openTerminalWindow();
    };
    
    const handleOpenBrowser = () => {
      openShopWindow();
    };
    
    const handleOpenProfile = () => {
      openProfileWindow();
    };
    
    const handleOpenPartyKitty = () => {
      openPartyKittyWindow();
    };
    
    window.addEventListener('openTerminal', handleOpenTerminal);
    window.addEventListener('openBrowser', handleOpenBrowser);
    window.addEventListener('openProfile', handleOpenProfile);
    window.addEventListener('openPartyKitty', handleOpenPartyKitty);
    
    return () => {
      window.removeEventListener('openTerminal', handleOpenTerminal);
      window.removeEventListener('openBrowser', handleOpenBrowser);
      window.removeEventListener('openProfile', handleOpenProfile);
      window.removeEventListener('openPartyKitty', handleOpenPartyKitty);
    };
  }, []);
  
  // Audio and Jukebox setup - we'll handle audio in the JukeboxWindow component now
  useEffect(() => {
    // Add event listeners for jukebox control
    const handleJukeboxStatusChange = (e: CustomEvent) => {
      setIsMusicPlaying(e.detail.isPlaying);
    };
    
    // Use CustomEvent for type safety
    window.addEventListener('jukeboxStatusChange', handleJukeboxStatusChange as EventListener);
    
    return () => {
      window.removeEventListener('jukeboxStatusChange', handleJukeboxStatusChange as EventListener);
    };
  }, []);

  // Window management functions
  const openWindow = (
    id: string, 
    title: string, 
    content: React.ReactNode, 
    icon: string,
    customSize?: { width?: number, height?: number }
  ) => {
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
    
    // Use default or custom dimensions
    const width = customSize?.width || 600;
    const height = customSize?.height || 400;
    
    // Create a new window with random position
    const newWindow: RetroWindow = {
      id,
      title,
      icon,
      content,
      position: {
        x: 50 + Math.random() * 100,
        y: 50 + Math.random() * 100,
        width,
        height,
      },
      isMinimized: false,
      isActive: true,
    };
    
    setWindows([...updatedWindows, newWindow]);
  };
  
  const closeWindow = (id: string) => {
    setWindows(windows.filter(window => window.id !== id));
    
    // If we're closing the admin folder window, also set the folder to closed
    if (id === "admin-folder-window") {
      setAdminFolder(prev => ({ ...prev, isOpen: false }));
    }
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
  
  // Handle icon clicks and dragging
  const handleIconClick = (iconId: string) => {
    setSelectedIcon(iconId);
  };
  
  const handleIconDoubleClick = (iconId: string, iconPath?: string) => {
    // Handle special icons with custom windows
    if (iconId === "inventory") {
      openInventoryWindow();
    } else if (iconId === "crafting") {
      openCraftingWindow();
    } else if (iconId === "terminal") {
      openTerminalWindow();
    } else if (iconId === "shop") {
      openShopWindow();
    } else if (iconId === "quests") {
      // Play sound if available
      if (window.sounds) {
        window.sounds.click();
      }
      
      // Only trigger loading state if quests app is currently closed
      if (questsAppState === 'closed') {
        // Show loading screen
        setQuestsAppState('loading');
      }
    } else if (iconId === "admin-folder") {
      toggleAdminFolder();
    } else if (iconPath) {
      // For other icons, navigate to the path if it exists
      navigate(iconPath);
    }
    
    // Clear icon selection after action
    setSelectedIcon(null);
  };
  
  const startIconDrag = (e: React.MouseEvent, iconId: string, isAdminFolder: boolean) => {
    e.preventDefault();
    
    // Function to handle the mouse movement for desktop icons
    const dragDesktopIcon = (e: MouseEvent, startX: number, startY: number, initialX: number, initialY: number) => {
      const newX = initialX + (e.clientX - startX);
      const newY = initialY + (e.clientY - startY);
      
      setDesktopIcons(prevIcons => 
        prevIcons.map(icon => 
          icon.id === iconId 
            ? { ...icon, position: { x: newX, y: newY } } 
            : icon
        )
      );
    };
    
    // Function to handle the mouse movement for the admin folder
    const dragAdminFolder = (e: MouseEvent, startX: number, startY: number, initialX: number, initialY: number) => {
      const newX = initialX + (e.clientX - startX);
      const newY = initialY + (e.clientY - startY);
      
      setAdminFolder(prev => ({
        ...prev,
        position: { x: newX, y: newY }
      }));
    };
    
    if (isAdminFolder) {
      // Admin folder drag
      const startX = e.clientX;
      const startY = e.clientY;
      const initialX = adminFolder.position.x;
      const initialY = adminFolder.position.y;
      
      const handleMouseMove = (e: MouseEvent) => {
        dragAdminFolder(e, startX, startY, initialX, initialY);
      };
      
      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      // Regular desktop icon drag
      const icon = desktopIcons.find(icon => icon.id === iconId);
      if (!icon) return;
      
      const startX = e.clientX;
      const startY = e.clientY;
      const initialX = icon.position.x;
      const initialY = icon.position.y;
      
      const handleMouseMove = (e: MouseEvent) => {
        dragDesktopIcon(e, startX, startY, initialX, initialY);
      };
      
      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };

  // Admin folder functions
  const toggleAdminFolder = () => {
    const newIsOpen = !adminFolder.isOpen;
    setAdminFolder(prev => ({ ...prev, isOpen: newIsOpen }));
    
    if (newIsOpen) {
      openAdminFolderWindow();
    } else {
      // Close the admin folder window if it's open
      const folderWindow = windows.find(w => w.id === "admin-folder-window");
      if (folderWindow) {
        closeWindow("admin-folder-window");
      }
    }
  };
  
  const openAdminFolderWindow = () => {
    const folderContent = (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Admin Tools</h2>
        <div className="grid grid-cols-3 gap-4">
          {adminIcons.map(icon => (
            <div 
              key={icon.id}
              className="flex flex-col items-center justify-center p-2 cursor-pointer hover:bg-blue-100 rounded transition-colors"
              onClick={() => {
                if (icon.path) {
                  navigate(icon.path);
                  // Close the folder window after navigation
                  closeWindow("admin-folder-window");
                }
              }}
            >
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-300 border border-purple-400 rounded-sm mb-2">
                <span className="text-2xl">{icon.icon}</span>
              </div>
              <span className="text-center text-sm">{icon.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
    
    openWindow("admin-folder-window", "Admin Tools", folderContent, "📁");
  };

  // Specific window content functions
  const openPartyKittyWindow = () => {
    openWindow(
      "partykitty", 
      "Party Kitty", 
      <PartyKittyWindow onClose={() => closeWindow("partykitty")} />, 
      "🐱", 
      { width: 500, height: 450 }
    );
  };
  
  const openCraftingWindow = () => {
    openWindow(
      "crafting", 
      "crafting.exe", 
      <CraftingWindow />, 
      "craftingarmor", 
      { width: 700, height: 500 }
    );
  };
  
  const openInventoryWindow = () => {
    openWindow(
      "inventory", 
      "loot.exe", 
      <InventoryWindow openItemDetails={openItemDetailsWindow} />, 
      "ironbag",
      { width: 650, height: 520 }
    );
  };
  
  const openItemDetailsWindow = (itemId: string, quantity: number) => {
    openWindow(
      `item-${itemId}`, 
      `Item Details: ${itemId}`, 
      <ItemDetailsWindow itemId={itemId} quantity={quantity} />, 
      "📦",
      { width: 500, height: 450 }
    );
  };
  
  const openTerminalWindow = () => {
    openWindow(
      "terminal", 
      "Command Prompt", 
      <TerminalWindow />, 
      "💻",
      { width: 650, height: 450 }
    );
  };
  
  const openShopWindow = () => {
    openWindow(
      "shop", 
      "Shop", 
      <WebBrowserWindow initialUrl="https://craftingtable.com" title="Crafting Shop" />, 
      "shopcoin",
      { width: 800, height: 600 }
    );
  };
  
  const openProfileWindow = () => {
    openWindow(
      "profile", 
      "Profile Settings", 
      <ProfileWindow onClose={() => closeWindow("profile")} />, 
      "user",
      { width: 600, height: 650 }
    );
  };

  const openWelcomeWindow = () => {
    const welcomeContent = (
      <div className="p-4 retro-window-content">
        <h1 className="text-xl font-bold mb-4">Welcome to CraftingTable!</h1>
        <p className="mb-3">Your adventure in crafting, exploration, and discovery begins here.</p>
        
        <div className="mb-4 border-t border-b border-gray-300 py-2">
          <h2 className="font-bold">Current Stats:</h2>
          <p>Level: {user?.level || 1}</p>
          <p>XP Progress</p>
          <div className="w-full bg-gray-200 h-2 rounded-full mt-1 mb-3">
            <div 
              className="bg-green-500 h-2 rounded-full" 
              style={{ width: '35%' }}
            ></div>
          </div>
          <p>Items in inventory: {user?.inventory ? Object.values(user.inventory).reduce((a, b) => a + b, 0) : 0}</p>
        </div>
        
        <p className="text-sm">Double-click on icons to get started, or use the start menu.</p>
      </div>
    );
    
    openWindow("welcome", "Welcome", welcomeContent, "💻");
  };
  
  // Desktop background click handler
  const handleDesktopClick = (e: React.MouseEvent) => {
    // Only process if this is a direct click on the desktop, not on an icon
    if ((e.target as HTMLElement).classList.contains('retro-desktop')) {
      setSelectedIcon(null);
    }
  };
  
  // Music controls
  const toggleMusic = () => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    
    if (isMusicPlaying) {
      audioElement.pause();
    } else {
      audioElement.currentTime = 0;
      audioElement.play().catch(error => {
        console.warn("Audio playback failed:", error);
        setIsMusicPlaying(false);
      });
    }
  };
  
  return (
    <div 
      className="retro-desktop relative flex-1 min-h-full h-full overflow-hidden text-black"
      style={{
        backgroundImage: `url(${wallpaperImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated'
      }}
      onClick={handleDesktopClick}
    >
      {/* Quest Loading Screen */}
      {questsAppState === 'loading' && (
        <QuestLoadingScreen 
          onLoadingComplete={() => {
            // Move from loading to open state
            setQuestsAppState('open');
          }}
        />
      )}
      
      {/* Fullscreen Quest Application */}
      {questsAppState === 'open' && (
        <FullscreenQuestsApp onClose={() => {
          // Reset app state to closed
          setQuestsAppState('closed');
        }} />
      )}
      {/* Desktop Icons */}
      <div className="absolute top-0 left-0 right-0 bottom-0">
        {/* Regular icons */}
        {desktopIcons.map((icon) => (
          <div 
            key={icon.id}
            className={`desktop-icon absolute flex flex-col items-center justify-center p-2 cursor-pointer rounded transition-all duration-150 w-24 ${
              selectedIcon === icon.id ? 'bg-blue-600/50 scale-105' : 'hover:bg-blue-600/30 hover:scale-105 active:bg-blue-700/40'
            }`}
            style={{
              top: `${icon.position.y}px`,
              left: `${icon.position.x}px`,
            }}
            onClick={() => handleIconClick(icon.id)}
            onDoubleClick={() => handleIconDoubleClick(icon.id, icon.path)}
            onMouseDown={(e) => {
              // Allow single click for selection without starting drag
              if (e.button === 0 && e.detail === 1) {
                // Don't allow the drag to start immediately to distinguish from click
                const dragTimeout = setTimeout(() => {
                  startIconDrag(e, icon.id, false);
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
            {/* Icon image */}
            <div className="flex items-center justify-center w-12 h-12 rounded-sm bg-gradient-to-br from-blue-100 to-blue-300 border border-blue-400 shadow-md mb-1">
              {icon.icon === "goldcrate" ? (
                <img 
                  src={goldCrateImage} 
                  alt="Gold Crate" 
                  className="w-10 h-10 object-contain" 
                  style={{ imageRendering: 'pixelated' }}
                />
              ) : icon.icon === "ironbag" ? (
                <img 
                  src={ironBagImage} 
                  alt="Inventory Bag" 
                  className="w-10 h-10 object-contain" 
                  style={{ imageRendering: 'pixelated' }}
                />
              ) : icon.icon === "craftingarmor" ? (
                <img 
                  src={craftingImage} 
                  alt="Crafting Armor" 
                  className="w-10 h-10 object-contain" 
                  style={{ imageRendering: 'pixelated' }}
                />
              ) : icon.icon === "questgrimoire" ? (
                <img 
                  src={questImage} 
                  alt="Quest Grimoire" 
                  className="w-10 h-10 object-contain" 
                  style={{ imageRendering: 'pixelated' }}
                />
              ) : icon.icon === "shopcoin" ? (
                <img 
                  src={shopCoinImage} 
                  alt="Shop Coin" 
                  className="w-10 h-10 object-contain" 
                  style={{ imageRendering: 'pixelated' }}
                />
              ) : (
                <span className="text-3xl drop-shadow-md">{icon.icon}</span>
              )}
            </div>
            
            {/* Icon label */}
            <div className="text-center text-sm font-bold text-white bg-black/60 px-1 py-0.5 rounded shadow-sm w-full">
              {icon.name}
            </div>
          </div>
        ))}
        
        {/* Admin folder icon - only visible to admins */}
        {user?.roles?.includes('admin') && (
          <div 
            key={adminFolder.id}
            className={`desktop-icon absolute flex flex-col items-center justify-center p-2 cursor-pointer rounded transition-all duration-150 w-24 ${
              selectedIcon === adminFolder.id ? 'bg-purple-600/50 scale-105' : 'hover:bg-purple-600/30 hover:scale-105 active:bg-purple-700/40'
            }`}
            style={{
              top: `${adminFolder.position.y}px`,
              left: `${adminFolder.position.x}px`,
            }}
            onClick={() => handleIconClick(adminFolder.id)}
            onDoubleClick={() => handleIconDoubleClick(adminFolder.id)}
            onMouseDown={(e) => {
              // Allow single click for selection without starting drag
              if (e.button === 0 && e.detail === 1) {
                // Don't allow the drag to start immediately to distinguish from click
                const dragTimeout = setTimeout(() => {
                  startIconDrag(e, adminFolder.id, true);
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
            {/* Icon image */}
            <div className="flex items-center justify-center w-12 h-12 rounded-sm bg-gradient-to-br from-purple-100 to-purple-300 border border-purple-400 shadow-md mb-1">
              <span className="text-3xl drop-shadow-md">{adminFolder.icon}</span>
            </div>
            
            {/* Icon label */}
            <div className="text-center text-sm font-bold text-yellow-300 bg-purple-900/70 px-1 py-0.5 rounded shadow-sm w-full">
              {adminFolder.name}
            </div>
          </div>
        )}
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
                {window.icon === "ironbag" ? (
                  <img 
                    src={ironBagImage} 
                    alt="Inventory" 
                    className="mr-2 w-6 h-6 object-contain" 
                    style={{ imageRendering: 'pixelated' }}
                  />
                ) : window.icon === "goldcrate" ? (
                  <img 
                    src={goldCrateImage} 
                    alt="Gold Crate" 
                    className="mr-2 w-6 h-6 object-contain" 
                    style={{ imageRendering: 'pixelated' }}
                  />
                ) : window.icon === "craftingarmor" ? (
                  <img 
                    src={craftingImage} 
                    alt="Crafting Armor" 
                    className="mr-2 w-6 h-6 object-contain" 
                    style={{ imageRendering: 'pixelated' }}
                  />
                ) : window.icon === "questgrimoire" ? (
                  <img 
                    src={questImage} 
                    alt="Quest Grimoire" 
                    className="mr-2 w-6 h-6 object-contain" 
                    style={{ imageRendering: 'pixelated' }}
                  />
                ) : window.icon === "shopcoin" ? (
                  <img 
                    src={shopCoinImage} 
                    alt="Shop Coin" 
                    className="mr-2 w-6 h-6 object-contain" 
                    style={{ imageRendering: 'pixelated' }}
                  />
                ) : (
                  <span className="mr-2 text-lg">{window.icon}</span>
                )}
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
                    // Toggle between default size and large size
                    const currentWidth = window.position.width;
                    const currentHeight = window.position.height;
                    
                    if (currentWidth < 800) {
                      // Maximize
                      setWindows(
                        windows.map(w => 
                          w.id === window.id 
                            ? { 
                                ...w, 
                                position: {
                                  ...w.position,
                                  width: 800,
                                  height: 600
                                } 
                              } 
                            : w
                        )
                      );
                    } else {
                      // Restore to default size
                      setWindows(
                        windows.map(w => 
                          w.id === window.id 
                            ? { 
                                ...w, 
                                position: {
                                  ...w.position,
                                  width: 600,
                                  height: 400
                                } 
                              } 
                            : w
                        )
                      );
                    }
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
            
            {/* Resize Handle */}
            <div 
              className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-gray-400 hover:bg-gray-300"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Get initial mouse position and window dimensions
                const startX = e.clientX;
                const startY = e.clientY;
                const initialWidth = window.position.width;
                const initialHeight = window.position.height;
                
                // Handle resize
                const onMouseMove = (e: MouseEvent) => {
                  // Calculate new dimensions based on mouse movement
                  const newWidth = Math.max(300, initialWidth + (e.clientX - startX));
                  const newHeight = Math.max(200, initialHeight + (e.clientY - startY));
                  
                  // Update window dimensions
                  setWindows(
                    windows.map(w => 
                      w.id === window.id 
                        ? { 
                            ...w, 
                            position: {
                              ...w.position,
                              width: newWidth,
                              height: newHeight
                            } 
                          } 
                        : w
                    )
                  );
                };
                
                // Clean up resize event
                const onMouseUp = () => {
                  document.removeEventListener('mousemove', onMouseMove);
                  document.removeEventListener('mouseup', onMouseUp);
                };
                
                // Add resize event listeners
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
              }}
            />
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
            <img 
              src={logoImage} 
              alt="Start" 
              className="mr-2 h-5 w-5 object-contain" 
              style={{ filter: 'brightness(1.2)' }} 
            />
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
                {window.icon === "ironbag" ? (
                  <img 
                    src={ironBagImage} 
                    alt="Inventory" 
                    className="mr-2 w-4 h-4 object-contain" 
                    style={{ imageRendering: 'pixelated' }}
                  />
                ) : window.icon === "goldcrate" ? (
                  <img 
                    src={goldCrateImage} 
                    alt="Gold Crate" 
                    className="mr-2 w-4 h-4 object-contain" 
                    style={{ imageRendering: 'pixelated' }}
                  />
                ) : window.icon === "craftingarmor" ? (
                  <img 
                    src={craftingImage} 
                    alt="Crafting Armor" 
                    className="mr-2 w-4 h-4 object-contain" 
                    style={{ imageRendering: 'pixelated' }}
                  />
                ) : window.icon === "questgrimoire" ? (
                  <img 
                    src={questImage} 
                    alt="Quest Grimoire" 
                    className="mr-2 w-4 h-4 object-contain" 
                    style={{ imageRendering: 'pixelated' }}
                  />
                ) : window.icon === "shopcoin" ? (
                  <img 
                    src={shopCoinImage} 
                    alt="Shop Coin" 
                    className="mr-2 w-4 h-4 object-contain" 
                    style={{ imageRendering: 'pixelated' }}
                  />
                ) : (
                  <span className="mr-2">{window.icon}</span>
                )}
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
          
          {/* We no longer need the audio element here as it's handled by the JukeboxWindow */}
        </div>
      </div>
    </div>
  );
};

export default RetroDesktop;