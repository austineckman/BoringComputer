import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import CircuitBuilder from '@/components/circuit-builder/CircuitBuilder';

const CircuitBuilderPage: React.FC = () => {
  return (
    <div className="h-full w-full overflow-hidden">
      <CircuitBuilder />
    </div>
  );
};

export default CircuitBuilderPage;
