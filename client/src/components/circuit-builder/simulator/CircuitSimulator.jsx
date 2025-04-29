import React, { useState, useEffect } from 'react';
import AVR8Simulator from './AVR8Simulator';
import CodeEditor from './CodeEditor';

/**
 * Circuit Simulator Component
 * 
 * This component integrates the code editor and the AVR8 simulator
 * to provide a complete circuit simulation experience
 */
const CircuitSimulator = ({
  components,
  wires,
  onComponentStateChange,
  isVisible = false 
}) => {
  const [code, setCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [compilationError, setCompilationError] = useState(null);
  const [simulationHistory, setSimulationHistory] = useState([]);

  // Handle code change
  const handleCodeChange = (newCode) => {
    setCode(newCode);
  };

  // Handle compilation
  const handleCompile = () => {
    // Basic syntax validation (just a simple example)
    if (code.includes('setup()') && code.includes('loop()')) {
      setCompilationError(null);
      console.log('Compilation successful!');
      return true;
    } else {
      setCompilationError('Arduino code must include setup() and loop() functions.');
      return false;
    }
  };

  // Handle run/stop simulation
  const handleRun = () => {
    if (isRunning) {
      // Stop simulation
      setIsRunning(false);
    } else {
      // Compile and run if compilation is successful
      const compileSuccess = handleCompile();
      if (compileSuccess) {
        setIsRunning(true);
        
        // Add entry to simulation history
        const timestamp = new Date().toLocaleTimeString();
        setSimulationHistory([
          ...simulationHistory,
          {
            timestamp,
            event: 'Started simulation',
            status: 'success'
          }
        ]);
      }
    }
  };

  // Handle save code
  const handleSave = () => {
    console.log('Saving code:', code);
    // In a real implementation, this would save the code to storage
    
    // Add entry to simulation history
    const timestamp = new Date().toLocaleTimeString();
    setSimulationHistory([
      ...simulationHistory,
      {
        timestamp,
        event: 'Saved code',
        status: 'info'
      }
    ]);
  };

  // Handle pin state changes from simulator
  const handlePinStateChange = (newPinStates) => {
    // Map pin states to component states
    // This function would update the visual state of components based on pin states
    if (onComponentStateChange) {
      // Example mapping (this should be adapted to your component model)
      const componentStates = {};
      
      // Iterate through components and update their states based on pin connections
      Object.values(components).forEach(component => {
        if (!component || !component.id) return;
        
        const componentId = component.id;
        let newState = false;
        
        // Find connected pins
        Object.entries(wires).forEach(([wireId, wire]) => {
          // Check if this wire connects to the component
          if (wire.from?.componentId === componentId) {
            const connectedPin = wire.to?.pinId;
            if (connectedPin && newPinStates[connectedPin]) {
              newState = newPinStates[connectedPin] === 1;
            }
          } else if (wire.to?.componentId === componentId) {
            const connectedPin = wire.from?.pinId;
            if (connectedPin && newPinStates[connectedPin]) {
              newState = newPinStates[connectedPin] === 1;
            }
          }
        });
        
        // Update component state
        componentStates[componentId] = newState;
      });
      
      // Notify parent component
      onComponentStateChange(componentStates);
      
      // Add significant state changes to history
      const timestamp = new Date().toLocaleTimeString();
      const pinChanges = Object.entries(newPinStates)
        .filter(([pin, state]) => state === 1)
        .map(([pin]) => `Pin ${pin}`)
        .join(', ');
      
      if (pinChanges) {
        setSimulationHistory(prev => {
          // Limit history to 50 entries
          const newHistory = [
            ...prev,
            {
              timestamp,
              event: `HIGH signal on ${pinChanges}`,
              status: 'info'
            }
          ];
          
          if (newHistory.length > 50) {
            return newHistory.slice(-50);
          }
          return newHistory;
        });
      }
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="circuit-simulator">
      <div className="simulator-header">
        <h2>Circuit Simulator</h2>
        <div className="simulator-controls">
          <button 
            className={`simulator-control ${isRunning ? 'running' : ''}`}
            onClick={handleRun}
          >
            {isRunning ? 'Stop Simulation' : 'Start Simulation'}
          </button>
        </div>
      </div>
      
      <div className="simulator-content">
        <div className="simulator-code-section">
          <CodeEditor 
            initialCode={code}
            onChange={handleCodeChange}
            onSave={handleSave}
            onCompile={handleCompile}
            onRun={handleRun}
            isRunning={isRunning}
            compilationError={compilationError}
          />
        </div>
        
        <div className="simulator-results-section">
          <div className="simulator-status">
            {isRunning ? (
              <div className="status-running">Simulation Running</div>
            ) : (
              <div className="status-idle">Simulation Idle</div>
            )}
          </div>
          
          <div className="simulator-history">
            <h3>Simulation Log</h3>
            <div className="history-items">
              {simulationHistory.length === 0 ? (
                <div className="no-history">No simulation events yet</div>
              ) : (
                simulationHistory.map((item, index) => (
                  <div key={index} className={`history-item ${item.status}`}>
                    <span className="timestamp">{item.timestamp}</span>
                    <span className="event">{item.event}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Hidden AVR8 simulator component - no UI but handles the actual simulation */}
      <AVR8Simulator
        code={code}
        isRunning={isRunning}
        components={components}
        wires={wires}
        onPinStateChange={handlePinStateChange}
      />
    </div>
  );
};

export default CircuitSimulator;