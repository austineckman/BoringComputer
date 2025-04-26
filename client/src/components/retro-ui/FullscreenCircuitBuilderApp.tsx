import React from 'react';
import CircuitBuilderWindow from './CircuitBuilderWindow';
import { useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';

const FullscreenCircuitBuilderApp: React.FC = () => {
  const [, navigate] = useLocation();

  return (
    <div className="fullscreen-circuit-builder h-screen w-screen bg-gray-900 flex flex-col overflow-hidden">
      {/* Header with back button */}
      <div className="header bg-gray-800 text-white p-2 flex items-center">
        <button 
          className="back-btn p-2 mr-3 hover:bg-gray-700 rounded-full"
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-semibold">Circuit Builder</h1>
        <div className="ml-auto text-sm">
          <span className="mr-4">Build and simulate circuits</span>
          <span className="bg-blue-600 px-2 py-1 rounded">Fullscreen Mode</span>
        </div>
      </div>
      
      {/* Circuit Builder Interface */}
      <div className="flex-grow overflow-hidden">
        <CircuitBuilderWindow />
      </div>
      
      {/* Footer with help text */}
      <div className="footer bg-gray-800 text-white p-2 text-sm flex justify-between">
        <div>
          <span className="mr-4">Drag components from palette • Connect points by clicking • Rotate with the rotate button</span>
        </div>
        <div>
          <span>Press the "Simulate Circuit" button to test your circuit</span>
        </div>
      </div>
    </div>
  );
};

export default FullscreenCircuitBuilderApp;