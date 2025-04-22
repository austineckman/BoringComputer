import React, { ReactNode } from 'react';
import { DndProvider as ReactDndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';

// Use this component to wrap any components that need drag-and-drop functionality
interface DndProviderProps {
  children: ReactNode;
}

const DndProvider: React.FC<DndProviderProps> = ({ children }) => {
  // Use TouchBackend for mobile devices, HTML5Backend for desktop
  const isTouchDevice = () => {
    return ('ontouchstart' in window) || 
      (navigator.maxTouchPoints > 0) || 
      ((navigator as any).msMaxTouchPoints > 0);
  };
  
  // Choose the appropriate backend based on device type
  const backend = isTouchDevice() ? TouchBackend : HTML5Backend;
  const options = isTouchDevice() ? { enableMouseEvents: true } : {};
  
  return (
    <ReactDndProvider backend={backend} options={options}>
      {children}
    </ReactDndProvider>
  );
};

export default DndProvider;