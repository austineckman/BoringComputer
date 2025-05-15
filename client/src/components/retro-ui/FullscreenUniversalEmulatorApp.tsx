import React from 'react';
import UniversalEmulatorApp from '../circuit-builder/emulator/UniversalEmulatorApp';

interface FullscreenUniversalEmulatorAppProps {
  onClose: () => void;
}

/**
 * Fullscreen Universal Emulator App
 * This component creates a fullscreen version of the Universal Emulator
 * with a layout matching the Sandbox application
 */
const FullscreenUniversalEmulatorApp: React.FC<FullscreenUniversalEmulatorAppProps> = ({ onClose }) => {

  return (
    <div className="fixed inset-0 bg-gray-800 z-50 flex flex-col">
      <UniversalEmulatorApp onClose={onClose} isFullscreen={true} />
    </div>
  );
};

export default FullscreenUniversalEmulatorApp;