import React from 'react';
import { DndProvider as ReactDndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

/**
 * DndProvider wraps components with react-dnd's DndProvider
 * Enables drag and drop functionality for the crafting system
 * 
 * @param props.children Child components that need drag and drop functionality
 */
export const DndProvider: React.FC<{ 
  children: React.ReactNode 
}> = ({ children }) => {
  return (
    <ReactDndProvider backend={HTML5Backend}>
      {children}
    </ReactDndProvider>
  );
};

export default DndProvider;