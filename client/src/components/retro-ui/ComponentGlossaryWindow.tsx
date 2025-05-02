import React, { useState, useEffect } from 'react';
import { X, Minimize2, Search, Book, Cpu, Layers, HelpCircle } from 'lucide-react';
import './retro-ui.css';

// Import ComponentSimulatorView
import ComponentSimulatorView from '../circuit-builder/components/ComponentSimulatorView';
import PinTooltip from '../circuit-builder/components/PinTooltip';

interface ComponentGlossaryWindowProps {
  onClose: () => void;
  onMinimize: () => void;
  isActive: boolean;
}

interface ComponentPin {
  id: string;
  name: string;
  description: string;
  voltageRange?: string;
  usageNotes?: string;
  warnings?: string;
  relatedTerms?: string[];
}

interface Component {
  id: string;
  name: string;
  iconSrc: string;
  description: string;
  pins: ComponentPin[];
  generalInfo?: string;
}

interface GlossaryTerm {
  term: string;
  definition: string;
  relatedComponents?: string[];
}

// Mock data for testing
const COMPONENTS: Component[] = [
  {
    id: 'led',
    name: 'LED',
    iconSrc: '/assets/led.icon.png',
    description: 'Light Emitting Diode - A semiconductor device that emits light when current flows through it',
    generalInfo: 'LEDs are widely used as indicator lamps in many devices and are increasingly used for lighting. They consume far less energy than incandescent lamps.',
    pins: [
      {
        id: 'led-anode',
        name: 'Anode (+)',
        description: 'The positive terminal of the LED, which connects to the positive voltage supply.',
        voltageRange: 'Typically 1.8V to 3.3V depending on color',
        usageNotes: 'Must be connected to the positive supply through a current-limiting resistor to prevent the LED from burning out.',
        warnings: 'Never connect an LED directly to a power source without a current-limiting resistor',
        relatedTerms: ['Forward Voltage', 'Current Limiting']
      },
      {
        id: 'led-cathode',
        name: 'Cathode (-)',
        description: 'The negative terminal of the LED, which connects to ground or the negative supply voltage.',
        usageNotes: 'Usually identified by a flat side on the LED package or a shorter lead.',
        relatedTerms: ['Ground', 'Common Cathode']
      }
    ]
  },
  {
    id: 'resistor',
    name: 'Resistor',
    iconSrc: '/assets/resistor.icon.png',
    description: 'A passive component that implements electrical resistance in a circuit',
    generalInfo: 'Resistors are used to reduce current flow, adjust signal levels, divide voltages, bias active elements, and terminate transmission lines.',
    pins: [
      {
        id: 'resistor-terminal1',
        name: 'Terminal 1',
        description: 'One end of the resistor. Resistors are non-polarized so either terminal can be connected to higher or lower voltage.',
        relatedTerms: ['Resistance', 'Ohm\'s Law']
      },
      {
        id: 'resistor-terminal2',
        name: 'Terminal 2',
        description: 'The other end of the resistor. Resistors are non-polarized so either terminal can be connected to higher or lower voltage.',
        relatedTerms: ['Resistance', 'Ohm\'s Law']
      }
    ]
  },
  {
    id: 'button',
    name: 'Push Button',
    iconSrc: '/assets/buzzer.icon.svg',
    description: 'A momentary switch that completes a circuit when pressed',
    pins: [
      {
        id: 'button-terminal1',
        name: 'Terminal 1',
        description: 'One terminal of the button. When the button is pressed, this terminal connects to Terminal 2.',
      },
      {
        id: 'button-terminal2',
        name: 'Terminal 2',
        description: 'The other terminal of the button. When the button is pressed, this terminal connects to Terminal 1.',
      }
    ]
  }
];

const GLOSSARY: GlossaryTerm[] = [
  {
    term: 'Forward Voltage',
    definition: 'The voltage required to turn on a diode and allow current to flow. Different types of diodes (including LEDs) have different forward voltage requirements.',
    relatedComponents: ['led']
  },
  {
    term: 'Current Limiting',
    definition: 'The practice of restricting the amount of current that can flow in a circuit, often done with a resistor. Essential for protecting components like LEDs.',
    relatedComponents: ['led', 'resistor']
  },
  {
    term: 'Ground',
    definition: 'A reference point in an electrical circuit from which voltage is measured. It is the return path for current to flow back to the source.',
    relatedComponents: ['led']
  },
  {
    term: 'Common Cathode',
    definition: 'A configuration where multiple components (often LEDs) share a common negative terminal.',
    relatedComponents: ['led']
  },
  {
    term: 'Resistance',
    definition: 'The opposition to the flow of electric current in a material, measured in ohms (Ω).',
    relatedComponents: ['resistor']
  },
  {
    term: 'Ohm\'s Law',
    definition: 'A fundamental relationship in electrical circuits: V = I × R, where V is voltage, I is current, and R is resistance.',
    relatedComponents: ['resistor']
  }
];

const ComponentGlossaryWindow: React.FC<ComponentGlossaryWindowProps> = ({ onClose, onMinimize, isActive }) => {
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [selectedPin, setSelectedPin] = useState<ComponentPin | null>(null);
  
  // Search states
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  
  // View states
  const [currentView, setCurrentView] = useState<'components' | 'component-detail' | 'search'>('components');
  const [componentList, setComponentList] = useState<Component[]>(COMPONENTS);
  
  // Simulator view state
  const [showSimulatorView, setShowSimulatorView] = useState<boolean>(true);
  
  // Effect to filter components based on search
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    const results: any[] = [];
    
    // Search in glossary terms
    const glossaryMatches = GLOSSARY.filter(term => 
      term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      term.definition.toLowerCase().includes(searchTerm.toLowerCase())
    );
    results.push(...glossaryMatches.map(match => ({
      type: 'term',
      item: match
    })));
    
    // Search in components
    const componentMatches = COMPONENTS.filter(comp => 
      comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    results.push(...componentMatches.map(match => ({
      type: 'component',
      item: match
    })));
    
    // Search in component pins
    COMPONENTS.forEach(comp => {
      const pinMatches = comp.pins.filter(pin => 
        pin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pin.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pin.usageNotes && pin.usageNotes.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      
      if (pinMatches.length > 0) {
        results.push(...pinMatches.map(match => ({
          type: 'pin',
          item: match,
          component: comp
        })));
      }
    });
    
    setSearchResults(results);
  }, [searchTerm]);
  
  // Handler for selecting a component
  const handleComponentSelect = (component: Component) => {
    setSelectedComponent(component);
    setSelectedPin(null);
    setCurrentView('component-detail');
  };
  
  // Handler for selecting a pin
  const handlePinSelect = (pin: ComponentPin) => {
    setSelectedPin(pin);
  };
  
  // Navigation for going back to component list
  const handleBackToList = () => {
    setCurrentView('components');
    setSelectedComponent(null);
    setSelectedPin(null);
    setSearchTerm("");
    setIsSearching(false);
  };
  
  // Handler for search results selection
  const handleSearchResultSelect = (result: any) => {
    if (result.type === 'component') {
      handleComponentSelect(result.item);
    } else if (result.type === 'pin') {
      handleComponentSelect(result.component);
      handlePinSelect(result.item);
    } else if (result.type === 'term') {
      // Just show the glossary term in a modal or info panel
      // For now, we'll just log it
      console.log("Glossary term:", result.item);
    }
  };
  
  // Component list view
  const renderComponentList = () => (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Component Encyclopedia</h2>
      <p className="mb-4 text-sm">Select a component to learn about its pins and functionality.</p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {componentList.map(component => (
          <div 
            key={component.id}
            className="cursor-pointer p-3 bg-white rounded-md border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            onClick={() => handleComponentSelect(component)}
          >
            <div className="flex flex-col items-center text-center">
              <img 
                src={component.iconSrc} 
                alt={component.name}
                className="w-16 h-16 object-contain mb-2"
              />
              <h3 className="font-bold">{component.name}</h3>
              <p className="text-xs text-gray-600 mt-1">{component.description.split(' - ')[0]}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
  // Component detail view
  const renderComponentDetail = () => {
    if (!selectedComponent) return null;
    
    return (
      <div className="flex h-full">
        {/* Left panel - Component visualization */}
        <div className="w-1/2 p-4 bg-white border-r border-gray-300 flex flex-col">
          <button 
            className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
            onClick={handleBackToList}
          >
            <span className="mr-1">←</span> Back to Component List
          </button>
          
          {/* Add toggle for simulator view */}
          <div className="mb-4 flex justify-between items-center">
            <h3 className="font-bold text-gray-700">Component View:</h3>
            <div className="flex items-center">
              <button
                className={`px-3 py-1 text-sm rounded-l ${!showSimulatorView ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                onClick={() => setShowSimulatorView(false)}
              >
                Standard
              </button>
              <button
                className={`px-3 py-1 text-sm rounded-r ${showSimulatorView ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                onClick={() => setShowSimulatorView(true)}
              >
                Simulator
              </button>
            </div>
          </div>
          
          {/* Show either simulator view or standard view */}
          {showSimulatorView ? (
            <div className="mb-4 flex-grow flex justify-center items-center">
              <ComponentSimulatorView component={selectedComponent} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-grow">
              <img 
                src={selectedComponent.iconSrc} 
                alt={selectedComponent.name}
                className="w-40 h-40 object-contain mb-4"
              />
            </div>
          )}
          
          <div className="text-center">
            <h2 className="text-xl font-bold">{selectedComponent.name}</h2>
            <p className="text-sm text-gray-600 mt-2">{selectedComponent.description}</p>
          
            {selectedComponent.generalInfo && (
              <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-gray-700 max-w-md mx-auto">
                <h4 className="font-bold flex items-center justify-center">
                  <HelpCircle size={16} className="mr-1 text-blue-600" />
                  General Information:
                </h4>
                <p className="mt-1">{selectedComponent.generalInfo}</p>
              </div>
            )}
          
            <div className="mt-6">
              <h3 className="font-bold text-gray-700 mb-2">Pins/Terminals:</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {selectedComponent.pins.map(pin => (
                  <button
                    key={pin.id}
                    className={`px-3 py-1.5 rounded border ${selectedPin?.id === pin.id ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                    onClick={() => handlePinSelect(pin)}
                  >
                    {pin.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Right panel - Pin information */}
        <div className="w-1/2 p-4 bg-gray-50 overflow-y-auto">
          {selectedPin ? (
            <div>
              <h3 className="text-lg font-bold border-b border-gray-300 pb-2 mb-4">{selectedPin.name}</h3>
              
              <div className="mb-4">
                <h4 className="font-bold text-gray-700">Description:</h4>
                <p>{selectedPin.description}</p>
              </div>
              
              {selectedPin.voltageRange && (
                <div className="mb-4">
                  <h4 className="font-bold text-gray-700">Voltage Range:</h4>
                  <p>{selectedPin.voltageRange}</p>
                </div>
              )}
              
              {selectedPin.usageNotes && (
                <div className="mb-4">
                  <h4 className="font-bold text-gray-700">Usage Notes:</h4>
                  <p>{selectedPin.usageNotes}</p>
                </div>
              )}
              
              {selectedPin.warnings && (
                <div className="mb-4 p-2 bg-red-50 border-l-2 border-red-500 text-red-700">
                  <h4 className="font-bold">⚠️ Warning:</h4>
                  <p>{selectedPin.warnings}</p>
                </div>
              )}
              
              {selectedPin.relatedTerms && selectedPin.relatedTerms.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-bold text-gray-700">Related Terms:</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedPin.relatedTerms.map(term => {
                      const glossaryTerm = GLOSSARY.find(g => g.term.toLowerCase() === term.toLowerCase());
                      return (
                        <div
                          key={term}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm cursor-pointer hover:bg-blue-200"
                          onClick={() => setSearchTerm(term)}
                          title={glossaryTerm?.definition || term}
                        >
                          {term}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="mb-2">👈</div>
                <p>Select a pin to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Search results view
  const renderSearchResults = () => (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Search Results</h2>
      <p className="mb-2 text-sm">Found {searchResults.length} results for "{searchTerm}":</p>
      
      {searchResults.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <p>No results found. Try a different search term.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Group results by type */}
          {(() => {
            const glossaryResults = searchResults.filter(r => r.type === 'term');
            const componentResults = searchResults.filter(r => r.type === 'component');
            const pinResults = searchResults.filter(r => r.type === 'pin');
            
            return (
              <>
                {/* Glossary terms */}
                {glossaryResults.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold border-b border-gray-300 pb-2 mb-3">Terminology</h3>
                    <div className="space-y-3">
                      {glossaryResults.map((result, index) => (
                        <div key={`term-${index}`} className="p-3 bg-white rounded-md border border-gray-200 shadow-sm">
                          <h4 className="font-bold flex items-center">
                            <Book size={16} className="mr-2 text-blue-600" />
                            {result.item.term}
                          </h4>
                          <p className="text-sm mt-1">{result.item.definition}</p>
                          
                          {result.item.relatedComponents && result.item.relatedComponents.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-600">Related Components:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {result.item.relatedComponents.map((compId: string) => {
                                  const component = COMPONENTS.find(c => c.id === compId);
                                  return component ? (
                                    <span 
                                      key={compId}
                                      className="px-2 py-0.5 bg-gray-100 rounded-full text-xs cursor-pointer hover:bg-gray-200"
                                      onClick={() => handleComponentSelect(component)}
                                    >
                                      {component.name}
                                    </span>
                                  ) : null;
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Components */}
                {componentResults.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold border-b border-gray-300 pb-2 mb-3">Components</h3>
                    <div className="space-y-3">
                      {componentResults.map((result, index) => (
                        <div 
                          key={`component-${index}`} 
                          className="p-3 bg-white rounded-md border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => handleSearchResultSelect(result)}
                        >
                          <div className="flex items-center">
                            <img 
                              src={result.item.iconSrc} 
                              alt={result.item.name}
                              className="w-10 h-10 object-contain mr-3"
                            />
                            <div>
                              <h4 className="font-bold">{result.item.name}</h4>
                              <p className="text-sm text-gray-600">{result.item.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Pins */}
                {pinResults.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold border-b border-gray-300 pb-2 mb-3">Pins & Terminals</h3>
                    <div className="space-y-3">
                      {pinResults.map((result, index) => (
                        <div 
                          key={`pin-${index}`} 
                          className="p-3 bg-white rounded-md border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => handleSearchResultSelect(result)}
                        >
                          <div className="flex items-center">
                            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-800 mr-3">
                              <Cpu size={20} />
                            </div>
                            <div>
                              <h4 className="font-bold flex items-center">
                                {result.item.name}
                                <span className="mx-2 text-gray-400">•</span>
                                <span className="text-sm font-normal text-gray-600">{result.component.name}</span>
                              </h4>
                              <p className="text-sm text-gray-600">{result.item.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
  
  return (
    <div className={`retroWindow ${isActive ? 'active' : ''}`}>
      {/* Add PinTooltip for showing pin details */}
      <PinTooltip />
      
      <div className="windowTitleBar">
        <div className="windowTitle">Component Encyclopedia</div>
        <div className="windowControls">
          <button onClick={onMinimize} className="controlButton minimizeButton">
            <Minimize2 size={14} />
          </button>
          <button onClick={onClose} className="controlButton closeButton">
            <X size={14} />
          </button>
        </div>
      </div>
      
      <div className="windowContent" style={{ height: 'calc(100% - 28px)', display: 'flex', flexDirection: 'column' }}>
        {/* Search bar */}
        <div className="p-2 border-b border-gray-300 bg-gray-100">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for components, pins, or terms..."
              className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            {searchTerm && (
              <button
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchTerm('')}
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          {/* Navigation tabs */}
          <div className="flex mt-2 border-b border-gray-200">
            <button
              className={`px-4 py-2 font-semibold text-sm ${!isSearching && currentView === 'components' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
              onClick={() => {
                setCurrentView('components');
                setSearchTerm('');
              }}
            >
              <Layers size={16} className="inline mr-1" /> All Components
            </button>
            {isSearching && (
              <button
                className={`px-4 py-2 font-semibold text-sm ${currentView === 'search' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
                onClick={() => setCurrentView('search')}
              >
                <Search size={16} className="inline mr-1" /> Search Results ({searchResults.length})
              </button>
            )}
          </div>
        </div>
        
        {/* Main content area */}
        <div className="flex-grow overflow-y-auto">
          {currentView === 'components' && !isSearching && renderComponentList()}
          {currentView === 'component-detail' && renderComponentDetail()}
          {isSearching && currentView === 'search' && renderSearchResults()}
        </div>
      </div>
    </div>
  );
};

export default ComponentGlossaryWindow;
