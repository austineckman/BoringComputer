import React, { useState, useEffect } from 'react';
import { Wire } from './WireManager';

interface CircuitDebuggerProps {
  wires: Wire[];
  pinVoltages: Record<string, number>;
  onWireHighlight?: (wireId: string | null) => void;
  onPinInspect?: (componentId: string, pinId: string) => void;
  className?: string;
}

/**
 * CircuitDebugger Component
 * 
 * This component provides a debug view of the circuit, showing
 * the electrical state of all wires and pins, along with voltage
 * levels and current flows.
 */
export function CircuitDebugger({
  wires,
  pinVoltages,
  onWireHighlight,
  onPinInspect,
  className = ''
}: CircuitDebuggerProps) {
  const [expandedWire, setExpandedWire] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'id' | 'voltage' | 'current'>('id');
  const [filterText, setFilterText] = useState('');
  
  // Format voltage for display
  const formatVoltage = (volts: number | undefined): string => {
    if (volts === undefined) return 'N/A';
    return `${volts.toFixed(2)}V`;
  };
  
  // Format current for display (if available)
  const formatCurrent = (amps: number | undefined): string => {
    if (amps === undefined) return 'N/A';
    if (Math.abs(amps) < 0.001) {
      return `${(amps * 1000000).toFixed(2)}µA`;
    } else if (Math.abs(amps) < 1) {
      return `${(amps * 1000).toFixed(2)}mA`;
    } else {
      return `${amps.toFixed(2)}A`;
    }
  };
  
  // Get voltage for a specific pin
  const getVoltage = (componentId: string, pinId: string): number => {
    const key = `${componentId}.${pinId}`;
    return pinVoltages[key] || 0;
  };
  
  // Filter and sort wires
  const filteredWires = wires.filter(wire => {
    if (!filterText) return true;
    
    const sourceKey = `${wire.sourceComponentId}.${wire.sourcePin}`;
    const targetKey = `${wire.targetComponentId}.${wire.targetPin}`;
    
    return wire.id.includes(filterText) ||
           sourceKey.includes(filterText) ||
           targetKey.includes(filterText);
  });
  
  // Sort wires based on selected criteria
  const sortedWires = [...filteredWires].sort((a, b) => {
    if (sortBy === 'voltage') {
      const voltageA = Math.max(
        getVoltage(a.sourceComponentId, a.sourcePin),
        getVoltage(a.targetComponentId, a.targetPin)
      );
      const voltageB = Math.max(
        getVoltage(b.sourceComponentId, b.sourcePin),
        getVoltage(b.targetComponentId, b.targetPin)
      );
      return voltageB - voltageA;
    } else if (sortBy === 'current') {
      const currentA = a.current || 0;
      const currentB = b.current || 0;
      return Math.abs(currentB) - Math.abs(currentA);
    } else {
      return a.id.localeCompare(b.id);
    }
  });
  
  // Toggle wire details expansion
  const toggleWireDetails = (wireId: string) => {
    setExpandedWire(expandedWire === wireId ? null : wireId);
    if (onWireHighlight) {
      onWireHighlight(expandedWire === wireId ? null : wireId);
    }
  };
  
  // Inspect pin details
  const handlePinInspect = (componentId: string, pinId: string) => {
    if (onPinInspect) {
      onPinInspect(componentId, pinId);
    }
  };
  
  // Determine wire status color based on voltage
  const getWireStatusColor = (wire: Wire): string => {
    const sourceVoltage = getVoltage(wire.sourceComponentId, wire.sourcePin);
    const targetVoltage = getVoltage(wire.targetComponentId, wire.targetPin);
    
    // If there's a significant voltage difference, indicate potential issue
    if (Math.abs(sourceVoltage - targetVoltage) > 0.5) {
      return 'text-yellow-500';
    }
    
    // If voltage is near 5V, it's HIGH
    if (sourceVoltage > 3.0 || targetVoltage > 3.0) {
      return 'text-green-500';
    }
    
    // If voltage is near 0V, it's LOW
    if (sourceVoltage < 1.0 && targetVoltage < 1.0) {
      return 'text-gray-400';
    }
    
    // Otherwise, intermediate voltage
    return 'text-blue-400';
  };
  
  return (
    <div className={`circuit-debugger ${className} bg-gray-900 rounded shadow-lg p-2 text-sm`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-white font-bold">Circuit Debugger</h3>
        
        <div className="flex items-center space-x-2">
          {/* Filter input */}
          <input
            type="text"
            placeholder="Filter..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="bg-gray-800 text-white px-2 py-1 rounded text-xs w-24"
          />
          
          {/* Sort options */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-gray-800 text-white px-2 py-1 rounded text-xs"
          >
            <option value="id">Sort by ID</option>
            <option value="voltage">Sort by Voltage</option>
            <option value="current">Sort by Current</option>
          </select>
        </div>
      </div>
      
      {/* Wire list */}
      <div className="overflow-y-auto max-h-60">
        {sortedWires.length === 0 ? (
          <div className="text-gray-500 italic p-2 text-center">No wires in circuit</div>
        ) : (
          <table className="w-full text-xs text-left">
            <thead className="text-gray-400 border-b border-gray-700">
              <tr>
                <th className="p-1">Wire</th>
                <th className="p-1">From</th>
                <th className="p-1">To</th>
                <th className="p-1">Voltage</th>
                <th className="p-1">Current</th>
              </tr>
            </thead>
            <tbody>
              {sortedWires.map(wire => {
                const wireStatusColor = getWireStatusColor(wire);
                const sourceVoltage = getVoltage(wire.sourceComponentId, wire.sourcePin);
                const targetVoltage = getVoltage(wire.targetComponentId, wire.targetPin);
                
                return (
                  <React.Fragment key={wire.id}>
                    <tr 
                      className={`border-b border-gray-800 hover:bg-gray-800 cursor-pointer ${expandedWire === wire.id ? 'bg-gray-800' : ''}`}
                      onClick={() => toggleWireDetails(wire.id)}
                    >
                      <td className="p-1">
                        <span className={`${wireStatusColor} font-mono`}>
                          {wire.id.split('-')[0]}-{wire.id.split('-')[1]?.substring(0, 4)}
                        </span>
                      </td>
                      <td className="p-1 font-mono text-gray-300">
                        {`${wire.sourceComponentId.substring(0, 6)}.${wire.sourcePin}`}
                      </td>
                      <td className="p-1 font-mono text-gray-300">
                        {`${wire.targetComponentId.substring(0, 6)}.${wire.targetPin}`}
                      </td>
                      <td className="p-1">
                        <span className={wireStatusColor}>
                          {formatVoltage(sourceVoltage)}
                        </span>
                      </td>
                      <td className="p-1">
                        <span className={wireStatusColor}>
                          {formatCurrent(wire.current)}
                        </span>
                      </td>
                    </tr>
                    
                    {/* Expanded details */}
                    {expandedWire === wire.id && (
                      <tr className="bg-gray-800">
                        <td colSpan={5} className="p-2">
                          <div className="text-gray-300 space-y-1">
                            <div className="flex justify-between">
                              <span className="font-bold">Wire ID:</span>
                              <span className="font-mono">{wire.id}</span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span className="font-bold">Source:</span>
                              <span 
                                className="font-mono cursor-pointer hover:text-blue-400"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePinInspect(wire.sourceComponentId, wire.sourcePin);
                                }}
                              >
                                {`${wire.sourceComponentId}.${wire.sourcePin}`}
                              </span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span className="font-bold">Target:</span>
                              <span 
                                className="font-mono cursor-pointer hover:text-blue-400"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePinInspect(wire.targetComponentId, wire.targetPin);
                                }}
                              >
                                {`${wire.targetComponentId}.${wire.targetPin}`}
                              </span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span className="font-bold">Source Voltage:</span>
                              <span className={wireStatusColor}>
                                {formatVoltage(sourceVoltage)}
                              </span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span className="font-bold">Target Voltage:</span>
                              <span className={wireStatusColor}>
                                {formatVoltage(targetVoltage)}
                              </span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span className="font-bold">Current:</span>
                              <span className={wireStatusColor}>
                                {formatCurrent(wire.current)}
                              </span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span className="font-bold">Resistance:</span>
                              <span className="font-mono">
                                {wire.resistance !== undefined ? `${wire.resistance.toFixed(2)}Ω` : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Pin voltages section */}
      <div className="mt-2 border-t border-gray-700 pt-2">
        <h4 className="text-white font-bold mb-1">Pin Voltages</h4>
        <div className="grid grid-cols-3 gap-1 text-xs">
          {Object.entries(pinVoltages)
            .filter(([pinKey]) => filterText ? pinKey.includes(filterText) : true)
            .sort((a, b) => b[1] - a[1])
            .map(([pinKey, voltage]) => {
              const [componentId, pinId] = pinKey.split('.');
              let voltageClass = 'text-gray-400';
              if (voltage > 3.0) voltageClass = 'text-green-500';
              else if (voltage > 1.0) voltageClass = 'text-blue-400';
              
              return (
                <div 
                  key={pinKey} 
                  className="flex justify-between bg-gray-800 p-1 rounded cursor-pointer hover:bg-gray-700"
                  onClick={() => handlePinInspect(componentId, pinId)}
                >
                  <span className="font-mono truncate" title={pinKey}>
                    {componentId.substring(0, 6)}.{pinId}
                  </span>
                  <span className={`${voltageClass} font-mono`}>
                    {formatVoltage(voltage)}
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

export default CircuitDebugger;