import React from 'react';
import { X, Maximize2, Minimize2, Trash2 } from 'lucide-react';
import { windowStyles, type ColorScheme } from './WindowStyles';

// Icon imports
import ironBagImage from "@assets/486_Iron_Bag_Leather_B.png";
import picklockImage from "@assets/Untitled design - 2025-04-26T171551.402.png";
import goldCrateImage from "@assets/goldcrate.png";
import craftingImage from "@assets/Untitled design - 2025-04-26T171858.770.png";
import questImage from "@assets/01_Fire_Grimoire.png";
import shopCoinImage from "@assets/22_Leperchaun_Coin.png";
import jukeboxIconImage from "@assets/jukebox_icon.png";
import bughuntIconImage from "@assets/Untitled design - 2025-05-01T164432.025.png";
import ledIconImage from "@assets/led.icon.png";

interface WindowProps {
  window: {
    id: string;
    title: string;
    icon: string;
    content: React.ReactNode;
    position: { x: number; y: number; width: number; height: number };
    isActive: boolean;
    isMinimized: boolean;
  };
  colorScheme: ColorScheme;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onActivate: (id: string) => void;
  onDragStart: (e: React.MouseEvent, id: string) => void;
  onResizeStart: (e: React.MouseEvent, id: string) => void;
  windows: any[];
  setWindows: React.Dispatch<React.SetStateAction<any[]>>;
}

const iconMap: Record<string, string> = {
  ironbag: ironBagImage,
  picklock: picklockImage,
  goldcrate: goldCrateImage,
  craftingarmor: craftingImage,
  questgrimoire: questImage,
  shopcoin: shopCoinImage,
  music: jukeboxIconImage,
  bughunt: bughuntIconImage,
  circuitbuilder: ledIconImage
};

const WindowIcon: React.FC<{ icon: string; size?: number; className?: string }> = ({ 
  icon, 
  size = 18, 
  className = "mr-2" 
}) => {
  if (icon === "trashIcon") {
    return <Trash2 size={size} className={`${className} text-white`} />;
  }
  
  if (iconMap[icon]) {
    return (
      <img 
        src={iconMap[icon]} 
        alt={icon} 
        className={`${className} object-contain`}
        style={{ 
          width: `${size}px`, 
          height: `${size}px`, 
          imageRendering: 'pixelated' 
        }}
      />
    );
  }
  
  return <span className={`${className} text-lg`}>{icon}</span>;
};

const Window: React.FC<WindowProps> = ({
  window,
  colorScheme,
  onClose,
  onMinimize,
  onMaximize,
  onActivate,
  onDragStart,
  onResizeStart,
  windows,
  setWindows
}) => {
  const titleBarClass = window.isActive 
    ? windowStyles.titleBar.active[colorScheme]
    : windowStyles.titleBar.inactive;

  const handleMaximize = () => {
    const currentWidth = window.position.width;
    const isForgeWindow = window.title.includes('Forge') || window.title.includes('Crafting');
    
    if (currentWidth < 800) {
      // Maximize
      setWindows(prevWindows =>
        prevWindows.map(w => 
          w.id === window.id 
            ? { 
                ...w, 
                position: { ...w.position, width: 800, height: 600 }
              } 
            : w
        )
      );
    } else {
      // Restore to default size
      setWindows(prevWindows =>
        prevWindows.map(w => 
          w.id === window.id 
            ? { 
                ...w, 
                position: {
                  ...w.position,
                  width: isForgeWindow ? 845 : 600,
                  height: isForgeWindow ? 676 : 400
                }
              } 
            : w
        )
      );
    }
  };

  const handleResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const initialWidth = window.position.width;
    const initialHeight = window.position.height;
    
    const onMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(300, initialWidth + (e.clientX - startX));
      const newHeight = Math.max(200, initialHeight + (e.clientY - startY));
      
      setWindows(prevWindows =>
        prevWindows.map(w => 
          w.id === window.id 
            ? { 
                ...w, 
                position: { ...w.position, width: newWidth, height: newHeight }
              } 
            : w
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

  return (
    <div
      className="absolute bg-white border-2 border-gray-400 shadow-lg rounded-sm overflow-hidden"
      style={{
        left: `${window.position.x}px`,
        top: `${window.position.y}px`,
        width: `${window.position.width}px`,
        height: `${window.position.height}px`,
        zIndex: window.isActive ? 1000 : 999,
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)'
      }}
      onClick={() => onActivate(window.id)}
    >
      {/* Title Bar */}
      <div 
        className={`flex items-center justify-between px-3 py-1.5 ${titleBarClass} text-white`}
        onMouseDown={(e) => onDragStart(e, window.id)}
      >
        <div className="flex items-center">
          <WindowIcon icon={window.icon} size={18} />
          <span className="font-bold text-sm truncate">{window.title}</span>
        </div>
        
        <div className="flex space-x-2">
          <button 
            className="w-5 h-5 flex items-center justify-center bg-blue-800 hover:bg-blue-700 text-white rounded-sm border border-blue-400 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onMinimize(window.id);
            }}
          >
            <Minimize2 size={14} />
          </button>
          
          <button 
            className="w-5 h-5 flex items-center justify-center bg-blue-800 hover:bg-blue-700 text-white rounded-sm border border-blue-400 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              handleMaximize();
            }}
          >
            <Maximize2 size={14} />
          </button>
          
          <button 
            className="w-5 h-5 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white rounded-sm border border-red-400 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onClose(window.id);
            }}
          >
            <X size={14} />
          </button>
        </div>
      </div>
      
      {/* Window Content */}
      <div 
        className="retro-window-body p-2 overflow-auto bg-gray-100" 
        style={{ height: 'calc(100% - 36px)' }}
      >
        {window.content}
      </div>
      
      {/* Resize Handle */}
      <div 
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-gray-400 hover:bg-gray-300 transition-colors"
        onMouseDown={handleResize}
      />
    </div>
  );
};

export default Window;