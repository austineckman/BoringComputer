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
      
      {/* Taskbar - preserved at bottom */}
      <div className="h-12 bg-gradient-to-r from-blue-900 to-purple-900 border-t-2 border-blue-400 flex items-center px-3 shadow-lg">
        <button 
          onClick={onClose}
          className="flex items-center bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded-sm border border-red-400 shadow-inner"
        >
          <X size={18} className="mr-2" />
          <span>Close Circuit Builder</span>
        </button>
      </div>
    </div>
  );
};

export default FullscreenCircuitBuilderApp;