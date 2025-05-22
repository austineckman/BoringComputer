import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { windowStyles, type ColorScheme } from './WindowStyles';
import logoImage from "@assets/Asset 6@2x-8.png";

// Icon imports for taskbar buttons
import ironBagImage from "@assets/486_Iron_Bag_Leather_B.png";
import picklockImage from "@assets/Untitled design - 2025-04-26T171551.402.png";
import goldCrateImage from "@assets/goldcrate.png";
import craftingImage from "@assets/Untitled design - 2025-04-26T171858.770.png";
import questImage from "@assets/01_Fire_Grimoire.png";
import shopCoinImage from "@assets/22_Leperchaun_Coin.png";
import jukeboxIconImage from "@assets/jukebox_icon.png";
import ledIconImage from "@assets/led.icon.png";

interface TaskBarProps {
  colorScheme: ColorScheme;
  isStartMenuOpen: boolean;
  onStartMenuToggle: () => void;
  minimizedWindows: any[];
  onWindowActivate: (id: string) => void;
  isMusicPlaying: boolean;
  onMusicToggle: () => void;
  currentTime: Date;
  use24HourClock: boolean;
  dateFormat: string;
  timezone: string;
  children?: React.ReactNode; // For MiniPlayer
}

const iconMap: Record<string, string> = {
  ironbag: ironBagImage,
  picklock: picklockImage,
  goldcrate: goldCrateImage,
  craftingarmor: craftingImage,
  questgrimoire: questImage,
  shopcoin: shopCoinImage,
  music: jukeboxIconImage,
  circuitbuilder: ledIconImage
};

const TaskBarIcon: React.FC<{ icon: string; alt: string; className?: string }> = ({ 
  icon, 
  alt, 
  className = "mr-2 w-4 h-4 object-contain" 
}) => {
  if (iconMap[icon]) {
    return (
      <img 
        src={iconMap[icon]} 
        alt={alt} 
        className={className}
        style={{ imageRendering: 'pixelated' }}
      />
    );
  }
  return <span className="mr-2">{icon}</span>;
};

const TaskBar: React.FC<TaskBarProps> = ({
  colorScheme,
  isStartMenuOpen,
  onStartMenuToggle,
  minimizedWindows,
  onWindowActivate,
  isMusicPlaying,
  onMusicToggle,
  currentTime,
  use24HourClock,
  dateFormat,
  timezone,
  children
}) => {
  const startBarClass = windowStyles.startBar[colorScheme];
  const startButtonClass = windowStyles.startButton[colorScheme];
  const taskbarButtonClass = windowStyles.taskbarButton[colorScheme];
  const controlButtonClass = windowStyles.controlButton[colorScheme];

  return (
    <div className={`absolute bottom-0 left-0 right-0 h-12 flex justify-between items-center px-3 shadow-lg ${startBarClass}`}>
      <div className="flex">
        {/* Start Button */}
        <button 
          className={`flex items-center text-white font-bold px-4 py-1.5 rounded-sm mr-4 shadow-inner transition-all ${startButtonClass}`}
          onClick={onStartMenuToggle}
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
          {minimizedWindows.map(window => (
            <button 
              key={window.id}
              className={`flex items-center px-3 py-1.5 text-xs text-white rounded-sm transition-all ${taskbarButtonClass}`}
              onClick={() => onWindowActivate(window.id)}
            >
              <TaskBarIcon icon={window.icon} alt={window.title} />
              <span className="truncate max-w-[100px]">{window.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Right side - MiniPlayer and Controls */}
      <div className="flex items-center space-x-3">
        {/* MiniPlayer (passed as children) */}
        {children}
        
        {/* Sound Control Button */}
        <button 
          className={`rounded-sm px-2 py-1.5 text-white transition-all ${controlButtonClass}`}
          onClick={onMusicToggle}
          title={isMusicPlaying ? "Mute music" : "Play music"}
        >
          {isMusicPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
        
        {/* Clock */}
        <div className={`rounded-sm px-3 py-1.5 text-white flex flex-col items-end ${controlButtonClass}`}>
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
  );
};

export default TaskBar;