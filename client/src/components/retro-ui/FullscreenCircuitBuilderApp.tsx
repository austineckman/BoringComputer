import React from 'react';
import { X } from 'lucide-react';
import CircuitBuilderWindow from './CircuitBuilderWindow';
import { SimulatorProvider } from '../circuit-builder/simulator/SimulatorContext';

interface FullscreenCircuitBuilderAppProps {
  onClose: () => void;
}

const FullscreenCircuitBuilderApp: React.FC<FullscreenCircuitBuilderAppProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-blue-950 z-50 flex flex-col">
      {/* App content */}
      <div className="flex-1 overflow-hidden">
        <SimulatorProvider>
          <CircuitBuilderWindow onClose={onClose} />
        </SimulatorProvider>
      </div>
    </div>
  );
};

export default FullscreenCircuitBuilderApp;