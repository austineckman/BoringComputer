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
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-xl font-bold text-blue-800">Resistors: The Traffic Controllers of Electronics</h2>
              <p className="text-blue-700 mt-2">
                Welcome to our friendly guide to understanding resistors! Let's explore these essential components together.
              </p>
            </div>
            
            <div className="space-y-4">
              <section className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-blue-600">What is a Resistor?</h3>
                <p className="mt-2">
                  Imagine a water pipe with a narrowing in the middle. The narrower section restricts water flow, right? 
                  That's exactly what a resistor does with electricity! It controls or limits the flow of electric current in a circuit.
                </p>
                <div className="bg-yellow-50 p-3 mt-3 rounded-lg">
                  <p className="font-medium">Think of it this way:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Water in a pipe = Electrons in a wire</li>
                    <li>Narrow section = Resistor</li>
                    <li>Water pressure = Voltage</li>
                    <li>Water flow rate = Current</li>
                  </ul>
                </div>
              </section>
              
              <section className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-blue-600">Resistance: Measured in Ohms (Ω)</h3>
                <p className="mt-2">
                  Resistance is measured in units called ohms, symbolized by the Greek letter omega (Ω). 
                  The higher the ohm value, the more the resistor restricts current flow.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="font-medium text-green-800">Low Resistance (e.g., 10Ω)</p>
                    <p className="text-sm mt-1">Allows more current flow, like a wide pipe</p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="font-medium text-yellow-800">Medium Resistance (e.g., 1kΩ)</p>
                    <p className="text-sm mt-1">Moderate current restriction</p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="font-medium text-red-800">High Resistance (e.g., 1MΩ)</p>
                    <p className="text-sm mt-1">Greatly limits current, like a very narrow pipe</p>
                  </div>
                </div>
              </section>
              
              <section className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-blue-600">Ohm's Law: The Golden Rule of Electronics</h3>
                <p className="mt-2">
                  Ohm's Law is the relationship between voltage (V), current (I), and resistance (R):
                </p>
                <div className="bg-blue-100 p-4 my-3 rounded-lg text-center">
                  <p className="text-xl font-bold">V = I × R</p>
                  <p className="mt-1">Voltage = Current × Resistance</p>
                </div>
                <p className="mt-2">This means we can also find:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Current: I = V ÷ R (Current equals voltage divided by resistance)</li>
                  <li>Resistance: R = V ÷ I (Resistance equals voltage divided by current)</li>
                </ul>
                
                <div className="bg-indigo-50 p-4 mt-4 rounded-lg">
                  <h4 className="font-medium text-indigo-800">Example: A Simple Circuit</h4>
                  <p className="mt-2">If you have a 9V battery powering a circuit with a 1kΩ (1000Ω) resistor:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Current = Voltage ÷ Resistance</li>
                    <li>Current = 9V ÷ 1000Ω = 0.009A = 9mA</li>
                  </ul>
                  <p className="mt-2">So the current flowing through that resistor will be 9 milliamps (mA).</p>
                </div>
              </section>
              
              <section className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-blue-600">Real-World Applications</h3>
                
                <div className="mt-3 space-y-4">
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <h4 className="font-medium text-purple-800">LED Current Limiting</h4>
                    <p className="mt-1">
                      LEDs need a resistor in series to prevent them from drawing too much current and burning out.
                    </p>
                    <div className="mt-2 bg-white p-3 rounded border border-purple-200">
                      <p className="font-medium">Example: LED with 3.3V Arduino</p>
                      <ul className="list-disc pl-5 mt-1 text-sm">
                        <li>Arduino output: 3.3V</li>
                        <li>Red LED forward voltage: ~2V</li>
                        <li>Desired current: 20mA (0.02A)</li>
                        <li>Voltage across resistor: 3.3V - 2V = 1.3V</li>
                        <li>Resistor value: R = V ÷ I = 1.3V ÷ 0.02A = 65Ω</li>
                        <li>Closest standard value: 68Ω</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-3 rounded-lg">
                    <h4 className="font-medium text-green-800">Voltage Dividers</h4>
                    <p className="mt-1">
                      Two resistors in series can divide voltage proportionally, useful for measuring high voltages with a microcontroller.
                    </p>
                    <div className="mt-2 bg-white p-3 rounded border border-green-200">
                      <p className="font-medium">Example: Reading a 12V battery with Arduino (max 5V input)</p>
                      <ul className="list-disc pl-5 mt-1 text-sm">
                        <li>Need to divide 12V down to under 5V</li>
                        <li>Use two resistors: R1 = 10kΩ, R2 = 5kΩ</li>
                        <li>Output voltage: Vout = Vin × (R2 ÷ (R1 + R2))</li>
                        <li>Vout = 12V × (5kΩ ÷ (10kΩ + 5kΩ)) = 12V × 0.33 = 4V</li>
                        <li>Now we can safely read the 12V battery's voltage!</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 p-3 rounded-lg">
                    <h4 className="font-medium text-amber-800">Pull-Up/Pull-Down Resistors</h4>
                    <p className="mt-1">
                      These resistors ensure a pin is in a defined state (HIGH or LOW) when not actively driven.
                    </p>
                    <div className="mt-2 bg-white p-3 rounded border border-amber-200">
                      <p className="font-medium">Example: Button with Arduino</p>
                      <ul className="list-disc pl-5 mt-1 text-sm">
                        <li>Button connected to digital pin and ground</li>
                        <li>10kΩ pull-up resistor connects pin to 5V</li>
                        <li>When button not pressed: Pin reads HIGH (5V)</li>
                        <li>When button pressed: Pin connects to ground, reads LOW (0V)</li>
                        <li>Without the pull-up resistor, the pin would "float" when button is not pressed</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>
              
              <section className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-blue-600">Resistors in Series and Parallel</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium">Resistors in Series</h4>
                    <p className="mt-1 mb-3">When resistors are connected end-to-end, their values add up:</p>
                    <div className="bg-white p-3 rounded border border-blue-200 text-center">
                      <p className="font-bold">Rtotal = R1 + R2 + R3 + ...</p>
                    </div>
                    <div className="mt-4 bg-white p-3 rounded border border-blue-200">
                      <p className="font-medium">Example:</p>
                      <p className="mt-1">Three resistors in series: 100Ω, 220Ω, and 330Ω</p>
                      <p className="mt-1">Total resistance = 100Ω + 220Ω + 330Ω = 650Ω</p>
                    </div>
                  </div>
                  
                  <div className="bg-teal-50 p-4 rounded-lg">
                    <h4 className="font-medium">Resistors in Parallel</h4>
                    <p className="mt-1 mb-3">When resistors are connected side-by-side, the calculation is:</p>
                    <div className="bg-white p-3 rounded border border-teal-200 text-center">
                      <p className="font-bold">1/Rtotal = 1/R1 + 1/R2 + 1/R3 + ...</p>
                    </div>
                    <div className="mt-4 bg-white p-3 rounded border border-teal-200">
                      <p className="font-medium">Example:</p>
                      <p className="mt-1">Two resistors in parallel: 100Ω and 100Ω</p>
                      <p className="mt-1">1/Rtotal = 1/100Ω + 1/100Ω = 2/100Ω</p>
                      <p className="mt-1">Rtotal = 50Ω</p>
                      <p className="text-sm mt-2 italic">Note: Parallel resistors always result in a lower total resistance than any individual resistor.</p>
                    </div>
                  </div>
                </div>
              </section>
              
              <section className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-blue-600">Power in Resistors: The Heat Factor</h3>
                <p className="mt-2">
                  Resistors convert electrical energy to heat. The power (in watts) they dissipate is important:
                </p>
                
                <div className="bg-red-50 p-4 mt-3 rounded-lg">
                  <div className="text-center">
                    <p className="font-bold text-lg">P = I² × R</p>
                    <p className="mt-1">Power = Current² × Resistance</p>
                    <p className="font-bold text-lg mt-3">P = V² ÷ R</p>
                    <p className="mt-1">Power = Voltage² ÷ Resistance</p>
                  </div>
                  
                  <div className="mt-4 bg-white p-3 rounded border border-red-200">
                    <p className="font-medium">Example: Power Calculation</p>
                    <p className="mt-1">A 1kΩ resistor with 12V across it:</p>
                    <ul className="list-disc pl-5 mt-1">
                      <li>P = V² ÷ R = (12V)² ÷ 1,000Ω = 144 ÷ 1,000 = 0.144 watts (144 milliwatts)</li>
                    </ul>
                    <p className="mt-2 font-medium">Therefore:</p>
                    <ul className="list-disc pl-5 mt-1">
                      <li>You need at least a ¼W (0.25W) resistor for this application</li>
                      <li>A smaller power rating would cause the resistor to overheat</li>
                    </ul>
                  </div>
                </div>
              </section>
              
              <section>
                <h3 className="text-lg font-semibold text-blue-600">Common Resistor Values and Projects</h3>
                
                <div className="mt-3 space-y-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h4 className="font-medium">Common Values You'll See Everywhere</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                      <div className="bg-white p-2 rounded border border-slate-200 text-center">
                        <p className="font-medium">220Ω</p>
                        <p className="text-xs">LED current limiting</p>
                      </div>
                      <div className="bg-white p-2 rounded border border-slate-200 text-center">
                        <p className="font-medium">330Ω</p>
                        <p className="text-xs">LED current limiting</p>
                      </div>
                      <div className="bg-white p-2 rounded border border-slate-200 text-center">
                        <p className="font-medium">1kΩ</p>
                        <p className="text-xs">General purpose</p>
                      </div>
                      <div className="bg-white p-2 rounded border border-slate-200 text-center">
                        <p className="font-medium">10kΩ</p>
                        <p className="text-xs">Pull-up/down resistors</p>
                      </div>
                      <div className="bg-white p-2 rounded border border-slate-200 text-center">
                        <p className="font-medium">4.7kΩ</p>
                        <p className="text-xs">I²C pull-ups</p>
                      </div>
                      <div className="bg-white p-2 rounded border border-slate-200 text-center">
                        <p className="font-medium">100kΩ</p>
                        <p className="text-xs">High impedance inputs</p>
                      </div>
                      <div className="bg-white p-2 rounded border border-slate-200 text-center">
                        <p className="font-medium">470Ω</p>
                        <p className="text-xs">LED series resistor</p>
                      </div>
                      <div className="bg-white p-2 rounded border border-slate-200 text-center">
                        <p className="font-medium">2.2kΩ</p>
                        <p className="text-xs">Audio applications</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <h4 className="font-medium text-indigo-800">Beginner Project: LED Brightness Control</h4>
                    <p className="mt-1">Try different resistor values with an LED to see brightness changes:</p>
                    <ul className="list-disc pl-5 mt-2">
                      <li>220Ω - Bright</li>
                      <li>470Ω - Medium</li>
                      <li>1kΩ - Dim</li>
                      <li>10kΩ - Very dim</li>
                    </ul>
                    <p className="text-sm mt-2">This simple experiment shows how resistors limit current and directly affect LED brightness.</p>
                  </div>
                  
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h4 className="font-medium text-emerald-800">Advanced Application: Logic Level Conversion</h4>
                    <p className="mt-1">Converting between 5V and 3.3V logic levels:</p>
                    <div className="mt-2 bg-white p-3 rounded border border-emerald-200">
                      <p className="text-sm">Using a voltage divider with 1kΩ and 2kΩ resistors:</p>
                      <p className="text-sm mt-1">5V × (2kΩ ÷ (1kΩ + 2kΩ)) = 5V × 0.66 = 3.3V</p>
                      <p className="text-sm mt-2 italic">This simple circuit lets a 5V Arduino communicate with a 3.3V Raspberry Pi.</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg mt-8">
              <h3 className="text-lg font-semibold text-blue-800">Final Thoughts</h3>
              <p className="mt-2">
                Resistors might seem simple, but they're at the heart of almost every electronic circuit. 
                Understanding how they work opens up a world of possibilities in your maker journey!
              </p>
              <p className="mt-2">
                Remember, practice makes perfect. Try using the calculator tab to decode resistor color bands, 
                and soon you'll be identifying resistors at a glance.
              </p>
            </div>
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