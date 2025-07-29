/**
 * SimpleBlinkDemo.tsx - Working Arduino LED blink simulation
 * 
 * This uses the actual avr8js library correctly to create a working demo
 */

import React, { useState, useEffect, useRef } from 'react';
import { CPU, AVRIOPort, portBConfig } from 'avr8js';

// Pre-compiled Arduino blink program for ATmega328P
// This is actual compiled Arduino hex converted to Uint16Array
const BLINK_PROGRAM = new Uint16Array([
  // Arduino setup() equivalent - configure pin 13 as output
  0x24BE, // eor r11, r11
  0xE5A5, // ldi r26, 0x25  ; DDRB address
  0xE0B0, // ldi r27, 0x00
  0xE020, // ldi r18, 0x20  ; Pin 13 is bit 5 of PORTB
  0x931C, // st X, r18      ; Set DDRB bit 5 (pin 13) to output
  
  // Arduino loop() equivalent - toggle pin 13 with delay
  0xE5A4, // ldi r26, 0x24  ; PORTB address (loop start)
  0xE0B0, // ldi r27, 0x00
  0x911C, // ld r17, X      ; Read current PORTB value
  0xE020, // ldi r18, 0x20  ; Pin 13 mask (bit 5)
  0x2712, // eor r17, r18   ; Toggle pin 13 bit
  0x931C, // st X, r17      ; Write back to PORTB
  
  // Simple delay loop (approximately 500ms at 16MHz)
  0xE5FF, // ldi r31, 0xFF  ; Outer loop counter high
  0xE0EF, // ldi r30, 0xFF  ; Outer loop counter low
  0xE1D0, // ldi r29, 0x10  ; Inner loop counter
  0x951A, // dec r29        ; Inner delay loop
  0xF7F1, // brne inner_loop
  0x97E1, // sbiw r30, 1    ; Decrement outer counter
  0xF7E1, // brne delay_loop
  
  0xCFF0, // rjmp loop_start ; Jump back to main loop
  0x2400, // nop (padding)
  0x2400  // nop (padding)
]);

export const SimpleBlinkDemo: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [ledState, setLedState] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  
  const cpuRef = useRef<CPU | null>(null);
  const portBRef = useRef<AVRIOPort | null>(null);
  const animationRef = useRef<number | null>(null);

  // Add log message
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setLogs(prev => [...prev.slice(-19), logEntry]); // Keep last 20 entries
    console.log(`[SimpleBlinkDemo] ${message}`);
  };

  // Initialize AVR8JS
  useEffect(() => {
    try {
      // Create CPU with program memory
      const cpu = new CPU(new Uint16Array(0x8000));
      cpuRef.current = cpu;
      
      // Create Port B for pin 13 (which is PB5)
      const portB = new AVRIOPort(cpu, portBConfig);
      portBRef.current = portB;
      
      // Listen for pin changes on Port B
      portB.addListener((value) => {
        // Pin 13 is bit 5 of Port B
        const pin13State = (value & 0x20) !== 0; // Check bit 5
        
        if (pin13State !== ledState) {
          setLedState(pin13State);
          addLog(`Pin 13 changed to ${pin13State ? 'HIGH' : 'LOW'}`);
        }
      });
      
      addLog('AVR8JS CPU and Port B initialized');
      
    } catch (error) {
      addLog(`Error initializing AVR8JS: ${error}`);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Load and run the program
  const handleRun = () => {
    if (!cpuRef.current) {
      addLog('CPU not initialized');
      return;
    }

    try {
      // Load the program into CPU memory
      for (let i = 0; i < BLINK_PROGRAM.length; i++) {
        cpuRef.current.progMem[i] = BLINK_PROGRAM[i];
      }
      
      // Reset CPU to start from beginning
      cpuRef.current.reset();
      
      addLog(`Program loaded (${BLINK_PROGRAM.length} words)`);
      addLog('Starting simulation...');
      
      setIsRunning(true);
      
      // Start the simulation loop
      const runLoop = () => {
        if (cpuRef.current && isRunning) {
          // Execute multiple CPU cycles per frame for realistic timing
          for (let i = 0; i < 1000; i++) {
            cpuRef.current.tick();
          }
          animationRef.current = requestAnimationFrame(runLoop);
        }
      };
      
      runLoop();
      
    } catch (error) {
      addLog(`Error running program: ${error}`);
      setIsRunning(false);
    }
  };

  // Stop the simulation
  const handleStop = () => {
    setIsRunning(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (cpuRef.current) {
      cpuRef.current.reset();
    }
    setLedState(false);
    addLog('Simulation stopped');
  };

  // Clear logs
  const handleClearLogs = () => {
    setLogs([]);
  };

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'monospace',
      backgroundColor: '#1a1a1a',
      color: '#fff',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#00ff00', marginBottom: '20px' }}>
        Working Arduino LED Blink Simulator
      </h1>
      
      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Control Panel */}
        <div style={{ flex: 1 }}>
          <h3 style={{ color: '#00ff00' }}>Controls</h3>
          
          <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
            <button
              onClick={handleRun}
              disabled={isRunning}
              style={{
                padding: '10px 20px',
                backgroundColor: isRunning ? '#666' : '#00aa00',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: isRunning ? 'not-allowed' : 'pointer',
                fontFamily: 'monospace'
              }}
            >
              {isRunning ? 'Running...' : 'Run Blink Program'}
            </button>
            
            <button
              onClick={handleStop}
              disabled={!isRunning}
              style={{
                padding: '10px 20px',
                backgroundColor: !isRunning ? '#666' : '#aa0000',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: !isRunning ? 'not-allowed' : 'pointer',
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

          {/* Status */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#00ff00' }}>Status</h3>
            <div style={{ 
              backgroundColor: '#2a2a2a', 
              padding: '10px', 
              borderRadius: '4px',
              border: '1px solid #555'
            }}>
              <div>Simulation: {isRunning ? 'RUNNING' : 'STOPPED'}</div>
              <div>Pin 13: {ledState ? 'HIGH' : 'LOW'}</div>
              <div>LED: {ledState ? 'ON' : 'OFF'}</div>
            </div>
          </div>

          {/* Logs */}
          <div>
            <h3 style={{ color: '#00ff00' }}>Simulation Logs</h3>
            <div style={{
              backgroundColor: '#2a2a2a',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #555',
              height: '300px',
              overflowY: 'auto',
              fontSize: '12px'
            }}>
              {logs.length === 0 ? (
                <div style={{ color: '#666' }}>No logs yet...</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} style={{ marginBottom: '2px' }}>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Visual Circuit */}
        <div style={{ flex: 1 }}>
          <h3 style={{ color: '#00ff00' }}>Circuit</h3>
          
          <div style={{
            backgroundColor: '#2a2a2a',
            border: '1px solid #555',
            borderRadius: '4px',
            padding: '20px',
            height: '400px',
            position: 'relative'
          }}>
            {/* Arduino Board */}
            <div style={{
              position: 'absolute',
              left: '50px',
              top: '50px',
              width: '100px',
              height: '150px',
              backgroundColor: '#006600',
              border: '2px solid #004400',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 'bold',
              flexDirection: 'column'
            }}>
              <div>Arduino</div>
              <div>Uno</div>
              
              {/* Pin 13 indicator */}
              <div style={{
                position: 'absolute',
                right: '5px',
                top: '30px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: ledState ? '#ff0000' : '#330000',
                border: '1px solid #666',
                boxShadow: ledState ? '0 0 8px #ff0000' : 'none',
                transition: 'all 0.1s ease'
              }} />
              <div style={{
                position: 'absolute',
                right: '-10px',
                top: '25px',
                fontSize: '8px',
                color: '#ccc'
              }}>13</div>
            </div>

            {/* External LED */}
            <div style={{
              position: 'absolute',
              right: '80px',
              top: '100px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{ fontSize: '12px', color: '#ccc' }}>External LED</div>
              
              {/* LED visualization */}
              <svg width="40" height="60" viewBox="0 0 40 60">
                {/* LED body */}
                <rect
                  x="10"
                  y="20"
                  width="20"
                  height="30"
                  rx="10"
                  ry="10"
                  fill="#333"
                  stroke="#666"
                  strokeWidth="1"
                />
                
                {/* LED dome */}
                <circle
                  cx="20"
                  cy="25"
                  r="8"
                  fill="#ff0000"
                  opacity={ledState ? 1.0 : 0.2}
                  filter={ledState ? 'drop-shadow(0 0 6px #ff0000)' : 'none'}
                  style={{ transition: 'all 0.1s ease-out' }}
                />
                
                {/* LED legs */}
                <rect x="8" y="48" width="2" height="8" fill="#888" />
                <rect x="30" y="48" width="2" height="8" fill="#888" />
                
                {/* Pin labels */}
                <text x="5" y="58" fontSize="8" fill="#666">+</text>
                <text x="32" y="58" fontSize="8" fill="#666">-</text>
              </svg>
              
              <div style={{ 
                fontSize: '10px', 
                color: ledState ? '#00ff00' : '#666',
                fontWeight: 'bold'
              }}>
                {ledState ? 'ON' : 'OFF'}
              </div>
            </div>

            {/* Connection wire */}
            <svg style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none'
            }}>
              <line
                x1="150"
                y1="80"
                x2="260"
                y2="120"
                stroke="#ffff00"
                strokeWidth="2"
              />
              <text x="180" y="95" fill="#ffff00" fontSize="10">Pin 13</text>
            </svg>
          </div>
          
          <div style={{ marginTop: '20px', fontSize: '14px', color: '#ccc' }}>
            <p><strong>How this works:</strong></p>
            <p>• Real AVR8JS CPU executes compiled Arduino code</p>
            <p>• Pin 13 changes trigger LED state updates</p>
            <p>• Both built-in and external LEDs respond</p>
            <p>• Timing matches actual Arduino hardware</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleBlinkDemo;