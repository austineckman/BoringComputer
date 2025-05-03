import React, { useState } from 'react';
import { X, Minimize2, Calculator, Info } from 'lucide-react';

interface ResistorCalculatorWindowProps {
  onClose: () => void;
  onMinimize: () => void;
  isActive: boolean;
}

const ResistorCalculatorWindow: React.FC<ResistorCalculatorWindowProps> = ({
  onClose,
  onMinimize,
  isActive,
}) => {
  // Tab management
  const [activeTab, setActiveTab] = useState<'calculator' | 'identifier' | 'explainer'>('calculator');
  
  // Resistor calculator state
  const [resistance, setResistance] = useState<number>(1000); // Default 1kΩ
  const [unit, setUnit] = useState<'ohm' | 'kilohm' | 'megohm'>('kilohm');
  
  // Resistor color code state
  const [band1, setBand1] = useState<string>('brown');
  const [band2, setBand2] = useState<string>('black');
  const [band3, setBand3] = useState<string>('red');
  const [band4, setBand4] = useState<string>('gold');
  const [band5, setBand5] = useState<string>('none'); // Optional 5th band
  
  // Resistor data
  const colorCodes = {
    black: { value: 0, multiplier: 1, tolerance: null, temp: 250 },
    brown: { value: 1, multiplier: 10, tolerance: 1, temp: 100 },
    red: { value: 2, multiplier: 100, tolerance: 2, temp: 50 },
    orange: { value: 3, multiplier: 1000, tolerance: 3, temp: 15 },
    yellow: { value: 4, multiplier: 10000, tolerance: 4, temp: 25 },
    green: { value: 5, multiplier: 100000, tolerance: 0.5, temp: 20 },
    blue: { value: 6, multiplier: 1000000, tolerance: 0.25, temp: 10 },
    violet: { value: 7, multiplier: 10000000, tolerance: 0.1, temp: 5 },
    grey: { value: 8, multiplier: 100000000, tolerance: 0.05, temp: 1 },
    white: { value: 9, multiplier: 1000000000, tolerance: null, temp: null },
    gold: { value: null, multiplier: 0.1, tolerance: 5, temp: null },
    silver: { value: null, multiplier: 0.01, tolerance: 10, temp: null },
    none: { value: null, multiplier: null, tolerance: 20, temp: null },
  };
  
  // Calculate resistor value from color bands
  const calculateResistorValue = () => {
    // For 4-band resistor
    const digits = `${colorCodes[band1].value}${colorCodes[band2].value}`;
    const multiplier = colorCodes[band3].multiplier;
    const tolerance = colorCodes[band4].tolerance;
    
    // Calculate resistor value
    let value = parseInt(digits) * multiplier;
    
    // Convert to appropriate unit
    let unitStr = 'Ω';
    if (value >= 1000000) {
      value = value / 1000000;
      unitStr = 'MΩ';
    } else if (value >= 1000) {
      value = value / 1000;
      unitStr = 'kΩ';
    }
    
    return {
      value,
      unitStr,
      tolerance,
    };
  };
  
  // Calculate color bands from resistor value
  const calculateColorBands = () => {
    let calculatedValue = resistance;
    switch (unit) {
      case 'kilohm':
        calculatedValue = resistance * 1000;
        break;
      case 'megohm':
        calculatedValue = resistance * 1000000;
        break;
    }
    
    // Convert to string and determine digits
    const valueStr = calculatedValue.toString();
    let digit1 = parseInt(valueStr[0]);
    let digit2 = valueStr.length > 1 ? parseInt(valueStr[1]) : 0;
    
    // Determine multiplier (zeros)
    let zeros = valueStr.length - 2;
    if (zeros < 0) zeros = 0;
    
    // Find color for each band
    let color1 = Object.keys(colorCodes).find(
      k => colorCodes[k].value === digit1
    ) || 'brown';
    
    let color2 = Object.keys(colorCodes).find(
      k => colorCodes[k].value === digit2
    ) || 'black';
    
    let color3 = 'black'; // Default
    
    // Find multiplier color
    if (zeros === 0) {
      color3 = 'black';
    } else if (zeros === 1) {
      color3 = 'brown';
    } else if (zeros === 2) {
      color3 = 'red';
    } else if (zeros === 3) {
      color3 = 'orange';
    } else if (zeros === 4) {
      color3 = 'yellow';
    } else if (zeros === 5) {
      color3 = 'green';
    } else if (zeros === 6) {
      color3 = 'blue';
    } else if (zeros === 7) {
      color3 = 'violet';
    } else if (zeros === 8) {
      color3 = 'grey';
    } else if (zeros === 9) {
      color3 = 'white';
    }
    
    return { color1, color2, color3 };
  };
  
  // Update color bands when resistance changes
  const handleResistanceChange = (value: number) => {
    setResistance(value);
    const { color1, color2, color3 } = calculateColorBands();
    setBand1(color1);
    setBand2(color2);
    setBand3(color3);
  };
  
  // Update unit when it changes
  const handleUnitChange = (newUnit: 'ohm' | 'kilohm' | 'megohm') => {
    let newValue = resistance;
    
    // Convert from old unit to new unit
    if (unit === 'ohm' && newUnit === 'kilohm') {
      newValue = resistance / 1000;
    } else if (unit === 'ohm' && newUnit === 'megohm') {
      newValue = resistance / 1000000;
    } else if (unit === 'kilohm' && newUnit === 'ohm') {
      newValue = resistance * 1000;
    } else if (unit === 'kilohm' && newUnit === 'megohm') {
      newValue = resistance / 1000;
    } else if (unit === 'megohm' && newUnit === 'ohm') {
      newValue = resistance * 1000000;
    } else if (unit === 'megohm' && newUnit === 'kilohm') {
      newValue = resistance * 1000;
    }
    
    setUnit(newUnit);
    setResistance(newValue);
    const { color1, color2, color3 } = calculateColorBands();
    setBand1(color1);
    setBand2(color2);
    setBand3(color3);
  };
  
  // Handle band color changes
  const handleBandChange = (band: number, color: string) => {
    switch (band) {
      case 1:
        setBand1(color);
        break;
      case 2:
        setBand2(color);
        break;
      case 3:
        setBand3(color);
        break;
      case 4:
        setBand4(color);
        break;
      case 5:
        setBand5(color);
        break;
    }
  };
  
  // Resistor color representation
  const getBandColor = (color: string) => {
    switch (color) {
      case 'black': return 'bg-black';
      case 'brown': return 'bg-amber-800';
      case 'red': return 'bg-red-600';
      case 'orange': return 'bg-orange-500';
      case 'yellow': return 'bg-yellow-400';
      case 'green': return 'bg-green-600';
      case 'blue': return 'bg-blue-600';
      case 'violet': return 'bg-purple-600';
      case 'grey': return 'bg-gray-500';
      case 'white': return 'bg-white border border-gray-300';
      case 'gold': return 'bg-amber-400';
      case 'silver': return 'bg-gray-300';
      case 'none': return 'bg-transparent';
      default: return 'bg-transparent';
    }
  };
  
  const resistorValue = calculateResistorValue();
  
  return (
    <div className={`fixed top-10 left-1/2 transform -translate-x-1/2 w-[700px] h-[540px] bg-white shadow-lg rounded-lg overflow-hidden border border-gray-300 transition-opacity z-40 ${isActive ? 'opacity-100' : 'opacity-50'}`}>
      {/* Window title bar */}
      <div className="flex justify-between items-center bg-blue-600 text-white px-4 py-2">
        <div className="flex items-center space-x-2">
          <Calculator className="w-5 h-5" />
          <h2 className="font-bold">Resistor Calculator</h2>
        </div>
        <div className="flex space-x-2">
          <button onClick={onMinimize} className="p-1 hover:bg-blue-500 rounded">
            <Minimize2 className="w-4 h-4" />
          </button>
          <button onClick={onClose} className="p-1 hover:bg-red-500 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="bg-gray-100 border-b border-gray-300">
        <div className="flex">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'calculator' ? 'bg-white border-t-2 border-blue-500' : 'text-gray-600 hover:bg-gray-200'}`}
            onClick={() => setActiveTab('calculator')}
          >
            Calculator
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'identifier' ? 'bg-white border-t-2 border-blue-500' : 'text-gray-600 hover:bg-gray-200'}`}
            onClick={() => setActiveTab('identifier')}
          >
            Color Code Reader
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'explainer' ? 'bg-white border-t-2 border-blue-500' : 'text-gray-600 hover:bg-gray-200'}`}
            onClick={() => setActiveTab('explainer')}
          >
            Resistor Guide
          </button>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="p-6 h-[calc(540px-90px)] overflow-y-auto">
        {/* Calculator Tab */}
        {activeTab === 'calculator' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Resistor Value Calculator</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Resistor Value Input */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <h4 className="text-md font-medium text-gray-700 mb-3">Enter Resistor Value</h4>
                
                <div className="flex space-x-2 items-center mb-4">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={resistance}
                    onChange={(e) => handleResistanceChange(parseFloat(e.target.value) || 0)}
                    className="w-24 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  
                  <select
                    value={unit}
                    onChange={(e) => handleUnitChange(e.target.value as 'ohm' | 'kilohm' | 'megohm')}
                    className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ohm">Ω (ohm)</option>
                    <option value="kilohm">kΩ (kilohm)</option>
                    <option value="megohm">MΩ (megohm)</option>
                  </select>
                </div>
                
                <div className="flex space-x-2 mb-2">
                  <button 
                    onClick={() => handleResistanceChange(100)}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
                  >
                    100Ω
                  </button>
                  <button 
                    onClick={() => handleResistanceChange(220)}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
                  >
                    220Ω
                  </button>
                  <button 
                    onClick={() => handleResistanceChange(330)}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
                  >
                    330Ω
                  </button>
                  <button 
                    onClick={() => handleResistanceChange(470)}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
                  >
                    470Ω
                  </button>
                </div>
                
                <div className="flex space-x-2 mb-2">
                  <button 
                    onClick={() => handleResistanceChange(1)}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
                  >
                    1kΩ
                  </button>
                  <button 
                    onClick={() => handleResistanceChange(2.2)}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
                  >
                    2.2kΩ
                  </button>
                  <button 
                    onClick={() => handleResistanceChange(4.7)}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
                  >
                    4.7kΩ
                  </button>
                  <button 
                    onClick={() => handleResistanceChange(10)}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
                  >
                    10kΩ
                  </button>
                </div>
              </div>
              
              {/* Color Band Result */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <h4 className="text-md font-medium text-gray-700 mb-3">Resistor Color Bands</h4>
                
                <div className="flex items-center justify-center my-4 relative bg-stone-200 rounded-lg h-14 w-full max-w-lg mx-auto">
                  {/* Bands */}
                  <div className={`w-4 rounded-full h-full ${getBandColor(band1)} absolute left-4`}></div>
                  <div className={`w-4 rounded-full h-full ${getBandColor(band2)} absolute left-16`}></div>
                  <div className={`w-4 rounded-full h-full ${getBandColor(band3)} absolute left-28`}></div>
                  <div className={`w-4 rounded-full h-full ${getBandColor(band4)} absolute left-40`}></div>
                  {band5 !== 'none' && (
                    <div className={`w-4 rounded-full h-full ${getBandColor(band5)} absolute left-52`}></div>
                  )}
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg text-center my-4">
                  <p className="text-sm font-medium text-blue-800">Value: 
                    <span className="font-bold ml-1">{resistorValue.value.toFixed(2)} {resistorValue.unitStr} ±{resistorValue.tolerance}%</span>
                  </p>
                </div>
                
                <div className="mt-4 grid grid-cols-4 gap-2 text-xs text-center">
                  <div>
                    <p className="font-medium">1st Band</p>
                    <p>{band1}</p>
                  </div>
                  <div>
                    <p className="font-medium">2nd Band</p>
                    <p>{band2}</p>
                  </div>
                  <div>
                    <p className="font-medium">Multiplier</p>
                    <p>{band3}</p>
                  </div>
                  <div>
                    <p className="font-medium">Tolerance</p>
                    <p>{band4}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
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
        )}
        
        {/* Color Code Reader Tab */}
        {activeTab === 'identifier' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Resistor Color Code Reader</h3>
            
            <div className="bg-white p-4 rounded shadow border border-gray-200">
              <h4 className="text-md font-medium text-gray-700 mb-3">Select Color Bands</h4>
              
              {/* Color band selection */}
              <div className="grid grid-cols-5 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">1st Band</label>
                  <select
                    value={band1}
                    onChange={(e) => handleBandChange(1, e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.keys(colorCodes)
                      .filter(color => colorCodes[color].value !== null)
                      .map(color => (
                        <option key={color} value={color}>{color}</option>
                      ))
                    }
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">2nd Band</label>
                  <select
                    value={band2}
                    onChange={(e) => handleBandChange(2, e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.keys(colorCodes)
                      .filter(color => colorCodes[color].value !== null)
                      .map(color => (
                        <option key={color} value={color}>{color}</option>
                      ))
                    }
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Multiplier</label>
                  <select
                    value={band3}
                    onChange={(e) => handleBandChange(3, e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.keys(colorCodes)
                      .filter(color => colorCodes[color].multiplier !== null)
                      .map(color => (
                        <option key={color} value={color}>{color}</option>
                      ))
                    }
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tolerance</label>
                  <select
                    value={band4}
                    onChange={(e) => handleBandChange(4, e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.keys(colorCodes)
                      .filter(color => colorCodes[color].tolerance !== null)
                      .map(color => (
                        <option key={color} value={color}>{color}</option>
                      ))
                    }
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">5th Band (optional)</label>
                  <select
                    value={band5}
                    onChange={(e) => handleBandChange(5, e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="none">None</option>
                    {Object.keys(colorCodes)
                      .filter(color => color !== 'none' && colorCodes[color].temp !== null)
                      .map(color => (
                        <option key={color} value={color}>{color}</option>
                      ))
                    }
                  </select>
                </div>
              </div>
              
              {/* Resistor visualization */}
              <div className="flex items-center justify-center my-6 relative bg-stone-200 rounded-lg h-14 w-full max-w-lg mx-auto">
                <div className={`w-4 rounded-full h-full ${getBandColor(band1)} absolute left-4`}></div>
                <div className={`w-4 rounded-full h-full ${getBandColor(band2)} absolute left-16`}></div>
                <div className={`w-4 rounded-full h-full ${getBandColor(band3)} absolute left-28`}></div>
                <div className={`w-4 rounded-full h-full ${getBandColor(band4)} absolute left-40`}></div>
                {band5 !== 'none' && (
                  <div className={`w-4 rounded-full h-full ${getBandColor(band5)} absolute left-52`}></div>
                )}
              </div>
              
              {/* Resistor value result */}
              <div className="mt-4 bg-blue-100 p-4 rounded-lg text-center">
                <h4 className="font-medium text-blue-800 mb-1">Resistor Value</h4>
                <p className="text-xl font-bold text-blue-900">{resistorValue.value.toFixed(2)} {resistorValue.unitStr} ±{resistorValue.tolerance}%</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="text-md font-medium text-gray-700 mb-2">Color Code Reference</h4>
              
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">Color</th>
                      <th className="border p-2 text-left">Digit Value</th>
                      <th className="border p-2 text-left">Multiplier</th>
                      <th className="border p-2 text-left">Tolerance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(colorCodes).map(([color, values]) => (
                      <tr key={color} className="hover:bg-gray-50">
                        <td className="border p-2 flex items-center">
                          <div className={`w-4 h-4 mr-2 rounded-full ${getBandColor(color)}`}></div>
                          {color}
                        </td>
                        <td className="border p-2">{values.value !== null ? values.value : '-'}</td>
                        <td className="border p-2">{values.multiplier !== null ? `×${values.multiplier}` : '-'}</td>
                        <td className="border p-2">{values.tolerance !== null ? `±${values.tolerance}%` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {/* Resistor Guide Tab */}
        {activeTab === 'explainer' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Resistor Guide</h3>
            
            <div className="bg-white p-4 rounded shadow border border-gray-200">
              <h4 className="text-md font-bold text-blue-600 mb-2">How to Read Resistor Color Bands</h4>
              
              <div className="flex items-center justify-center my-4 relative bg-stone-200 rounded-lg h-14 w-full max-w-lg mx-auto">
                <div className="w-4 rounded-full h-full bg-amber-600 absolute left-4"></div>
                <div className="w-4 rounded-full h-full bg-red-600 absolute left-16"></div>
                <div className="w-4 rounded-full h-full bg-orange-500 absolute left-28"></div>
                <div className="w-4 rounded-full h-full bg-yellow-400 absolute left-40"></div>
                
                <div className="absolute -top-6 left-2 text-xs text-gray-700">1st Band</div>
                <div className="absolute -top-6 left-14 text-xs text-gray-700">2nd Band</div>
                <div className="absolute -top-6 left-26 text-xs text-gray-700">3rd Band (multiplier)</div>
                <div className="absolute -top-6 left-40 text-xs text-gray-700">4th Band (tolerance)</div>
                
                <div className="absolute -bottom-6 left-2 text-xs font-bold text-gray-800">1</div>
                <div className="absolute -bottom-6 left-14 text-xs font-bold text-gray-800">2</div>
                <div className="absolute -bottom-6 left-26 text-xs font-bold text-gray-800">×1000</div>
                <div className="absolute -bottom-6 left-42 text-xs font-bold text-gray-800">±5%</div>
                
                <div className="absolute -bottom-12 left-20 text-sm font-semibold">12,000Ω or 12kΩ ±5%</div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="text-sm">
                  <p className="font-semibold mb-1">Steps for 4-band resistors:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>1st band = first digit</li>
                    <li>2nd band = second digit</li>
                    <li>3rd band = multiplier (number of zeros)</li>
                    <li>4th band = tolerance</li>
                  </ol>
                </div>
                <div className="text-sm">
                  <p className="font-semibold mb-1">Steps for 5-band resistors:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>1st band = first digit</li>
                    <li>2nd band = second digit</li>
                    <li>3rd band = third digit</li>
                    <li>4th band = multiplier</li>
                    <li>5th band = tolerance</li>
                  </ol>
                  <p className="mt-1 text-xs italic">5-band resistors are typically used for precision resistors (±1%, ±0.5%, ±0.25%, ±0.1%)</p>
                </div>
              </div>
              
              <div className="mt-4 bg-blue-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-blue-800">Quick Memory Tip:</p>
                <p className="text-sm">"Bad Boys Race Our Young Girls, But Violet Generally Wins" = colors in order (Black, Brown, Red, Orange, Yellow, Green, Blue, Violet, Gray, White)</p>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded shadow border border-gray-200">
              <h4 className="text-md font-bold text-blue-600 mb-2">Common Resistor Values</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium mb-1">Standard E12 Series (10% tolerance)</h5>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-sm">10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82</p>
                    <p className="text-xs text-gray-500 mt-1">Then multiplied by powers of 10: ×10, ×100, ×1k, ×10k, etc.</p>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium mb-1">Standard E24 Series (5% tolerance)</h5>
                  <div className="bg-gray-50 p-2 rounded text-sm">
                    <p className="text-sm">10, 11, 12, 13, 15, 16, 18, 20, 22, 24, 27, 30, 33, 36, 39, 43, 47, 51, 56, 62, 68, 75, 82, 91</p>
                    <p className="text-xs text-gray-500 mt-1">Then multiplied by powers of 10</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <h5 className="font-medium mb-1">Most Commonly Used Values</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div className="bg-blue-50 p-2 rounded text-center">
                    <p className="font-medium">220Ω</p>
                    <p className="text-xs">Red-Red-Brown-Gold</p>
                  </div>
                  <div className="bg-blue-50 p-2 rounded text-center">
                    <p className="font-medium">330Ω</p>
                    <p className="text-xs">Orange-Orange-Brown-Gold</p>
                  </div>
                  <div className="bg-blue-50 p-2 rounded text-center">
                    <p className="font-medium">1kΩ</p>
                    <p className="text-xs">Brown-Black-Red-Gold</p>
                  </div>
                  <div className="bg-blue-50 p-2 rounded text-center">
                    <p className="font-medium">4.7kΩ</p>
                    <p className="text-xs">Yellow-Violet-Red-Gold</p>
                  </div>
                  <div className="bg-blue-50 p-2 rounded text-center">
                    <p className="font-medium">10kΩ</p>
                    <p className="text-xs">Brown-Black-Orange-Gold</p>
                  </div>
                  <div className="bg-blue-50 p-2 rounded text-center">
                    <p className="font-medium">47kΩ</p>
                    <p className="text-xs">Yellow-Violet-Orange-Gold</p>
                  </div>
                  <div className="bg-blue-50 p-2 rounded text-center">
                    <p className="font-medium">100kΩ</p>
                    <p className="text-xs">Brown-Black-Yellow-Gold</p>
                  </div>
                  <div className="bg-blue-50 p-2 rounded text-center">
                    <p className="font-medium">1MΩ</p>
                    <p className="text-xs">Brown-Black-Green-Gold</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded shadow border border-gray-200">
              <h4 className="text-md font-bold text-blue-600 mb-2">Resistor Applications</h4>
              
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="font-medium">Current Limiting</p>
                  <p className="text-sm mt-1">Used to limit current flow to protect sensitive components like LEDs.</p>
                  <p className="text-sm font-mono mt-1">R = (V_supply - V_component) / I_desired</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded">
                  <p className="font-medium">Voltage Division</p>
                  <p className="text-sm mt-1">Two resistors in series create a divided voltage at their junction.</p>
                  <p className="text-sm font-mono mt-1">V_out = V_in × (R2 / (R1 + R2))</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded">
                  <p className="font-medium">Pull-up/Pull-down</p>
                  <p className="text-sm mt-1">Ensure a definite logical state for digital inputs when not driven.</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded">
                  <p className="font-medium">Biasing</p>
                  <p className="text-sm mt-1">Setting the operating point for active components like transistors.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResistorCalculatorWindow;