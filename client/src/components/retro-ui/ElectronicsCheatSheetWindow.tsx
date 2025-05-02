import React, { useState } from 'react';
import { X, Minimize2, Book, FileText, Cpu, Zap, FileSpreadsheet, Calculator } from 'lucide-react';

interface ElectronicsCheatSheetWindowProps {
  onClose: () => void;
  onMinimize: () => void;
  isActive: boolean;
}

const ElectronicsCheatSheetWindow: React.FC<ElectronicsCheatSheetWindowProps> = ({
  onClose,
  onMinimize,
  isActive,
}) => {
  const [selectedTab, setSelectedTab] = useState(0);

  const categories = [
    { id: 0, name: 'Formulas', icon: <FileText className="w-4 h-4" /> },
    { id: 1, name: 'Pin Mappings', icon: <Cpu className="w-4 h-4" /> },
    { id: 2, name: 'Common Circuits', icon: <Zap className="w-4 h-4" /> },
    { id: 3, name: 'Reference Tables', icon: <FileSpreadsheet className="w-4 h-4" /> },
  ];

  const formulas = [
    {
      title: "Ohm's Law",
      formula: "V = I × R",
      description: "Voltage (V) equals current (I) multiplied by resistance (R).",
      units: "V = volts, I = amperes, R = ohms (Ω)",
      applications: "Calculating voltage drops, current flow, or resistance in circuits",
      variations: [
        { name: "For Current", formula: "I = V / R" },
        { name: "For Resistance", formula: "R = V / I" },
      ],
    },
    {
      title: "Power (P)",
      formula: "P = V × I",
      description: "Power (P) equals voltage (V) multiplied by current (I).",
      units: "P = watts, V = volts, I = amperes",
      applications: "Calculating power consumption or generation in circuits",
      variations: [
        { name: "Using Resistance", formula: "P = I² × R" },
        { name: "Using Voltage", formula: "P = V² / R" },
      ],
    },
    {
      title: "Series Resistors",
      formula: "Rtotal = R₁ + R₂ + R₃ + ...",
      description: "Total resistance in series equals the sum of all individual resistances.",
      units: "R = ohms (Ω)",
      applications: "Designing voltage dividers, calculating total resistance in series circuits",
    },
    {
      title: "Parallel Resistors",
      formula: "1/Rtotal = 1/R₁ + 1/R₂ + 1/R₃ + ...",
      description: "For parallel resistors, the reciprocal of total resistance equals the sum of reciprocals of individual resistances.",
      units: "R = ohms (Ω)",
      applications: "Current splitting, multiple load connections",
      variations: [
        { name: "Two Resistors Only", formula: "Rtotal = (R₁ × R₂) / (R₁ + R₂)" },
      ],
    },
    {
      title: "Capacitive Reactance",
      formula: "Xc = 1 / (2πfC)",
      description: "Reactance (opposition to current) of a capacitor depends on frequency and capacitance.",
      units: "Xc = ohms (Ω), f = hertz (Hz), C = farads (F)",
      applications: "AC circuits, filters, timing circuits",
    },
    {
      title: "Inductive Reactance",
      formula: "XL = 2πfL",
      description: "Reactance of an inductor is proportional to frequency and inductance.",
      units: "XL = ohms (Ω), f = hertz (Hz), L = henries (H)",
      applications: "AC circuits, filters, chokes",
    },
    {
      title: "Resonant Frequency",
      formula: "f = 1 / (2π√(LC))",
      description: "Frequency at which inductive and capacitive reactances are equal.",
      units: "f = hertz (Hz), L = henries (H), C = farads (F)",
      applications: "Tuned circuits, oscillators, filters",
    },
    {
      title: "LED Current Limiting Resistor",
      formula: "R = (Vs - Vf) / If",
      description: "Calculates the necessary resistor value for an LED.",
      units: "R = ohms (Ω), Vs = supply voltage (V), Vf = LED forward voltage (V), If = LED current (A)",
      applications: "LED circuits, indicator lights",
    },
    {
      title: "Voltage Divider",
      formula: "Vout = Vin × (R2 / (R1 + R2))",
      description: "Output voltage of a resistive divider network.",
      units: "V = volts, R = ohms (Ω)",
      applications: "Level shifting, measurement, biasing",
    },
    {
      title: "RC Time Constant",
      formula: "τ = R × C",
      description: "Time constant for a resistor-capacitor circuit.",
      units: "τ = seconds, R = ohms (Ω), C = farads (F)",
      applications: "Timing circuits, filters, debouncing",
    },
  ];

  const pinMappings = [
    {
      title: "Raspberry Pi Pico / RP2040",
      description: "Pin mappings for Raspberry Pi Pico and RP2040-based boards like the HERO.",
      mappings: [
        { pin: "GP0-GP28", description: "General purpose I/O pins" },
        { pin: "GP26-GP28", description: "Analog inputs (ADC0-ADC2)" },
        { pin: "GP16, GP17", description: "Default UART0 (TX, RX)" },
        { pin: "GP4, GP5", description: "Default I2C0 (SDA, SCL)" },
        { pin: "GP18-GP21", description: "Default SPI0 pins" },
        { pin: "VSYS", description: "1.8V to 5.5V input power" },
        { pin: "3V3", description: "3.3V regulated output" },
        { pin: "VBUS", description: "5V from USB" },
        { pin: "GND", description: "Ground reference" },
      ],
      notes: "The RP2040 features flexible pin assignments through the PIO (Programmable I/O) system. Most functions can be remapped to different pins in software.",
    },
    {
      title: "HERO Board",
      description: "Common pins and components on the HERO educational board.",
      mappings: [
        { pin: "LED (GPIO 25)", description: "Onboard LED connected to GPIO 25" },
        { pin: "Button A", description: "Connected to GPIO 7" },
        { pin: "Button B", description: "Connected to GPIO 8" },
        { pin: "Potentiometer", description: "Connected to ADC0 (GPIO 26)" },
        { pin: "Light Sensor", description: "Connected to ADC1 (GPIO 27)" },
        { pin: "Buzzer", description: "Connected to GPIO 16" },
        { pin: "RGB LED", description: "Connected to GPIOs 13 (R), 14 (G), 15 (B)" },
      ],
      notes: "The HERO board includes all these components pre-connected to the RP2040, making it easier to get started without external wiring.",
    },
    {
      title: "Common Digital Pins",
      description: "Standard pin designations across many microcontrollers.",
      mappings: [
        { pin: "VCC/VDD", description: "Positive power supply" },
        { pin: "GND", description: "Ground reference" },
        { pin: "SCL/SCK", description: "Serial clock (I2C/SPI)" },
        { pin: "SDA/MOSI", description: "Serial data (I2C) or Master Out Slave In (SPI)" },
        { pin: "MISO", description: "Master In Slave Out (SPI)" },
        { pin: "CS/SS", description: "Chip select/Slave select (SPI)" },
        { pin: "TX", description: "Transmit (UART)" },
        { pin: "RX", description: "Receive (UART)" },
        { pin: "RST/RESET", description: "Reset pin" },
        { pin: "EN/ENABLE", description: "Enable pin" },
        { pin: "BOOT/BOOTSEL", description: "Boot mode selection" },
      ],
    },
  ];

  const commonCircuits = [
    {
      title: "LED with Current-Limiting Resistor",
      description: "The most basic circuit for illuminating an LED safely.",
      components: ["LED", "Resistor (typically 220Ω to 1kΩ)", "Power source"],
      instructions: [
        "Connect the positive side of the power source to one end of the resistor",
        "Connect the other end of the resistor to the anode (longer leg) of the LED",
        "Connect the cathode (shorter leg) of the LED to the negative side of the power source"
      ],
      formula: "Resistor value = (Supply Voltage - LED Forward Voltage) / Desired Current",
      example: "For a red LED (2V forward voltage) with a 5V supply and desired current of 20mA: (5V - 2V) / 0.02A = 150Ω",
      notes: "Always include a current-limiting resistor with LEDs to prevent damage."
    },
    {
      title: "Voltage Divider",
      description: "Creates an output voltage that is a fraction of the input voltage.",
      components: ["Two resistors", "Power source"],
      instructions: [
        "Connect resistors in series between the power source positive and negative terminals",
        "Measure output voltage at the connection point between the two resistors"
      ],
      formula: "Vout = Vin × (R2 / (R1 + R2))",
      example: "With 5V input and resistors of 1kΩ (R1) and 1kΩ (R2): 5V × (1kΩ / (1kΩ + 1kΩ)) = 2.5V",
      notes: "Commonly used for reading sensors or creating reference voltages."
    },
    {
      title: "Pull-Up Resistor",
      description: "Ensures a defined high state when a switch or input is not actively driven low.",
      components: ["Resistor (typically 10kΩ)", "Switch or input device", "Microcontroller input pin"],
      instructions: [
        "Connect one end of the resistor to the positive supply voltage",
        "Connect the other end to both the microcontroller input pin and one side of the switch",
        "Connect the other side of the switch to ground"
      ],
      formula: "N/A",
      example: "When the switch is open, the input reads high; when closed, it reads low",
      notes: "Many microcontrollers have built-in pull-up (or pull-down) resistors that can be enabled in software."
    },
    {
      title: "RC Timer/Debounce Circuit",
      description: "Adds time delay or provides switch debouncing.",
      components: ["Resistor", "Capacitor", "Input source (often a switch)"],
      instructions: [
        "Connect the resistor between the input source and the output/microcontroller pin",
        "Connect the capacitor between the output/microcontroller pin and ground"
      ],
      formula: "Time constant (τ) = R × C",
      example: "With 10kΩ resistor and 1μF capacitor: 10,000Ω × 0.000001F = 0.01 seconds",
      notes: "The circuit reaches about 63% of full charge in one time constant, and 99% after five time constants."
    },
    {
      title: "Transistor Switch",
      description: "Uses a small control current to switch a larger current on/off.",
      components: ["NPN transistor (e.g., 2N2222)", "Base resistor", "Load (e.g., LED, motor)", "Power source"],
      instructions: [
        "Connect the collector to the load, and the load to the positive supply",
        "Connect the emitter to ground",
        "Connect the base resistor between the control signal (e.g., microcontroller pin) and the transistor base"
      ],
      formula: "Base resistor = (Control Voltage - 0.7V) / (Load Current / Transistor Gain)",
      example: "For a 5V control, 100mA load, and transistor gain of 100: (5V - 0.7V) / (0.1A / 100) = 4.3kΩ",
      notes: "Use a diode across inductive loads (motors, relays) to prevent voltage spikes when switching off."
    },
  ];

  const referenceTables = [
    {
      title: "Resistor Color Codes",
      description: "Standard color bands used to identify resistor values.",
      headers: ["Color", "1st Band", "2nd Band", "3rd Band (Multiplier)", "4th Band (Tolerance)"],
      rows: [
        ["Black", "0", "0", "×10⁰ (1)", "-"],
        ["Brown", "1", "1", "×10¹ (10)", "±1%"],
        ["Red", "2", "2", "×10² (100)", "±2%"],
        ["Orange", "3", "3", "×10³ (1,000)", "-"],
        ["Yellow", "4", "4", "×10⁴ (10,000)", "-"],
        ["Green", "5", "5", "×10⁵ (100,000)", "±0.5%"],
        ["Blue", "6", "6", "×10⁶ (1,000,000)", "±0.25%"],
        ["Violet", "7", "7", "×10⁷ (10,000,000)", "±0.1%"],
        ["Grey", "8", "8", "×10⁸ (100,000,000)", "-"],
        ["White", "9", "9", "×10⁹ (1,000,000,000)", "-"],
        ["Gold", "-", "-", "×10⁻¹ (0.1)", "±5%"],
        ["Silver", "-", "-", "×10⁻² (0.01)", "±10%"],
        ["None", "-", "-", "-", "±20%"],
      ],
      notes: "Example: Red-Red-Brown-Gold = 22 × 10 = 220Ω ±5%",
    },
    {
      title: "Common Component Values",
      description: "Frequently used standard values for electronic components.",
      headers: ["Component Type", "Common Values", "Notes"],
      rows: [
        ["Resistors", "10Ω, 22Ω, 47Ω, 100Ω, 220Ω, 470Ω, 1kΩ, 2.2kΩ, 4.7kΩ, 10kΩ, 22kΩ, 47kΩ, 100kΩ, 1MΩ", "E12 series is most common"],
        ["Capacitors", "10pF, 22pF, 47pF, 100pF, 220pF, 470pF, 1nF, 10nF, 100nF, 1μF, 10μF, 100μF, 1000μF", "Ceramic for small values, electrolytic for larger values"],
        ["Inductors", "1μH, 10μH, 100μH, 1mH, 10mH", "Less commonly used in basic circuits"],
        ["LEDs Forward Voltage", "Red: 1.8-2.1V, Green: 2.0-2.2V, Blue/White: 3.0-3.4V, IR: 1.2-1.5V", "Typical current: 20mA"],
        ["Zener Diodes", "3.3V, 5.1V, 9.1V, 12V", "For voltage regulation"],
        ["Logic Levels", "5V TTL: Low < 0.8V, High > 2.0V; 3.3V CMOS: Low < 0.8V, High > 2.0V", "Minimum recommended margins"],
      ],
    },
    {
      title: "Wire Gauges and Current Ratings",
      description: "Current-carrying capacity of different wire sizes.",
      headers: ["AWG", "Diameter (mm)", "Max Current (Chassis Wiring)", "Max Current (Power Transmission)"],
      rows: [
        ["10", "2.59", "15A", "30A"],
        ["12", "2.05", "9.3A", "20A"],
        ["14", "1.63", "5.9A", "15A"],
        ["16", "1.29", "3.7A", "10A"],
        ["18", "1.02", "2.3A", "16A"],
        ["20", "0.81", "1.5A", "11A"],
        ["22", "0.64", "0.92A", "7A"],
        ["24", "0.51", "0.58A", "3.5A"],
        ["26", "0.41", "0.37A", "2.2A"],
        ["28", "0.32", "0.23A", "1.4A"],
        ["30", "0.25", "0.14A", "0.86A"],
      ],
      notes: "Lower AWG numbers indicate thicker wire. Ratings vary by insulation type and environment.",
    },
  ];

  // Content components for each tab
  const formulasContent = (
    <div className="p-4 overflow-auto h-full">
      <h2 className="text-lg font-bold mb-3 text-blue-700">Electronics Formulas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {formulas.map((formula, idx) => (
          <div key={idx} className="bg-white p-4 rounded shadow border border-gray-200">
            <h3 className="text-md font-bold text-blue-600">{formula.title}</h3>
            <div className="bg-gray-100 p-2 my-2 rounded text-center font-mono text-lg">
              {formula.formula}
            </div>
            <p className="text-sm text-gray-700 mb-2">{formula.description}</p>
            <p className="text-sm text-gray-600 italic mb-1"><span className="font-semibold">Units:</span> {formula.units}</p>
            <p className="text-sm text-gray-600 mb-2"><span className="font-semibold">Applications:</span> {formula.applications}</p>
            
            {formula.variations && (
              <div className="mt-2">
                <p className="text-xs font-semibold text-gray-700">Variations:</p>
                <div className="grid grid-cols-1 gap-1 mt-1">
                  {formula.variations.map((variation, vidx) => (
                    <div key={vidx} className="bg-gray-50 p-1 rounded border border-gray-200">
                      <p className="text-xs">
                        <span className="font-medium">{variation.name}:</span>{" "}
                        <span className="font-mono">{variation.formula}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const pinMappingsContent = (
    <div className="p-4 overflow-auto h-full">
      <h2 className="text-lg font-bold mb-3 text-blue-700">Pin Mappings & Connections</h2>
      <div className="space-y-6">
        {pinMappings.map((mapping, idx) => (
          <div key={idx} className="bg-white p-4 rounded shadow border border-gray-200">
            <h3 className="text-md font-bold text-blue-600">{mapping.title}</h3>
            <p className="text-sm text-gray-700 mb-3">{mapping.description}</p>
            
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">Pin</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">Description</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mapping.mappings.map((pin, pinIdx) => (
                    <tr key={pinIdx} className={pinIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-2 text-sm font-medium text-gray-900 border border-gray-200">{pin.pin}</td>
                      <td className="px-3 py-2 text-sm text-gray-700 border border-gray-200">{pin.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {mapping.notes && (
              <p className="mt-3 text-xs text-gray-600 italic">{mapping.notes}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const commonCircuitsContent = (
    <div className="p-4 overflow-auto h-full">
      <h2 className="text-lg font-bold mb-3 text-blue-700">Common Circuit Designs</h2>
      <div className="space-y-6">
        {commonCircuits.map((circuit, idx) => (
          <div key={idx} className="bg-white p-4 rounded shadow border border-gray-200">
            <h3 className="text-md font-bold text-blue-600">{circuit.title}</h3>
            <p className="text-sm text-gray-700 mb-3">{circuit.description}</p>
            
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-gray-700 mb-1">Components Needed:</h4>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {circuit.components.map((component, cidx) => (
                  <li key={cidx}>{component}</li>
                ))}
              </ul>
            </div>
            
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-gray-700 mb-1">Circuit Assembly:</h4>
              <ol className="list-decimal list-inside text-sm text-gray-600">
                {circuit.instructions.map((instruction, iidx) => (
                  <li key={iidx} className="mb-1">{instruction}</li>
                ))}
              </ol>
            </div>
            
            {circuit.formula && (
              <div className="mb-3">
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Formula:</h4>
                <div className="bg-gray-100 p-2 rounded text-sm font-mono">
                  {circuit.formula}
                </div>
              </div>
            )}
            
            {circuit.example && (
              <div className="mb-3">
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Example:</h4>
                <p className="text-sm text-gray-600">{circuit.example}</p>
              </div>
            )}
            
            {circuit.notes && (
              <div className="text-xs text-gray-600 italic mt-3">
                <strong>Note:</strong> {circuit.notes}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const referenceTablesContent = (
    <div className="p-4 overflow-auto h-full">
      <h2 className="text-lg font-bold mb-3 text-blue-700">Reference Tables</h2>
      <div className="space-y-6">
        {referenceTables.map((table, idx) => (
          <div key={idx} className="bg-white p-4 rounded shadow border border-gray-200">
            <h3 className="text-md font-bold text-blue-600">{table.title}</h3>
            <p className="text-sm text-gray-700 mb-3">{table.description}</p>
            
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    {table.headers.map((header, hidx) => (
                      <th key={hidx} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {table.rows.map((row, ridx) => (
                    <tr key={ridx} className={ridx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {row.map((cell, cidx) => (
                        <td key={cidx} className="px-3 py-2 text-sm text-gray-700 border border-gray-200">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {table.notes && (
              <p className="mt-3 text-xs text-gray-600 italic">{table.notes}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // Helper function to render active tab content
  const getActiveTabContent = () => {
    switch(selectedTab) {
      case 0: return formulasContent;
      case 1: return pinMappingsContent;
      case 2: return commonCircuitsContent;
      case 3: return referenceTablesContent;
      default: return formulasContent;
    }
  };

  return (
    <div className={`bg-gray-100 rounded-lg overflow-hidden shadow-lg flex flex-col h-full ${isActive ? 'ring-2 ring-blue-500' : ''}`}>
      {/* Window title bar */}
      <div className="bg-blue-600 text-white p-2 flex justify-between items-center">
        <div className="flex items-center">
          <Book className="mr-2" />
          <h2 className="text-md font-semibold">Electronics Cheat Sheets</h2>
        </div>
        <div className="flex space-x-1">
          <button
            onClick={onMinimize}
            className="p-1 hover:bg-blue-500 rounded"
          >
            <Minimize2 size={16} />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-500 rounded"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Tabs */}
        <div className="flex bg-gray-200 border-b border-gray-300 p-1">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-t transition-colors ${
                selectedTab === category.id
                  ? 'bg-white text-blue-600 border-t border-l border-r border-gray-300 border-b-white'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
              }`}
              onClick={() => setSelectedTab(category.id)}
            >
              <span className="mr-1">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
        
        {/* Tab content */}
        <div className="flex-1 overflow-auto">
          {getActiveTabContent()}
        </div>
      </div>
    </div>
  );
};

export default ElectronicsCheatSheetWindow;