import React from 'react';
import ReliableEmulator from '../circuit-builder/emulator/ReliableEmulator';

interface FullscreenUniversalEmulatorAppProps {
  onClose: () => void;
}

/**
 * Fullscreen Universal Emulator App
 * This component creates a fullscreen version of the emulator
 * with a layout matching the Sandbox application.
 * 
 * NOTE: This component now uses the new reliable emulator instead of
 * the problematic UniversalEmulatorApp.
 */
const FullscreenUniversalEmulatorApp: React.FC<FullscreenUniversalEmulatorAppProps> = ({ onClose }) => {
  return (
    <ReliableEmulator onClose={onClose} />
  );
};

export default FullscreenUniversalEmulatorApp;