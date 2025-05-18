import React from 'react';
import BasicEmulator from '../circuit-builder/BasicEmulator';

interface FullscreenUniversalEmulatorAppProps {
  onClose: () => void;
}

/**
 * Fullscreen Universal Emulator App
 * This component creates a fullscreen version of the emulator
 * with a layout matching the Sandbox application.
 * 
 * Now using the completely standalone BasicEmulator which has no dependencies
 * on the other problematic emulator code.
 */
const FullscreenUniversalEmulatorApp: React.FC<FullscreenUniversalEmulatorAppProps> = ({ onClose }) => {
  return (
    <BasicEmulator onClose={onClose} />
  );
};

export default FullscreenUniversalEmulatorApp;