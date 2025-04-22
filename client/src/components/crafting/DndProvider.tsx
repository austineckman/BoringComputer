import React from 'react';
import { DndProvider as ReactDndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { isTouchDevice } from '@/lib/utils';

interface DndProviderProps {
  children: React.ReactNode;
}

/**
 * A wrapper around react-dnd's DndProvider that automatically uses
 * the appropriate backend based on the device (touch vs mouse).
 */
const DndProvider: React.FC<DndProviderProps> = ({ children }) => {
  // Choose the appropriate backend based on device capabilities
  const backend = isTouchDevice() ? TouchBackend : HTML5Backend;
  
  // Options for touch backend
  const touchBackendOptions = {
    enableMouseEvents: true, // Allow mouse events on touch devices
    delayTouchStart: 200, // Delay before touch is registered as drag (ms)
  };
  
  // Since backend selection happens during render, we need to be careful with SSR
  return (
    <ReactDndProvider 
      backend={backend} 
      options={isTouchDevice() ? touchBackendOptions : undefined}
    >
      {children}
    </ReactDndProvider>
  );
};

export default DndProvider;