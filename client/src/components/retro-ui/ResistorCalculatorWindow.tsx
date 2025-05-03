import React, { useState } from 'react';
import { X, Minimize2, Calculator, Zap, Info } from 'lucide-react';

interface ResistorCalculatorWindowProps {
  onClose: () => void;
  onMinimize: () => void;
  isActive: boolean;
}

interface ResistorColor {
  value: number;
  multiplier: number;
  tolerance: number | null;
  temp: number; // Temperature coefficient
}

const ResistorCalculatorWindow: React.FC<ResistorCalculatorWindowProps> = ({
  onClose,
  onMinimize,
  isActive,
}) => {
  // Tab management
  const [activeTab, setActiveTab] = useState<'calculator' | 'identifier' | 'explainer'>('calculator');
  
  // Resistor band colors for the calculator
  const [band1, setBand1] = useState('brown');
  const [band2, setBand2] = useState('black');
  const [band3, setBand3] = useState('red');
  const [band4, setBand4] = useState('gold'); // Tolerance band
  const [band5, setBand5] = useState('none'); // Optional 5th band
  
  // For identification mode
  const [resistanceInput, setResistanceInput] = useState('');
  const [toleranceInput, setToleranceInput] = useState('5');
  const [identifiedColors, setIdentifiedColors] = useState<string[]>([]);
  
  // Color code reference
  const colorCodes: Record<string, ResistorColor> = {
    black: { value: 0, multiplier: 1, tolerance: null, temp: 250 },
    brown: { value: 1, multiplier: 10, tolerance: 1, temp: 100 },
    red: { value: 2, multiplier: 100, tolerance: 2, temp: 50 },
    orange: { value: 3, multiplier: 1000, tolerance: 3, temp: 15 },
    yellow: { value: 4, multiplier: 10000, tolerance: 4, temp: 25 },
    green: { value: 5, multiplier: 100000, tolerance: 0.5, temp: 20 },
    blue: { value: 6, multiplier: 1000000, tolerance: 0.25, temp: 10 },
    violet: { value: 7, multiplier: 10000000, tolerance: 0.1, temp: 5 },
    grey: { value: 8, multiplier: 100000000, tolerance: 0.05, temp: 1 },
    white: { value: 9, multiplier: 1000000000, tolerance: null, temp: 0 },
    gold: { value: -1, multiplier: 0.1, tolerance: 5, temp: 0 },
    silver: { value: -2, multiplier: 0.01, tolerance: 10, temp: 0 },
    none: { value: -3, multiplier: 1, tolerance: 20, temp: 0 }
  };
  
  // Color names mapped to CSS color classes
  const colorToClass: Record<string, string> = {
    black: 'bg-black text-white',
    brown: 'bg-amber-800 text-white',
    red: 'bg-red-600 text-white',
    orange: 'bg-orange-500 text-white',
    yellow: 'bg-yellow-400',
    green: 'bg-green-600 text-white',
    blue: 'bg-blue-600 text-white',
    violet: 'bg-purple-600 text-white',
    grey: 'bg-gray-500 text-white',
    white: 'bg-white border border-gray-300',
    gold: 'bg-yellow-600 text-white',
    silver: 'bg-gray-300',
    none: 'bg-transparent border border-dashed border-gray-400 text-gray-500'
  };

  // Calculate the resistance value based on the selected bands
  const calculateResistance = () => {
    let value = 0;
    
    // 4-band resistor
    if (band5 === 'none') {
      // First two bands are digits
      value = (colorCodes[band1].value * 10 + colorCodes[band2].value) * colorCodes[band3].multiplier;
    } 
    // 5-band resistor
    else {
      // First three bands are digits
      value = (colorCodes[band1].value * 100 + colorCodes[band2].value * 10 + colorCodes[band3].value) * colorCodes[band4].multiplier;
    }
    
    // Format the value
    return formatResistance(value);
  };

  // Format the resistance value with appropriate units
  const formatResistance = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)} MΩ`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(2)} kΩ`;
    } else {
      return `${value.toFixed(2)} Ω`;
    }
  };

  // Get tolerance value
  const getTolerance = () => {
    // For 4-band resistors, tolerance is band4
    // For 5-band resistors, tolerance is band5
    const toleranceBand = band5 === 'none' ? band4 : band5;
    const tolerance = colorCodes[toleranceBand].tolerance;
    return tolerance !== null ? `±${tolerance}%` : 'n/a';
  };

  // Identify resistor colors from a given resistance value
  const identifyResistorColors = () => {
    const value = parseFloat(resistanceInput);
    const tolerance = parseFloat(toleranceInput);
    
    if (isNaN(value) || value <= 0) {
      alert('Please enter a valid resistance value');
      return;
    }
    
    // Find the appropriate multiplier and calculate the significant digits
    let multiplier = 1;
    let digitsValue = value;
    
    // Scale the value to be between 10 and 999 for 4-band resistors
    while (digitsValue < 10) {
      digitsValue *= 10;
      multiplier /= 10;
    }
    while (digitsValue >= 100) {
      digitsValue /= 10;
      multiplier *= 10;
    }
    
    // Round to the nearest integer
    digitsValue = Math.round(digitsValue);
    
    // Find the closest multiplier in the color codes
    const multiplierColor = Object.entries(colorCodes).find(([_, code]) => 
      code.multiplier === multiplier
    )?.[0] || 'black';
    
    // Find the closest tolerance value
    const toleranceColor = Object.entries(colorCodes).find(([_, code]) => 
      code.tolerance === tolerance
    )?.[0] || 'gold';
    
    // Extract digits
    const firstDigit = Math.floor(digitsValue / 10);
    const secondDigit = digitsValue % 10;
    
    // Find colors for the digits
    const firstColor = Object.entries(colorCodes).find(([_, code]) => 
      code.value === firstDigit
    )?.[0] || 'brown';
    
    const secondColor = Object.entries(colorCodes).find(([_, code]) => 
      code.value === secondDigit
    )?.[0] || 'black';
    
    setIdentifiedColors([firstColor, secondColor, multiplierColor, toleranceColor]);
  };

  return (
    <div className={`p-0 rounded-lg overflow-hidden shadow-lg flex flex-col h-full ${isActive ? 'ring-2 ring-blue-500' : ''}`}>
      {/* Title bar */}
      <div className="bg-blue-500 text-white p-2 flex justify-between items-center">
        <div className="flex items-center">
          <Calculator className="w-5 h-5 mr-2" />
          <h2 className="text-lg font-semibold">Resistor Calculator</h2>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onMinimize}
            className="p-1 hover:bg-blue-400 rounded"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-400 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="bg-gray-100 border-b border-gray-300">
        <div className="flex">
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'calculator' ? 'text-blue-600 border-b-2 border-blue-500 bg-white' : 'text-gray-600 hover:text-gray-800'}`}
            onClick={() => setActiveTab('calculator')}
          >
            Calculator
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'identifier' ? 'text-blue-600 border-b-2 border-blue-500 bg-white' : 'text-gray-600 hover:text-gray-800'}`}
            onClick={() => setActiveTab('identifier')}
          >
            Find Colors
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'explainer' ? 'text-blue-600 border-b-2 border-blue-500 bg-white' : 'text-gray-600 hover:text-gray-800'}`}
            onClick={() => setActiveTab('explainer')}
          >
            How It Works
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-auto p-4 bg-white">
        {/* Calculator Tab */}
        {activeTab === 'calculator' && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="bg-amber-100 p-6 rounded-lg relative w-64 h-20">
                <div className="absolute bg-amber-800 w-full h-6 left-0 top-7"></div>
                
                {/* Resistor bands */}
                <div className={`absolute w-4 h-16 left-12 top-2 ${colorToClass[band1]}`}></div>
                <div className={`absolute w-4 h-16 left-20 top-2 ${colorToClass[band2]}`}></div>
                <div className={`absolute w-4 h-16 left-28 top-2 ${colorToClass[band3]}`}></div>
                <div className={`absolute w-4 h-16 left-36 top-2 ${colorToClass[band4]}`}></div>
                {band5 !== 'none' && (
                  <div className={`absolute w-4 h-16 left-44 top-2 ${colorToClass[band5]}`}></div>
                )}
                
                {/* Connection wires */}
                <div className="absolute w-8 h-2 bg-gray-600 left-2 top-9"></div>
                <div className="absolute w-8 h-2 bg-gray-600 right-2 top-9"></div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Band Selection</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">1st Band</label>
                    <select
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      value={band1}
                      onChange={(e) => setBand1(e.target.value)}
                    >
                      {Object.entries(colorCodes).filter(([color, code]) => code.value >= 0 && code.value <= 9).map(([color]) => (
                        <option key={color} value={color} className={colorToClass[color]}>
                          {color.charAt(0).toUpperCase() + color.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">2nd Band</label>
                    <select
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      value={band2}
                      onChange={(e) => setBand2(e.target.value)}
                    >
                      {Object.entries(colorCodes).filter(([color, code]) => code.value >= 0 && code.value <= 9).map(([color]) => (
                        <option key={color} value={color}>
                          {color.charAt(0).toUpperCase() + color.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">3rd Band (Multiplier)</label>
                    <select
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      value={band3}
                      onChange={(e) => setBand3(e.target.value)}
                    >
                      {Object.entries(colorCodes).filter(([color]) => color !== 'none').map(([color]) => (
                        <option key={color} value={color}>
                          {color.charAt(0).toUpperCase() + color.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">4th Band (Tolerance)</label>
                    <select
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      value={band4}
                      onChange={(e) => setBand4(e.target.value)}
                    >
                      {Object.entries(colorCodes).filter(([_, code]) => code.tolerance !== null).map(([color]) => (
                        <option key={color} value={color}>
                          {color.charAt(0).toUpperCase() + color.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">5th Band (Optional)</label>
                    <select
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      value={band5}
                      onChange={(e) => setBand5(e.target.value)}
                    >
                      <option value="none">None (4-band resistor)</option>
                      {Object.entries(colorCodes).filter(([color, code]) => code.value >= 0 && code.value <= 9).map(([color]) => (
                        <option key={color} value={color}>
                          {color.charAt(0).toUpperCase() + color.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Result</h3>
                <div className="bg-gray-100 p-4 rounded-lg space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Resistance Value</label>
                    <div className="mt-1 bg-white p-3 rounded border border-gray-300 text-2xl font-mono text-center">
                      {calculateResistance()}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tolerance</label>
                    <div className="mt-1 bg-white p-3 rounded border border-gray-300 text-lg font-mono text-center">
                      {getTolerance()}
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mt-4">
                  <h3 className="text-sm font-semibold text-yellow-800 flex items-center mb-2">
                    <Info className="w-4 h-4 mr-1" /> Power Rating
                  </h3>
                  <p className="text-sm text-yellow-800">
                    Always check the power rating of resistors. Power (P) = I² × R = V² / R
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Common power ratings: ¼W, ½W, 1W, 2W, 5W. Always choose a resistor with a power rating higher than your calculated power.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Identifier Tab */}
        {activeTab === 'identifier' && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-md font-semibold text-blue-800">Find Resistor Color Bands</h3>
              <p className="text-sm text-blue-700 mt-1">Enter a resistance value and tolerance to find the corresponding color bands.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Resistance Value</label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="text"
                        className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="e.g. 220"
                        value={resistanceInput}
                        onChange={(e) => setResistanceInput(e.target.value)}
                      />
                      <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        Ω
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tolerance</label>
                    <select
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      value={toleranceInput}
                      onChange={(e) => setToleranceInput(e.target.value)}
                    >
                      <option value="1">±1%</option>
                      <option value="2">±2%</option>
                      <option value="0.5">±0.5%</option>
                      <option value="0.25">±0.25%</option>
                      <option value="0.1">±0.1%</option>
                      <option value="5">±5%</option>
                      <option value="10">±10%</option>
                      <option value="20">±20%</option>
                    </select>
                  </div>
                  
                  <div>
                    <button
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      onClick={identifyResistorColors}
                    >
                      Calculate Color Bands
                    </button>
                  </div>
                </div>
              </div>
              
              <div>
                {identifiedColors.length > 0 && (
                  <div className="bg-gray-100 p-4 rounded-lg space-y-4">
                    <h3 className="text-md font-semibold">Color Band Result</h3>
                    
                    <div className="flex justify-center">
                      <div className="bg-amber-100 p-6 rounded-lg relative w-64 h-20">
                        <div className="absolute bg-amber-800 w-full h-6 left-0 top-7"></div>
                        
                        {/* Result bands */}
                        {identifiedColors.map((color, index) => (
                          <div 
                            key={index}
                            className={`absolute w-4 h-16 top-2 ${colorToClass[color]}`}
                            style={{ left: `${12 + index * 8}px` }}
                          ></div>
                        ))}
                        
                        {/* Connection wires */}
                        <div className="absolute w-8 h-2 bg-gray-600 left-2 top-9"></div>
                        <div className="absolute w-8 h-2 bg-gray-600 right-2 top-9"></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2 text-center text-sm">
                      {identifiedColors.map((color, index) => (
                        <div key={index} className="p-2 bg-white rounded border border-gray-200">
                          <div 
                            className={`h-4 w-full rounded-sm mb-1 ${colorToClass[color]}`}
                          ></div>
                          <span className="font-medium">
                            {color.charAt(0).toUpperCase() + color.slice(1)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Explainer Tab */}
        {activeTab === 'explainer' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">How to Read Resistor Color Codes</h3>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="text-md font-semibold text-blue-600 mb-2">The Basics</h4>
              <p className="text-sm text-gray-700 mb-2">
                Resistors use color bands to indicate their resistance value and tolerance. The standard format is:
              </p>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>4-band resistors:</strong> 1st digit, 2nd digit, multiplier, tolerance</li>
                  <li><strong>5-band resistors:</strong> 1st digit, 2nd digit, 3rd digit, multiplier, tolerance</li>
                  <li><strong>6-band resistors:</strong> Add temperature coefficient as the 6th band</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="text-md font-semibold text-blue-600 mb-2">Color Code Reference</h4>
              
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 uppercase text-sm leading-normal">
                      <th className="py-2 px-3 text-left">Color</th>
                      <th className="py-2 px-3 text-left">Value</th>
                      <th className="py-2 px-3 text-left">Multiplier</th>
                      <th className="py-2 px-3 text-left">Tolerance</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 text-sm">
                    {Object.entries(colorCodes).map(([color, code]) => (
                      <tr key={color} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-2 px-3 flex items-center">
                          <div className={`w-4 h-4 mr-2 rounded-sm ${colorToClass[color]}`}></div>
                          {color.charAt(0).toUpperCase() + color.slice(1)}
                        </td>
                        <td className="py-2 px-3">{code.value >= 0 ? code.value : 'N/A'}</td>
                        <td className="py-2 px-3">
                          {code.multiplier === 0.01 ? '×0.01' :
                           code.multiplier === 0.1 ? '×0.1' :
                           code.multiplier >= 1000000000 ? '×10⁹' :
                           code.multiplier >= 100000000 ? '×10⁸' :
                           code.multiplier >= 10000000 ? '×10⁷' :
                           code.multiplier >= 1000000 ? '×10⁶' :
                           code.multiplier >= 100000 ? '×10⁵' :
                           code.multiplier >= 10000 ? '×10⁴' :
                           code.multiplier >= 1000 ? '×10³' :
                           code.multiplier >= 100 ? '×10²' :
                           code.multiplier >= 10 ? '×10' : '×1'}
                        </td>
                        <td className="py-2 px-3">{code.tolerance !== null ? `±${code.tolerance}%` : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="text-md font-semibold text-blue-600 mb-2">Example Calculation</h4>
              
              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                <p className="mb-2"><strong>For a resistor with Red-Red-Orange-Gold bands:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>1st band (Red):</strong> 2</li>
                  <li><strong>2nd band (Red):</strong> 2</li>
                  <li><strong>3rd band (Orange):</strong> ×1,000</li>
                  <li><strong>4th band (Gold):</strong> ±5% tolerance</li>
                </ul>
                <p className="mt-2 font-medium">Value = 22 × 1,000 = 22,000Ω = 22kΩ ±5%</p>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="text-md font-semibold text-yellow-800 flex items-center mb-2">
                <Info className="w-4 h-4 mr-1" /> Memory Tip
              </h4>
              <p className="text-sm text-yellow-800">
                "Bad Boys Race Our Young Girls, But Violet Generally Wins Grey White"
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                This helps remember the color order: Black, Brown, Red, Orange, Yellow, Green, Blue, Violet, Grey, White
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResistorCalculatorWindow;