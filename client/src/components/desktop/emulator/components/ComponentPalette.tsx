import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";

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
        icon: <img src={ledIcon} className="h-6 w-6" alt="LED" />,
        description: 'Light Emitting Diode',
        rarity: 'common',
      },
      {
        id: 'rgb-led',
        name: 'RGB LED',
        icon: <img src={rgbLedIcon} className="h-6 w-6" alt="RGB LED" />,
        description: 'Multi-color LED',
        rarity: 'uncommon',
      },
      {
        id: 'oled-display',
        name: 'OLED Display',
        icon: <img src={oledDisplayIcon} className="h-6 w-6" alt="OLED Display" />,
        description: '128x64 Monochrome Screen',
        rarity: 'rare',
      },
      {
        id: 'buzzer',
        name: 'Buzzer',
        icon: <img src={buzzerIcon} className="h-6 w-6" alt="Buzzer" />,
        description: 'Sound output component',
        rarity: 'uncommon',
      },
      {
        id: 'segmented-display',
        name: '7-Segment Display',
        icon: <img src={segmentedDisplayIcon} className="h-6 w-6" alt="7-Segment Display" />,
        description: 'Digital numeric display',
        rarity: 'rare',
      }
    ]
  },
  {
    id: 'input',
    name: 'INPUT DEVICES',
    components: [
      {
        id: 'rotary-encoder',
        name: 'Rotary Encoder',
        icon: <img src={rotaryEncoderIcon} className="h-6 w-6" alt="Rotary Encoder" />,
        description: 'Rotational input device',
        rarity: 'uncommon',
      },
      {
        id: 'photoresistor',
        name: 'Photoresistor',
        icon: <img src={photoresistorIcon} className="h-6 w-6" alt="Photoresistor" />,
        description: 'Light-sensitive resistor',
        rarity: 'uncommon',
      },
      {
        id: 'dip-switch',
        name: 'DIP Switch',
        icon: <img src={dipSwitchIcon} className="h-6 w-6" alt="DIP Switch" />,
        description: 'Multiple toggle switches',
        rarity: 'uncommon',
      },
      {
        id: 'custom-keypad',
        name: 'Custom Keypad',
        icon: <img src={customKeypadIcon} className="h-6 w-6" alt="Custom Keypad" />,
        description: 'Matrix keypad for input',
        rarity: 'rare',
      }
    ]
  },
  {
    id: 'passive',
    name: 'ESSENTIAL COMPONENTS',
    components: [
      {
        id: 'hero-board',
        name: 'HERO Board',
        icon: <img src={heroBoardIcon} className="h-6 w-6" alt="HERO Board" />,
        description: 'Main microcontroller board',
        rarity: 'legendary',
      },
      {
        id: 'resistor',
        name: 'Resistor',
        icon: <img src={resistorIcon} className="h-6 w-6" alt="Resistor" />,
        description: 'Limits current flow',
        rarity: 'common',
      },
      {
        id: 'breadboard-mini',
        name: 'Mini Breadboard',
        icon: <img src={breadboardMiniIcon} className="h-6 w-6" alt="Mini Breadboard" />,
        description: 'For connecting components',
        rarity: 'uncommon',
      }
    ]
  }
];

// Rarity color mappings for the retro-game aesthetic
const RARITY_COLORS = {
  common: 'border-slate-500 bg-slate-800',
  uncommon: 'border-green-500 bg-green-900/20',
  rare: 'border-blue-500 bg-blue-900/20',
  epic: 'border-purple-500 bg-purple-900/20',
  legendary: 'border-amber-500 bg-amber-900/20'
};

interface ComponentPaletteProps {
  onAddComponent: (type: string) => void;
}

/**
 * Component Palette - Retro Gaming Styled
 * 
 * Displays available components that can be added to the circuit
 * with a retro gaming aesthetic
 */
export function ComponentPalette({ onAddComponent }: ComponentPaletteProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    output: true,
    input: true,
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
                    className={`p-2 flex items-center gap-2 border ${RARITY_COLORS[component.rarity as keyof typeof RARITY_COLORS]} rounded hover:bg-gray-700/50 cursor-pointer transition-colors`}
                    onClick={() => onAddComponent(component.id)}
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-900 rounded flex items-center justify-center">
                      {component.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white truncate">{component.name}</div>
                      <div className="text-xs text-gray-400 truncate">{component.description}</div>
                    </div>
                    <Button 
                      size="icon" 
                      variant="outline"
                      className="h-6 w-6 flex-shrink-0 border border-gray-700 bg-gray-800 hover:bg-gray-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddComponent(component.id);
                      }}
                      title="Add component to circuit"
                    >
                      <Plus className="h-3 w-3 text-white" />
                    </Button>
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