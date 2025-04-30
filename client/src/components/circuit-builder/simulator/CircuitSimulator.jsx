import React, { useState, useEffect } from 'react';
import CodeEditor from './CodeEditor';
import AVR8Simulator from './AVR8Simulator';

/**
 * CircuitSimulator component - Provides circuit simulation functionality
 * with Arduino code editing and execution
 */
const CircuitSimulator = ({ components, wires, onComponentStateChange, isVisible }) => {
  // State for code editor and simulator
  const [code, setCode] = useState(`// Arduino code for circuit simulation
void setup() {
  // Set up pins
  pinMode(13, OUTPUT); // Built-in LED
  
  // Add your setup code here
}

void loop() {
  // Basic blink example
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
  
  // Add your loop code here
}
`);
  
  const [isRunning, setIsRunning] = useState(false);
  const [simOutput, setSimOutput] = useState([]);
  
  // Map component pins to Arduino pins
  const getArduinoPinMapping = () => {
    // Create a mapping between component pins and Arduino pins
    const pinMapping = {};
    
    // Process wire connections
    wires.forEach(wire => {
      const source = wire.sourceId;
      const target = wire.targetId;
      
      // Find component IDs from pin IDs
      const sourceCompId = source.split('-')[0];
      const targetCompId = target.split('-')[0];
      
      // Get pin numbers
      const sourcePin = source.split('-')[1];
      const targetPin = target.split('-')[1];
      
      // If one of the components is a hero board, create a mapping
      if (sourceCompId.includes('heroboard')) {
        pinMapping[sourcePin] = target;
      } else if (targetCompId.includes('heroboard')) {
        pinMapping[targetPin] = source;
      }
    });
    
    return pinMapping;
  };
  
  // Handle simulation pin state changes
  const handlePinStateChange = (pinStates) => {
    if (!isRunning) return;
    
    // Map Arduino pin states to component states
    const pinMapping = getArduinoPinMapping();
    const componentStates = {};
    
    // Process pin states from the simulation
    Object.entries(pinStates).forEach(([pin, state]) => {
      // If this Arduino pin is connected to a component
      const connectedComponentPin = pinMapping[pin];
      if (connectedComponentPin) {
        // Get component ID from pin ID
        const componentId = connectedComponentPin.split('-')[0];
        
        // Set component state (e.g., LED on/off)
        componentStates[componentId] = state === 1;
      }
    });
    
    // Notify parent component about state changes
    if (onComponentStateChange) {
      onComponentStateChange(componentStates);
    }
    
    // Add to simulation output log
    setSimOutput(prev => [...prev, {
      time: new Date().toISOString(),
      type: 'pin',
      message: `Pin states updated: ${JSON.stringify(pinStates)}`
    }]);
  };
  
  // Simulator log output handler
  const handleSimulatorLog = (message, type = 'info') => {
    setSimOutput(prev => [...prev, {
      time: new Date().toISOString(),
      type,
      message
    }]);
  };
  
  // Start or stop simulation
  const toggleSimulation = () => {
    const newState = !isRunning;
    setIsRunning(newState);
    
    if (newState) {
      handleSimulatorLog('Simulation started');
    } else {
      handleSimulatorLog('Simulation stopped');
    }
  };
  
  // Reset simulation
  const resetSimulation = () => {
    setIsRunning(false);
    setSimOutput([]);
    handleSimulatorLog('Simulation reset');
  };
  
  // Clear output log
  const clearOutput = () => {
    setSimOutput([]);
  };
  
  // Handle code changes
  const handleCodeChange = (newCode) => {
    setCode(newCode);
  };
  
  // Compile the code
  const compileCode = () => {
    handleSimulatorLog('Compiling code...');
    // In a full implementation, this would compile the Arduino code
    // For now, we'll just simulate compiling by adding a delay
    setTimeout(() => {
      handleSimulatorLog('Compilation successful!');
      setIsRunning(true);
    }, 1000);
  };
  
  return (
    <div className="circuit-simulator-container">
      <div className="simulator-header">
        <h3 className="simulator-title">Circuit Simulator</h3>
        <div className="simulator-controls">
          <button 
            onClick={toggleSimulation}
            className={`control-button ${isRunning ? 'stop' : 'start'}`}
          >
            {isRunning ? 'Stop' : 'Start'}
          </button>
          <button 
            onClick={resetSimulation}
            className="control-button reset"
            disabled={isRunning}
          >
            Reset
          </button>
          <button 
            onClick={compileCode}
            className="control-button compile"
            disabled={isRunning}
          >
            Compile & Run
          </button>
        </div>
      </div>
      
      <div className="simulator-content">
        <div className="code-editor-container">
          <CodeEditor 
            code={code} 
            onChange={handleCodeChange}
            readOnly={isRunning}
          />
        </div>
        
        <div className="simulation-container">
          <div className="output-container">
            <div className="output-header">
              <h4>Simulation Output</h4>
              <button 
                onClick={clearOutput}
                className="clear-output-button"
              >
                Clear
              </button>
            </div>
            <div className="output-content">
              {simOutput.map((entry, index) => (
                <div 
                  key={index}
                  className={`output-line output-${entry.type}`}
                >
                  <span className="output-time">
                    {new Date(entry.time).toLocaleTimeString()}
                  </span>
                  <span className="output-message">
                    {entry.message}
                  </span>
                </div>
              ))}
              {simOutput.length === 0 && (
                <div className="output-empty">
                  No output yet. Start the simulation to see results.
                </div>
              )}
            </div>
          </div>
          
          <AVR8Simulator
            code={code}
            isRunning={isRunning}
            onPinStateChange={handlePinStateChange}
            onLog={handleSimulatorLog}
          />
        </div>
      </div>
    </div>
  );
};

export default CircuitSimulator;