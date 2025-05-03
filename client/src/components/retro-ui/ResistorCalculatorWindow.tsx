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
  const [activeTab, setActiveTab] = useState<'calculator' | 'identifier' | 'explainer' | 'learning'>('calculator');
  
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
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'learning' ? 'text-blue-600 border-b-2 border-blue-500 bg-white' : 'text-gray-600 hover:text-gray-800'}`}
            onClick={() => setActiveTab('learning')}
          >
            Learning Center
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-auto p-4 bg-white">
        {/* Learning Center Tab */}
        {activeTab === 'learning' && (
          <div className="space-y-6 pb-4">
            {/* Hero Section with Gizbo */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-l-4 border-blue-500 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center border-2 border-blue-300 p-1 shadow-inner">
                    <div className="text-4xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-transparent bg-clip-text">G</div>
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-blue-800">Resistors: The Gatekeepers of Electronics</h2>
                  <p className="text-blue-700 mt-2 leading-relaxed">
                    Welcome to Gizbo's Comprehensive Guide to Resistors! Whether you're a beginner or looking to deepen your understanding, this guide will take you through everything you need to know about these essential components.
                  </p>
                  <div className="mt-4 bg-white/60 p-4 rounded-lg border border-blue-200 italic text-blue-700">
                    <p>"Greetings, curious maker! I am Gizbo, and today we shall unlock the mysteries of resistors together. These humble components may seem simple, but they are the foundation upon which all electronic circuits are built!"</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Navigation Menu */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <h3 className="font-medium text-gray-700">Learning Path</h3>
                <p className="text-sm text-gray-500">Follow along from basic concepts to advanced applications</p>
              </div>
              <div className="flex flex-wrap gap-2 p-4">
                <a href="#basics" className="px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg font-medium text-blue-800 transition duration-150 flex items-center gap-1">
                  <span className="bg-blue-800 text-white rounded-full w-5 h-5 inline-flex items-center justify-center text-xs">1</span>
                  <span>Basics</span>
                </a>
                <a href="#ohms-law" className="px-4 py-2 bg-purple-100 hover:bg-purple-200 rounded-lg font-medium text-purple-800 transition duration-150 flex items-center gap-1">
                  <span className="bg-purple-800 text-white rounded-full w-5 h-5 inline-flex items-center justify-center text-xs">2</span>
                  <span>Ohm's Law</span>
                </a>
                <a href="#applications" className="px-4 py-2 bg-green-100 hover:bg-green-200 rounded-lg font-medium text-green-800 transition duration-150 flex items-center gap-1">
                  <span className="bg-green-800 text-white rounded-full w-5 h-5 inline-flex items-center justify-center text-xs">3</span>
                  <span>Applications</span>
                </a>
                <a href="#configurations" className="px-4 py-2 bg-amber-100 hover:bg-amber-200 rounded-lg font-medium text-amber-800 transition duration-150 flex items-center gap-1">
                  <span className="bg-amber-800 text-white rounded-full w-5 h-5 inline-flex items-center justify-center text-xs">4</span>
                  <span>Configurations</span>
                </a>
                <a href="#troubleshooting" className="px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg font-medium text-red-800 transition duration-150 flex items-center gap-1">
                  <span className="bg-red-800 text-white rounded-full w-5 h-5 inline-flex items-center justify-center text-xs">5</span>
                  <span>Troubleshooting</span>
                </a>
                <a href="#projects" className="px-4 py-2 bg-teal-100 hover:bg-teal-200 rounded-lg font-medium text-teal-800 transition duration-150 flex items-center gap-1">
                  <span className="bg-teal-800 text-white rounded-full w-5 h-5 inline-flex items-center justify-center text-xs">6</span>
                  <span>Projects</span>
                </a>
              </div>
            </div>

            {/* Basics Section */}
            <section id="basics" className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-blue-500 px-6 py-3 flex items-center justify-between">
                <h3 className="font-semibold text-white text-lg">Understanding Resistors: The Basics</h3>
                <span className="bg-white text-blue-500 rounded-full w-8 h-8 inline-flex items-center justify-center font-bold">1</span>
              </div>
              <div className="p-6 space-y-6">
                {/* What is a Resistor */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">What is a Resistor?</h4>
                  <div className="mt-4 flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <p className="text-gray-700 leading-relaxed">
                        A resistor is an electronic component that <span className="font-medium">limits or restricts the flow of electric current</span> in a circuit. It's one of the most fundamental and commonly used components in electronics.
                      </p>
                      <p className="text-gray-700 mt-3 leading-relaxed">
                        Resistors are used to control voltage and current levels, divide voltages, bias active elements, and terminate transmission lines, among other uses.
                      </p>
                    </div>
                    <div className="flex-1 bg-blue-50 p-4 rounded-lg">
                      <h5 className="font-medium text-blue-800">Real-World Analogy</h5>
                      <p className="mt-2 text-blue-700">
                        Think of electricity flowing through a wire like water flowing through a pipe:
                      </p>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div className="bg-white p-3 rounded border border-blue-200">
                          <p className="font-medium text-center text-blue-800 border-b border-blue-100 pb-1">Electricity</p>
                          <ul className="text-sm space-y-1 mt-2 text-gray-700">
                            <li>• Wire = Pipe</li>
                            <li>• Current = Water flow</li>
                            <li>• Voltage = Water pressure</li>
                            <li>• Resistor = Narrow section</li>
                          </ul>
                        </div>
                        <div className="bg-white p-3 rounded border border-blue-200">
                          <p className="font-medium text-center text-blue-800 border-b border-blue-100 pb-1">Effect</p>
                          <p className="text-sm mt-2 text-gray-700">
                            Just as a narrow pipe restricts water flow, a resistor restricts the flow of electric current in a circuit.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* How Resistors Work */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">How Resistors Work</h4>
                  <div className="mt-4 flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <p className="text-gray-700 leading-relaxed">
                        Resistors work based on a property called <span className="font-medium">resistance</span>, which is the opposition to the flow of electric current. The higher the resistance, the more the current flow is restricted.
                      </p>
                      <div className="mt-4 bg-yellow-50 p-4 rounded-lg">
                        <h5 className="font-medium text-yellow-800">Key Insight:</h5>
                        <p className="mt-1 text-yellow-700">
                          When current flows through a resistor, some electrical energy is converted to heat energy. This is why resistors can get warm during operation.
                        </p>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                        <h5 className="font-medium text-gray-800">Resistance is measured in Ohms (Ω)</h5>
                        <p className="mt-2 text-gray-700">
                          The ohm (Ω) is named after Georg Ohm, who discovered the relationship between voltage, current, and resistance.
                        </p>
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="bg-green-50 p-3 rounded-lg">
                            <p className="font-medium text-center text-green-800">Low Resistance</p>
                            <p className="text-center text-sm mt-1">10Ω - 1kΩ</p>
                            <p className="text-center text-xs mt-2 text-green-700">Allows more current flow</p>
                          </div>
                          <div className="bg-yellow-50 p-3 rounded-lg">
                            <p className="font-medium text-center text-yellow-800">Medium Resistance</p>
                            <p className="text-center text-sm mt-1">1kΩ - 100kΩ</p>
                            <p className="text-center text-xs mt-2 text-yellow-700">Moderate current restriction</p>
                          </div>
                          <div className="bg-red-50 p-3 rounded-lg">
                            <p className="font-medium text-center text-red-800">High Resistance</p>
                            <p className="text-center text-sm mt-1">100kΩ - 10MΩ</p>
                            <p className="text-center text-xs mt-2 text-red-700">Greatly limits current</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Types of Resistors */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Types of Resistors</h4>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                      <div className="bg-blue-500 text-white p-2 text-center">
                        <h5 className="font-medium">Fixed Resistors</h5>
                      </div>
                      <div className="p-3">
                        <p className="text-sm text-gray-700">
                          Have a specific resistance value that doesn't change. Most common type in circuits.
                        </p>
                        <div className="mt-2 text-xs text-gray-600">
                          <p><span className="font-medium">Examples:</span> Carbon film, metal film, wirewound</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                      <div className="bg-purple-500 text-white p-2 text-center">
                        <h5 className="font-medium">Variable Resistors</h5>
                      </div>
                      <div className="p-3">
                        <p className="text-sm text-gray-700">
                          Can change their resistance value, often with a sliding contact or dial.
                        </p>
                        <div className="mt-2 text-xs text-gray-600">
                          <p><span className="font-medium">Examples:</span> Potentiometers, rheostats, trimmers</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                      <div className="bg-green-500 text-white p-2 text-center">
                        <h5 className="font-medium">Special Resistors</h5>
                      </div>
                      <div className="p-3">
                        <p className="text-sm text-gray-700">
                          Change resistance based on environmental conditions or other factors.
                        </p>
                        <div className="mt-2 text-xs text-gray-600">
                          <p><span className="font-medium">Examples:</span> Thermistors (temperature), photoresistors (light), varistors (voltage)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Resistor Color Codes */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Resistor Color Codes</h4>
                  <div className="mt-4 flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                      <p className="text-gray-700">
                        Most resistors have colored bands that indicate their resistance value and tolerance. Learning to read these bands is an essential skill.
                      </p>
                      <div className="mt-3 bg-amber-50 p-4 rounded-lg">
                        <h5 className="font-medium text-amber-800">How to Read Color Bands:</h5>
                        <ol className="mt-2 space-y-2 text-amber-700 pl-5 list-decimal">
                          <li>The first 2-3 bands represent significant digits</li>
                          <li>The next band is the multiplier (number of zeros)</li>
                          <li>The last band indicates tolerance (accuracy)</li>
                        </ol>
                        <p className="mt-3 text-sm text-amber-600">
                          <span className="font-medium">Tip:</span> Use the "Calculator" tab in this tool to practice identifying resistor values from color codes and vice versa.
                        </p>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h5 className="font-medium text-gray-800 text-center">Color Code Quick Reference</h5>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs font-medium text-gray-600 mb-1">Digit Values:</p>
                            <div className="space-y-1 text-xs">
                              <p><span className="inline-block w-3 h-3 bg-black mr-2"></span>Black = 0</p>
                              <p><span className="inline-block w-3 h-3 bg-amber-800 mr-2"></span>Brown = 1</p>
                              <p><span className="inline-block w-3 h-3 bg-red-600 mr-2"></span>Red = 2</p>
                              <p><span className="inline-block w-3 h-3 bg-orange-500 mr-2"></span>Orange = 3</p>
                              <p><span className="inline-block w-3 h-3 bg-yellow-400 mr-2"></span>Yellow = 4</p>
                              <p><span className="inline-block w-3 h-3 bg-green-600 mr-2"></span>Green = 5</p>
                              <p><span className="inline-block w-3 h-3 bg-blue-600 mr-2"></span>Blue = 6</p>
                              <p><span className="inline-block w-3 h-3 bg-purple-600 mr-2"></span>Violet = 7</p>
                              <p><span className="inline-block w-3 h-3 bg-gray-500 mr-2"></span>Gray = 8</p>
                              <p><span className="inline-block w-3 h-3 bg-white border border-gray-300 mr-2"></span>White = 9</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-600 mb-1">Tolerance Values:</p>
                            <div className="space-y-1 text-xs">
                              <p><span className="inline-block w-3 h-3 bg-amber-800 mr-2"></span>Brown = ±1%</p>
                              <p><span className="inline-block w-3 h-3 bg-red-600 mr-2"></span>Red = ±2%</p>
                              <p><span className="inline-block w-3 h-3 bg-green-600 mr-2"></span>Green = ±0.5%</p>
                              <p><span className="inline-block w-3 h-3 bg-blue-600 mr-2"></span>Blue = ±0.25%</p>
                              <p><span className="inline-block w-3 h-3 bg-purple-600 mr-2"></span>Violet = ±0.1%</p>
                              <p><span className="inline-block w-3 h-3 bg-gray-500 mr-2"></span>Gray = ±0.05%</p>
                              <p><span className="inline-block w-3 h-3 bg-yellow-600 mr-2"></span>Gold = ±5%</p>
                              <p><span className="inline-block w-3 h-3 bg-gray-300 mr-2"></span>Silver = ±10%</p>
                              <p><span className="inline-block w-3 h-3 border border-dashed border-gray-400 mr-2"></span>None = ±20%</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            
            {/* Ohm's Law Section */}
            <section id="ohms-law" className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-purple-500 px-6 py-3 flex items-center justify-between">
                <h3 className="font-semibold text-white text-lg">Ohm's Law: The Foundation of Electronics</h3>
                <span className="bg-white text-purple-500 rounded-full w-8 h-8 inline-flex items-center justify-center font-bold">2</span>
              </div>
              <div className="p-6 space-y-6">
                {/* Ohm's Law Explanation */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">The Fundamental Relationship</h4>
                  <div className="mt-4 flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <p className="text-gray-700 leading-relaxed">
                        Ohm's Law describes the relationship between <span className="font-medium">voltage (V)</span>, <span className="font-medium">current (I)</span>, and <span className="font-medium">resistance (R)</span> in an electrical circuit.
                      </p>
                      <div className="mt-4 bg-purple-100 p-6 rounded-lg flex flex-col items-center">
                        <div className="text-2xl font-bold text-purple-800">V = I × R</div>
                        <p className="mt-1 text-purple-700">Voltage = Current × Resistance</p>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                          <div className="bg-white p-3 rounded border border-purple-200 text-center">
                            <div className="font-bold text-purple-800">V</div>
                            <p className="text-sm">Voltage</p>
                            <p className="text-xs text-gray-500">Measured in Volts (V)</p>
                          </div>
                          <div className="bg-white p-3 rounded border border-purple-200 text-center">
                            <div className="font-bold text-purple-800">I</div>
                            <p className="text-sm">Current</p>
                            <p className="text-xs text-gray-500">Measured in Amperes (A)</p>
                          </div>
                          <div className="bg-white p-3 rounded border border-purple-200 text-center">
                            <div className="font-bold text-purple-800">R</div>
                            <p className="text-sm">Resistance</p>
                            <p className="text-xs text-gray-500">Measured in Ohms (Ω)</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg">
                        <h5 className="font-medium text-purple-800">Ohm's Law Triangle</h5>
                        <p className="mt-2 text-gray-700">
                          You can rearrange Ohm's Law to find any value if you know the other two:
                        </p>
                        <div className="mt-3 grid grid-cols-1 gap-3">
                          <div className="bg-white p-3 rounded border border-purple-200">
                            <div className="text-center font-medium text-purple-800">To find Voltage:</div>
                            <div className="text-center mt-1">V = I × R</div>
                            <div className="text-xs text-center mt-1 text-gray-500">Voltage = Current × Resistance</div>
                          </div>
                          <div className="bg-white p-3 rounded border border-purple-200">
                            <div className="text-center font-medium text-purple-800">To find Current:</div>
                            <div className="text-center mt-1">I = V ÷ R</div>
                            <div className="text-xs text-center mt-1 text-gray-500">Current = Voltage ÷ Resistance</div>
                          </div>
                          <div className="bg-white p-3 rounded border border-purple-200">
                            <div className="text-center font-medium text-purple-800">To find Resistance:</div>
                            <div className="text-center mt-1">R = V ÷ I</div>
                            <div className="text-xs text-center mt-1 text-gray-500">Resistance = Voltage ÷ Current</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Ohm's Law Example */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Practical Examples</h4>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <h5 className="font-medium text-indigo-800">Example 1: Finding Current</h5>
                      <div className="mt-3 space-y-3">
                        <div className="bg-white p-3 rounded border border-indigo-200">
                          <p><span className="font-medium">Problem:</span> You have a 9V battery connected to a 1kΩ (1000Ω) resistor. What current flows through the circuit?</p>
                        </div>
                        <div className="bg-white p-3 rounded border border-indigo-200">
                          <p><span className="font-medium">Step 1:</span> Identify what we know</p>
                          <ul className="text-sm mt-1 pl-5 list-disc">
                            <li>Voltage (V) = 9V</li>
                            <li>Resistance (R) = 1000Ω</li>
                            <li>Current (I) = ?</li>
                          </ul>
                        </div>
                        <div className="bg-white p-3 rounded border border-indigo-200">
                          <p><span className="font-medium">Step 2:</span> Use the formula I = V ÷ R</p>
                          <div className="text-sm mt-1">
                            <p>I = 9V ÷ 1000Ω</p>
                            <p>I = 0.009A</p>
                            <p>I = 9mA (milliamps)</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <h5 className="font-medium text-indigo-800">Example 2: Finding Resistance</h5>
                      <div className="mt-3 space-y-3">
                        <div className="bg-white p-3 rounded border border-indigo-200">
                          <p><span className="font-medium">Problem:</span> An LED draws 20mA (0.02A) when connected to a 3V power source. If the LED's forward voltage is 2V, what resistor value is needed?</p>
                        </div>
                        <div className="bg-white p-3 rounded border border-indigo-200">
                          <p><span className="font-medium">Step 1:</span> Find the voltage across the resistor</p>
                          <div className="text-sm mt-1">
                            <p>Voltage across resistor = Source voltage - LED voltage</p>
                            <p>Voltage across resistor = 3V - 2V = 1V</p>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded border border-indigo-200">
                          <p><span className="font-medium">Step 2:</span> Use the formula R = V ÷ I</p>
                          <div className="text-sm mt-1">
                            <p>R = 1V ÷ 0.02A</p>
                            <p>R = 50Ω</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Power Calculation */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Power in Resistors</h4>
                  <div className="mt-4 flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <p className="text-gray-700 leading-relaxed">
                        When current flows through a resistor, electrical energy is converted to heat. The <span className="font-medium">power</span> dissipated by a resistor is measured in watts (W).
                      </p>
                      <div className="mt-4 bg-red-50 p-4 rounded-lg">
                        <h5 className="font-medium text-red-800">Important for Safety:</h5>
                        <p className="mt-1 text-red-700">
                          You must choose resistors with an appropriate power rating. A resistor that dissipates more power than it's rated for will overheat and can be damaged or cause a fire.
                        </p>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h5 className="font-medium text-gray-800 text-center">Power Formulas</h5>
                        <div className="mt-3 space-y-3">
                          <div className="p-3 bg-red-50 rounded border border-red-100 text-center">
                            <p className="font-medium text-red-800">P = I² × R</p>
                            <p className="text-sm text-red-700">Power = Current² × Resistance</p>
                          </div>
                          <div className="p-3 bg-red-50 rounded border border-red-100 text-center">
                            <p className="font-medium text-red-800">P = V² ÷ R</p>
                            <p className="text-sm text-red-700">Power = Voltage² ÷ Resistance</p>
                          </div>
                          <div className="p-3 bg-red-50 rounded border border-red-100 text-center">
                            <p className="font-medium text-red-800">P = V × I</p>
                            <p className="text-sm text-red-700">Power = Voltage × Current</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 bg-amber-50 p-4 rounded-lg">
                    <h5 className="font-medium text-amber-800">Example: Power Calculation</h5>
                    <div className="mt-2 space-y-2">
                      <p className="text-amber-700">A 220Ω resistor has 5V across it. What power does it dissipate?</p>
                      <div className="bg-white p-3 rounded border border-amber-200">
                        <p><span className="font-medium">Using P = V² ÷ R:</span></p>
                        <div className="text-sm">
                          <p>P = (5V)² ÷ 220Ω</p>
                          <p>P = 25 ÷ 220</p>
                          <p>P = 0.114W = 114mW</p>
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded border border-amber-200">
                        <p><span className="font-medium">Therefore:</span></p>
                        <div className="text-sm">
                          <p>You would need a resistor rated for at least 1/4W (250mW) for this application.</p>
                          <p>Common resistor power ratings: 1/8W, 1/4W, 1/2W, 1W, 2W, 5W</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            
            {/* Applications Section */}
            <section id="applications" className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-green-500 px-6 py-3 flex items-center justify-between">
                <h3 className="font-semibold text-white text-lg">Real-World Applications</h3>
                <span className="bg-white text-green-500 rounded-full w-8 h-8 inline-flex items-center justify-center font-bold">3</span>
              </div>
              <div className="p-6 space-y-6">
                {/* Common Applications */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* LED Current Limiting */}
                  <div className="bg-green-50 rounded-lg overflow-hidden shadow-sm border border-green-200">
                    <div className="bg-green-500 p-3 text-white">
                      <h4 className="font-medium">LED Current Limiting</h4>
                    </div>
                    <div className="p-4 space-y-3">
                      <p className="text-sm text-gray-700">
                        LEDs need a resistor in series to prevent too much current from flowing through them and causing damage.
                      </p>
                      <div className="bg-white p-3 rounded border border-green-100">
                        <p className="text-xs font-medium text-green-800">How to calculate the resistor value:</p>
                        <div className="mt-1 text-xs">
                          <p>R = (Vsource - Vled) ÷ Iled</p>
                          <div className="mt-1 pl-3">
                            <p>Where:</p>
                            <p>• Vsource = Supply voltage</p>
                            <p>• Vled = LED forward voltage</p>
                            <p>• Iled = Desired LED current</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded border border-green-100">
                        <p className="text-xs font-medium text-green-800">Example:</p>
                        <div className="mt-1 text-xs">
                          <p>• Arduino 5V pin</p>
                          <p>• Red LED (forward voltage 2V)</p>
                          <p>• Want 20mA (0.02A)</p>
                          <p>• R = (5V - 2V) ÷ 0.02A = 150Ω</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Voltage Dividers */}
                  <div className="bg-green-50 rounded-lg overflow-hidden shadow-sm border border-green-200">
                    <div className="bg-green-500 p-3 text-white">
                      <h4 className="font-medium">Voltage Dividers</h4>
                    </div>
                    <div className="p-4 space-y-3">
                      <p className="text-sm text-gray-700">
                        Two resistors in series can divide a voltage into a smaller voltage, useful for reading high voltages with microcontrollers.
                      </p>
                      <div className="bg-white p-3 rounded border border-green-100">
                        <p className="text-xs font-medium text-green-800">Voltage divider formula:</p>
                        <div className="mt-1 text-xs">
                          <p>Vout = Vin × (R2 ÷ (R1 + R2))</p>
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded border border-green-100">
                        <p className="text-xs font-medium text-green-800">Example:</p>
                        <div className="mt-1 text-xs">
                          <p>• Need to read a 12V signal with Arduino (max 5V)</p>
                          <p>• Use R1 = 10kΩ and R2 = 5kΩ</p>
                          <p>• Vout = 12V × (5kΩ ÷ (10kΩ + 5kΩ))</p>
                          <p>• Vout = 12V × (5kΩ ÷ 15kΩ) = 12V × 0.33 = 4V</p>
                          <p>• Safe to read with Arduino!</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Pull-up/Pull-down Resistors */}
                  <div className="bg-green-50 rounded-lg overflow-hidden shadow-sm border border-green-200">
                    <div className="bg-green-500 p-3 text-white">
                      <h4 className="font-medium">Pull-up/Pull-down Resistors</h4>
                    </div>
                    <div className="p-4 space-y-3">
                      <p className="text-sm text-gray-700">
                        These resistors ensure a pin is in a defined state (HIGH or LOW) when not being actively driven by a signal.
                      </p>
                      <div className="bg-white p-3 rounded border border-green-100">
                        <p className="text-xs font-medium text-green-800">Pull-up Resistors:</p>
                        <div className="mt-1 text-xs">
                          <p>• Connect between signal line and power supply</p>
                          <p>• Default state: HIGH (5V/3.3V)</p>
                          <p>• When button pressed: Goes LOW (0V)</p>
                          <p>• Typical value: 10kΩ</p>
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded border border-green-100">
                        <p className="text-xs font-medium text-green-800">Pull-down Resistors:</p>
                        <div className="mt-1 text-xs">
                          <p>• Connect between signal line and ground</p>
                          <p>• Default state: LOW (0V)</p>
                          <p>• When button pressed: Goes HIGH (5V/3.3V)</p>
                          <p>• Typical value: 10kΩ</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Additional Applications */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">More Applications</h4>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h5 className="font-medium text-gray-800 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Current Sensing
                      </h5>
                      <p className="mt-2 text-sm text-gray-700">
                        A small-value resistor can be used to measure current by measuring the voltage drop across it and applying Ohm's Law.
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h5 className="font-medium text-gray-800 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Timing Circuits
                      </h5>
                      <p className="mt-2 text-sm text-gray-700">
                        Resistors combined with capacitors create RC circuits that can be used for timing operations in electronics.
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h5 className="font-medium text-gray-800 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Filters
                      </h5>
                      <p className="mt-2 text-sm text-gray-700">
                        Resistors paired with capacitors can filter signals, allowing some frequencies to pass while blocking others.
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h5 className="font-medium text-gray-800 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Biasing
                      </h5>
                      <p className="mt-2 text-sm text-gray-700">
                        Resistors set the operating point for active components like transistors and operational amplifiers.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            
            {/* Configurations Section */}
            <section id="configurations" className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-amber-500 px-6 py-3 flex items-center justify-between">
                <h3 className="font-semibold text-white text-lg">Resistor Configurations</h3>
                <span className="bg-white text-amber-500 rounded-full w-8 h-8 inline-flex items-center justify-center font-bold">4</span>
              </div>
              <div className="p-6 space-y-6">
                {/* Series vs Parallel */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-5 rounded-lg">
                    <h4 className="font-medium text-blue-800 border-b border-blue-200 pb-2">Resistors in Series</h4>
                    <div className="mt-3 space-y-3">
                      <p className="text-blue-700">
                        When resistors are connected end-to-end, their resistances add up.
                      </p>
                      <div className="bg-white p-4 rounded-lg border border-blue-200">
                        <div className="text-center font-medium text-blue-800">Formula:</div>
                        <div className="text-center text-lg mt-1">Rtotal = R1 + R2 + R3 + ...</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-blue-200">
                        <div className="font-medium text-blue-800">Example:</div>
                        <div className="mt-1 text-sm">
                          <p>Three resistors in series: 100Ω, 220Ω, and 330Ω</p>
                          <p className="mt-1">Rtotal = 100Ω + 220Ω + 330Ω = 650Ω</p>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-blue-200">
                        <div className="font-medium text-blue-800">Characteristics:</div>
                        <ul className="mt-1 text-sm pl-5 list-disc">
                          <li>Same current flows through all resistors</li>
                          <li>Voltage is divided across the resistors</li>
                          <li>Total resistance is always greater than any individual resistor</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="bg-teal-50 p-5 rounded-lg">
                    <h4 className="font-medium text-teal-800 border-b border-teal-200 pb-2">Resistors in Parallel</h4>
                    <div className="mt-3 space-y-3">
                      <p className="text-teal-700">
                        When resistors are connected side-by-side (both ends connected together), their combined resistance decreases.
                      </p>
                      <div className="bg-white p-4 rounded-lg border border-teal-200">
                        <div className="text-center font-medium text-teal-800">Formula:</div>
                        <div className="text-center text-lg mt-1">1/Rtotal = 1/R1 + 1/R2 + 1/R3 + ...</div>
                        <div className="text-center text-sm mt-1 text-gray-600">(For two resistors: Rtotal = (R1 × R2) ÷ (R1 + R2))</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-teal-200">
                        <div className="font-medium text-teal-800">Example:</div>
                        <div className="mt-1 text-sm">
                          <p>Two resistors in parallel: 100Ω and 100Ω</p>
                          <p className="mt-1">1/Rtotal = 1/100Ω + 1/100Ω = 2/100Ω</p>
                          <p className="mt-1">Rtotal = 50Ω</p>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-teal-200">
                        <div className="font-medium text-teal-800">Characteristics:</div>
                        <ul className="mt-1 text-sm pl-5 list-disc">
                          <li>Same voltage appears across all resistors</li>
                          <li>Current is divided among the resistors</li>
                          <li>Total resistance is always less than the smallest individual resistor</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Common Values */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Common Resistor Values You'll Encounter</h4>
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white p-3 rounded-lg border border-gray-200 text-center shadow-sm">
                      <div className="font-medium text-gray-800">220Ω & 330Ω</div>
                      <p className="text-xs mt-1 text-gray-600">LED current limiting (common)</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200 text-center shadow-sm">
                      <div className="font-medium text-gray-800">1kΩ & 2.2kΩ</div>
                      <p className="text-xs mt-1 text-gray-600">General purpose</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200 text-center shadow-sm">
                      <div className="font-medium text-gray-800">4.7kΩ</div>
                      <p className="text-xs mt-1 text-gray-600">I²C pull-ups</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200 text-center shadow-sm">
                      <div className="font-medium text-gray-800">10kΩ</div>
                      <p className="text-xs mt-1 text-gray-600">Pull-up/down resistors</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200 text-center shadow-sm">
                      <div className="font-medium text-gray-800">47kΩ & 100kΩ</div>
                      <p className="text-xs mt-1 text-gray-600">High impedance inputs</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200 text-center shadow-sm">
                      <div className="font-medium text-gray-800">470Ω</div>
                      <p className="text-xs mt-1 text-gray-600">LED series resistor (bright)</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200 text-center shadow-sm">
                      <div className="font-medium text-gray-800">1MΩ & 10MΩ</div>
                      <p className="text-xs mt-1 text-gray-600">Very high resistance applications</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200 text-center shadow-sm">
                      <div className="font-medium text-gray-800">0.1Ω - 1Ω</div>
                      <p className="text-xs mt-1 text-gray-600">Current sensing (shunt resistors)</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            
            {/* Troubleshooting Section */}
            <section id="troubleshooting" className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-red-500 px-6 py-3 flex items-center justify-between">
                <h3 className="font-semibold text-white text-lg">Troubleshooting & Common Problems</h3>
                <span className="bg-white text-red-500 rounded-full w-8 h-8 inline-flex items-center justify-center font-bold">5</span>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className="font-medium text-red-800">Problem: Circuit Not Working</h4>
                        <ul className="mt-2 space-y-2 text-sm pl-5 list-disc">
                          <li><span className="font-medium">Check for open circuit:</span> Use a multimeter to test if the resistor is broken (reading "OL" on continuity test)</li>
                          <li><span className="font-medium">Verify connections:</span> Ensure the resistor is properly connected and soldered</li>
                          <li><span className="font-medium">Confirm resistance value:</span> Measure the actual resistance to ensure it matches what you expect</li>
                          <li><span className="font-medium">Check for damage:</span> Look for burn marks or discoloration that might indicate resistor failure</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className="font-medium text-red-800">Problem: Resistor Getting Hot</h4>
                        <ul className="mt-2 space-y-2 text-sm pl-5 list-disc">
                          <li><span className="font-medium">Power rating is too low:</span> The resistor is dissipating more power than it can handle</li>
                          <li><span className="font-medium">Calculate the power:</span> P = I² × R or P = V² ÷ R</li>
                          <li><span className="font-medium">Solution:</span> Replace with a higher wattage resistor</li>
                          <li><span className="font-medium">Alternative:</span> Use multiple resistors in parallel or series to distribute the power</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className="font-medium text-red-800">Problem: LED Too Dim or Too Bright</h4>
                        <ul className="mt-2 space-y-2 text-sm pl-5 list-disc">
                          <li><span className="font-medium">Too dim:</span> Resistor value is too high, limiting too much current</li>
                          <li><span className="font-medium">Too bright/LED failure:</span> Resistor value is too low, allowing too much current</li>
                          <li><span className="font-medium">Solution:</span> Recalculate the correct resistor value using I = V ÷ R</li>
                          <li><span className="font-medium">Rule of thumb:</span> Most standard LEDs need 20mA current</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className="font-medium text-red-800">Problem: Inaccurate Readings</h4>
                        <ul className="mt-2 space-y-2 text-sm pl-5 list-disc">
                          <li><span className="font-medium">Tolerance issue:</span> Standard resistors have ±5% or ±10% tolerance</li>
                          <li><span className="font-medium">Temperature effects:</span> Resistance changes with temperature</li>
                          <li><span className="font-medium">Solution for precision:</span> Use resistors with tighter tolerance (±1% or better)</li>
                          <li><span className="font-medium">For temperature stability:</span> Use metal film instead of carbon film resistors</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-amber-50 p-5 rounded-lg border border-amber-100">
                  <h4 className="font-medium text-amber-800 border-b border-amber-200 pb-2">Testing Resistors</h4>
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-amber-200">
                      <h5 className="font-medium text-amber-800">Using a Multimeter</h5>
                      <ol className="mt-2 space-y-1 text-sm pl-5 list-decimal">
                        <li>Set the multimeter to the Ohms (Ω) setting</li>
                        <li>Select a range higher than your expected resistance</li>
                        <li>Remove the resistor from the circuit (important!)</li>
                        <li>Touch the probes to each end of the resistor</li>
                        <li>Read the value and compare with the expected value</li>
                      </ol>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-amber-200">
                      <h5 className="font-medium text-amber-800">What to Look For</h5>
                      <ul className="mt-2 space-y-1 text-sm pl-5 list-disc">
                        <li><span className="font-medium">"OL" reading:</span> Open circuit/broken resistor</li>
                        <li><span className="font-medium">0Ω reading:</span> Short circuit (not normal for a resistor)</li>
                        <li><span className="font-medium">Value within tolerance:</span> Resistor is good</li>
                        <li><span className="font-medium">Value far off:</span> Resistor is damaged or wrong value</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            
            {/* Projects Section */}
            <section id="projects" className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-teal-500 px-6 py-3 flex items-center justify-between">
                <h3 className="font-semibold text-white text-lg">Fun Projects & Exercises</h3>
                <span className="bg-white text-teal-500 rounded-full w-8 h-8 inline-flex items-center justify-center font-bold">6</span>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-teal-50 to-green-50 rounded-lg overflow-hidden shadow-sm border border-teal-200">
                    <div className="bg-teal-500 p-3 text-white">
                      <h4 className="font-medium">Project 1: LED Night Light</h4>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="bg-white p-3 rounded-lg border border-teal-100">
                        <p className="font-medium text-teal-800">Components:</p>
                        <ul className="mt-1 text-sm pl-5 list-disc">
                          <li>9V battery with connector</li>
                          <li>3 LEDs: red, green, and blue</li>
                          <li>3 resistors (we'll calculate the values)</li>
                          <li>Breadboard and jumper wires</li>
                        </ul>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-teal-100">
                        <p className="font-medium text-teal-800">First, calculate the resistor values:</p>
                        <p className="mt-1 text-sm">Each LED needs about 20mA (0.02A) of current but has different forward voltages:</p>
                        <div className="mt-2 space-y-1 text-sm">
                          <p>• Red LED (1.8V): R = (9V - 1.8V) ÷ 0.02A = 360Ω → use 390Ω</p>
                          <p>• Green LED (2.2V): R = (9V - 2.2V) ÷ 0.02A = 340Ω → use 330Ω</p>
                          <p>• Blue LED (3.0V): R = (9V - 3.0V) ÷ 0.02A = 300Ω → use 330Ω</p>
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-teal-100">
                        <p className="font-medium text-teal-800">What You'll Learn:</p>
                        <ul className="mt-1 text-sm pl-5 list-disc">
                          <li>How to calculate resistor values for LEDs</li>
                          <li>Series circuit construction</li>
                          <li>How different color LEDs have different voltage requirements</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-teal-50 to-green-50 rounded-lg overflow-hidden shadow-sm border border-teal-200">
                    <div className="bg-teal-500 p-3 text-white">
                      <h4 className="font-medium">Project 2: Voltage Divider Sensor</h4>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="bg-white p-3 rounded-lg border border-teal-100">
                        <p className="font-medium text-teal-800">Components:</p>
                        <ul className="mt-1 text-sm pl-5 list-disc">
                          <li>Arduino or similar microcontroller</li>
                          <li>10kΩ resistor</li>
                          <li>Photoresistor (LDR)</li>
                          <li>LED with appropriate resistor</li>
                          <li>Breadboard and jumper wires</li>
                        </ul>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-teal-100">
                        <p className="font-medium text-teal-800">Circuit:</p>
                        <p className="mt-1 text-sm">Create a voltage divider with the fixed resistor and the photoresistor:</p>
                        <ul className="mt-1 text-sm pl-5 list-disc">
                          <li>Connect 5V to one end of the photoresistor</li>
                          <li>Connect the other end to both the 10kΩ resistor and an analog pin</li>
                          <li>Connect the other end of the 10kΩ resistor to ground</li>
                          <li>As light changes, resistance changes, changing the voltage at the analog pin</li>
                        </ul>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-teal-100">
                        <p className="font-medium text-teal-800">What You'll Learn:</p>
                        <ul className="mt-1 text-sm pl-5 list-disc">
                          <li>How voltage dividers work with variable resistors</li>
                          <li>How to read analog values with a microcontroller</li>
                          <li>How to create a light-activated circuit</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-5 rounded-lg border border-teal-200">
                  <h4 className="font-medium text-teal-800 border-b border-teal-100 pb-2">Exercise: Resistor Combinations</h4>
                  <div className="mt-3 space-y-4">
                    <p className="text-teal-700">
                      In real projects, you often won't have exactly the resistor value you need. Practice creating specific values using standard resistors in series or parallel.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-teal-50 p-3 rounded-lg">
                        <h5 className="font-medium text-teal-800">Challenge 1:</h5>
                        <p className="text-sm mt-1">Create a 375Ω resistor using standard values (220Ω, 330Ω, 470Ω, etc.)</p>
                        <div className="mt-2 bg-white p-2 rounded text-sm">
                          <p className="font-medium">Solution:</p>
                          <p>220Ω + 150Ω in series = 370Ω (close enough!)</p>
                          <p className="text-xs mt-1 text-gray-600">Or 470Ω ∥ 1.2kΩ gives approximately 373Ω</p>
                        </div>
                      </div>
                      <div className="bg-teal-50 p-3 rounded-lg">
                        <h5 className="font-medium text-teal-800">Challenge 2:</h5>
                        <p className="text-sm mt-1">Create a 3.3kΩ resistor if you only have 2.2kΩ and 10kΩ resistors</p>
                        <div className="mt-2 bg-white p-2 rounded text-sm">
                          <p className="font-medium">Solution:</p>
                          <p>2.2kΩ + (10kΩ ∥ 10kΩ) = 2.2kΩ + 5kΩ = 7.2kΩ</p>
                          <p className="text-xs mt-1 text-gray-600">(We need more resistors! Try another combination)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            
            {/* Final Thoughts Section */}
            <section className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-l-4 border-blue-500 shadow-sm">
              <h3 className="text-xl font-semibold text-blue-800">Key Takeaways</h3>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h4 className="ml-3 font-medium text-blue-800">The Foundation of Electronics</h4>
                  </div>
                  <p className="mt-2 text-sm text-gray-700">
                    Resistors are one of the most fundamental components in electronics. Understanding them opens the door to countless other concepts.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="ml-3 font-medium text-blue-800">Practical Applications</h4>
                  </div>
                  <p className="mt-2 text-sm text-gray-700">
                    From LEDs to complex circuits, resistors play crucial roles in limiting current, dividing voltage, and setting operating points.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                    </div>
                    <h4 className="ml-3 font-medium text-blue-800">Versatility</h4>
                  </div>
                  <p className="mt-2 text-sm text-gray-700">
                    With different values, combinations, and types, resistors can be configured to meet almost any circuit requirement.
                  </p>
                </div>
              </div>
              
              <div className="mt-6 bg-white/60 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center border-2 border-blue-300 p-1 shadow-inner">
                      <div className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-transparent bg-clip-text">G</div>
                    </div>
                  </div>
                  <div className="ml-4 italic text-blue-700 border-l-4 border-blue-200 pl-4 flex items-center">
                    <div>
                      <p>"Remember, young maker, resistors are like the gatekeepers of your circuit - they ensure just the right amount of current flows where it needs to go. Master them, and you've taken your first big step in your electronics journey!"</p>
                      <p className="mt-2 text-sm">"Now, try using the Calculator tab to practice identifying resistor values, and soon you'll be reading resistor color bands as easily as reading words on a page!"</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
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
        
        {/* Explainer Tab */}
        {activeTab === 'explainer' && (
          <div className="space-y-6">
            <div className="bg-emerald-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-emerald-800">How Resistor Color Bands Work</h3>
              <p className="mt-2 text-emerald-700">
                Resistors use color bands to indicate their resistance value, tolerance, and sometimes temperature coefficient.
                Let's learn how to decode these bands!
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-semibold mb-3">4-Band Resistors (Most Common)</h4>
                <div className="bg-amber-100 p-6 rounded-lg relative w-full h-24 mb-4">
                  <div className="absolute bg-amber-800 w-full h-8 left-0 top-8"></div>
                  <div className="absolute w-4 h-20 left-16 top-2 bg-amber-800 text-white flex items-center justify-center">1</div>
                  <div className="absolute w-4 h-20 left-24 top-2 bg-black text-white flex items-center justify-center">2</div>
                  <div className="absolute w-4 h-20 left-32 top-2 bg-red-600 text-white flex items-center justify-center">3</div>
                  <div className="absolute w-4 h-20 left-40 top-2 bg-yellow-600 text-white flex items-center justify-center">4</div>
                  <div className="absolute w-10 h-2 bg-gray-600 left-2 top-11"></div>
                  <div className="absolute w-10 h-2 bg-gray-600 right-2 top-11"></div>
                </div>
                
                <ul className="list-decimal pl-5 space-y-2">
                  <li><span className="font-medium">1st Band:</span> First digit of resistance value</li>
                  <li><span className="font-medium">2nd Band:</span> Second digit of resistance value</li>
                  <li><span className="font-medium">3rd Band:</span> Multiplier (number of zeros to add)</li>
                  <li><span className="font-medium">4th Band:</span> Tolerance (accuracy of the resistor)</li>
                </ul>
                
                <div className="bg-blue-50 p-3 rounded-lg mt-4">
                  <p className="font-medium">Example: Brown-Black-Red-Gold</p>
                  <ul className="list-disc pl-5 mt-2">
                    <li>1st Band (Brown) = 1</li>
                    <li>2nd Band (Black) = 0</li>
                    <li>3rd Band (Red) = 100 (add 2 zeros)</li>
                    <li>4th Band (Gold) = ±5% tolerance</li>
                    <li>Result: 10 × 100 = 1,000Ω = 1kΩ ±5%</li>
                  </ul>
                </div>
              </div>
              
              <div>
                <h4 className="text-md font-semibold mb-3">5-Band Resistors (Higher Precision)</h4>
                <div className="bg-amber-100 p-6 rounded-lg relative w-full h-24 mb-4">
                  <div className="absolute bg-amber-800 w-full h-8 left-0 top-8"></div>
                  <div className="absolute w-4 h-20 left-16 top-2 bg-amber-800 text-white flex items-center justify-center">1</div>
                  <div className="absolute w-4 h-20 left-24 top-2 bg-black text-white flex items-center justify-center">2</div>
                  <div className="absolute w-4 h-20 left-32 top-2 bg-orange-500 text-white flex items-center justify-center">3</div>
                  <div className="absolute w-4 h-20 left-40 top-2 bg-blue-600 text-white flex items-center justify-center">4</div>
                  <div className="absolute w-4 h-20 left-48 top-2 bg-green-600 text-white flex items-center justify-center">5</div>
                  <div className="absolute w-10 h-2 bg-gray-600 left-2 top-11"></div>
                  <div className="absolute w-10 h-2 bg-gray-600 right-2 top-11"></div>
                </div>
                
                <ul className="list-decimal pl-5 space-y-2">
                  <li><span className="font-medium">1st Band:</span> First digit of resistance value</li>
                  <li><span className="font-medium">2nd Band:</span> Second digit of resistance value</li>
                  <li><span className="font-medium">3rd Band:</span> Third digit of resistance value</li>
                  <li><span className="font-medium">4th Band:</span> Multiplier (number of zeros to add)</li>
                  <li><span className="font-medium">5th Band:</span> Tolerance (accuracy of the resistor)</li>
                </ul>
                
                <div className="bg-blue-50 p-3 rounded-lg mt-4">
                  <p className="font-medium">Example: Brown-Black-Orange-Blue-Green</p>
                  <ul className="list-disc pl-5 mt-2">
                    <li>1st Band (Brown) = 1</li>
                    <li>2nd Band (Black) = 0</li>
                    <li>3rd Band (Orange) = 3</li>
                    <li>4th Band (Blue) = 1,000,000 (add 6 zeros)</li>
                    <li>5th Band (Green) = ±0.5% tolerance</li>
                    <li>Result: 103 × 1,000,000 = 103,000,000Ω = 103MΩ ±0.5%</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-md font-semibold mb-3">Color Code Chart</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                      <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value (1st-3rd Bands)</th>
                      <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Multiplier (4-band)</th>
                      <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tolerance</th>
                      <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temp. Coefficient</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-2"><div className="h-6 w-6 rounded-full bg-black"></div></td>
                      <td className="px-4 py-2">0</td>
                      <td className="px-4 py-2">×1</td>
                      <td className="px-4 py-2">-</td>
                      <td className="px-4 py-2">250ppm</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2"><div className="h-6 w-6 rounded-full bg-amber-800"></div></td>
                      <td className="px-4 py-2">1</td>
                      <td className="px-4 py-2">×10</td>
                      <td className="px-4 py-2">±1%</td>
                      <td className="px-4 py-2">100ppm</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2"><div className="h-6 w-6 rounded-full bg-red-600"></div></td>
                      <td className="px-4 py-2">2</td>
                      <td className="px-4 py-2">×100</td>
                      <td className="px-4 py-2">±2%</td>
                      <td className="px-4 py-2">50ppm</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2"><div className="h-6 w-6 rounded-full bg-orange-500"></div></td>
                      <td className="px-4 py-2">3</td>
                      <td className="px-4 py-2">×1,000 (1K)</td>
                      <td className="px-4 py-2">±3%</td>
                      <td className="px-4 py-2">15ppm</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2"><div className="h-6 w-6 rounded-full bg-yellow-400"></div></td>
                      <td className="px-4 py-2">4</td>
                      <td className="px-4 py-2">×10,000 (10K)</td>
                      <td className="px-4 py-2">±4%</td>
                      <td className="px-4 py-2">25ppm</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2"><div className="h-6 w-6 rounded-full bg-green-600"></div></td>
                      <td className="px-4 py-2">5</td>
                      <td className="px-4 py-2">×100,000 (100K)</td>
                      <td className="px-4 py-2">±0.5%</td>
                      <td className="px-4 py-2">20ppm</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2"><div className="h-6 w-6 rounded-full bg-blue-600"></div></td>
                      <td className="px-4 py-2">6</td>
                      <td className="px-4 py-2">×1,000,000 (1M)</td>
                      <td className="px-4 py-2">±0.25%</td>
                      <td className="px-4 py-2">10ppm</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2"><div className="h-6 w-6 rounded-full bg-purple-600"></div></td>
                      <td className="px-4 py-2">7</td>
                      <td className="px-4 py-2">×10,000,000 (10M)</td>
                      <td className="px-4 py-2">±0.1%</td>
                      <td className="px-4 py-2">5ppm</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2"><div className="h-6 w-6 rounded-full bg-gray-500"></div></td>
                      <td className="px-4 py-2">8</td>
                      <td className="px-4 py-2">×100,000,000 (100M)</td>
                      <td className="px-4 py-2">±0.05%</td>
                      <td className="px-4 py-2">1ppm</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2"><div className="h-6 w-6 rounded-full bg-white border border-gray-300"></div></td>
                      <td className="px-4 py-2">9</td>
                      <td className="px-4 py-2">×1,000,000,000 (1G)</td>
                      <td className="px-4 py-2">-</td>
                      <td className="px-4 py-2">-</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2"><div className="h-6 w-6 rounded-full bg-yellow-600"></div></td>
                      <td className="px-4 py-2">-</td>
                      <td className="px-4 py-2">×0.1</td>
                      <td className="px-4 py-2">±5%</td>
                      <td className="px-4 py-2">-</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2"><div className="h-6 w-6 rounded-full bg-gray-300"></div></td>
                      <td className="px-4 py-2">-</td>
                      <td className="px-4 py-2">×0.01</td>
                      <td className="px-4 py-2">±10%</td>
                      <td className="px-4 py-2">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg mt-6">
              <h3 className="text-md font-semibold text-purple-800">Tips for Reading Resistors</h3>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>The gold or silver band (tolerance) is usually on the right side of the resistor.</li>
                <li>Read the resistor from left to right, with the tolerance band on the right.</li>
                <li>If there's a gap between bands, start from the side opposite the gap.</li>
                <li>When in doubt, use a multimeter to measure the actual resistance.</li>
                <li>Common tolerances are ±5% (gold) and ±10% (silver) for standard resistors.</li>
              </ul>
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