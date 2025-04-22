import React from 'react';
import { DndProvider as ReactDndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { isTouchDevice } from '@/lib/utils';

interface DndProviderProps {
  children: React.ReactNode;
}

// This component provides drag and drop functionality with automatic detection
// for touch devices to use the appropriate backend
const DndProvider: React.FC<DndProviderProps> = ({ children }) => {
  // Use TouchBackend for mobile devices, HTML5Backend for desktop
  const backend = isTouchDevice() ? TouchBackend : HTML5Backend;
  
  // TouchBackend options
  const touchOptions = {
    enableMouseEvents: true, // Allow mouse events on touch devices for testing
    enableTouchEvents: true, // Make sure touch events are enabled
    delayTouchStart: 100, // Small delay to distinguish between tap and drag (in ms)
  };
  
  return (
    <ReactDndProvider backend={backend} options={isTouchDevice() ? touchOptions : undefined}>
      {children}
    </ReactDndProvider>
  );
};

export default DndProvider;