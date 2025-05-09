import React, { useState, useEffect } from 'react';
import { parseOLEDCommands, executeOLEDCommands } from '../simulator/OLEDCommandParser';
import { OLED_EXAMPLES } from '../simulator/examples/oled-examples';

/**
 * Test component for OLED command parser and executor
 */
const OLEDTest = () => {
  const [code, setCode] = useState(OLED_EXAMPLES.MINIMAL);
  const [parsedCommands, setParsedCommands] = useState(null);
  const [buffer, setBuffer] = useState(null);
  const [selectedExample, setSelectedExample] = useState('MINIMAL');
  
  // Parse code and update buffer when code changes
  useEffect(() => {
    // Parse the code
    const parsed = parseOLEDCommands(code);
    setParsedCommands(parsed);
    
    // Execute commands to get buffer
    if (parsed) {
      const displayBuffer = executeOLEDCommands(parsed, 128, 64);
      setBuffer(displayBuffer);
    }
  }, [code]);
  
  // Change example code
  const handleExampleChange = (e) => {
    const exampleKey = e.target.value;
    setSelectedExample(exampleKey);
    setCode(OLED_EXAMPLES[exampleKey]);
  };
  
  // Render buffer to canvas
  useEffect(() => {
    const canvas = document.getElementById('oled-test-canvas');
    if (canvas && buffer) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#29B6F6'; // OLED blue color
      const pixelSize = Math.min(
        canvas.width / 128,
        canvas.height / 64
      );
      
      // Draw pixels from buffer
      for (let y = 0; y < 64; y++) {
        for (let x = 0; x < 128; x++) {
          if (buffer[y][x]) {
            ctx.fillRect(
              x * pixelSize,
              y * pixelSize,
              pixelSize,
              pixelSize
            );
          }
        }
      }
    }
  }, [buffer]);
  
  return (
    <div className="oled-test p-4 bg-gray-900 rounded-lg shadow-lg text-white">
      <h2 className="text-xl font-bold mb-4">OLED Command Parser Test</h2>
      
      <div className="mb-4">
        <label className="block mb-2">Select Example:</label>
        <select 
          className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded"
          value={selectedExample}
          onChange={handleExampleChange}
        >
          {Object.keys(OLED_EXAMPLES).map(key => (
            <option key={key} value={key}>
              {key.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-medium mb-2">OLED Display Rendering</h3>
          <div className="border border-gray-700 rounded bg-black">
            <canvas 
              id="oled-test-canvas" 
              width="128" 
              height="64" 
              className="w-full"
              style={{ width: '100%', height: '200px', objectFit: 'contain' }}
            />
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Parsed Commands</h3>
          <pre className="bg-gray-800 p-2 rounded text-xs font-mono overflow-auto max-h-48">
            {parsedCommands ? JSON.stringify(parsedCommands, null, 2) : 'No commands parsed'}
          </pre>
        </div>
      </div>
      
      <div className="mt-4">
        <h3 className="font-medium mb-2">OLED Code</h3>
        <pre className="bg-gray-800 p-2 rounded text-xs font-mono overflow-auto max-h-48">
          {code}
        </pre>
      </div>
    </div>
  );
};

export default OLEDTest;