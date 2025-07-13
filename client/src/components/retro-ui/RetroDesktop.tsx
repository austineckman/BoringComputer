import React, { useState, useEffect, useCallback } from "react";
import { X, Maximize2, Minimize2, Volume2, VolumeX, Trash2 } from "lucide-react";
import { FaDiscord } from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import RetroStartMenu from "./RetroStartMenu";
import { Window, TaskBar, type ColorScheme } from "./WindowManager";
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
import SettingsWindow from "./SettingsWindow";
import QuestLoadingScreen from "./QuestLoadingScreen";
import CodeQuizWindow from "./CodeQuizWindow";
import CodeGuessWindow from "./CodeGuessWindow";
import ComponentGlossaryWindow from "./ComponentGlossaryWindow";
import ImprovedCodeReferenceWindow from "./ImprovedCodeReferenceWindow";
import HelpCenterWindow from "./HelpCenterWindow";
import ElectronicsCheatSheetWindow from "./ElectronicsCheatSheetWindow";
import ResistorCalculatorWindow from "./ResistorCalculatorWindow";
import CodeCaravanWindow from "./CodeCaravanWindow";
import ShopWindow from "./ShopWindow";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import wallpaperImage from "@assets/wallpaper.png";
import goldCrateImage from "@assets/goldcrate.png";
import ironBagImage from "@assets/486_Iron_Bag_Leather_B.png"; // Fixed to match the available asset
import questImage from "@assets/01_Fire_Grimoire.png";
import jukeboxIconImage from "@assets/jukebox_icon.png";
import shopCoinImage from "@assets/22_Leperchaun_Coin.png";
import logoImage from "@assets/Asset 6@2x-8.png";
import partyKittyImage from "@assets/partykitty.png";
import ledIconImage from "@assets/led.icon.png";
import oracleIconImage from "@assets/hooded-figure.png";
import picklockImage from "@assets/Untitled design - 2025-04-26T171551.402.png";
import craftingImage from "@assets/Untitled design - 2025-04-26T171858.770.png";
import bughuntIconImage from "@assets/Untitled design - 2025-05-01T164432.025.png";

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
  
  // State for computer settings
  const [currentWallpaper, setCurrentWallpaper] = useState<string>(wallpaperImage);
  const [crtEnabled, setCrtEnabled] = useState<boolean>(false);
  const [use24HourClock, setUse24HourClock] = useState<boolean>(false);
  const [dateFormat, setDateFormat] = useState<string>("MM/DD/YYYY");
  const [timezone, setTimezone] = useState<string>("America/New_York");
  
  // State for Code Caravan window
  const [isCodeCaravanOpen, setIsCodeCaravanOpen] = useState<boolean>(false);
  const [iconSize, setIconSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [colorScheme, setColorScheme] = useState<'blue' | 'black' | 'orange' | 'green' | 'red'>('blue');
  
  // Desktop icons (regular icons visible to all users)
  const [desktopIcons, setDesktopIcons] = useState<DesktopIcon[]>([
    // Base icons that all users see
    { id: "recyclebin", name: "Recycle Bin", icon: "trashIcon", position: { x: 20, y: 20 } },
    { id: "quests", name: "Quests", icon: "questgrimoire", path: "/quests", position: { x: 20, y: 120 } },
    { id: "inventory", name: "Inventory.exe", icon: "ironbag", path: "/inventory", position: { x: 20, y: 220 } },
    { id: "crafting", name: "Gizbo's Forge", icon: "craftingarmor", path: "/crafting", position: { x: 20, y: 320 } },
    
    // Second column (after 4 icons in first column)
    { id: "lootboxes", name: "HackLock.exe", icon: "picklock", path: "/lootboxes", position: { x: 140, y: 20 } },
    { id: "shop", name: "BMAH", icon: "shopcoin", path: "/shop", position: { x: 140, y: 120 } },
    { id: "circuitbuilder", name: "Sandbox", icon: "circuitbuilder", position: { x: 140, y: 220 } },
    { id: "discord", name: "Discord", icon: "discord", position: { x: 140, y: 320 } },
  ]);

  // Update desktop icons when user data changes
  useEffect(() => {
    const baseIcons = [
      // Base icons that all users see
      { id: "recyclebin", name: "Recycle Bin", icon: "trashIcon", position: { x: 20, y: 20 } },
      { id: "quests", name: "Quests", icon: "questgrimoire", path: "/quests", position: { x: 20, y: 120 } },
      { id: "inventory", name: "Inventory.exe", icon: "ironbag", path: "/inventory", position: { x: 20, y: 220 } },
      { id: "crafting", name: "Gizbo's Forge", icon: "craftingarmor", path: "/crafting", position: { x: 20, y: 320 } },
      
      // Second column (after 4 icons in first column)
      { id: "lootboxes", name: "HackLock.exe", icon: "picklock", path: "/lootboxes", position: { x: 140, y: 20 } },
      { id: "shop", name: "BMAH", icon: "shopcoin", path: "/shop", position: { x: 140, y: 120 } },
      { id: "circuitbuilder", name: "Sandbox", icon: "circuitbuilder", position: { x: 140, y: 220 } },
      { id: "discord", name: "Discord", icon: "discord", position: { x: 140, y: 320 } },
    ];
    
    // Only add Oracle icon for admin users (including Founder role)
    if (user?.roles?.includes('admin') || user?.roles?.includes('Founder')) {
      baseIcons.push({ id: "oracle", name: "The Oracle", icon: "oracle", position: { x: 800, y: 20 } });
    }
    
    setDesktopIcons(baseIcons);
  }, [user?.roles]); // Re-run when user roles change
  
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
  
  // Handler for toggling CRT effect
  const handleCrtToggle = useCallback((enabled: boolean) => {
    setCrtEnabled(enabled);
    
    // Add or remove the CRT effect class
    const desktopElement = document.querySelector('.retro-desktop');
    if (desktopElement) {
      if (!enabled) {
        desktopElement.classList.add('crt-effect-disabled');
      } else {
        desktopElement.classList.remove('crt-effect-disabled');
      }
    }
    
    // Save preference in local storage
    localStorage.setItem('crtEnabled', enabled.toString());
  }, []);
  
  // Handler for changing wallpaper
  const handleWallpaperChange = useCallback((wallpaper: string) => {
    setCurrentWallpaper(wallpaper);
  }, []);
  
  // Handler for changing clock format
  const handleClockFormatChange = useCallback((use24Hour: boolean) => {
    setUse24HourClock(use24Hour);
    // Save preference in local storage
    localStorage.setItem('use24HourClock', use24Hour.toString());
  }, []);
  
  // Handler for changing date format
  const handleDateFormatChange = useCallback((format: string) => {
    setDateFormat(format);
    // Save preference in local storage
    localStorage.setItem('dateFormat', format);
  }, []);
  
  // Handler for changing timezone
  const handleTimezoneChange = useCallback((tz: string) => {
    setTimezone(tz);
    // Save preference in local storage
    localStorage.setItem('timezone', tz);
  }, []);
  
  // Handler for changing icon size
  const handleIconSizeChange = useCallback((size: 'small' | 'medium' | 'large') => {
    setIconSize(size);
    // Save preference in local storage
    localStorage.setItem('iconSize', size);
  }, []);
  
  // Handler for changing color scheme
  const handleColorSchemeChange = useCallback((scheme: 'blue' | 'black' | 'orange' | 'green' | 'red') => {
    setColorScheme(scheme);
    // Save preference in local storage
    localStorage.setItem('colorScheme', scheme);
  }, []);

  // Load user preferences from local storage
  useEffect(() => {
    // Load clock format preference
    const savedClockFormat = localStorage.getItem('use24HourClock');
    if (savedClockFormat !== null) {
      setUse24HourClock(savedClockFormat === 'true');
    }
    
    // Load date format preference
    const savedDateFormat = localStorage.getItem('dateFormat');
    if (savedDateFormat) {
      setDateFormat(savedDateFormat);
    }
    
    // Load timezone preference
    const savedTimezone = localStorage.getItem('timezone');
    if (savedTimezone) {
      setTimezone(savedTimezone);
    }
    
    // Load icon size preference
    const savedIconSize = localStorage.getItem('iconSize') as 'small' | 'medium' | 'large' | null;
    if (savedIconSize && ['small', 'medium', 'large'].includes(savedIconSize)) {
      setIconSize(savedIconSize as 'small' | 'medium' | 'large');
    }
    
    // Load color scheme preference
    const savedColorScheme = localStorage.getItem('colorScheme') as 'blue' | 'black' | 'orange' | 'green' | 'red' | null;
    if (savedColorScheme && ['blue', 'black', 'orange', 'green', 'red'].includes(savedColorScheme)) {
      setColorScheme(savedColorScheme as 'blue' | 'black' | 'orange' | 'green' | 'red');
    }
    
    // Load CRT effect preference
    const savedCrtEnabled = localStorage.getItem('crtEnabled');
    if (savedCrtEnabled !== null) {
      setCrtEnabled(savedCrtEnabled === 'true');
    } else {
      // Ensure the CRT effect is disabled by default on first load
      // by adding the disabled class to the desktop element
      const desktopElement = document.querySelector('.retro-desktop');
      if (desktopElement) {
        desktopElement.classList.add('crt-effect-disabled');
      }
    }
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
    
    const handleOpenJukebox = () => {
      openJukeboxWindow();
    };
    
    const handleOpenSettings = () => {
      openSettingsWindow();
    };

    const handleOpenBugHunt = () => {
      openCodeQuizWindow();
    };
    
    const handleOpenCodeGuess = () => {
      openCodeGuessWindow();
    };
    
    const handleOpenComponentGlossary = () => {
      openComponentGlossaryWindow();
    };
    
    const handleOpenCodeReference = () => {
      openCodeReferenceWindow();
    };
    
    const handleOpenHelpCenter = () => {
      openHelpCenterWindow();
    };
    
    const handleOpenElectronicsCheatSheet = () => {
      openElectronicsCheatSheetWindow();
    };
    
    const handleOpenResistorTool = () => {
      openResistorToolWindow();
    };
    
    const handleOpenCodeCaravan = () => {
      openCodeCaravanWindow();
    };
    
    window.addEventListener('openTerminal', handleOpenTerminal);
    window.addEventListener('openBrowser', handleOpenBrowser);
    window.addEventListener('openProfile', handleOpenProfile);
    window.addEventListener('openPartyKitty', handleOpenPartyKitty);
    window.addEventListener('openJukebox', handleOpenJukebox);
    window.addEventListener('openSettings', handleOpenSettings);
    window.addEventListener('openBugHunt', handleOpenBugHunt);
    window.addEventListener('openCodeGuess', handleOpenCodeGuess);
    window.addEventListener('openComponentGlossary', handleOpenComponentGlossary);
    window.addEventListener('openCodeReference', handleOpenCodeReference);
    window.addEventListener('openHelpCenter', handleOpenHelpCenter);
    window.addEventListener('openElectronicsCheatSheet', handleOpenElectronicsCheatSheet);
    window.addEventListener('openResistorTool', handleOpenResistorTool);
    window.addEventListener('openCodeCaravan', handleOpenCodeCaravan);
    
    return () => {
      window.removeEventListener('openTerminal', handleOpenTerminal);
      window.removeEventListener('openBrowser', handleOpenBrowser);
      window.removeEventListener('openProfile', handleOpenProfile);
      window.removeEventListener('openPartyKitty', handleOpenPartyKitty);
      window.removeEventListener('openJukebox', handleOpenJukebox);
      window.removeEventListener('openSettings', handleOpenSettings);
      window.removeEventListener('openBugHunt', handleOpenBugHunt);
      window.removeEventListener('openCodeGuess', handleOpenCodeGuess);
      window.removeEventListener('openComponentGlossary', handleOpenComponentGlossary);
      window.removeEventListener('openCodeReference', handleOpenCodeReference);
      window.removeEventListener('openHelpCenter', handleOpenHelpCenter);
      window.removeEventListener('openElectronicsCheatSheet', handleOpenElectronicsCheatSheet);
      window.removeEventListener('openResistorTool', handleOpenResistorTool);
      window.removeEventListener('openCodeCaravan', handleOpenCodeCaravan);
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
    // Play sound if available for any icon click
    if (window.sounds) {
      window.sounds.click();
    }
    
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
    } else if (iconId === "codequiz") {
      openCodeQuizWindow();
    } else if (iconId === "quests") {
      // Only trigger loading state if quests app is currently closed
      if (questsAppState === 'closed') {
        // Show loading screen
        setQuestsAppState('loading');
      }
    } else if (iconId === "oracle") {
      // Only allow admin users to open the Oracle app (including Founder role)
      if (user?.roles?.includes('admin') || user?.roles?.includes('Founder')) {
        // Open the Oracle app if it's currently closed
        if (oracleAppState === 'closed') {
          setOracleAppState('open');
        }
      } else {
        // Non-admin users should never see this, but as a fallback,
        // show an error message if they somehow try to access it
        if (window.sounds) {
          window.sounds.error();
        }
        openWindow(
          "access-denied",
          "Access Denied",
          <div className="p-6 text-center">
            <div className="text-red-600 text-xl mb-4">⚠️ Access Denied</div>
            <p className="mb-4">You do not have permission to access The Oracle.</p>
            <p className="text-sm text-gray-600">This administrative tool is restricted to admin users only.</p>
          </div>,
          "🔒"
        );
      }
    } else if (iconId === "circuitbuilder") {
      // Open the Circuit Builder app if it's currently closed
      if (circuitBuilderAppState === 'closed') {
        setCircuitBuilderAppState('open');
      }
    } else if (iconId === "lootboxes") {
      // Open the HackLock app if it's currently closed
      if (lockpickingAppState === 'closed') {
        setLockpickingAppState('open');
      }
    } else if (iconId === "discord") {
      // Open Discord link in a new tab
      window.open("https://craftingtable.com/discord", "_blank");
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
  const openCodeQuizWindow = () => {
    openWindow(
      "codequiz", 
      "BugHunt", 
      <CodeQuizWindow 
        onClose={() => closeWindow("codequiz")} 
        onMinimize={() => minimizeWindow("codequiz")}
        isActive={windows.some(w => w.id === "codequiz" && w.isActive)}
      />, 
      "bughunt",
      { width: 700, height: 600 }
    );
  };

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
      "Gizbo's Forge", 
      <CraftingWindow />, 
      "craftingarmor", 
      { width: 930, height: 744 } // 10% larger than previous (845x676) for even better crafting experience
    );
  };
  
  const openInventoryWindow = () => {
    openWindow(
      "inventory", 
      "Inventory.exe", 
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
      "G1ZB0-TERM v3.1.4", 
      <TerminalWindow 
        onClose={() => closeWindow("terminal")}
        onMinimize={() => minimizeWindow("terminal")}
        isActive={windows.some(w => w.id === "terminal" && w.isActive)}
        username={user?.username || "hacker"}
      />, 
      "💻",
      { width: 800, height: 600 }
    );
  };
  
  const openShopWindow = () => {
    openWindow(
      "shop", 
      "The Keymaster's Shop", 
      <ShopWindow onClose={() => closeWindow("shop")} />, 
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
  
  const openSettingsWindow = () => {
    openWindow(
      "settings", 
      "Computer Settings", 
      <SettingsWindow 
        onClose={() => closeWindow("settings")} 
        onWallpaperChange={handleWallpaperChange}
        onCrtToggle={handleCrtToggle}
        onClockFormatChange={handleClockFormatChange}
        onDateFormatChange={handleDateFormatChange}
        onTimezoneChange={handleTimezoneChange}
        onIconSizeChange={handleIconSizeChange}
        onColorSchemeChange={handleColorSchemeChange}
        currentWallpaper={currentWallpaper}
        crtEnabled={crtEnabled}
        use24HourClock={use24HourClock}
        dateFormat={dateFormat}
        timezone={timezone}
        iconSize={iconSize}
        colorScheme={colorScheme}
      />, 
      "monitor",
      { width: 680, height: 620 }
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
  
  const openCodeGuessWindow = () => {
    openWindow(
      "codeguess", 
      "CodeGuess", 
      <CodeGuessWindow 
        onClose={() => closeWindow("codeguess")} 
        onMinimize={() => minimizeWindow("codeguess")}
        isActive={windows.some(w => w.id === "codeguess" && w.isActive)}
      />, 
      "🎮",
      { width: 600, height: 700 }
    );
  };
  
  const openComponentGlossaryWindow = () => {
    openWindow(
      "componentglossary", 
      "Component Encyclopedia", 
      <ComponentGlossaryWindow 
        onClose={() => closeWindow("componentglossary")} 
        onMinimize={() => minimizeWindow("componentglossary")}
        isActive={windows.some(w => w.id === "componentglossary" && w.isActive)}
      />, 
      "💻",
      { width: 900, height: 650 }
    );
  };
  
  const openHelpCenterWindow = () => {
    openWindow(
      "helpcenter", 
      "Help Center", 
      <HelpCenterWindow 
        onClose={() => closeWindow("helpcenter")} 
        onMinimize={() => minimizeWindow("helpcenter")}
        isActive={windows.some(w => w.id === "helpcenter" && w.isActive)}
      />, 
      "❓",
      { width: 850, height: 650 }
    );
  };

  const openCodeReferenceWindow = () => {
    openWindow(
      "codereference", 
      "Code Reference Guide", 
      <ImprovedCodeReferenceWindow 
        onClose={() => closeWindow("codereference")} 
        onMinimize={() => minimizeWindow("codereference")}
        isActive={windows.some(w => w.id === "codereference" && w.isActive)}
      />, 
      "📘",
      { width: 900, height: 700 }
    );
  };
  
  const openElectronicsCheatSheetWindow = () => {
    openWindow(
      "electronicscheatsheet", 
      "Electronics Cheat Sheets", 
      <ElectronicsCheatSheetWindow 
        onClose={() => closeWindow("electronicscheatsheet")} 
        onMinimize={() => minimizeWindow("electronicscheatsheet")}
        isActive={windows.some(w => w.id === "electronicscheatsheet" && w.isActive)}
      />, 
      "📊",
      { width: 900, height: 700 }
    );
  };
  
  const openResistorToolWindow = () => {
    openWindow(
      "resistortool", 
      "Resistor Calculator", 
      <ResistorCalculatorWindow 
        onClose={() => closeWindow("resistortool")} 
        onMinimize={() => minimizeWindow("resistortool")}
        isActive={windows.some(w => w.id === "resistortool" && w.isActive)}
      />, 
      "🔢",
      { width: 760, height: 600 }
    );
  };
  
  const openCodeCaravanWindow = () => {
    openWindow(
      "codecaravan", 
      "Code Caravan: The Silicon Road", 
      <CodeCaravanWindow 
        onClose={() => closeWindow("codecaravan")} 
        onMinimize={() => minimizeWindow("codecaravan")}
        isActive={windows.some(w => w.id === "codecaravan" && w.isActive)}
      />, 
      "🎮",
      { width: 800, height: 650 }
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
      className={`retro-desktop relative flex-1 min-h-full h-full overflow-hidden text-black ${!crtEnabled ? 'crt-effect-disabled' : ''}`}
      style={{
        backgroundImage: `url(${currentWallpaper})`,
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
      
      {/* Fullscreen Oracle Application - Only visible to admin users */}
      {oracleAppState === 'open' && (user?.roles?.includes('admin') || user?.roles?.includes('Founder')) ? (
        <FullscreenOracleApp onClose={() => {
          // Reset app state to closed
          setOracleAppState('closed');
        }} />
      ) : oracleAppState === 'open' ? (
        // Access denied screen for non-admin users who somehow got the app state to 'open'
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center text-white">
          <div className="text-3xl text-red-500 mb-6">⚠️ Access Denied</div>
          <div className="text-xl mb-4">You do not have permission to access The Oracle.</div>
          <div className="text-md mb-8">This administrative tool is restricted to admin users only.</div>
          <button 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
            onClick={() => setOracleAppState('closed')}
          >
            Return to Desktop
          </button>
        </div>
      ) : null}
      
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
            <div className={`flex items-center justify-center rounded-sm shadow-md mb-1 ${iconSize === 'small' ? 'w-8 h-8' : iconSize === 'large' ? 'w-16 h-16' : 'w-12 h-12'} ${
              icon.icon === "oracle" 
                ? "bg-gradient-to-br from-amber-200 to-yellow-500 border border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]" 
                : "bg-gradient-to-br from-blue-100 to-blue-300 border border-blue-400"
            }`}>
              {icon.icon === "picklock" ? (
                <img 
                  src={picklockImage} 
                  alt="HackLock" 
                  className={`${iconSize === 'small' ? 'w-6 h-6' : iconSize === 'large' ? 'w-14 h-14' : 'w-10 h-10'} object-contain`} 
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
              ) : icon.icon === "bughunt" ? (
                <img 
                  src={bughuntIconImage} 
                  alt="BugHunt" 
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
              ) : icon.icon === "circuitbuilder" ? (
                <img 
                  src={ledIconImage} 
                  alt="Sandbox" 
                  className="w-10 h-10 object-contain" 
                  style={{ imageRendering: 'pixelated' }}
                />
              ) : icon.icon === "discord" ? (
                <FaDiscord size={28} className="text-indigo-600" />
              
              ) : icon.icon === "trashIcon" ? (
                <Trash2 size={24} className="text-gray-700" />
              ) : (
                <span className="text-3xl drop-shadow-md">{icon.icon}</span>
              )}
            </div>
            
            {/* Icon label */}
            <div className="text-center text-sm font-bold text-white bg-black/60 px-1 py-0.5 rounded shadow-sm w-full"
              style={{ fontSize: iconSize === 'small' ? '0.75rem' : iconSize === 'large' ? '1rem' : '0.875rem' }}
            >
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
                  ? colorScheme === 'blue' ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500' :
                    colorScheme === 'black' ? 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700' :
                    colorScheme === 'orange' ? 'bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500' :
                    colorScheme === 'green' ? 'bg-gradient-to-r from-green-600 via-green-500 to-emerald-500' :
                    colorScheme === 'red' ? 'bg-gradient-to-r from-red-600 via-red-500 to-rose-500' :
                    'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500'
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
                    alt="HackLock" 
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
                ) : window.icon === "bughunt" ? (
                  <img 
                    src={bughuntIconImage} 
                    alt="BugHunt" 
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
                      // Use larger base size for crafting windows and regular size for others
                      const isForgeWindow = window.title.includes('Forge') || window.title.includes('Crafting');
                      setWindows(
                        windows.map(w => 
                          w.id === window.id 
                            ? { 
                                ...w, 
                                position: {
                                  ...w.position,
                                  width: isForgeWindow ? 845 : 600, // 30% larger for crafting
                                  height: isForgeWindow ? 676 : 400 // 30% larger for crafting
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
      <div className={`absolute bottom-0 left-0 right-0 h-12 flex justify-between items-center px-3 shadow-lg
        ${colorScheme === 'blue' ? 'bg-gradient-to-r from-blue-900 to-purple-900 border-t-2 border-blue-400' :
          colorScheme === 'black' ? 'bg-gradient-to-r from-gray-900 to-gray-800 border-t-2 border-gray-600' :
          colorScheme === 'orange' ? 'bg-gradient-to-r from-orange-900 to-amber-800 border-t-2 border-orange-500' :
          colorScheme === 'green' ? 'bg-gradient-to-r from-green-900 to-emerald-800 border-t-2 border-green-500' :
          colorScheme === 'red' ? 'bg-gradient-to-r from-red-900 to-rose-800 border-t-2 border-red-500' :
          'bg-gradient-to-r from-blue-900 to-purple-900 border-t-2 border-blue-400'}`}>
        <div className="flex">
          <button 
            className={`flex items-center text-white font-bold px-4 py-1.5 rounded-sm mr-4 shadow-inner
              ${colorScheme === 'blue' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 border border-cyan-300' :
                colorScheme === 'black' ? 'bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 border border-gray-500' :
                colorScheme === 'orange' ? 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 border border-orange-300' :
                colorScheme === 'green' ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border border-green-300' :
                colorScheme === 'red' ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 border border-red-300' :
                'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 border border-cyan-300'}`}
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
                className={`flex items-center px-3 py-1.5 text-xs text-white rounded-sm transition-colors
                  ${colorScheme === 'blue' ? 'bg-blue-800 hover:bg-blue-700 border border-blue-500' :
                    colorScheme === 'black' ? 'bg-gray-800 hover:bg-gray-700 border border-gray-600' :
                    colorScheme === 'orange' ? 'bg-orange-800 hover:bg-orange-700 border border-orange-500' :
                    colorScheme === 'green' ? 'bg-green-800 hover:bg-green-700 border border-green-500' :
                    colorScheme === 'red' ? 'bg-red-800 hover:bg-red-700 border border-red-500' :
                    'bg-blue-800 hover:bg-blue-700 border border-blue-500'}`}
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
                    alt="HackLock" 
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
                ) : window.icon === "circuitbuilder" ? (
                  <img 
                    src={ledIconImage} 
                    alt="Sandbox" 
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
            className={`rounded-sm px-2 py-1.5 text-white transition-colors
              ${colorScheme === 'blue' ? 'bg-blue-800 hover:bg-blue-700 border border-blue-500' :
                colorScheme === 'black' ? 'bg-gray-800 hover:bg-gray-700 border border-gray-600' :
                colorScheme === 'orange' ? 'bg-orange-800 hover:bg-orange-700 border border-orange-500' :
                colorScheme === 'green' ? 'bg-green-800 hover:bg-green-700 border border-green-500' :
                colorScheme === 'red' ? 'bg-red-800 hover:bg-red-700 border border-red-500' :
                'bg-blue-800 hover:bg-blue-700 border border-blue-500'}`}
            onClick={toggleMusic}
            title={isMusicPlaying ? "Mute music" : "Play music"}
          >
            {isMusicPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          
          {/* Clock */}
          <div className={`rounded-sm px-3 py-1.5 text-white flex flex-col items-end
            ${colorScheme === 'blue' ? 'bg-blue-800 border border-blue-500' :
              colorScheme === 'black' ? 'bg-gray-800 border border-gray-600' :
              colorScheme === 'orange' ? 'bg-orange-800 border border-orange-500' :
              colorScheme === 'green' ? 'bg-green-800 border border-green-500' :
              colorScheme === 'red' ? 'bg-red-800 border border-red-500' :
              'bg-blue-800 border border-blue-500'}`}>
            <div className="text-xs font-mono">
              {use24HourClock ? 
                currentTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', hour12: false}) : 
                currentTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', hour12: true})
              }
            </div>
            <div className="text-[10px] font-mono text-gray-300">
              {currentTime.toLocaleDateString([], {
                month: dateFormat.includes('MMM') ? 'short' : '2-digit',
                day: '2-digit',
                year: 'numeric',
                timeZone: timezone
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetroDesktop;