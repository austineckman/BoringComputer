import React, { useState, useEffect } from 'react';
import { X, Minimize2, Search, Book, Cpu, Layers, HelpCircle } from 'lucide-react';
import './retro-ui.css';

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

// Electronic components database
const COMPONENTS: Component[] = [
  {
    id: 'led',
    name: 'LED',
    iconSrc: 'attached_assets/led.icon.png',
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
    id: 'rgb-led',
    name: 'RGB LED',
    iconSrc: 'attached_assets/rgb-led.icon.png',
    description: 'A LED that can emit different colors by combining red, green, and blue light',
    generalInfo: 'RGB LEDs contain three separate LEDs (red, green, and blue) in one package. By controlling the intensity of each color, you can create any color in the rainbow.',
    pins: [
      {
        id: 'rgb-common',
        name: 'Common Terminal',
        description: 'The common terminal of the RGB LED, either common anode (connected to positive) or common cathode (connected to ground).',
        usageNotes: 'Most RGB LEDs are common anode, meaning this pin connects to positive voltage.',
        relatedTerms: ['Common Anode', 'Common Cathode']
      },
      {
        id: 'rgb-red',
        name: 'Red Terminal',
        description: 'Controls the red component of the RGB LED.',
        voltageRange: 'Forward voltage typically 1.8-2.2V',
        relatedTerms: ['PWM', 'Color Mixing']
      },
      {
        id: 'rgb-green',
        name: 'Green Terminal',
        description: 'Controls the green component of the RGB LED.',
        voltageRange: 'Forward voltage typically 2.0-3.2V',
        relatedTerms: ['PWM', 'Color Mixing']
      },
      {
        id: 'rgb-blue',
        name: 'Blue Terminal',
        description: 'Controls the blue component of the RGB LED.',
        voltageRange: 'Forward voltage typically 2.7-3.4V',
        relatedTerms: ['PWM', 'Color Mixing']
      }
    ]
  },
  {
    id: 'resistor',
    name: 'Resistor',
    iconSrc: 'attached_assets/resistor.icon.png',
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
    id: 'photoresistor',
    name: 'Photoresistor',
    iconSrc: 'attached_assets/photoresistor.icon.png',
    description: 'A light-sensitive resistor that changes resistance based on light intensity',
    generalInfo: 'Also known as Light Dependent Resistors (LDRs), photoresistors decrease in resistance when exposed to light. They are used in light sensing applications like night lights and automatic outdoor lighting.',
    pins: [
      {
        id: 'photoresistor-terminal1',
        name: 'Terminal 1',
        description: 'One end of the photoresistor. Photoresistors are non-polarized so either terminal can be connected.',
        relatedTerms: ['Light Sensing', 'Voltage Divider']
      },
      {
        id: 'photoresistor-terminal2',
        name: 'Terminal 2',
        description: 'The other end of the photoresistor. Photoresistors are non-polarized so either terminal can be connected.',
        relatedTerms: ['Light Sensing', 'Voltage Divider']
      }
    ]
  },
  {
    id: 'button',
    name: 'Push Button',
    iconSrc: 'attached_assets/buzzer.icon.svg',
    description: 'A momentary switch that completes a circuit when pressed',
    generalInfo: 'Push buttons are temporary switches that create a connection when pressed and break the connection when released. They are commonly used for user input in electronic projects.',
    pins: [
      {
        id: 'button-terminal1',
        name: 'Terminal 1',
        description: 'One terminal of the button. When the button is pressed, this terminal connects to Terminal 2.',
        relatedTerms: ['Pull-up Resistor', 'Debouncing']
      },
      {
        id: 'button-terminal2',
        name: 'Terminal 2',
        description: 'The other terminal of the button. When the button is pressed, this terminal connects to Terminal 1.',
        relatedTerms: ['Pull-up Resistor', 'Debouncing']
      }
    ]
  },
  {
    id: 'rotary-encoder',
    name: 'Rotary Encoder',
    iconSrc: 'attached_assets/rotary-encoder.icon.png',
    description: 'A device that converts rotational motion into digital signals',
    generalInfo: 'Rotary encoders provide both direction and position feedback when rotated. They are commonly used for volume controls, menu navigation, and precise positioning systems.',
    pins: [
      {
        id: 'rotary-common',
        name: 'Common (C)',
        description: 'The common pin for the rotary encoder, typically connected to ground.',
        relatedTerms: ['Ground', 'Common Terminal']
      },
      {
        id: 'rotary-a',
        name: 'Output A',
        description: 'One of the two output pins that produce quadrature signals when the encoder is rotated.',
        usageNotes: 'Connect to a digital input pin with a pull-up resistor.',
        relatedTerms: ['Quadrature Encoding', 'Pull-up Resistor']
      },
      {
        id: 'rotary-b',
        name: 'Output B',
        description: 'The second output pin that works with Output A to determine direction of rotation.',
        usageNotes: 'Connect to a digital input pin with a pull-up resistor.',
        relatedTerms: ['Quadrature Encoding', 'Direction Detection']
      },
      {
        id: 'rotary-switch',
        name: 'Switch (SW)',
        description: 'Many rotary encoders include a push button switch that activates when the knob is pressed.',
        usageNotes: 'Connect to a digital input pin with a pull-up resistor.',
        relatedTerms: ['Push Button', 'Pull-up Resistor']
      }
    ]
  },
  {
    id: 'oled-display',
    name: 'OLED Display',
    iconSrc: 'attached_assets/oled-display.icon.png',
    description: 'Organic Light Emitting Diode display for showing text and graphics',
    generalInfo: 'OLED displays offer high contrast, wide viewing angles, and do not require backlighting. They are energy efficient and commonly used in small electronic devices where visual feedback is needed.',
    pins: [
      {
        id: 'oled-gnd',
        name: 'GND',
        description: 'Ground connection for the display.',
        relatedTerms: ['Ground', 'Power Supply']
      },
      {
        id: 'oled-vcc',
        name: 'VCC',
        description: 'Power supply for the display logic, typically 3.3V or 5V.',
        voltageRange: '3.3-5V DC',
        warnings: 'Check your specific display model for voltage requirements.',
        relatedTerms: ['Power Supply', 'Voltage Level']
      },
      {
        id: 'oled-scl',
        name: 'SCL/SCK',
        description: 'Serial Clock line for I2C or SPI communication.',
        usageNotes: 'Connect to a microcontroller SCL/SCK pin.',
        relatedTerms: ['I2C', 'SPI', 'Serial Communication']
      },
      {
        id: 'oled-sda',
        name: 'SDA/MOSI',
        description: 'Serial Data line for I2C or Master Out Slave In for SPI.',
        usageNotes: 'Connect to a microcontroller SDA/MOSI pin.',
        relatedTerms: ['I2C', 'SPI', 'Serial Communication']
      }
    ]
  },
  {
    id: 'segmented-display',
    name: '7-Segment Display',
    iconSrc: 'attached_assets/segmented-display.icon.png',
    description: 'A display device for showing numbers and some letters using 7 LED segments',
    generalInfo: 'Seven-segment displays consist of seven LEDs arranged in a figure-8 pattern, plus an optional decimal point. They are commonly used to display numbers in clocks, counters, and measurement devices.',
    pins: [
      {
        id: 'segment-common',
        name: 'Common Pin',
        description: 'The common connection for all segments, either common anode (positive) or common cathode (negative).',
        usageNotes: 'Common anode connects to positive voltage, common cathode connects to ground.',
        relatedTerms: ['Common Anode', 'Common Cathode']
      },
      {
        id: 'segment-a',
        name: 'Segment A',
        description: 'Controls the top horizontal segment.',
        relatedTerms: ['LED', 'Current Limiting']
      },
      {
        id: 'segment-b',
        name: 'Segment B',
        description: 'Controls the upper right vertical segment.',
        relatedTerms: ['LED', 'Current Limiting']
      },
      {
        id: 'segment-c',
        name: 'Segment C',
        description: 'Controls the lower right vertical segment.',
        relatedTerms: ['LED', 'Current Limiting']
      },
      {
        id: 'segment-d',
        name: 'Segment D',
        description: 'Controls the bottom horizontal segment.',
        relatedTerms: ['LED', 'Current Limiting']
      },
      {
        id: 'segment-e',
        name: 'Segment E',
        description: 'Controls the lower left vertical segment.',
        relatedTerms: ['LED', 'Current Limiting']
      },
      {
        id: 'segment-f',
        name: 'Segment F',
        description: 'Controls the upper left vertical segment.',
        relatedTerms: ['LED', 'Current Limiting']
      },
      {
        id: 'segment-g',
        name: 'Segment G',
        description: 'Controls the middle horizontal segment.',
        relatedTerms: ['LED', 'Current Limiting']
      },
      {
        id: 'segment-dp',
        name: 'Decimal Point',
        description: 'Controls the decimal point dot (if present).',
        relatedTerms: ['LED', 'Current Limiting']
      }
    ]
  },
  {
    id: 'heroboard',
    name: 'Hero Board',
    iconSrc: 'attached_assets/hero-board.icon.png',
    description: 'A microcontroller development board for learning electronics and programming',
    generalInfo: 'The Hero Board is an educational microcontroller platform based on the ATmega328P chip. It features digital and analog I/O pins, PWM outputs, and is programmed using the Arduino IDE and C/C++.',
    pins: [
      {
        id: 'hero-5v',
        name: '5V',
        description: '5V power output when the board is powered via USB or external power supply.',
        voltageRange: '5V DC',
        warnings: 'Do not apply external voltage to this pin.',
        relatedTerms: ['Power Supply', 'Voltage Regulator']
      },
      {
        id: 'hero-3v3',
        name: '3.3V',
        description: '3.3V power output from the on-board voltage regulator.',
        voltageRange: '3.3V DC',
        warnings: 'Do not apply external voltage to this pin. Maximum current draw is 50mA.',
        relatedTerms: ['Power Supply', 'Voltage Regulator']
      },
      {
        id: 'hero-gnd',
        name: 'GND',
        description: 'Ground pins for completing electrical circuits.',
        relatedTerms: ['Ground', 'Common Reference']
      },
      {
        id: 'hero-digital',
        name: 'Digital Pins (0-13)',
        description: 'General-purpose digital input/output pins that can read or output HIGH (5V) or LOW (0V).',
        usageNotes: 'Pins 3, 5, 6, 9, 10, and 11 support PWM output. Pins 0 and 1 are used for serial communication.',
        relatedTerms: ['GPIO', 'PWM', 'Digital Signal']
      },
      {
        id: 'hero-analog',
        name: 'Analog Pins (A0-A5)',
        description: 'Analog input pins that can read varying voltage levels from 0-5V.',
        usageNotes: 'Can also be used as digital I/O pins if needed.',
        relatedTerms: ['ADC', 'Analog Signal', 'Sensor Input']
      }
    ]
  }
];

const GLOSSARY: GlossaryTerm[] = [
  {
    term: 'Forward Voltage',
    definition: 'The voltage required to turn on a diode and allow current to flow. Different types of diodes (including LEDs) have different forward voltage requirements.',
    relatedComponents: ['led', 'rgb-led']
  },
  {
    term: 'Current Limiting',
    definition: 'The practice of restricting the amount of current that can flow in a circuit, often done with a resistor. Essential for protecting components like LEDs.',
    relatedComponents: ['led', 'resistor', 'rgb-led', 'segmented-display']
  },
  {
    term: 'Ground',
    definition: 'A reference point in an electrical circuit from which voltage is measured. It is the return path for current to flow back to the source.',
    relatedComponents: ['led', 'oled-display', 'heroboard']
  },
  {
    term: 'Common Cathode',
    definition: 'A configuration where multiple components (often LEDs) share a common negative terminal.',
    relatedComponents: ['led', 'rgb-led', 'segmented-display']
  },
  {
    term: 'Common Anode',
    definition: 'A configuration where multiple components (often LEDs) share a common positive terminal.',
    relatedComponents: ['rgb-led', 'segmented-display']
  },
  {
    term: 'Resistance',
    definition: 'The opposition to the flow of electric current in a material, measured in ohms (\u03a9).',
    relatedComponents: ['resistor', 'photoresistor']
  },
  {
    term: 'Ohm\'s Law',
    definition: 'A fundamental relationship in electrical circuits: V = I \u00d7 R, where V is voltage, I is current, and R is resistance.',
    relatedComponents: ['resistor', 'photoresistor']
  },
  {
    term: 'Light Sensing',
    definition: 'The ability to detect and measure the intensity of light, often used in automatic lighting controls, sunrise/sunset detection, and other light-dependent applications.',
    relatedComponents: ['photoresistor']
  },
  {
    term: 'Voltage Divider',
    definition: 'A circuit that produces an output voltage that is a fraction of its input voltage. Common implementation uses two resistors in series.',
    relatedComponents: ['resistor', 'photoresistor']
  },
  {
    term: 'Pull-up Resistor',
    definition: 'A resistor connected between a signal conductor and the positive power supply to ensure the signal defaults to a high state when not actively driven low.',
    relatedComponents: ['button', 'rotary-encoder']
  },
  {
    term: 'Debouncing',
    definition: 'A technique to prevent multiple signal transitions from being registered when a mechanical switch is opened or closed due to mechanical bounce.',
    relatedComponents: ['button', 'rotary-encoder']
  },
  {
    term: 'PWM',
    definition: 'Pulse Width Modulation - A technique for getting analog results with digital means by controlling the amount of time a signal is on versus off.',
    relatedComponents: ['rgb-led', 'heroboard']
  },
  {
    term: 'Color Mixing',
    definition: 'The process of combining different colors of light (typically red, green, and blue) to create a wide range of colors.',
    relatedComponents: ['rgb-led']
  },
  {
    term: 'Quadrature Encoding',
    definition: 'A method of encoding rotational position by using two output signals that are 90 degrees out of phase, allowing both position and direction to be determined.',
    relatedComponents: ['rotary-encoder']
  },
  {
    term: 'Direction Detection',
    definition: 'The ability to determine the direction of movement or rotation in an encoder by analyzing the phase relationship between multiple signals.',
    relatedComponents: ['rotary-encoder']
  },
  {
    term: 'I2C',
    definition: 'Inter-Integrated Circuit - A serial communication protocol that uses two bidirectional lines (SDA and SCL) for data transfer between devices.',
    relatedComponents: ['oled-display']
  },
  {
    term: 'SPI',
    definition: 'Serial Peripheral Interface - A synchronous serial communication protocol used for short-distance communication, primarily in embedded systems.',
    relatedComponents: ['oled-display']
  },
  {
    term: 'Serial Communication',
    definition: 'A method of transmitting data one bit at a time over a communication channel or computer bus.',
    relatedComponents: ['oled-display', 'heroboard']
  },
  {
    term: 'Power Supply',
    definition: 'A device or system that supplies electrical energy to an output load or group of loads, providing the correct voltage and current.',
    relatedComponents: ['heroboard', 'oled-display']
  },
  {
    term: 'Voltage Regulator',
    definition: 'A circuit that maintains a constant voltage level automatically, used to provide stable power to electronic devices.',
    relatedComponents: ['heroboard']
  },
  {
    term: 'GPIO',
    definition: 'General Purpose Input/Output - A generic pin on a microcontroller that can be programmed to be either an input or output pin.',
    relatedComponents: ['heroboard']
  },
  {
    term: 'Digital Signal',
    definition: 'A signal that represents data as a sequence of discrete values, typically just two values representing on/off, high/low, or 1/0.',
    relatedComponents: ['heroboard', 'button']
  },
  {
    term: 'Analog Signal',
    definition: 'A continuous signal that can take on any value within a range, as opposed to digital signals that have discrete values.',
    relatedComponents: ['heroboard', 'photoresistor']
  },
  {
    term: 'ADC',
    definition: 'Analog-to-Digital Converter - A system that converts an analog signal into a digital signal that represents the amplitude of the analog signal.',
    relatedComponents: ['heroboard']
  },
  {
    term: 'Sensor Input',
    definition: 'An electronic component that detects and responds to changes in the environment, converting physical parameters into electrical signals.',
    relatedComponents: ['heroboard', 'photoresistor']
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
  
  // Component detail view - SIMPLIFIED VERSION
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
          
          <div className="flex flex-col items-center justify-center flex-grow">
            <img 
              src={selectedComponent.iconSrc} 
              alt={selectedComponent.name}
              className="w-40 h-40 object-contain mb-4"
            />
            <h2 className="text-xl font-bold">{selectedComponent.name}</h2>
            <p className="text-sm text-gray-600 mt-2 text-center">{selectedComponent.description}</p>
            
            {selectedComponent.generalInfo && (
              <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-gray-700 max-w-md">
                <h4 className="font-bold flex items-center">
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
