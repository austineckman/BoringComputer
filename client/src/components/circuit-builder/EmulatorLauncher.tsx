import React, { useState } from 'react';
import SimpleEmulator from './emulator/SimpleEmulator';

/**
 * EmulatorLauncher component
 * 
 * This is a simple component that launches our clean emulator implementation.
 * It's designed to be integrated into the sandbox app with minimal dependencies.
 */
const EmulatorLauncher: React.FC = () => {
  const [showEmulator, setShowEmulator] = useState(false);
  
  const launchEmulator = () => {
    setShowEmulator(true);
  };
  
  const closeEmulator = () => {
    setShowEmulator(false);
  };
  
  return (
    <>
      {/* Launch button */}
      <button 
        onClick={launchEmulator}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded flex items-center space-x-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
        </svg>
        <span>Launch Emulator</span>
      </button>
      
      {/* Emulator modal */}
      {showEmulator && (
        <SimpleEmulator onClose={closeEmulator} />
      )}
    </>
  );
};

export default EmulatorLauncher;