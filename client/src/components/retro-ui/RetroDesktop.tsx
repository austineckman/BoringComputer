import React, { useState, useEffect } from "react";
import { X, Maximize2, Minimize2, Volume2, VolumeX, Trash2 } from "lucide-react";
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
import MiniPlayer from "./MiniPlayer";
import FullscreenQuestsApp from "./FullscreenQuestsApp";
import FullscreenOracleApp from "./FullscreenOracleApp";
import FullscreenCircuitBuilderApp from "./FullscreenCircuitBuilderApp";
import FullscreenLockpickingApp from "./FullscreenLockpickingApp";
import RecycleBinWindow from "./RecycleBinWindow";
import QuestLoadingScreen from "./QuestLoadingScreen";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import wallpaperImage from "@assets/wallpaper.png";
import goldCrateImage from "@assets/goldcrate.png";
import ironBagImage from "@assets/486_Iron_Bag_Leather_B.png"; // Fixed to match the available asset
import questImage from "@assets/01_Fire_Grimoire.png";
import jukeboxIconImage from "@assets/jukebox_icon.png";
import shopCoinImage from "@assets/22_Leperchaun_Coin.png";
import logoImage from "@assets/Asset 6@2x-8.png";
import partyKittyImage from "@assets/partykitty.png";
import oracleIconImage from "@assets/hooded-figure.png";
import picklockImage from "@assets/Untitled design - 2025-04-26T171551.402.png";
import craftingImage from "@assets/Untitled design - 2025-04-26T171858.770.png";

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

// AdminFolder interface removed

const RetroDesktop: React.FC = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [windows, setWindows] = useState<RetroWindow[]>([]);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  // Single state to manage quests app status: 'closed', 'loading', or 'open'
  const [questsAppState, setQuestsAppState] = useState<'closed' | 'loading' | 'open'>('closed');
  // State to manage Oracle app: 'closed' or 'open'
  const [oracleAppState, setOracleAppState] = useState<'closed' | 'open'>('closed');
  // State to manage Circuit Builder app: 'closed' or 'open'
  const [circuitBuilderAppState, setCircuitBuilderAppState] = useState<'closed' | 'open'>('closed');
  // State to manage PickLock.exe app: 'closed' or 'open'
  const [lockpickingAppState, setLockpickingAppState] = useState<'closed' | 'open'>('closed');
  // Use global audio player context
  const { isPlaying: isMusicPlaying, toggleMute } = useAudioPlayer();
  
  // Desktop icons (regular icons visible to all users)
  const [desktopIcons, setDesktopIcons] = useState<DesktopIcon[]>([
    { id: "quests", name: "Quests", icon: "questgrimoire", path: "/quests", position: { x: 20, y: 20 } },
    { id: "inventory", name: "loot.exe", icon: "ironbag", path: "/inventory", position: { x: 20, y: 120 } },
    { id: "crafting", name: "crafting.exe", icon: "craftingarmor", path: "/crafting", position: { x: 20, y: 220 } },
    { id: "lootboxes", name: "PickLock.exe", icon: "picklock", path: "/lootboxes", position: { x: 20, y: 320 } },
    { id: "shop", name: "Shop", icon: "shopcoin", path: "/shop", position: { x: 20, y: 420 } },
    { id: "oracle", name: "The Oracle", icon: "oracle", position: { x: 20, y: 520 } },
    { id: "circuitbuilder", name: "Circuit Builder", icon: "🔌", position: { x: 20, y: 620 } },
    { id: "recyclebin", name: "Recycle Bin", icon: "trashIcon", position: { x: 140, y: 20 } },
  ]);
  
  // Admin icons (for reference only - no longer displayed in a folder)
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
  
  // No resize handlers needed for admin folder anymore

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
    
    const handleOpenJukebox = () => {
      openJukeboxWindow();
    };
    
    window.addEventListener('openTerminal', handleOpenTerminal);
    window.addEventListener('openBrowser', handleOpenBrowser);
    window.addEventListener('openProfile', handleOpenProfile);
    window.addEventListener('openPartyKitty', handleOpenPartyKitty);
    window.addEventListener('openJukebox', handleOpenJukebox);
    
    return () => {
      window.removeEventListener('openTerminal', handleOpenTerminal);
      window.removeEventListener('openBrowser', handleOpenBrowser);
      window.removeEventListener('openProfile', handleOpenProfile);
      window.removeEventListener('openPartyKitty', handleOpenPartyKitty);
      window.removeEventListener('openJukebox', handleOpenJukebox);
    };
  }, []);
  
  // No separate audio setup needed as we're using the AudioPlayerContext

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
    } else if (iconId === "recyclebin") {
      openRecycleBinWindow();
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
    } else if (iconId === "oracle") {
      // Play sound if available
      if (window.sounds) {
        window.sounds.click();
      }
      
      // Open the Oracle app if it's currently closed
      if (oracleAppState === 'closed') {
        setOracleAppState('open');
      }
    } else if (iconId === "circuitbuilder") {
      // Play sound if available
      if (window.sounds) {
        window.sounds.click();
      }
      
      // Open the Circuit Builder app if it's currently closed
      if (circuitBuilderAppState === 'closed') {
        setCircuitBuilderAppState('open');
      }
    } else if (iconId === "lootboxes") {
      // Play sound if available
      if (window.sounds) {
        window.sounds.click();
      }
      
      // Open the PickLock app if it's currently closed
      if (lockpickingAppState === 'closed') {
        setLockpickingAppState('open');
      }
    } else if (iconPath) {
      // For other icons, navigate to the path if it exists
      navigate(iconPath);
    }
    
    // Clear icon selection after action
    setSelectedIcon(null);
  };
  
  const startIconDrag = (e: React.MouseEvent, iconId: string) => {
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
  };

  // Admin functions removed as requested

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
      { width: 845, height: 676 } // Increased by 30% from 650x520
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
  
  const openJukeboxWindow = () => {
    openWindow(
      "jukebox", 
      "Music Player", 
      <JukeboxWindow onClose={() => closeWindow("jukebox")} />, 
      "music",
      { width: 900, height: 600 }
    );
  };
  
  const openRecycleBinWindow = () => {
    openWindow(
      "recyclebin", 
      "Recycle Bin", 
      <RecycleBinWindow onClose={() => closeWindow("recyclebin")} />, 
      "trashIcon",
      { width: 800, height: 600 }
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
    // Use the toggleMute function from AudioPlayerContext
    toggleMute();
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
      
      {/* Fullscreen Oracle Application */}
      {oracleAppState === 'open' && (
        <FullscreenOracleApp onClose={() => {
          // Reset app state to closed
          setOracleAppState('closed');
        }} />
      )}
      
      {/* Fullscreen Circuit Builder Application */}
      {circuitBuilderAppState === 'open' && (
        <FullscreenCircuitBuilderApp onClose={() => {
          // Reset app state to closed
          setCircuitBuilderAppState('closed');
        }} />
      )}
      
      {/* Fullscreen Lockpicking Application */}
      {lockpickingAppState === 'open' && (
        <FullscreenLockpickingApp onClose={() => {
          // Reset app state to closed
          setLockpickingAppState('closed');
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
                  startIconDrag(e, icon.id);
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
            <div className={`flex items-center justify-center w-12 h-12 rounded-sm shadow-md mb-1 ${
              icon.icon === "ironbag" 
                ? "bg-gradient-to-br from-amber-200 to-yellow-500 border border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]" 
                : "bg-gradient-to-br from-blue-100 to-blue-300 border border-blue-400"
            }`}>
              {icon.icon === "picklock" ? (
                <img 
                  src={picklockImage} 
                  alt="PickLock" 
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
              ) : icon.icon === "oracle" ? (
                <img 
                  src={oracleIconImage} 
                  alt="The Oracle" 
                  className="w-10 h-10 object-contain" 
                  style={{ imageRendering: 'pixelated' }}
                />
              ) : icon.icon === "trashIcon" ? (
                <Trash2 size={24} className="text-gray-700" />
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
        
        {/* Admin folder has been removed as requested */}
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
                ) : window.icon === "picklock" ? (
                  <img 
                    src={picklockImage} 
                    alt="PickLock" 
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
                ) : window.icon === "music" ? (
                  <img 
                    src={jukeboxIconImage} 
                    alt="Jukebox" 
                    className="mr-2 w-6 h-6 object-contain" 
                    style={{ imageRendering: 'pixelated' }}
                  />
                ) : window.icon === "trashIcon" ? (
                  <Trash2 size={18} className="mr-2 text-white" />
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
                ) : window.icon === "picklock" ? (
                  <img 
                    src={picklockImage} 
                    alt="PickLock" 
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
                ) : window.icon === "music" ? (
                  <img 
                    src={jukeboxIconImage} 
                    alt="Jukebox" 
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

        {/* MiniPlayer */}
        <MiniPlayer onOpenJukebox={openJukeboxWindow} />
        
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
        </div>
      </div>
    </div>
  );
};

export default RetroDesktop;