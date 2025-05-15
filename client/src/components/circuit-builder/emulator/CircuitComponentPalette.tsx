import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';

// Use the original sandbox component icons from attached_assets
// These are the exact images provided with the sandbox
const ledIcon = '/attached_assets/led.icon.png';
const rgbLedIcon = '/attached_assets/rgb-led.icon.png';
const oledDisplayIcon = '/attached_assets/oled-display.icon.png';
const resistorIcon = '/attached_assets/resistor.icon.png';
const photoresistorIcon = '/attached_assets/photoresistor.icon.png';
const buzzerIcon = '/attached_assets/buzzer.icon.png';
const heroBoardIcon = '/attached_assets/hero-board.icon.png';
const rotaryEncoderIcon = '/attached_assets/rotary-encoder.icon.png';
const segmentedDisplayIcon = '/attached_assets/segmented-display.icon.png';
const dipSwitchIcon = '/attached_assets/dip-switch-3.icon.png';
const customKeypadIcon = '/attached_assets/custom-keypad.icon.png';
const breadboardMiniIcon = '/attached_assets/breadboard-mini.icon.png';

// Define the component types and their metadata with category grouping
// Matching the 30 Days Lost in Space sandbox component organization
const COMPONENT_CATEGORIES = [
  {
    id: 'output',
    name: 'OUTPUT DEVICES',
    components: [
      {
        id: 'led',
        name: 'LED',
        icon: <img src={ledIcon} className="h-8 w-8" alt="LED" style={{ imageRendering: 'crisp-edges' }} />,
        description: 'Light-emitting diode'
      },
      {
        id: 'rgb-led',
        name: 'RGB LED',
        icon: <img src={rgbLedIcon} className="h-8 w-8" alt="RGB LED" style={{ imageRendering: 'crisp-edges' }} />,
        description: 'RGB light-emitting diode'
      },
      {
        id: 'oled-display',
        name: 'OLED Display',
        icon: <img src={oledDisplayIcon} className="h-8 w-8" alt="OLED Display" style={{ imageRendering: 'crisp-edges' }} />,
        description: '128x64 OLED display (I2C)'
      },
      {
        id: 'segmented-display',
        name: '7-Segment Display',
        icon: <img src={segmentedDisplayIcon} className="h-8 w-8" alt="7-Segment Display" style={{ imageRendering: 'crisp-edges' }} />,
        description: '4-digit 7-segment display (TM1637)'
      },
      {
        id: 'buzzer',
        name: 'Buzzer',
        icon: <img src={buzzerIcon} className="h-8 w-8" alt="Buzzer" style={{ imageRendering: 'crisp-edges' }} />,
        description: 'Piezo buzzer'
      }
    ]
  },
  {
    id: 'input',
    name: 'INPUT DEVICES',
    components: [
      {
        id: 'button',
        name: 'Button',
        icon: <img src="/attached_assets/button.icon.png" className="h-8 w-8" alt="Button" style={{ imageRendering: 'crisp-edges' }} />,
        description: 'Momentary push button'
      },
      {
        id: 'photoresistor',
        name: 'Photoresistor',
        icon: <img src={photoresistorIcon} className="h-8 w-8" alt="Photoresistor" style={{ imageRendering: 'crisp-edges' }} />,
        description: 'Light-dependent resistor'
      },
      {
        id: 'rotary-encoder',
        name: 'Rotary Encoder',
        icon: <img src={rotaryEncoderIcon} className="h-8 w-8" alt="Rotary Encoder" style={{ imageRendering: 'crisp-edges' }} />,
        description: 'Rotary encoder with button'
      },
      {
        id: 'dip-switch',
        name: 'DIP Switch',
        icon: <img src={dipSwitchIcon} className="h-8 w-8" alt="DIP Switch" style={{ imageRendering: 'crisp-edges' }} />,
        description: '3-position DIP switch'
      },
      {
        id: 'keypad',
        name: 'Keypad',
        icon: <img src={customKeypadIcon} className="h-8 w-8" alt="Keypad" style={{ imageRendering: 'crisp-edges' }} />,
        description: '4x4 matrix keypad'
      }
    ]
  },
  {
    id: 'boards',
    name: 'HERO BOARDS',
    components: [
      {
        id: 'heroboard',
        name: 'HERO Board',
        icon: <img src={heroBoardIcon} className="h-8 w-8" alt="HERO Board" style={{ imageRendering: 'crisp-edges' }} />,
        description: 'Arduino UNO R3 compatible microcontroller board'
      }
    ]
  },
  {
    id: 'passive',
    name: 'PASSIVE COMPONENTS',
    components: [
      {
        id: 'resistor',
        name: 'Resistor',
        icon: <img src={resistorIcon} className="h-8 w-8" alt="Resistor" style={{ imageRendering: 'crisp-edges' }} />,
        description: 'Current-limiting resistor'
      },
      {
        id: 'breadboard-mini',
        name: 'Mini Breadboard',
        icon: <img src={breadboardMiniIcon} className="h-8 w-8" alt="Mini Breadboard" style={{ imageRendering: 'crisp-edges' }} />,
        description: 'Solderless breadboard for prototyping'
      }
    ]
  }
];

interface CircuitComponentPaletteProps {
  onAddComponent: (type: string, x?: number, y?: number) => void;
}

/**
 * Circuit Component Palette
 * 
 * A component that displays categorized circuit components that can be added to the circuit builder.
 */
export function CircuitComponentPalette({ onAddComponent }: CircuitComponentPaletteProps) {
  // Track which categories are expanded/collapsed
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    output: true,
    input: true,
    boards: true,
    passive: true
  });
  
  // Toggle a category's expanded state
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };
  
  return (
    <div className="space-y-3">
      {/* This matches the 30 Days sandbox component list styling */}
      <div className="space-y-3">
        {COMPONENT_CATEGORIES.map(category => (
          <div key={category.id} className="space-y-1">
            {/* Category Header */}
            <div 
              className="flex items-center justify-between p-1 bg-gray-800 border-b border-gray-700 text-xs font-bold text-white cursor-pointer"
              onClick={() => toggleCategory(category.id)}
            >
              <div className="flex items-center">
                {expandedCategories[category.id] 
                  ? <ChevronDown className="h-3 w-3 mr-1 text-gray-400" /> 
                  : <ChevronRight className="h-3 w-3 mr-1 text-gray-400" />}
                {category.name}
              </div>
            </div>
            
            {/* Category Components - Matching the 30 Days sandbox component styling */}
            {expandedCategories[category.id] && (
              <div className="space-y-1 pt-1">
                {category.components.map(component => (
                  <div
                    key={component.id}
                    className="flex items-center justify-between px-2 py-1 hover:bg-gray-800 rounded"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                        {component.icon}
                      </div>
                      <div className="ml-2">
                        <div className="text-xs font-medium text-white">{component.name}</div>
                        <div className="text-xs text-gray-400">{component.description}</div>
                      </div>
                    </div>
                    <button
                      className="flex items-center justify-center h-6 w-6 bg-blue-600 hover:bg-blue-500 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddComponent(component.id);
                      }}
                      title="Add component to circuit"
                    >
                      <Plus className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Quick Reference */}
      <div className="mt-4 pt-3 border-t border-gray-700">
        <div className="text-xs text-gray-300 font-bold mb-2">CIRCUIT BUILDER TIPS</div>
        <div className="bg-gray-800 border border-gray-700 rounded p-2 text-xs">
          <p className="text-gray-300 mb-1">• Click pins to connect components</p>
          <p className="text-gray-300 mb-1">• Drag components to position them</p>
          <p className="text-gray-300 mb-1">• Run code to see your circuit in action</p>
        </div>
      </div>
    </div>
  );
}