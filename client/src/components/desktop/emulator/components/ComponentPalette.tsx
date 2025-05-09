import React, { useState } from 'react';
import { CircuitBoard, Cpu, Lightbulb, Sliders, ZapOff, Gauge, Monitor, Wifi, ToggleLeft, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";

// Define the component types and their metadata with category grouping
const COMPONENT_CATEGORIES = [
  {
    id: 'output',
    name: 'OUTPUT DEVICES',
    components: [
      {
        id: 'led',
        name: 'LED',
        icon: <Lightbulb className="h-4 w-4 text-yellow-300" />,
        description: 'Light Emitting Diode',
        rarity: 'common',
      },
      {
        id: 'rgb-led',
        name: 'RGB LED',
        icon: <Lightbulb className="h-4 w-4 text-cyan-300" />,
        description: 'Multi-color LED',
        rarity: 'uncommon',
      },
      {
        id: 'display',
        name: 'OLED Display',
        icon: <Monitor className="h-4 w-4 text-blue-300" />,
        description: '128x64 Monochrome Screen',
        rarity: 'rare',
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
        icon: <ToggleLeft className="h-4 w-4 text-green-300" />,
        description: 'Momentary switch',
        rarity: 'common',
      },
      {
        id: 'potentiometer',
        name: 'Potentiometer',
        icon: <Sliders className="h-4 w-4 text-purple-300" />,
        description: 'Variable resistor',
        rarity: 'uncommon',
      },
      {
        id: 'light-sensor',
        name: 'Light Sensor',
        icon: <Gauge className="h-4 w-4 text-amber-300" />,
        description: 'Photoresistor',
        rarity: 'uncommon',
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
        icon: <ZapOff className="h-4 w-4 text-orange-300" />,
        description: 'Limits current flow',
        rarity: 'common',
      },
      {
        id: 'capacitor',
        name: 'Capacitor',
        icon: <Wifi className="h-4 w-4 text-indigo-300" />,
        description: 'Stores electrical charge',
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
    <div className="space-y-4">
      <div className="mb-4 text-cyan-300 pb-2 flex items-center justify-between">
        <h3 className="font-bold text-xs uppercase tracking-wider">Components</h3>
      </div>
      
      <div className="space-y-3">
        {COMPONENT_CATEGORIES.map(category => (
          <div key={category.id} className="space-y-1">
            {/* Category Header */}
            <div 
              className="flex items-center justify-between p-1 bg-blue-900/30 border-b border-cyan-900 text-xs font-bold text-cyan-300 cursor-pointer"
              onClick={() => toggleCategory(category.id)}
            >
              <div className="flex items-center">
                {expandedCategories[category.id] 
                  ? <ChevronDown className="h-3 w-3 mr-1 text-cyan-400" /> 
                  : <ChevronRight className="h-3 w-3 mr-1 text-cyan-400" />}
                {category.name}
              </div>
            </div>
            
            {/* Category Components */}
            {expandedCategories[category.id] && (
              <div className="space-y-1 pt-1">
                {category.components.map(component => (
                  <div
                    key={component.id}
                    className={`p-2 flex items-center gap-2 border ${RARITY_COLORS[component.rarity as keyof typeof RARITY_COLORS]} rounded hover:bg-slate-700/50 cursor-pointer transition-colors`}
                    onClick={() => onAddComponent(component.id)}
                  >
                    <div className="p-1.5 bg-slate-900/80 rounded-md border border-slate-700">
                      {component.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-slate-200">{component.name}</div>
                      <div className="text-xs text-slate-400">{component.description}</div>
                    </div>
                    <Button 
                      size="icon" 
                      variant="outline"
                      className="h-5 w-5 border border-cyan-700 bg-blue-900/20 hover:bg-blue-800/30"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddComponent(component.id);
                      }}
                    >
                      <Plus className="h-3 w-3 text-cyan-300" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Quick Reference - For a fun retro touch */}
      <div className="mt-6 pt-4 border-t border-cyan-900/50">
        <div className="text-xs text-cyan-300 font-bold mb-2">QUICK TIPS</div>
        <div className="bg-slate-900/50 border border-cyan-900/30 rounded p-2 text-xs">
          <p className="text-slate-300 mb-1">• Drag components onto the board</p>
          <p className="text-slate-300 mb-1">• Connect pins by clicking on them</p>
          <p className="text-slate-300 mb-1">• Select a component to view properties</p>
        </div>
      </div>
    </div>
  );
}