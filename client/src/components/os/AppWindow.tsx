import React, { useState, useEffect, useRef } from 'react';
import { X, Minus, Square } from 'lucide-react';

interface AppWindowProps {
  appId: string;
  title: string;
  icon?: string;
  isActive: boolean;
  onClose: () => void;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  resizable?: boolean;
  children: React.ReactNode;
}

/**
 * AppWindow Component
 * 
 * Represents a window in the CraftingTable OS desktop environment
 */
export function AppWindow({
  appId,
  title,
  icon,
  isActive,
  onClose,
  width = 800,
  height = 600,
  x = 50,
  y = 50,
  resizable = false,
  children
}: AppWindowProps) {
  const [position, setPosition] = useState({ x, y });
  const [size, setSize] = useState({ width, height });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const windowRef = useRef<HTMLDivElement>(null);
  
  // Handle window dragging
  useEffect(() => {
    if (!isDragging) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);
  
  // Start dragging when titlebar is clicked
  const handleTitlebarMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return;
    
    setIsDragging(true);
    const rect = windowRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };
  
  // Toggle maximize state
  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
  };
  
  // Toggle minimize state
  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };
  
  // Calculate window style
  const windowStyle: React.CSSProperties = isMaximized
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: isActive ? 1000 : 900
      }
    : {
        position: 'absolute',
        top: position.y,
        left: position.x,
        width: size.width,
        height: size.height,
        zIndex: isActive ? 1000 : 900,
        display: isMinimized ? 'none' : 'flex'
      };
  
  return (
    <div
      ref={windowRef}
      id={`app-window-${appId}`}
      className="flex flex-col bg-background border border-border rounded-md shadow-xl overflow-hidden"
      style={windowStyle}
    >
      {/* Window Titlebar */}
      <div
        className={`flex items-center px-2 py-1 ${
          isActive ? 'bg-accent' : 'bg-muted'
        }`}
        onMouseDown={handleTitlebarMouseDown}
        style={{ cursor: isMaximized ? 'default' : 'move' }}
      >
        {icon && (
          <img src={icon} alt={title} className="w-4 h-4 mr-2" />
        )}
        <div className="flex-1 text-sm font-semibold truncate">{title}</div>
        
        {/* Window Controls */}
        <div className="flex space-x-1">
          <button
            className="p-1 hover:bg-muted/50 rounded-sm"
            onClick={handleMinimize}
          >
            <Minus size={14} />
          </button>
          <button
            className="p-1 hover:bg-muted/50 rounded-sm"
            onClick={handleMaximize}
          >
            <Square size={14} />
          </button>
          <button
            className="p-1 hover:bg-destructive/50 rounded-sm"
            onClick={onClose}
          >
            <X size={14} />
          </button>
        </div>
      </div>
      
      {/* Window Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}