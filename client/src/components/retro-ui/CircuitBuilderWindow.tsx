import React, { useState, useRef, useEffect } from 'react';
import { X, RotateCcw, Trash2, ZoomIn, ZoomOut, Move, Play, Save, FileCode, Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

// Import our CircuitBuilder component
import CircuitBuilder from '../circuit-builder/CircuitBuilder';
import ExampleManager from '../circuit-builder/ExampleManager';
import ExampleSelector from '../circuit-builder/ExampleSelector';

interface CircuitBuilderWindowProps {
  onClose: () => void;
}

// Default Arduino code for new projects - Basic Blink Example
const defaultCode = `// Basic LED Blink Example
// This is the classic "Hello World" program for Arduino
// The built-in LED on pin 13 will blink on and off

const int ledPin = 13;  // Built-in LED on pin 13

void setup() {
  // Initialize the digital pin as an output
  pinMode(ledPin, OUTPUT);
}

void loop() {
  digitalWrite(ledPin, HIGH);   // Turn on the LED
  delay(1000);                  // Wait for a second
  digitalWrite(ledPin, LOW);    // Turn off the LED
  delay(1000);                  // Wait for a second
}

/* 
  Common Arduino functions:
  
  - digitalWrite(pin, value): Sets a digital pin to HIGH or LOW
  - digitalRead(pin): Reads a digital pin, returns HIGH or LOW
  - analogWrite(pin, value): Sets an analog value (PWM) on a pin (0-255)
  - analogRead(pin): Reads an analog input, returns 0-1023
  - delay(ms): Pauses program execution for 'ms' milliseconds
  - millis(): Returns time since program started in milliseconds
  
  Available libraries (include with #include <LibraryName.h>):
  
  - U8g2lib.h: For OLED displays
  - TM1637Display.h: For 7-segment displays 
  - Keypad.h: For matrix keypads
  - BasicEncoder.h: For rotary encoders
*/`;

const CircuitBuilderWindow: React.FC<CircuitBuilderWindowProps> = ({ onClose }) => {
  // Circuit state
  const [components, setComponents] = useState<any[]>([]);
  const [wires, setWires] = useState<any[]>([]);
  const [code, setCode] = useState(defaultCode);
  
  // Fetch current user for founder access
  const { data: currentUser } = useQuery({
    queryKey: ['/api/auth/me'],
    retry: false,
  });

  // Example loading handler
  const handleLoadExample = (example: any) => {
    if (example.circuit?.components) {
      setComponents(example.circuit.components);
    }
    if (example.circuit?.wires) {
      setWires(example.circuit.wires);
    }
    if (example.code) {
      setCode(example.code);
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-gray-800 text-white overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-900 p-2 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <img 
            src="/@fs/home/runner/workspace/attached_assets/led.icon.png" 
            alt="Sandbox" 
            className="h-6 mr-2" 
          />
          <h2 className="text-lg font-bold">Circuit Builder</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={onClose}
            className="bg-gray-700 px-2 py-1 rounded hover:bg-gray-600"
            title="Close Circuit Builder"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Example buttons along the top */}
      <div className="bg-gray-800 border-b border-gray-700 p-2 flex items-center space-x-2 overflow-x-auto">
        <ExampleSelector onLoadExample={handleLoadExample} />
        {currentUser?.roles?.includes('Founder') && (
          <ExampleManager
            components={components}
            wires={wires}
            code={code}
            onLoadExample={handleLoadExample}
            currentUser={currentUser}
          />
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Circuit Builder Area */}
        <div className="flex-1 flex flex-col">
          {/* Circuit Canvas */}
          <div className="flex-1 bg-gray-800 overflow-hidden">
            <CircuitBuilder />
          </div>

          {/* Code Editor */}
          <div className="h-80 bg-gray-900 border-t border-gray-700">
            <div className="p-2 bg-gray-800 border-b border-gray-700">
              <h3 className="text-sm font-semibold">Arduino Code</h3>
            </div>
            <div className="h-full p-4">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-full bg-gray-800 text-white border border-gray-600 rounded p-2 font-mono text-sm resize-none"
                placeholder="Write your Arduino code here..."
                spellCheck={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircuitBuilderWindow;