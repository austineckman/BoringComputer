import React from 'react';
import SimpleEmulator from '../components/circuit-builder/emulator/SimpleEmulator';

/**
 * A clean page that just displays our new emulator
 */
const CleanEmulatorPage: React.FC = () => {
  return (
    <div className="emulator-page">
      <SimpleEmulator onClose={() => window.history.back()} />
    </div>
  );
};

export default CleanEmulatorPage;