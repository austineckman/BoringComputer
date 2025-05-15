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
  
  // Auto-scroll logs to bottom when new logs arrive
  useEffect(() => {
    const logConsole = document.getElementById('log-console');
    if (logConsole) {
      logConsole.scrollTop = logConsole.scrollHeight;
    }
  }, [logs]);
  
  // Format pin states for display
  const formatPinStates = useCallback(() => {
    // Initialize with default state for commonly used pins if they're not set
    const defaultPins = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 'A0', 'A1', 'A2', 'A3', 'A4', 'A5'];
    const allPinStates = { ...pinStates };
    
    // Add default state for pins that are not in the state
    defaultPins.forEach(pin => {
      if (!allPinStates[pin]) {
        allPinStates[pin] = { isHigh: false };
      }
    });
    
    // Sort pins numerically/alphabetically
    return Object.entries(allPinStates)
      .sort((a, b) => {
        // Convert pins to sortable values (numeric pins first, then analog pins)
        const pinA = isNaN(parseInt(a[0])) ? a[0] : parseInt(a[0]);
        const pinB = isNaN(parseInt(b[0])) ? b[0] : parseInt(b[0]);
        
        if (typeof pinA === 'number' && typeof pinB === 'number') {
          return pinA - pinB;
        } else if (typeof pinA === 'number') {
          return -1;
        } else if (typeof pinB === 'number') {
          return 1;
        } else {
          return pinA.localeCompare(pinB);
        }
      })
      .map(([pin, state]) => {
        const isHigh = state.isHigh || false;
        const analogValue = state.analogValue;
        
        // Create a special visualization for certain pins
        let extraInfo = '';
        if (pin === '13') {
          extraInfo = isHigh ? ' (LED ON)' : ' (LED OFF)';
        } else if (analogValue !== undefined) {
          extraInfo = ` (PWM: ${analogValue})`;
        }
        
        return (
          <div key={pin} className="pin-state">
            <span className="pin-number">Pin {pin}:</span>
            <span 
              className={`pin-value ${isHigh ? 'high' : 'low'}`}
              data-pin={pin}
            >
              {isHigh ? 'HIGH' : 'LOW'}
              {extraInfo}
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
              {serialOutput.length > 0 ? (
                // Group serial output by lines for better readability
                serialOutput
                  .reduce((lines, item) => {
                    // If the char is a newline or the first character, start a new line
                    if (item.char === '\n' || lines.length === 0) {
                      lines.push([]);
                    }
                    // Add the character to the current line (unless it's a newline)
                    if (item.char !== '\n') {
                      lines[lines.length - 1].push(item);
                    }
                    return lines;
                  }, [])
                  .map((line, lineIndex) => (
                    <div key={`line-${lineIndex}`} className="serial-line">
                      {line.map((item, charIndex) => (
                        <span key={`char-${lineIndex}-${charIndex}`}>
                          {item.char}
                        </span>
                      ))}
                    </div>
                  ))
              ) : (
                <div className="serial-line empty">
                  No serial output yet...
                </div>
              )}
            </div>
          </div>
          
          <div className="logs">
            <h3>Logs:</h3>
            <div className="log-console" id="log-console">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <div key={log.id} className="log-line">
                    {log.message}
                  </div>
                ))
              ) : (
                <div className="log-line empty">
                  No logs yet...
                </div>
              )}
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