import React from 'react';
import { DndProvider as ReactDndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface DndProviderProps {
  children: React.ReactNode;
}

const DndProvider: React.FC<DndProviderProps> = ({ children }) => {
  return (
    <ReactDndProvider backend={HTML5Backend}>
      {children}
    </ReactDndProvider>
  );
};

export default DndProvider;