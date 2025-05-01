import React, { useState, useEffect } from "react";
import { Check, Upload, Clock } from "lucide-react";
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
  onClockFormatChange: (use24Hour: boolean) => void;
  onDateFormatChange: (dateFormat: string) => void;
  onTimezoneChange: (timezone: string) => void;
  onIconSizeChange: (size: 'small' | 'medium' | 'large') => void;
  onColorSchemeChange: (scheme: 'blue' | 'black' | 'orange' | 'green' | 'red') => void;
  currentWallpaper: string;
  crtEnabled: boolean;
  use24HourClock: boolean;
  dateFormat: string;
  timezone: string;
  iconSize: 'small' | 'medium' | 'large';
  colorScheme: 'blue' | 'black' | 'orange' | 'green' | 'red';
}

const SettingsWindow: React.FC<SettingsWindowProps> = ({ 
  onClose, 
  onWallpaperChange,
  onCrtToggle,
  onClockFormatChange,
  onDateFormatChange,
  onTimezoneChange,
  onIconSizeChange,
  onColorSchemeChange,
  currentWallpaper,
  crtEnabled,
  use24HourClock,
  dateFormat,
  timezone,
  iconSize,
  colorScheme
}) => {
  const [selectedWallpaper, setSelectedWallpaper] = useState<string>(currentWallpaper);
  const [isCrtEnabled, setIsCrtEnabled] = useState<boolean>(crtEnabled);
  // Custom wallpaper state removed to improve performance
  const [is24HourClock, setIs24HourClock] = useState<boolean>(use24HourClock);
  const [selectedDateFormat, setSelectedDateFormat] = useState<string>(dateFormat);
  const [selectedTimezone, setSelectedTimezone] = useState<string>(timezone);
  const [selectedIconSize, setSelectedIconSize] = useState<'small' | 'medium' | 'large'>(iconSize);
  const [selectedColorScheme, setSelectedColorScheme] = useState<'blue' | 'black' | 'orange' | 'green' | 'red'>(colorScheme);
  
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
  
  // Custom file upload handler removed to improve performance
  
  // Available date formats
  const dateFormats = [
    { id: 'MM/DD/YYYY', name: 'MM/DD/YYYY' },
    { id: 'DD/MM/YYYY', name: 'DD/MM/YYYY' },
    { id: 'YYYY-MM-DD', name: 'YYYY-MM-DD' },
    { id: 'MMM DD, YYYY', name: 'Month DD, YYYY' }
  ];
  
  // Available timezones
  const timezones = [
    { id: 'America/New_York', name: 'Eastern Time (ET)' },
    { id: 'America/Chicago', name: 'Central Time (CT)' },
    { id: 'America/Denver', name: 'Mountain Time (MT)' },
    { id: 'America/Los_Angeles', name: 'Pacific Time (PT)' },
    { id: 'Europe/London', name: 'Greenwich Mean Time (GMT)' },
    { id: 'Europe/Paris', name: 'Central European Time (CET)' },
    { id: 'Asia/Tokyo', name: 'Japan Standard Time (JST)' },
    { id: 'Australia/Sydney', name: 'Australian Eastern Time (AET)' }
  ];
  
  // Icon sizes with pixel dimensions
  const iconSizes = [
    { id: 'small', name: 'Small', width: 18, height: 18 },
    { id: 'medium', name: 'Medium', width: 24, height: 24 },
    { id: 'large', name: 'Large', width: 32, height: 32 }
  ];
  
  // Available color schemes with display information
  const colorSchemes = [
    { id: 'blue', name: 'Blue', primary: 'bg-blue-600', secondary: 'bg-blue-800' },
    { id: 'black', name: 'Black', primary: 'bg-gray-900', secondary: 'bg-gray-800' },
    { id: 'orange', name: 'Orange', primary: 'bg-orange-600', secondary: 'bg-orange-800' },
    { id: 'green', name: 'Green', primary: 'bg-green-600', secondary: 'bg-green-800' },
    { id: 'red', name: 'Red', primary: 'bg-red-600', secondary: 'bg-red-800' },
  ];
  
  // Handle save settings
  const handleSaveSettings = () => {
    // Apply wallpaper setting
    const selectedWp = wallpapers.find(wp => wp.id === selectedWallpaper);
    if (selectedWp) {
      onWallpaperChange(selectedWp.src);
    }
    
    // Apply CRT effect setting
    onCrtToggle(isCrtEnabled);
    
    // Apply clock format setting
    onClockFormatChange(is24HourClock);
    
    // Apply date format setting
    onDateFormatChange(selectedDateFormat);
    
    // Apply timezone setting
    onTimezoneChange(selectedTimezone);
    
    // Apply icon size setting
    onIconSizeChange(selectedIconSize);
    
    // Apply color scheme setting
    onColorSchemeChange(selectedColorScheme);
    
    // Close the settings window
    onClose();
  };
  
  return (
    <div className="p-4 flex flex-col h-full overflow-y-auto">
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
          
          {/* Custom wallpaper preview option removed to improve performance */}
        </div>
        
        {/* Custom wallpaper upload removed to improve performance */}
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
      
      {/* Desktop Icon Size Setting */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Desktop Icon Size</h3>
        <div className="grid grid-cols-3 gap-3 mb-3">
          {iconSizes.map((size) => (
            <div 
              key={size.id}
              className={`relative border-2 cursor-pointer overflow-hidden p-3 ${selectedIconSize === size.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
              onClick={() => setSelectedIconSize(size.id as 'small' | 'medium' | 'large')}
            >
              <div className="flex flex-col items-center justify-center">
                <div 
                  className="bg-blue-200 rounded-sm border border-blue-400 flex items-center justify-center mb-1" 
                  style={{ width: size.width, height: size.height }}
                >
                  <span style={{ fontSize: size.width * 0.5 }}>🖼️</span>
                </div>
                <span className="text-xs">{size.name}</span>
              </div>
              {selectedIconSize === size.id && (
                <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-1">
                  <Check size={8} />
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">Change how large desktop icons appear</p>
      </div>
      
      {/* Date & Time Settings */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Date & Time</h3>
        
        {/* Clock Format */}
        <div className="mb-3">
          <p className="text-sm font-medium mb-1">Clock Format</p>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input 
                type="radio" 
                className="mr-2" 
                checked={!is24HourClock}
                onChange={() => setIs24HourClock(false)}
              />
              <span>12-hour (AM/PM)</span>
            </label>
            <label className="flex items-center">
              <input 
                type="radio" 
                className="mr-2" 
                checked={is24HourClock}
                onChange={() => setIs24HourClock(true)}
              />
              <span>24-hour</span>
            </label>
          </div>
        </div>
        
        {/* Date Format */}
        <div className="mb-3">
          <p className="text-sm font-medium mb-1">Date Format</p>
          <select 
            className="w-full border border-gray-300 rounded p-2"
            value={selectedDateFormat}
            onChange={(e) => setSelectedDateFormat(e.target.value)}
          >
            {dateFormats.map(format => (
              <option key={format.id} value={format.id}>{format.name}</option>
            ))}
          </select>
        </div>
        
        {/* Timezone */}
        <div>
          <p className="text-sm font-medium mb-1">Time Zone</p>
          <select 
            className="w-full border border-gray-300 rounded p-2"
            value={selectedTimezone}
            onChange={(e) => setSelectedTimezone(e.target.value)}
          >
            {timezones.map(tz => (
              <option key={tz.id} value={tz.id}>{tz.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Color Scheme Settings */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Color Scheme</h3>
        <div className="grid grid-cols-5 gap-2 mb-3">
          {colorSchemes.map((scheme) => (
            <div 
              key={scheme.id}
              className={`relative border-2 cursor-pointer overflow-hidden p-3 ${selectedColorScheme === scheme.id ? 'border-blue-500' : 'border-gray-300'}`}
              onClick={() => setSelectedColorScheme(scheme.id as 'blue' | 'black' | 'orange' | 'green' | 'red')}
            >
              <div className="flex flex-col items-center justify-center">
                <div className="mb-2 flex flex-col rounded overflow-hidden w-full">
                  <div className={`h-4 w-full ${scheme.primary}`}></div>
                  <div className={`h-3 w-full ${scheme.secondary}`}></div>
                </div>
                <span className="text-xs">{scheme.name}</span>
              </div>
              {selectedColorScheme === scheme.id && (
                <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-1">
                  <Check size={8} />
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">Change the colors used for window title bars and taskbar</p>
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
