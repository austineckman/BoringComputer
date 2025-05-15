/**
 * RealAVR8Test.jsx
 * 
 * A test component to verify the real AVR8 emulator implementation.
 * This component provides a simple UI to test the functionality of the emulator.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { RealAVR8Emulator } from './RealAVR8Emulator';
import { RealSimulatorProvider, useRealSimulator } from '../RealSimulatorContext';
import './RealAVR8Test.css';

// Default Arduino code for testing
const DEFAULT_CODE = `
void setup() {
  // Initialize pins
  pinMode(13, OUTPUT); // Built-in LED
  pinMode(10, OUTPUT); // Green LED (RGB)
  
  // Initialize serial communication
  Serial.begin(9600);
  Serial.println("Arduino initialized");
}

void loop() {
  // Blink the built-in LED
  digitalWrite(13, HIGH);
  Serial.println("LED ON");
  delay(1000);
  digitalWrite(13, LOW);
  Serial.println("LED OFF");
  delay(1000);
  
  // Pulse the green LED with PWM
  for (int i = 0; i < 255; i++) {
    analogWrite(10, i);
    delay(5);
  }
  for (int i = 255; i > 0; i--) {
    analogWrite(10, i);
    delay(5);
  }
}
`;

/**
 * The emulator test UI component
 */
const EmulatorTestUI = () => {
  const {
    code,
    setCode,
    isRunning,
    toggleSimulation,
    compilationStatus,
    serialOutput,
    pinStates,
    logs,
    setDigitalInput
  } = useRealSimulator();
  
  // Initialize with default code
  useEffect(() => {
    setCode(DEFAULT_CODE);
  }, [setCode]);
  
  // Format pin states for display
  const formatPinStates = useCallback(() => {
    return Object.entries(pinStates).map(([pin, state]) => {
      const { isHigh, analogValue } = state;
      return (
        <div key={pin} className="pin-state">
          <span className="pin-number">Pin {pin}:</span>
          <span className={`pin-value ${isHigh ? 'high' : 'low'}`}>
            {isHigh ? 'HIGH' : 'LOW'}
            {analogValue !== undefined && ` (${analogValue})`}
          </span>
        </div>
      );
    });
  }, [pinStates]);
  
  return (
    <div className="emulator-test-ui">
      <h1>Real AVR8 Emulator Test</h1>
      
      <div className="test-container">
        <div className="code-editor">
          <h2>Arduino Code</h2>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={isRunning}
            rows={20}
            cols={80}
          />
        </div>
        
        <div className="controls">
          <button 
            onClick={toggleSimulation}
            className={isRunning ? 'stop' : 'start'}
          >
            {isRunning ? 'Stop Simulation' : 'Start Simulation'}
          </button>
          
          <div className="compilation-status">
            <h3>Compilation Status:</h3>
            <div className={`status ${compilationStatus.status}`}>
              {compilationStatus.message}
            </div>
          </div>
        </div>
        
        <div className="output-section">
          <div className="pin-states">
            <h3>Pin States:</h3>
            <div className="pin-states-list">
              {formatPinStates()}
            </div>
          </div>
          
          <div className="serial-output">
            <h3>Serial Output:</h3>
            <div className="serial-console">
              {serialOutput.map((item, index) => (
                <div key={index} className="serial-line">
                  {item.char}
                </div>
              ))}
            </div>
          </div>
          
          <div className="logs">
            <h3>Logs:</h3>
            <div className="log-console">
              {logs.map((log) => (
                <div key={log.id} className="log-line">
                  {log.message}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="test-controls">
          <h3>Test Controls:</h3>
          <div className="test-buttons">
            <button onClick={() => setDigitalInput(2, true)}>
              Set Pin 2 HIGH
            </button>
            <button onClick={() => setDigitalInput(2, false)}>
              Set Pin 2 LOW
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * The main test component wrapped with the simulator provider
 */
const RealAVR8Test = () => {
  return (
    <RealSimulatorProvider>
      <EmulatorTestUI />
    </RealSimulatorProvider>
  );
};

export default RealAVR8Test;