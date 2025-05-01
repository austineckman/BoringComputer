import React, { useState, useEffect } from "react";
import { Check, Upload } from "lucide-react";
import wallpaperImage from "@assets/wallpaper.png";
import beachBg from "@assets/beachg.png";
import skBg from "@assets/skbg.png";
import lootRoomBg from "@assets/lootroomg.png";
import gizboRoboBg from "@assets/gizborobog.png";

// Define settings props interface
interface SettingsWindowProps {
  onClose: () => void;
  onWallpaperChange: (wallpaper: string) => void;
  onCrtToggle: (enabled: boolean) => void;
  currentWallpaper: string;
  crtEnabled: boolean;
}

const SettingsWindow: React.FC<SettingsWindowProps> = ({ 
  onClose, 
  onWallpaperChange,
  onCrtToggle,
  currentWallpaper,
  crtEnabled
}) => {
  const [selectedWallpaper, setSelectedWallpaper] = useState<string>(currentWallpaper);
  const [isCrtEnabled, setIsCrtEnabled] = useState<boolean>(crtEnabled);
  const [customWallpaper, setCustomWallpaper] = useState<string | null>(null);
  
  // Available wallpapers
  const wallpapers = [
    { id: "default", name: "Default", src: wallpaperImage },
    { id: "beach", name: "Beach", src: beachBg },
    { id: "skateboard", name: "Skateboard", src: skBg },
    { id: "lootroom", name: "Loot Room", src: lootRoomBg },
    { id: "robotics", name: "Robotics", src: gizboRoboBg },
  ];
  
  // Handle wallpaper selection
  const handleWallpaperSelect = (wallpaper: string) => {
    setSelectedWallpaper(wallpaper);
  };
  
  // Handle CRT effect toggle
  const handleCrtToggle = () => {
    setIsCrtEnabled(!isCrtEnabled);
  };
  
  // Handle custom file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          setCustomWallpaper(event.target.result);
          setSelectedWallpaper('custom');
        }
      };
      
      reader.readAsDataURL(file);
    }
  };
  
  // Handle save settings
  const handleSaveSettings = () => {
    // Apply wallpaper setting
    if (selectedWallpaper === 'custom' && customWallpaper) {
      onWallpaperChange(customWallpaper);
    } else {
      const selectedWp = wallpapers.find(wp => wp.id === selectedWallpaper);
      if (selectedWp) {
        onWallpaperChange(selectedWp.src);
      }
    }
    
    // Apply CRT effect setting
    onCrtToggle(isCrtEnabled);
    
    // Close the settings window
    onClose();
  };
  
  return (
    <div className="p-4 flex flex-col h-full">
      <h2 className="text-xl font-bold mb-4">Computer Settings</h2>
      
      {/* Desktop Background Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Desktop Background</h3>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {wallpapers.map((wallpaper) => (
            <div 
              key={wallpaper.id}
              className={`relative border-2 cursor-pointer overflow-hidden h-24 ${selectedWallpaper === wallpaper.id ? 'border-blue-500' : 'border-gray-300'}`}
              onClick={() => handleWallpaperSelect(wallpaper.id)}
            >
              <img 
                src={wallpaper.src} 
                alt={wallpaper.name} 
                className="w-full h-full object-cover"
                style={{ imageRendering: 'pixelated' }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1">
                {wallpaper.name}
              </div>
              {selectedWallpaper === wallpaper.id && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                  <Check size={12} />
                </div>
              )}
            </div>
          ))}
          
          {/* Custom wallpaper preview */}
          {customWallpaper && (
            <div 
              className={`relative border-2 cursor-pointer overflow-hidden h-24 ${selectedWallpaper === 'custom' ? 'border-blue-500' : 'border-gray-300'}`}
              onClick={() => handleWallpaperSelect('custom')}
            >
              <img 
                src={customWallpaper} 
                alt="Custom" 
                className="w-full h-full object-cover"
                style={{ imageRendering: 'pixelated' }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1">
                Custom
              </div>
              {selectedWallpaper === 'custom' && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                  <Check size={12} />
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Upload custom wallpaper */}
        <div className="mb-4">
          <label className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 py-2 px-3 rounded cursor-pointer w-fit">
            <Upload size={16} />
            <span>Upload Image</span>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
          <p className="text-xs text-gray-500 mt-1">Recommended size: 1920x1080px</p>
        </div>
      </div>
      
      {/* CRT Effect Setting */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Display Effects</h3>
        <div className="flex items-center">
          <label className="retro-checkbox-container flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={isCrtEnabled}
              onChange={handleCrtToggle}
              className="mr-2"
            />
            <span>Enable CRT Effect</span>
          </label>
        </div>
        <p className="text-xs text-gray-500 mt-1">Adds scan lines and screen flicker for a retro monitor look</p>
      </div>
      
      {/* Buttons */}
      <div className="mt-auto flex justify-end gap-2">
        <button 
          className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
          onClick={onClose}
        >
          Cancel
        </button>
        <button 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          onClick={handleSaveSettings}
        >
          Apply Settings
        </button>
      </div>
    </div>
  );
};

export default SettingsWindow;
