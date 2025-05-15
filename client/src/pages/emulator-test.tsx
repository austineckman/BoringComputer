/**
 * emulator-test.tsx
 * 
 * A page to test the real AVR8 emulator.
 */

import React from 'react';
// @ts-ignore - Importing JSX file in TypeScript
import RealAVR8Test from '../components/circuit-builder/simulator/proper/RealAVR8Test';

const EmulatorTestPage = () => {
  return (
    <div className="emulator-test-page">
      <RealAVR8Test />
    </div>
  );
};

export default EmulatorTestPage;