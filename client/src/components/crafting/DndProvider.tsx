import React, { ReactNode } from 'react';
import { DndProvider as ReactDndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface DndProviderProps {
  children: ReactNode;
}

/**
 * DndProvider component to wrap components that need drag and drop functionality
 * This abstracts away the react-dnd specific implementation details
 */
export function DndProvider({ children }: DndProviderProps) {
  return (
    <ReactDndProvider backend={HTML5Backend}>
      {children}
    </ReactDndProvider>
  );
}

export default DndProvider;