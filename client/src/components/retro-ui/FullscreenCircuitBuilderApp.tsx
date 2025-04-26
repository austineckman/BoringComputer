import React from 'react';
import CircuitBuilderWindow from './CircuitBuilderWindow';

const FullscreenCircuitBuilderApp: React.FC = () => {
  return (
    <div className="fullscreen-app h-screen w-screen bg-gray-900 flex flex-col">
      <CircuitBuilderWindow />
    </div>
  );
};

export default FullscreenCircuitBuilderApp;