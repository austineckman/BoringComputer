import React from 'react';
import { DndProvider as ReactDndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';

interface DndProviderProps {
  children: React.ReactNode;
}

/**
 * DndProvider that detects device capabilities and selects the appropriate backend
 */
export const DndProvider: React.FC<DndProviderProps> = ({ children }) => {
  // Helper function to detect touch devices
  const isTouchDevice = () => {
    if (typeof window === 'undefined') return false;
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 
    );
  };

  // Select the appropriate backend based on device capabilities
  const backend = isTouchDevice() ? TouchBackend : HTML5Backend;
  
  // Options for touch backend
  const touchOptions = {
    enableMouseEvents: true, // Allow mouse events for testing on desktop
    delayTouchStart: 100,    // Delay to distinguish between scroll and drag
  };
  
  return (
    <ReactDndProvider backend={backend} options={isTouchDevice() ? touchOptions : undefined}>
      {children}
    </ReactDndProvider>
  );
};

export default DndProvider;