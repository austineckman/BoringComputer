/**
 * emulator-test.tsx
 * 
 * A page to test the Arduino emulator.
 */

import React from 'react';
import WorkingEmulator from '../components/circuit-builder/emulator/WorkingEmulator';

const EmulatorTestPage = () => {
  return (
    <div className="emulator-test-page">
      <WorkingEmulator />
    </div>
  );
};

export default EmulatorTestPage;