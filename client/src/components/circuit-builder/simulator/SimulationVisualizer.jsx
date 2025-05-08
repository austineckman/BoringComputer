import React from 'react';
import { useSimulator } from './SimulatorContext';

/**
 * SimulationVisualizer - Component that provides visual feedback for simulation state
 * Shows pin states and component activations
 */
const SimulationVisualizer = () => {
  const { pinStates, componentStates, isSimulationRunning } = useSimulator();
  
  if (!isSimulationRunning) {
    return null; // Don't render anything when simulation is not running
  }
  
  return (
    <div className="absolute bottom-4 right-4 bg-gray-900 border border-gray-700 rounded-md p-3 shadow-lg">
      <h3 className="text-xs font-semibold mb-2 text-white">Pin States</h3>
      
      <div className="grid grid-cols-4 gap-2 mb-3">
        {/* Digital pins */}
        {Object.entries(pinStates)
          .filter(([pin]) => pin.startsWith('D'))
          .map(([pin, isHigh]) => (
            <div key={pin} className="flex items-center">
              <div 
                className={`w-3 h-3 rounded-full mr-1 ${isHigh ? 'bg-green-500' : 'bg-gray-600'}`}
              />
              <span className="text-xs text-gray-300">{pin}</span>
            </div>
          ))
        }
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {/* Analog pins */}
        {Object.entries(pinStates)
          .filter(([pin]) => pin.startsWith('A'))
          .map(([pin, value]) => (
            <div key={pin} className="flex flex-col">
              <span className="text-xs text-gray-300">{pin}</span>
              <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500"
                  style={{ width: `${(value / 1023) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-400">{value}</span>
            </div>
          ))
        }
      </div>
      
      {/* Component states would be shown here in a full implementation */}
    </div>
  );
};

export default SimulationVisualizer;