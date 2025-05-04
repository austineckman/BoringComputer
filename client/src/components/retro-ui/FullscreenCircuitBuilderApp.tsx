import React from 'react';
import { X } from 'lucide-react';
import CircuitBuilderWindow from './CircuitBuilderWindow';

interface FullscreenCircuitBuilderAppProps {
  onClose: () => void;
}

const FullscreenCircuitBuilderApp: React.FC<FullscreenCircuitBuilderAppProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-blue-950 z-50 flex flex-col">
      {/* App content */}
      <div className="flex-1 overflow-hidden">
        <CircuitBuilderWindow onClose={onClose} />
      </div>
      
      {/* Close button integrated into main window */}
    </div>
  );
};

export default FullscreenCircuitBuilderApp;