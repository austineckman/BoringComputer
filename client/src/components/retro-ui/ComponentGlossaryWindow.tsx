import React, { useState, useEffect } from 'react';
import { X, Minimize2, Search, Book, Cpu, Layers, HelpCircle } from 'lucide-react';
import './retro-ui.css';

// Import component images
import ledIconImage from "@assets/led.icon.png";
import buzzerIconImage from "@assets/buzzer.icon.svg";
import resistorIconImage from "@assets/resistor.icon.png";
import photoresistorIconImage from "@assets/photoresistor.icon.png";
import rgbLedIconImage from "@assets/rgb-led.icon.png";
import customKeypadIconImage from "@assets/custom-keypad.icon.png";
import dipSwitchIconImage from "@assets/dip-switch-3.icon.png";
import oledDisplayIconImage from "@assets/oled-display.icon.png";
import heroboardIconImage from "@assets/hero-board.icon.png";
import rotaryEncoderIconImage from "@assets/rotary-encoder.icon.png";
import segmentedDisplayIconImage from "@assets/segmented-display.icon.png";

interface ComponentGlossaryWindowProps {
  onClose: () => void;
  onMinimize: () => void;
  isActive: boolean;
}

// Component data structure
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

// Search term glossary
interface GlossaryTerm {
  term: string;
  definition: string;
  relatedComponents?: string[];
}

// Component data
const COMPONENTS: Component[] = [
  {
    id: "led",
    name: "LED",
    iconSrc: ledIconImage,
    description: "Light Emitting Diode - A semiconductor that emits light when current flows through it.",
    generalInfo: "LEDs are polarized components, meaning they only work when connected in the correct direction. The longer leg is the anode (+) and should be connected to the positive voltage, while the shorter leg is the cathode (-) and connects to ground.",
    pins: [
      {
        id: "anode",
        name: "Anode (+)",
        description: "The positive terminal of the LED, typically the longer leg.",
        voltageRange: "Forward voltage varies by color: Red: 1.8-2.2V, Green: 2.0-3.2V, Blue: 2.7-3.4V",
        usageNotes: "Must be connected to the positive voltage through a current-limiting resistor.",
        warnings: "Never connect an LED directly to a voltage source without a resistor as it will burn out.",
        relatedTerms: ["current limiting resistor", "forward voltage"]
      },
      {
        id: "cathode",
        name: "Cathode (-)",
        description: "The negative terminal of the LED, typically the shorter leg.",
        voltageRange: "0V (connects to ground)",
        usageNotes: "Should be connected to ground (GND) to complete the circuit.",
        relatedTerms: ["GND", "ground"]
      }
    ]
  },
  {
    id: "resistor",
    name: "Resistor",
    iconSrc: resistorIconImage,
    description: "A passive two-terminal electrical component that implements electrical resistance as a circuit element.",
    generalInfo: "Resistors are used to reduce current flow, adjust signal levels, divide voltages, bias active elements, and terminate transmission lines. Resistance is measured in ohms (Ω).",
    pins: [
      {
        id: "terminal1",
        name: "Terminal 1",
        description: "First terminal of the resistor.",
        usageNotes: "Resistors are non-polarized, so either terminal can be connected to higher voltage or ground.",
        relatedTerms: ["ohm's law", "resistance"]
      },
      {
        id: "terminal2",
        name: "Terminal 2",
        description: "Second terminal of the resistor.",
        usageNotes: "Resistors are non-polarized, so either terminal can be connected to higher voltage or ground.",
        relatedTerms: ["ohm's law", "resistance"]
      }
    ]
  },
  {
    id: "buzzer",
    name: "Buzzer",
    iconSrc: buzzerIconImage,
    description: "A audio signaling device that can be mechanical, electromechanical, or piezoelectric.",
    generalInfo: "Buzzers convert electrical energy into sound. They are commonly used in alarms, timers, and confirmation of user input.",
    pins: [
      {
        id: "positive",
        name: "Positive (+)",
        description: "The positive terminal of the buzzer.",
        voltageRange: "3-12V depending on the buzzer specifications",
        usageNotes: "Connect to the positive voltage supply through a current-limiting resistor if needed.",
        warnings: "Check your buzzer's specifications for voltage requirements."
      },
      {
        id: "negative",
        name: "Negative (-)",
        description: "The negative terminal of the buzzer.",
        voltageRange: "0V (connects to ground)",
        usageNotes: "Connect to ground (GND) to complete the circuit."
      }
    ]
  },
  {
    id: "photoresistor",
    name: "Photoresistor",
    iconSrc: photoresistorIconImage,
    description: "A light-controlled variable resistor that decreases resistance with increasing incident light intensity.",
    generalInfo: "Also known as LDRs (Light Dependent Resistors), photoresistors are used in light sensing applications, such as detecting darkness or brightness.",
    pins: [
      {
        id: "terminal1",
        name: "Terminal 1",
        description: "First terminal of the photoresistor.",
        usageNotes: "Typically used in a voltage divider circuit with another resistor. Connect to power or ground.",
        relatedTerms: ["voltage divider", "analog sensing"]
      },
      {
        id: "terminal2",
        name: "Terminal 2",
        description: "Second terminal of the photoresistor.",
        usageNotes: "Typically connected to an analog input pin (through a voltage divider) or to VCC with the other terminal to ground through a fixed resistor.",
        relatedTerms: ["voltage divider", "analog sensing"]
      }
    ]
  },
  {
    id: "rgb-led",
    name: "RGB LED",
    iconSrc: rgbLedIconImage,
    description: "A LED that can emit different colors by combining red, green, and blue light.",
    generalInfo: "RGB LEDs contain three separate LEDs in one package. By varying the intensity of each color, you can create millions of different colors.",
    pins: [
      {
        id: "common",
        name: "Common Terminal",
        description: "This can be either common anode (connects to VCC) or common cathode (connects to GND) depending on the LED type.",
        usageNotes: "For common anode RGB LEDs, connect this to VCC. For common cathode, connect to GND.",
        warnings: "Always check your LED datasheet to confirm whether it's common anode or common cathode.",
        relatedTerms: ["common anode", "common cathode"]
      },
      {
        id: "red",
        name: "Red Terminal",
        description: "Controls the red component of the RGB LED.",
        voltageRange: "Forward voltage ~1.8-2.2V",
        usageNotes: "Connect through a current-limiting resistor (usually 220-330Ω).",
        relatedTerms: ["PWM", "current limiting resistor"]
      },
      {
        id: "green",
        name: "Green Terminal",
        description: "Controls the green component of the RGB LED.",
        voltageRange: "Forward voltage ~2.0-3.2V",
        usageNotes: "Connect through a current-limiting resistor (usually 220-330Ω).",
        relatedTerms: ["PWM", "current limiting resistor"]
      },
      {
        id: "blue",
        name: "Blue Terminal",
        description: "Controls the blue component of the RGB LED.",
        voltageRange: "Forward voltage ~2.7-3.4V",
        usageNotes: "Connect through a current-limiting resistor (usually 220-330Ω).",
        relatedTerms: ["PWM", "current limiting resistor"]
      }
    ]
  },
  {
    id: "hero-board",
    name: "Hero Board",
    iconSrc: heroboardIconImage,
    description: "A microcontroller development board for electronics prototyping and learning.",
    generalInfo: "The Hero Board serves as a versatile microcontroller platform with Arduino compatibility, featuring expansion capabilities and built-in components for easier electronics experimentation.",
    pins: [
      {
        id: "vcc",
        name: "VCC",
        description: "Voltage Common Collector - The main power supply positive voltage.",
        voltageRange: "3.3V or 5V depending on the jumper setting",
        usageNotes: "Used to power components and circuits connected to the board.",
        warnings: "Make sure your components can handle the selected voltage.",
        relatedTerms: ["power", "voltage"]
      },
      {
        id: "gnd",
        name: "GND",
        description: "Ground - The reference point for all voltage measurements in the circuit.",
        voltageRange: "0V",
        usageNotes: "All components in your circuit should have a ground connection directly or indirectly.",
        relatedTerms: ["ground", "common"]
      },
      {
        id: "digital-pins",
        name: "Digital I/O Pins",
        description: "Pins that can be set to either HIGH (VCC) or LOW (GND) and can read digital signals.",
        voltageRange: "0V (LOW) to 3.3V/5V (HIGH)",
        usageNotes: "Used for digital input or output. Can be set as INPUT, OUTPUT, or INPUT_PULLUP in code.",
        relatedTerms: ["GPIO", "digital signal", "INPUT_PULLUP"]
      },
      {
        id: "analog-pins",
        name: "Analog Input Pins",
        description: "Pins that can read analog voltage levels through an analog-to-digital converter (ADC).",
        voltageRange: "0V to VCC (3.3V or 5V)",
        usageNotes: "Used to read sensors like potentiometers, photoresistors, etc. Values range from 0 to 1023 (10-bit) or 0 to 4095 (12-bit) depending on the board.",
        relatedTerms: ["ADC", "analog-to-digital", "10-bit resolution"]
      },
      {
        id: "pwm-pins",
        name: "PWM Pins",
        description: "Digital pins that can simulate analog output through Pulse Width Modulation.",
        voltageRange: "Effective voltage varies based on duty cycle from 0V to VCC",
        usageNotes: "Used for controlling LED brightness, motor speed, and other analog-like controls. Marked with ~ symbol on many boards.",
        relatedTerms: ["pulse width modulation", "duty cycle", "analogWrite"]
      },
      {
        id: "i2c-pins",
        name: "I2C Pins (SDA/SCL)",
        description: "Pins for I2C (Inter-Integrated Circuit) communication protocol.",
        usageNotes: "Used for communicating with multiple slave devices like displays, sensors, and other ICs over just two wires.",
        relatedTerms: ["serial communication", "SCL", "SDA", "Wire library"]
      },
      {
        id: "spi-pins",
        name: "SPI Pins (MOSI/MISO/SCK/SS)",
        description: "Pins for SPI (Serial Peripheral Interface) communication protocol.",
        usageNotes: "Faster than I2C but requires more pins. Used for communicating with SD cards, displays, and sensors.",
        relatedTerms: ["serial communication", "MOSI", "MISO", "SCK", "SS", "SPI library"]
      }
    ]
  },
  {
    id: "rotary-encoder",
    name: "Rotary Encoder",
    iconSrc: rotaryEncoderIconImage,
    description: "A type of position sensor that converts angular motion into digital output signals.",
    generalInfo: "Unlike potentiometers, rotary encoders provide unlimited rotation and can detect both the amount and direction of rotation. They're commonly used in volume knobs, scroll wheels, and motor control applications.",
    pins: [
      {
        id: "clk",
        name: "CLK (A)",
        description: "Clock or Channel A pin.",
        usageNotes: "Connect to a digital input pin on your microcontroller. Used with DT pin to determine rotation direction.",
        relatedTerms: ["quadrature encoding", "interrupt"]
      },
      {
        id: "dt",
        name: "DT (B)",
        description: "Data or Channel B pin.",
        usageNotes: "Connect to a digital input pin on your microcontroller. Used with CLK pin to determine rotation direction.",
        relatedTerms: ["quadrature encoding", "interrupt"]
      },
      {
        id: "sw",
        name: "SW (Button)",
        description: "Switch or Button pin.",
        usageNotes: "Many rotary encoders include a pushbutton switch. Connect to a digital input pin, typically with a pull-up resistor.",
        relatedTerms: ["debouncing", "INPUT_PULLUP"]
      },
      {
        id: "vcc",
        name: "VCC",
        description: "Power supply pin.",
        voltageRange: "3.3V to 5V",
        usageNotes: "Connect to the microcontroller's VCC."
      },
      {
        id: "gnd",
        name: "GND",
        description: "Ground pin.",
        usageNotes: "Connect to the microcontroller's GND."
      }
    ]
  },
  {
    id: "oled-display",
    name: "OLED Display",
    iconSrc: oledDisplayIconImage,
    description: "A self-illuminating display that uses organic light-emitting diodes to produce brilliant visuals.",
    generalInfo: "OLED displays are energy-efficient, thin, lightweight, and provide excellent contrast. They communicate with microcontrollers typically through I2C or SPI protocols.",
    pins: [
      {
        id: "vcc",
        name: "VCC",
        description: "Power supply pin.",
        voltageRange: "3.3V to 5V (check your specific display)",
        usageNotes: "Connect to the microcontroller's VCC.",
        warnings: "Always verify voltage requirements - some displays are 3.3V only."
      },
      {
        id: "gnd",
        name: "GND",
        description: "Ground pin.",
        usageNotes: "Connect to the microcontroller's GND."
      },
      {
        id: "scl",
        name: "SCL/SCK",
        description: "Serial Clock line for I2C or SPI communication.",
        usageNotes: "Connect to the SCL pin on your microcontroller for I2C displays, or to the SCK pin for SPI displays.",
        relatedTerms: ["I2C", "SPI", "serial communication"]
      },
      {
        id: "sda",
        name: "SDA/MOSI",
        description: "Serial Data line for I2C, or Master Out Slave In for SPI communication.",
        usageNotes: "Connect to the SDA pin on your microcontroller for I2C displays, or to the MOSI pin for SPI displays.",
        relatedTerms: ["I2C", "SPI", "serial communication"]
      },
      {
        id: "res",
        name: "RES/RST",
        description: "Reset pin.",
        usageNotes: "Connect to a digital output pin on your microcontroller. Used to reset the display."
      },
      {
        id: "dc",
        name: "DC",
        description: "Data/Command control pin (SPI displays only).",
        usageNotes: "Connect to a digital output pin on your microcontroller. For SPI displays, indicates whether the data sent is a command or display data.",
        relatedTerms: ["SPI", "command register"]
      },
      {
        id: "cs",
        name: "CS",
        description: "Chip Select pin (SPI displays only).",
        usageNotes: "Connect to a digital output pin on your microcontroller. Used to enable the display for SPI communication.",
        relatedTerms: ["SPI", "slave select"]
      }
    ]
  },
  {
    id: "dip-switch",
    name: "DIP Switch",
    iconSrc: dipSwitchIconImage,
    description: "A small manual switch assembly used to customize the hardware operation of electronic devices.",
    generalInfo: "DIP (Dual In-line Package) switches provide an easy way to change configuration settings without software. They're commonly used for setting device IDs, enabling features, or configuring operational modes.",
    pins: [
      {
        id: "common",
        name: "Common Terminal",
        description: "The terminal that connects to all switches.",
        usageNotes: "Typically connected to either VCC or GND depending on your circuit design."
      },
      {
        id: "switch-terminals",
        name: "Switch Terminals",
        description: "Individual terminals for each switch.",
        usageNotes: "Connect to microcontroller input pins, typically with pull-up or pull-down resistors to ensure defined states.",
        relatedTerms: ["pull-up resistor", "pull-down resistor", "INPUT_PULLUP"]
      }
    ]
  },
  {
    id: "segmented-display",
    name: "7-Segment Display",
    iconSrc: segmentedDisplayIconImage,
    description: "A form of electronic display device for displaying decimal numerals and some alphabetic characters.",
    generalInfo: "7-segment displays consist of seven LED segments arranged in a rectangular pattern to display digits and limited letters. They come in common anode or common cathode configurations.",
    pins: [
      {
        id: "common",
        name: "Common Terminal",
        description: "This can be either common anode (connects to VCC) or common cathode (connects to GND) depending on the display type.",
        usageNotes: "For common anode displays, connect to VCC. For common cathode, connect to GND.",
        warnings: "Always check your display datasheet to confirm whether it's common anode or common cathode.",
        relatedTerms: ["common anode", "common cathode"]
      },
      {
        id: "segments",
        name: "Segment Pins (a-g)",
        description: "Individual pins controlling each of the seven segments plus the decimal point.",
        voltageRange: "Typically requires 1.8V-3.3V per segment with appropriate current limiting resistors.",
        usageNotes: "Each segment must be connected through a current-limiting resistor (typically 220-330Ω).",
        warnings: "Never connect directly to a voltage source without current-limiting resistors.",
        relatedTerms: ["current limiting resistor", "multiplexing"]
      }
    ]
  }
];

// Glossary data
const GLOSSARY: GlossaryTerm[] = [
  {
    term: "VCC",
    definition: "Voltage Common Collector - The main power supply positive voltage in a circuit, typically 3.3V or 5V in microcontroller circuits.",
    relatedComponents: ["hero-board", "led", "rgb-led"]
  },
  {
    term: "GND",
    definition: "Ground - The reference point from which voltages are measured, typically 0V. All components in a circuit must share a common ground.",
    relatedComponents: ["hero-board", "led", "rgb-led", "buzzer"]
  },
  {
    term: "pull-up resistor",
    definition: "A resistor connected between a signal wire and the positive power supply (VCC). It ensures a defined high state when the input is not actively driven low.",
    relatedComponents: ["hero-board", "dip-switch", "rotary-encoder"]
  },
  {
    term: "pull-down resistor",
    definition: "A resistor connected between a signal wire and ground (GND). It ensures a defined low state when the input is not actively driven high.",
    relatedComponents: ["hero-board", "dip-switch"]
  },
  {
    term: "current limiting resistor",
    definition: "A resistor used to limit the amount of current flowing through a component, often used with LEDs to prevent damage.",
    relatedComponents: ["led", "rgb-led", "segmented-display"]
  },
  {
    term: "forward voltage",
    definition: "The voltage drop across a semiconductor device (like an LED) when current is flowing in the forward direction.",
    relatedComponents: ["led", "rgb-led"]
  },
  {
    term: "PWM",
    definition: "Pulse Width Modulation - A technique to simulate analog output using digital signals by varying the width of pulses. Used for controlling LED brightness, motor speed, etc.",
    relatedComponents: ["hero-board", "led", "rgb-led"]
  },
  {
    term: "common anode",
    definition: "A configuration where multiple LEDs or segments share a common positive terminal (anode) that connects to VCC.",
    relatedComponents: ["rgb-led", "segmented-display"]
  },
  {
    term: "common cathode",
    definition: "A configuration where multiple LEDs or segments share a common negative terminal (cathode) that connects to GND.",
    relatedComponents: ["rgb-led", "segmented-display"]
  },
  {
    term: "I2C",
    definition: "Inter-Integrated Circuit - A serial communication protocol that uses two wires (SDA and SCL) to communicate with multiple devices.",
    relatedComponents: ["hero-board", "oled-display"]
  },
  {
    term: "SPI",
    definition: "Serial Peripheral Interface - A synchronous serial communication protocol that uses separate clock and data lines, plus select lines for multiple devices.",
    relatedComponents: ["hero-board", "oled-display"]
  },
  {
    term: "voltage divider",
    definition: "A circuit that produces an output voltage that is a fraction of its input voltage, commonly used with analog sensors like photoresistors.",
    relatedComponents: ["photoresistor"]
  },
  {
    term: "debouncing",
    definition: "The process of eliminating the effects of signal bounce in mechanical switches or buttons, preventing multiple unintended triggers.",
    relatedComponents: ["rotary-encoder", "dip-switch"]
  },
  {
    term: "anode",
    definition: "The positive electrode or terminal of a semiconductor device like an LED. Current flows into the anode when the device is forward-biased.",
    relatedComponents: ["led", "rgb-led"]
  },
  {
    term: "cathode",
    definition: "The negative electrode or terminal of a semiconductor device like an LED. Current flows out of the cathode when the device is forward-biased.",
    relatedComponents: ["led", "rgb-led"]
  },
  {
    term: "analog sensing",
    definition: "Reading variable voltage levels (rather than just high/low) to detect things like light intensity, temperature, pressure, etc.",
    relatedComponents: ["photoresistor", "hero-board"]
  }
];

const ComponentGlossaryWindow: React.FC<ComponentGlossaryWindowProps> = ({ onClose, onMinimize, isActive }) => {
  // Component selection and PIN selection states
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
