import React, { useState, useEffect } from 'react';
import { OLED_EXAMPLES } from '../simulator/examples/oled-examples';
import { useSimulator } from '../simulator/SimulatorContext';

/**
 * OLED Tester Component
 * Allows testing of OLED displays with different example codes
 */
const OLEDTester = () => {
  const { setCode, isRunning, startSimulation, stopSimulation } = useSimulator();
  const [selectedExample, setSelectedExample] = useState('MINIMAL');
  const [isTesting, setIsTesting] = useState(false);
  
  // Load example code when selected
  const loadExample = () => {
    const example = OLED_EXAMPLES[selectedExample];
    if (example) {
      setCode(example);
      console.log(`Loaded ${selectedExample} example`);
    }
  };
  
  // Start/stop testing
  const toggleTesting = () => {
    if (isTesting) {
      stopSimulation();
      setIsTesting(false);
    } else {
      loadExample();
      startSimulation();
      setIsTesting(true);
    }
  };
  
  // Handle example selection
  const handleExampleChange = (e) => {
    setSelectedExample(e.target.value);
    if (isTesting) {
      const example = OLED_EXAMPLES[e.target.value];
      if (example) {
        setCode(example);
        console.log(`Switched to ${e.target.value} example`);
      }
    }
  };
  
  // Sync testing state with simulator state
  useEffect(() => {
    setIsTesting(isRunning);
  }, [isRunning]);
  
  return (
    <div className="oled-tester p-4 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">OLED Display Tester</h2>
      
      <div className="mb-4">
        <label className="block mb-2 font-medium">Example Code:</label>
        <select 
          className="w-full p-2 border rounded"
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
      
      <div className="flex space-x-2">
        <button
          className={`px-4 py-2 rounded font-medium ${
            isTesting 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
          onClick={toggleTesting}
        >
          {isTesting ? 'Stop Testing' : 'Start Testing'}
        </button>
        
        <button
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium"
          onClick={loadExample}
          disabled={isTesting}
        >
          Load Example
        </button>
      </div>
      
      <div className="mt-4 p-3 bg-gray-200 rounded text-sm">
        <p>
          <strong>Testing Status:</strong> {isTesting ? 'Running' : 'Stopped'}
        </p>
        <p className="mt-2 text-gray-700">
          Make sure you have an OLED display properly connected to your Arduino:
          <ul className="list-disc pl-5 mt-1">
            <li>VCC to 5V/3.3V</li>
            <li>GND to GND</li>
            <li>SDA to A4</li>
            <li>SCL to A5</li>
          </ul>
        </p>
      </div>
    </div>
  );
};

export default OLEDTester;