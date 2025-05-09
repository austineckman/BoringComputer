import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { SimulatorProvider } from '@/components/circuit-builder/simulator/SimulatorContext';
import { LibraryManagerProvider } from '@/components/circuit-builder/simulator/LibraryManager';
import OLEDTest from '@/components/circuit-builder/tests/OLEDTest';

const OLEDTestPage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">OLED Parser Test</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <SimulatorProvider>
            <LibraryManagerProvider>
              <OLEDTest />
            </LibraryManagerProvider>
          </SimulatorProvider>
        </div>
        
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h2 className="text-xl font-bold mb-4">About This Test</h2>
          <p className="mb-2">
            This page tests the OLED display command parser and renderer. It demonstrates how Arduino code
            with OLED commands is parsed and executed to create a visual output on the simulated display.
          </p>
          <p>
            You can select different example sketches from the dropdown to see how various OLED commands
            are interpreted and rendered.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default OLEDTestPage;