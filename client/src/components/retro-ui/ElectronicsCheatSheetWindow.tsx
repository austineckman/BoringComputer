import React, { useState } from 'react';
import { X, Minimize2, Book, FileText, Cpu, Zap, FileSpreadsheet, Calculator, Search, Sparkles, CircuitBoard, Wrench, Lightbulb, Info, ArrowRight, ChevronRight, ChevronsDown } from 'lucide-react';
import gizboImage from '@assets/gizbo.png';

interface ElectronicsCheatSheetWindowProps {
  onClose: () => void;
  onMinimize: () => void;
  isActive: boolean;
}

interface FormulaItem {
  title: string;
  formula: string;
  description: string;
  variations?: { formula: string; description: string }[];
  notes?: string;
  image?: string;
}

interface PinoutItem {
  title: string;
  description: string;
  pinout: string;
  notes?: string;
}

interface CircuitPattern {
  title: string;
  description: string;
  circuit: string;
  notes: string;
}

const ElectronicsCheatSheetWindow: React.FC<ElectronicsCheatSheetWindowProps> = ({
  onClose,
  onMinimize,
  isActive,
}) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // Toggle expanded state for an item
  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // Collection of electronic formulas
  const formulas: FormulaItem[] = [
    {
      title: "Ohm's Law",
      formula: "V = I × R",
      description: "The relationship between voltage (V), current (I), and resistance (R)",
      variations: [
        { formula: "I = V ÷ R", description: "Finding current" },
        { formula: "R = V ÷ I", description: "Finding resistance" }
      ],
      notes: "Example: If V = 12V and R = 6Ω, then I = 2A"
    },
    {
      title: "Power (P)",
      formula: "P = V × I",
      description: "The relationship between power (P), voltage (V), and current (I)",
      variations: [
        { formula: "P = I² × R", description: "Using current and resistance" },
        { formula: "P = V² ÷ R", description: "Using voltage and resistance" }
      ],
      notes: "Example: If V = 12V and I = 2A, then P = 24W"
    },
    {
      title: "Series Resistors",
      formula: "Rtotal = R₁ + R₂ + ... + Rₙ",
      description: "The total resistance of resistors connected in series",
      notes: "Example: 10Ω + 20Ω + 30Ω = 60Ω total"
    },
    {
      title: "Parallel Resistors",
      formula: "1/Rtotal = 1/R₁ + 1/R₂ + ... + 1/Rₙ",
      description: "The total resistance of resistors connected in parallel",
      variations: [
        { formula: "For 2 resistors: Rtotal = (R₁ × R₂) ÷ (R₁ + R₂)", description: "Simplified formula for 2 resistors" }
      ],
      notes: "Example: For 4Ω and 12Ω in parallel, Rtotal = (4 × 12) ÷ (4 + 12) = 3Ω"
    },
    {
      title: "Capacitance in Series",
      formula: "1/Ctotal = 1/C₁ + 1/C₂ + ... + 1/Cₙ",
      description: "The total capacitance of capacitors connected in series",
      notes: "Similar to parallel resistors formula"
    },
    {
      title: "Capacitance in Parallel",
      formula: "Ctotal = C₁ + C₂ + ... + Cₙ",
      description: "The total capacitance of capacitors connected in parallel",
      notes: "Similar to series resistors formula"
    },
    {
      title: "Voltage Divider",
      formula: "Vout = Vin × (R₂ ÷ (R₁ + R₂))",
      description: "Output voltage from a voltage divider circuit",
      notes: "R₁ is connected to Vin, R₂ is connected to ground, Vout is measured across R₂"
    },
    {
      title: "LED Current Limiting Resistor",
      formula: "R = (Vs - Vf) ÷ If",
      description: "Calculate resistor value for an LED circuit",
      notes: "Vs = supply voltage, Vf = LED forward voltage, If = LED forward current"
    },
    {
      title: "RC Time Constant",
      formula: "τ = R × C",
      description: "Time constant for a resistor-capacitor circuit",
      notes: "Time (in seconds) to charge to ~63% or discharge to ~37%"
    },
    {
      title: "Frequency and Period",
      formula: "f = 1 ÷ T",
      description: "Relationship between frequency (f) and period (T)",
      variations: [
        { formula: "T = 1 ÷ f", description: "Finding period from frequency" }
      ],
      notes: "f is in Hz, T is in seconds"
    }
  ];

  // Collection of component pinouts
  const pinouts: PinoutItem[] = [
    {
      title: "Arduino Uno Pins",
      description: "Arduino Uno pin mapping and functions",
      pinout: `
Digital Pins:
• D0-D13: Digital I/O pins (D0/D1 are also RX/TX)
• D0 (RX): Serial receive
• D1 (TX): Serial transmit
• D2-D3: External interrupt pins
• D3, D5, D6, D9, D10, D11: PWM pins
• D10-D13: SPI pins (SS, MOSI, MISO, SCK)
• D13: Built-in LED

Analog Pins:
• A0-A5: Analog input pins
• A4-A5: I2C pins (SDA, SCL)

Power Pins:
• 5V: 5V power output
• 3.3V: 3.3V power output
• GND: Ground
• Vin: Input voltage
• AREF: Analog reference
      `,
      notes: "PWM pins are marked with ~ on the board"
    },
    {
      title: "Common IC Pinouts",
      description: "Pinouts for common integrated circuits",
      pinout: `
555 Timer (8-pin DIP):
1: GND
2: Trigger
3: Output
4: Reset
5: Control Voltage
6: Threshold
7: Discharge
8: Vcc

LM7805 Voltage Regulator (TO-220):
1: Input Voltage
2: Ground
3: Output (5V)

L293D Motor Driver:
1,9,16: Enable pins
2,7,10,15: Input pins
3,6,11,14: Output pins
4,5,12,13: Ground
8: Logic supply (Vss)
16: Motor supply (Vs)
      `,
      notes: "Pin 1 is typically marked with a dot or notch on ICs"
    },
    {
      title: "Common Sensors",
      description: "Pinouts for common sensors",
      pinout: `
DHT11/DHT22 (Temperature/Humidity):
1: VCC (3-5V)
2: Data
3: Not connected (NC)
4: GND

HC-SR04 (Ultrasonic):
VCC: 5V power
Trig: Trigger input
Echo: Echo output
GND: Ground

MPU6050 (Accelerometer/Gyro):
VCC: 3-5V power
GND: Ground
SCL: I2C clock
SDA: I2C data
XDA: Auxiliary data
XCL: Auxiliary clock
AD0: I2C address select
INT: Interrupt
      `,
      notes: "Always verify pinout with component datasheet"
    },
    {
      title: "Common Displays",
      description: "Pinouts for common display types",
      pinout: `
16x2 LCD (with I2C adapter):
GND: Ground
VCC: 5V power
SDA: I2C data
SCL: I2C clock

SSD1306 OLED Display:
GND: Ground
VCC: 3.3V power
SCL: I2C clock
SDA: I2C data

MAX7219 LED Matrix:
VCC: 5V power
GND: Ground
DIN: Data in
CS: Chip select
CLK: Clock
      `,
      notes: "I2C displays typically need only 4 wires"
    }
  ];

  // Collection of common circuit patterns
  const circuits: CircuitPattern[] = [
    {
      title: "Voltage Divider",
      description: "Outputs a fraction of the input voltage",
      circuit: `
Vin --- R1 --- Vout --- R2 --- GND

Where:
• Vout = Vin × (R2 / (R1 + R2))
• Common uses: level shifting, measurement, biasing
      `,
      notes: "For accurate measurement, ensure load resistance is much greater than R2"
    },
    {
      title: "RC Filter Circuits",
      description: "Filter circuits using resistors and capacitors",
      circuit: `
Low-Pass Filter:
Input --- R1 --- Output
           |
           C1
           |
          GND

High-Pass Filter:
Input --- C1 --- Output
                  |
                  R1
                  |
                 GND
      `,
      notes: "Cutoff frequency (fc) = 1/(2πRC)"
    },
    {
      title: "LED Circuit",
      description: "Basic LED circuit with current limiting resistor",
      circuit: `
VCC --- Resistor --- LED --- GND

Where:
• Resistor value = (VCC - Vf) / If
• Vf = LED forward voltage (typical: ~2V for red, ~3.2V for blue/white)
• If = LED forward current (typical: 20mA)
      `,
      notes: "Always use a current limiting resistor with LEDs"
    },
    {
      title: "Transistor Switch",
      description: "NPN transistor used as a switch",
      circuit: `
VCC --- Load --- Collector
                  |
    Base --- R1 --- Emitter
     |                |
 Control             GND
     |
     R2
     |
    GND
      `,
      notes: "R1 limits collector current, R2 limits base current"
    },
    {
      title: "H-Bridge Motor Control",
      description: "Circuit for bidirectional DC motor control",
      circuit: `
        VCC
         |
     ----|----
    |         |
    Q1        Q2
    |         |
    |--Motor--|
    |         |
    Q3        Q4
    |         |
     ----|----
         |
        GND

Control logic:
• Q1+Q4 ON, Q2+Q3 OFF: Motor turns one way
• Q2+Q3 ON, Q1+Q4 OFF: Motor turns other way
• All OFF: Motor free-running
• Q1+Q3 ON or Q2+Q4 ON: Braking (avoid!)
      `,
      notes: "Never turn on Q1+Q2 or Q3+Q4 at the same time (short circuit!)"
    }
  ];

  // Collection of electronic standards and references
  const references = [
    {
      title: "Resistor Color Codes",
      content: `
4-Band Resistors:
1st band: 1st digit
2nd band: 2nd digit
3rd band: Multiplier
4th band: Tolerance

5-Band Resistors:
1st band: 1st digit
2nd band: 2nd digit
3rd band: 3rd digit
4th band: Multiplier
5th band: Tolerance

Color Codes:
• Black: 0
• Brown: 1
• Red: 2
• Orange: 3
• Yellow: 4
• Green: 5
• Blue: 6
• Violet: 7
• Grey: 8
• White: 9
• Gold: ×0.1, ±5%
• Silver: ×0.01, ±10%
      `
    },
    {
      title: "Standard Capacitor Values",
      content: `
Common values in pF, nF, µF:
• 1, 1.5, 2.2, 3.3, 4.7, 6.8
• 10, 15, 22, 33, 47, 68
• 100, 150, 220, 330, 470, 680
• 1000, 1500, 2200, 3300, 4700, 6800
• 10000, ...

Capacitor Codes:
• 104 = 10 × 10⁴ pF = 100 nF
• 475 = 47 × 10⁵ pF = 4.7 µF
• 103 = 10 × 10³ pF = 10 nF
      `
    },
    {
      title: "Wire Gauges (AWG)",
      content: `
Common wire gauges and max current:
• 10 AWG: 30A
• 12 AWG: 20A
• 14 AWG: 15A
• 16 AWG: 8A
• 18 AWG: 5A
• 20 AWG: 3.5A
• 22 AWG: 2A
• 24 AWG: 1A
• 26 AWG: 0.75A
• 28 AWG: 0.5A
• 30 AWG: 0.25A

Lower gauge = thicker wire
      `
    },
    {
      title: "Logic Level Standards",
      content: `
TTL Logic Levels:
• LOW: 0V to 0.8V
• HIGH: 2V to 5V

CMOS Logic Levels (5V):
• LOW: 0V to 1.5V
• HIGH: 3.5V to 5V

CMOS Logic Levels (3.3V):
• LOW: 0V to 0.8V
• HIGH: 2V to 3.3V

Arduino Logic Levels:
• Digital input HIGH: >3V on 5V board, >2V on 3.3V board
• Digital input LOW: <2V on 5V board, <1V on 3.3V board
      `
    },
    {
      title: "Common Arduino Commands",
      content: `
Digital I/O:
• pinMode(pin, mode)
• digitalWrite(pin, value)
• digitalRead(pin)

Analog:
• analogRead(pin)
• analogWrite(pin, value)

Time:
• delay(ms)
• delayMicroseconds(us)
• millis()
• micros()

Serial:
• Serial.begin(baud)
• Serial.print(data)
• Serial.println(data)
• Serial.available()
• Serial.read()
      `
    }
  ];

  // Filtered items based on search term
  const filteredFormulas = formulas.filter(f => 
    searchTerm === '' || 
    f.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredPinouts = pinouts.filter(p => 
    searchTerm === '' || 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.pinout.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCircuits = circuits.filter(c => 
    searchTerm === '' || 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.circuit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReferences = references.filter(r => 
    searchTerm === '' || 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Tab data
  const tabs = [
    { name: "Formulas", icon: <Calculator className="w-4 h-4" />, data: filteredFormulas, type: "formula" },
    { name: "Pinouts", icon: <Cpu className="w-4 h-4" />, data: filteredPinouts, type: "pinout" },
    { name: "Circuits", icon: <CircuitBoard className="w-4 h-4" />, data: filteredCircuits, type: "circuit" },
    { name: "References", icon: <FileText className="w-4 h-4" />, data: filteredReferences, type: "reference" },
  ];

  // Render a formula item
  const renderFormulaItem = (item: FormulaItem, index: number) => {
    const isExpanded = expandedItems[`formula-${index}`] || false;
    
    return (
      <div 
        key={`formula-${index}`} 
        className="mb-3 bg-white rounded-lg border border-gray-200 overflow-hidden"
      >
        <div 
          className="p-3 bg-gradient-to-r from-blue-50 to-white flex justify-between items-center cursor-pointer"
          onClick={() => toggleExpanded(`formula-${index}`)}
        >
          <div className="flex items-center">
            <Calculator className="w-4 h-4 text-blue-600 mr-2" />
            <h3 className="font-bold text-gray-800">{item.title}</h3>
          </div>
          <div className="flex items-center">
            <span className="text-xs bg-blue-100 text-blue-800 py-0.5 px-2 rounded mr-2">Formula</span>
            {isExpanded ? (
              <ChevronsDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </div>
        </div>
        
        {isExpanded && (
          <div className="p-3 border-t border-gray-100">
            <div className="bg-blue-50 p-2 rounded mb-2 font-mono text-center text-lg">
              {item.formula}
            </div>
            
            <p className="text-gray-600 mb-3">{item.description}</p>
            
            {item.variations && item.variations.length > 0 && (
              <div className="mb-3">
                <h4 className="font-semibold text-sm text-gray-700 mb-1">Variations:</h4>
                {item.variations.map((variation, vidx) => (
                  <div key={vidx} className="flex items-center text-sm mb-1">
                    <span className="inline-block bg-gray-100 p-1 rounded font-mono mr-2">{variation.formula}</span>
                    <span className="text-gray-600">{variation.description}</span>
                  </div>
                ))}
              </div>
            )}
            
            {item.notes && (
              <div className="flex items-start mt-2 text-sm">
                <Info className="w-4 h-4 text-blue-500 mr-1 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{item.notes}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render a pinout item
  const renderPinoutItem = (item: PinoutItem, index: number) => {
    const isExpanded = expandedItems[`pinout-${index}`] || false;
    
    return (
      <div 
        key={`pinout-${index}`} 
        className="mb-3 bg-white rounded-lg border border-gray-200 overflow-hidden"
      >
        <div 
          className="p-3 bg-gradient-to-r from-purple-50 to-white flex justify-between items-center cursor-pointer"
          onClick={() => toggleExpanded(`pinout-${index}`)}
        >
          <div className="flex items-center">
            <Cpu className="w-4 h-4 text-purple-600 mr-2" />
            <h3 className="font-bold text-gray-800">{item.title}</h3>
          </div>
          <div className="flex items-center">
            <span className="text-xs bg-purple-100 text-purple-800 py-0.5 px-2 rounded mr-2">Pinout</span>
            {isExpanded ? (
              <ChevronsDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </div>
        </div>
        
        {isExpanded && (
          <div className="p-3 border-t border-gray-100">
            <p className="text-gray-600 mb-3">{item.description}</p>
            
            <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm whitespace-pre mb-2">
              {item.pinout}
            </div>
            
            {item.notes && (
              <div className="flex items-start mt-2 text-sm">
                <Info className="w-4 h-4 text-purple-500 mr-1 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{item.notes}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render a circuit pattern item
  const renderCircuitItem = (item: CircuitPattern, index: number) => {
    const isExpanded = expandedItems[`circuit-${index}`] || false;
    
    return (
      <div 
        key={`circuit-${index}`} 
        className="mb-3 bg-white rounded-lg border border-gray-200 overflow-hidden"
      >
        <div 
          className="p-3 bg-gradient-to-r from-green-50 to-white flex justify-between items-center cursor-pointer"
          onClick={() => toggleExpanded(`circuit-${index}`)}
        >
          <div className="flex items-center">
            <CircuitBoard className="w-4 h-4 text-green-600 mr-2" />
            <h3 className="font-bold text-gray-800">{item.title}</h3>
          </div>
          <div className="flex items-center">
            <span className="text-xs bg-green-100 text-green-800 py-0.5 px-2 rounded mr-2">Circuit</span>
            {isExpanded ? (
              <ChevronsDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </div>
        </div>
        
        {isExpanded && (
          <div className="p-3 border-t border-gray-100">
            <p className="text-gray-600 mb-3">{item.description}</p>
            
            <div className="bg-gray-100 p-3 rounded font-mono text-sm whitespace-pre mb-2">
              {item.circuit}
            </div>
            
            <div className="flex items-start mt-2 text-sm">
              <Info className="w-4 h-4 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{item.notes}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render a reference item
  const renderReferenceItem = (item: {title: string, content: string}, index: number) => {
    const isExpanded = expandedItems[`reference-${index}`] || false;
    
    return (
      <div 
        key={`reference-${index}`} 
        className="mb-3 bg-white rounded-lg border border-gray-200 overflow-hidden"
      >
        <div 
          className="p-3 bg-gradient-to-r from-amber-50 to-white flex justify-between items-center cursor-pointer"
          onClick={() => toggleExpanded(`reference-${index}`)}
        >
          <div className="flex items-center">
            <FileText className="w-4 h-4 text-amber-600 mr-2" />
            <h3 className="font-bold text-gray-800">{item.title}</h3>
          </div>
          <div className="flex items-center">
            <span className="text-xs bg-amber-100 text-amber-800 py-0.5 px-2 rounded mr-2">Reference</span>
            {isExpanded ? (
              <ChevronsDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </div>
        </div>
        
        {isExpanded && (
          <div className="p-3 border-t border-gray-100">
            <div className="bg-gray-100 p-3 rounded font-mono text-sm whitespace-pre">
              {item.content}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className={`retroWindow ${isActive ? 'active' : ''}`}>
      <div className="windowTitleBar">
        <div className="windowTitle">
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Electronics Cheat Sheets
        </div>
        <div className="windowControls">
          <button onClick={onMinimize} className="controlButton minimizeButton">
            <Minimize2 size={14} />
          </button>
          <button onClick={onClose} className="controlButton closeButton">
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="windowContent">
        {/* Search and tab navigation */}
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <div className="relative mb-2">
            <input
              type="text"
              placeholder="Search for formulas, pinouts, circuits..."
              className="pl-9 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            {searchTerm && (
              <button
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchTerm('')}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="flex space-x-1">
            {tabs.map((tab, index) => (
              <button
                key={index}
                className={`px-3 py-1.5 text-sm rounded-lg flex items-center ${
                  selectedTab === index
                    ? 'bg-blue-100 text-blue-700 font-medium' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedTab(index)}
              >
                <span className="mr-1.5">{tab.icon}</span>
                {tab.name}
                {tab.data.length > 0 && (
                  <span className={`ml-1.5 text-xs py-0.5 px-1.5 rounded-full ${
                    selectedTab === index ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {tab.data.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-auto p-4">
          {searchTerm && (
            <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-lg text-sm">
              <p className="text-blue-700">
                Showing {tabs[selectedTab].data.length} results for "{searchTerm}" in {tabs[selectedTab].name}
              </p>
            </div>
          )}

          {tabs[selectedTab].data.length === 0 ? (
            <div className="text-center py-10">
              <div className="bg-gray-100 inline-block p-3 rounded-full mb-2">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-1">No results found</h3>
              <p className="text-gray-500">
                Try a different search term or browse another category
              </p>
            </div>
          ) : (
            <div>
              {selectedTab === 0 && (
                <div>
                  {filteredFormulas.map((formula, index) => renderFormulaItem(formula, index))}
                </div>
              )}
              
              {selectedTab === 1 && (
                <div>
                  {filteredPinouts.map((pinout, index) => renderPinoutItem(pinout, index))}
                </div>
              )}
              
              {selectedTab === 2 && (
                <div>
                  {filteredCircuits.map((circuit, index) => renderCircuitItem(circuit, index))}
                </div>
              )}
              
              {selectedTab === 3 && (
                <div>
                  {filteredReferences.map((reference, index) => renderReferenceItem(reference, index))}
                </div>
              )}
            </div>
          )}
          
          {/* Creator signature */}
          <div className="mt-6 text-center border-t border-gray-200 pt-3">
            <p className="text-xs text-gray-500">
              <span className="font-semibold">Electronics Cheat Sheet v1.0</span> • Compiled by Gizbo the Goblin
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectronicsCheatSheetWindow;