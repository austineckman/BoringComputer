import React from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { DndProvider as ReactDndProvider } from 'react-dnd';

interface DndProviderProps {
  children: React.ReactNode;
}

/**
 * Detects if the device is a touch device
 */
const isTouchDevice = (): boolean => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * DndProvider component that automatically switches between HTML5 and Touch backends
 * based on the device type.
 */
const DndProvider: React.FC<DndProviderProps> = ({ children }) => {
  // Choose the appropriate backend based on the device type
  const backend = isTouchDevice() ? TouchBackend : HTML5Backend;
  
  // Configure the touch backend with preview options if needed
  const touchBackendOptions = {
    enableMouseEvents: true,
    enableTouchEvents: true,
    delayTouchStart: 100,
  };
  
  // Options to use based on the selected backend
  const options = isTouchDevice() ? touchBackendOptions : {};
  
  return (
    <ReactDndProvider backend={backend} options={options}>
      {children}
    </ReactDndProvider>
  );
};

export default DndProvider;