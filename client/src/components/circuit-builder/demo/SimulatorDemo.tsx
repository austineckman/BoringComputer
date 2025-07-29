/**
 * SimulatorDemo.tsx - Proof of concept demo showing real Arduino simulation
 * 
 * This demonstrates the complete workflow:
 * 1. Arduino code compilation
 * 2. AVR8JS execution  
 * 3. Visual component updates
 * 4. Real-time simulation
 */

import React, { useState, useEffect, useRef } from 'react';
import { SimulatorEngine, ComponentConnection, SimulationState } from '../simulator/SimulatorEngine';
import SimulatedLED from '../components/SimulatedLED';

const DEFAULT_BLINK_CODE = `
// Basic Blink Example
void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}
`.trim();

export const SimulatorDemo: React.FC = () => {
  const [code, setCode] = useState(DEFAULT_BLINK_CODE);
  const [simulationState, setSimulationState] = useState<SimulationState | null>(null);
  const engineRef = useRef<SimulatorEngine | null>(null);
  const componentCallbacks = useRef<Map<string, (isHigh: boolean) => void>>(new Map());

  // Initialize the simulation engine
  useEffect(() => {
    engineRef.current = new SimulatorEngine();
    
    // Register for state updates
    engineRef.current.onStateUpdate((state) => {
      setSimulationState(state);
    });

    // Set initial state
    setSimulationState(engineRef.current.getState());

    return () => {
      if (engineRef.current) {
        engineRef.current.stop();
      }
    };
  }, []);

  // Handle component connection registration
  const handleComponentConnection = (componentId: string, pin: number, callback: (isHigh: boolean) => void) => {
    if (engineRef.current) {
      // Store the callback for later use
      componentCallbacks.current.set(componentId, callback);
      
      // Connect the component to the simulation engine
      const connection: ComponentConnection = {
        componentId,
        componentType: 'LED',
        arduinoPin: pin,
        onPinChange: callback
      };
      
      engineRef.current.connectComponent(connection);
    }
  };

  // Handle component disconnection
  const handleComponentDisconnection = (componentId: string) => {
    if (engineRef.current) {
      engineRef.current.disconnectComponent(componentId);
      componentCallbacks.current.delete(componentId);
    }
  };

  // Compile and run the code
  const handleRun = async () => {
    if (engineRef.current) {
      await engineRef.current.compileAndRun(code);
    }
  };

  // Stop the simulation
  const handleStop = () => {
    if (engineRef.current) {
      engineRef.current.stop();
    }
  };

  // Clear logs
  const handleClearLogs = () => {
    if (simulationState) {
      // Reset logs (this is a demo limitation - normally logs would persist)
      setSimulationState({
        ...simulationState,
        logs: []
      });
    }
  };

  return (
    <div className="simulator-demo" style={{ 
      display: 'flex', 
      height: '100vh', 
      fontFamily: 'monospace',
      backgroundColor: '#1a1a1a',
      color: '#fff'
    }}>
      {/* Left panel - Code editor and controls */}
      <div style={{ 
        width: '50%', 
        padding: '20px',
        borderRight: '1px solid #333'
      }}>
        <h2 style={{ marginBottom: '10px', color: '#00ff00' }}>Arduino Code</h2>
        
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{
            width: '100%',
            height: '300px',
            backgroundColor: '#2a2a2a',
            color: '#fff',
            border: '1px solid #555',
            padding: '10px',
            fontFamily: 'monospace',
            fontSize: '14px',
            resize: 'vertical'
          }}
          placeholder="Enter your Arduino code here..."
        />

        {/* Control buttons */}
        <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
          <button
            onClick={handleRun}
            disabled={simulationState?.isCompiling || simulationState?.isRunning}
            style={{
              padding: '10px 20px',
              backgroundColor: simulationState?.isRunning ? '#ff4444' : '#00aa00',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'monospace'
            }}
          >
            {simulationState?.isCompiling ? 'Compiling...' : 
             simulationState?.isRunning ? 'Running' : 'Run'}
          </button>
          
          <button
            onClick={handleStop}
            disabled={!simulationState?.isRunning}
            style={{
              padding: '10px 20px',
              backgroundColor: '#aa0000',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: simulationState?.isRunning ? 'pointer' : 'not-allowed',
              fontFamily: 'monospace'
            }}
          >
            Stop
          </button>
          
          <button
            onClick={handleClearLogs}
            style={{
              padding: '10px 20px',
              backgroundColor: '#555',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'monospace'
            }}
          >
            Clear Logs
          </button>
        </div>

        {/* Status display */}
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ color: '#00ff00' }}>Status</h3>
          <div style={{ 
            backgroundColor: '#2a2a2a', 
            padding: '10px', 
            borderRadius: '4px',
            border: '1px solid #555'
          }}>
            <div>Running: {simulationState?.isRunning ? 'YES' : 'NO'}</div>
            <div>Compiling: {simulationState?.isCompiling ? 'YES' : 'NO'}</div>
            <div>Connected Components: {simulationState?.components.length || 0}</div>
            <div>Pin 13 State: {simulationState?.pinStates[13] ? 'HIGH' : 'LOW'}</div>
          </div>
        </div>

        {/* Simulation logs */}
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ color: '#00ff00' }}>Simulation Logs</h3>
          <div style={{
            backgroundColor: '#2a2a2a',
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #555',
            height: '200px',
            overflowY: 'auto',
            fontSize: '12px'
          }}>
            {simulationState?.logs.map((log, index) => (
              <div key={index} style={{ marginBottom: '2px' }}>
                {log}
              </div>
            )) || <div style={{ color: '#666' }}>No logs yet...</div>}
          </div>
        </div>
      </div>

      {/* Right panel - Visual circuit */}
      <div style={{ 
        width: '50%', 
        padding: '20px',
        position: 'relative'
      }}>
        <h2 style={{ marginBottom: '20px', color: '#00ff00' }}>Circuit Simulation</h2>
        
        {/* Circuit canvas */}
        <div style={{
          width: '100%',
          height: '400px',
          backgroundColor: '#2a2a2a',
          border: '1px solid #555',
          borderRadius: '4px',
          position: 'relative'
        }}>
          {/* LED connected to pin 13 */}
          <SimulatedLED
            id="led-13"
            x={200}
            y={150}
            arduinoPin={13}
            color="#ff0000"
            onConnectionChange={handleComponentConnection}
            onDisconnect={handleComponentDisconnection}
          />
          
          {/* Arduino board representation */}
          <div style={{
            position: 'absolute',
            left: '50px',
            top: '100px',
            width: '80px',
            height: '120px',
            backgroundColor: '#006600',
            border: '2px solid #004400',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            Arduino
            <br />
            Uno
          </div>
          
          {/* Connection wire (visual only) */}
          <svg style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
          }}>
            <line
              x1="130"
              y1="140"
              x2="180"
              y2="150"
              stroke="#ffff00"
              strokeWidth="2"
            />
            <text x="140" y="135" fill="#ffff00" fontSize="10">Pin 13</text>
          </svg>
        </div>

        {/* Instructions */}
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ color: '#00ff00' }}>Instructions</h3>
          <div style={{ fontSize: '14px', color: '#ccc' }}>
            <p>1. Click "Run" to compile and execute the Arduino code</p>
            <p>2. Watch the LED respond to your code in real-time</p>
            <p>3. Modify the delay values to change blink speed</p>
            <p>4. Check the logs to see pin state changes</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulatorDemo;