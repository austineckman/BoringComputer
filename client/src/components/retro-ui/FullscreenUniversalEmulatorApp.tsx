import React from 'react';
import MinimalEmulator from '../circuit-builder/emulator/MinimalEmulator';

interface FullscreenUniversalEmulatorAppProps {
  onClose: () => void;
}

/**
 * Fullscreen Universal Emulator App
 * This component creates a fullscreen version of the emulator
 * with a layout matching the Sandbox application.
 * 
 * NOTE: Using MinimalEmulator - a completely standalone implementation
 * that guarantees a working LED and logs display
 */
const FullscreenUniversalEmulatorApp: React.FC<FullscreenUniversalEmulatorAppProps> = ({ onClose }) => {
  return (
    <MinimalEmulator onClose={onClose} />
  );
};

export default FullscreenUniversalEmulatorApp;