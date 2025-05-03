import React, { useState } from 'react';
import { X, Minimize2, Book, FileText, Cpu, Zap, FileSpreadsheet, Calculator, Search, Sparkles, AlertTriangle, CheckCircle2, ThumbsUp } from 'lucide-react';
import gizboImage from '@assets/gizbo.png';

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

  const [searchTerm, setSearchTerm] = useState('');
  const [showSecret, setShowSecret] = useState(false);

  const categories = [
    { id: 0, name: 'Formulas', icon: <FileText className="w-4 h-4" /> },
    { id: 1, name: 'Pin Mappings', icon: <Cpu className="w-4 h-4" /> },
    { id: 2, name: 'Common Circuits', icon: <Zap className="w-4 h-4" /> },
    { id: 3, name: 'Reference Tables', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 4, name: 'Troubleshooting', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 5, name: 'Gizbo\'s Notes', icon: <Sparkles className="w-4 h-4" /> },
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
    {
      title: "Joule's Law",
      formula: "E = P × t",
      description: "Energy (E) equals power (P) multiplied by time (t).",
      units: "E = joules, P = watts, t = seconds",
      applications: "Battery capacity calculations, heat generation, energy consumption",
    },
    {
      title: "Frequency-Wavelength Relationship",
      formula: "λ = c / f",
      description: "Wavelength (λ) equals speed of light (c) divided by frequency (f).",
      units: "λ = meters, c = meters/second, f = hertz (Hz)",
      applications: "Antenna design, RF circuits, wireless communication",
    },
    {
      title: "Decibel (Power Ratio)",
      formula: "dB = 10 × log₁₀(P₂/P₁)",
      description: "Decibels (dB) represent the ratio of two power values on a logarithmic scale.",
      units: "dB = decibels, P = watts",
      applications: "Signal amplification, attenuation, audio engineering",
      variations: [
        { name: "Voltage Ratio", formula: "dB = 20 × log₁₀(V₂/V₁)" },
      ],
    },
    {
      title: "Transformer Ratio",
      formula: "Vs/Vp = Ns/Np",
      description: "The voltage ratio equals the turns ratio in a transformer.",
      units: "V = volts, N = number of turns",
      applications: "Power supplies, voltage conversion, isolation",
      variations: [
        { name: "Current Ratio", formula: "Ip/Is = Ns/Np" },
        { name: "Impedance Ratio", formula: "Zs/Zp = (Ns/Np)²" },
      ],
    },
    {
      title: "RMS Voltage",
      formula: "Vrms = Vpeak / √2",
      description: "Root Mean Square (RMS) voltage for a sinusoidal waveform.",
      units: "V = volts",
      applications: "AC power calculations, effective voltage values",
      variations: [
        { name: "Peak from RMS", formula: "Vpeak = Vrms × √2" },
        { name: "Peak-to-Peak", formula: "Vpp = 2 × Vpeak" },
      ],
    },
    {
      title: "Low-Pass RC Filter Cutoff",
      formula: "fc = 1 / (2πRC)",
      description: "Cutoff frequency of a simple RC low-pass filter.",
      units: "fc = hertz (Hz), R = ohms (Ω), C = farads (F)",
      applications: "Audio filters, noise reduction, signal conditioning",
    },
    {
      title: "High-Pass RC Filter Cutoff",
      formula: "fc = 1 / (2πRC)",
      description: "Cutoff frequency of a simple RC high-pass filter.",
      units: "fc = hertz (Hz), R = ohms (Ω), C = farads (F)",
      applications: "AC coupling, bass cut, DC blocking",
    },
    {
      title: "LC Oscillator Frequency",
      formula: "f = 1 / (2π√(LC))",
      description: "Resonant frequency of an LC oscillator circuit.",
      units: "f = hertz (Hz), L = henries (H), C = farads (F)",
      applications: "RF oscillators, tuned circuits, frequency generation",
    },
    {
      title: "Impedance of Capacitor",
      formula: "Z = 1 / (j2πfC)",
      description: "Complex impedance of a capacitor in AC circuits.",
      units: "Z = ohms (Ω), f = hertz (Hz), C = farads (F)",
      applications: "AC circuit analysis, filter design, phase shift circuits",
    },
    {
      title: "Impedance of Inductor",
      formula: "Z = j2πfL",
      description: "Complex impedance of an inductor in AC circuits.",
      units: "Z = ohms (Ω), f = hertz (Hz), L = henries (H)",
      applications: "AC circuit analysis, filter design, RF circuits",
    },
    {
      title: "Charge on Capacitor",
      formula: "Q = C × V",
      description: "Charge stored on a capacitor is proportional to its capacitance and voltage.",
      units: "Q = coulombs, C = farads (F), V = volts",
      applications: "Energy storage, capacitor charging calculations",
    },
    {
      title: "Energy Stored in Capacitor",
      formula: "E = ½ × C × V²",
      description: "Energy stored in a charged capacitor.",
      units: "E = joules, C = farads (F), V = volts",
      applications: "Power supply filtering, energy storage systems",
    },
    {
      title: "Energy Stored in Inductor",
      formula: "E = ½ × L × I²",
      description: "Energy stored in an inductor's magnetic field.",
      units: "E = joules, L = henries (H), I = amperes",
      applications: "Switched-mode power supplies, motor drive circuits",
    },
    {
      title: "Voltage Gain (Amplifiers)",
      formula: "Av = Vout / Vin",
      description: "Voltage amplification factor in amplifier circuits.",
      units: "Unitless ratio",
      applications: "Audio amplifiers, operational amplifiers, signal boosting",
      variations: [
        { name: "Gain in dB", formula: "Gain(dB) = 20 × log₁₀(Av)" },
      ],
    },
    {
      title: "Wheatstone Bridge Balance",
      formula: "R₁/R₂ = R₃/R₄",
      description: "Condition for a balanced Wheatstone bridge (no current through the galvanometer).",
      units: "R = ohms (Ω)",
      applications: "Precision measurements, strain gauges, temperature sensors",
    },
    {
      title: "Transistor Current Gain (BJT)",
      formula: "β = Ic / Ib",
      description: "Current gain of a bipolar junction transistor (BJT).",
      units: "Unitless ratio",
      applications: "Amplifier design, switching circuits, current mirrors",
      variations: [
        { name: "Emitter Current", formula: "Ie = Ic + Ib" },
      ],
    },
    {
      title: "MOSFET Drain Current (Saturation)",
      formula: "Id = K × (Vgs - Vth)²",
      description: "Drain current in a MOSFET operating in saturation region.",
      units: "Id = amperes, Vgs = volts, Vth = volts, K = process parameter",
      applications: "Digital circuits, amplifiers, power switching",
    },
    {
      title: "Op-Amp Non-Inverting Gain",
      formula: "Av = 1 + (Rf / Ri)",
      description: "Voltage gain of a non-inverting operational amplifier circuit.",
      units: "Unitless ratio, R = ohms (Ω)",
      applications: "Signal amplification, buffer circuits, precision measurement",
    },
    {
      title: "Op-Amp Inverting Gain",
      formula: "Av = -(Rf / Ri)",
      description: "Voltage gain of an inverting operational amplifier circuit.",
      units: "Unitless ratio, R = ohms (Ω)",
      applications: "Signal amplification, summing circuits, phase inversion",
    },
    {
      title: "Wien Bridge Oscillator",
      formula: "f = 1 / (2πRC)",
      description: "Oscillation frequency of a Wien bridge oscillator.",
      units: "f = hertz (Hz), R = ohms (Ω), C = farads (F)",
      applications: "Audio frequency generation, sine wave oscillators",
    },
    {
      title: "555 Timer (Astable)",
      formula: "f = 1.44 / ((R₁ + 2R₂) × C)",
      description: "Frequency of a 555 timer in astable (oscillator) mode.",
      units: "f = hertz (Hz), R = ohms (Ω), C = farads (F)",
      applications: "Pulse generation, oscillators, timing circuits",
      variations: [
        { name: "Duty Cycle", formula: "D = (R₁ + R₂) / (R₁ + 2R₂)" },
      ],
    },
    {
      title: "555 Timer (Monostable)",
      formula: "t = 1.1 × R × C",
      description: "Pulse width of a 555 timer in monostable (one-shot) mode.",
      units: "t = seconds, R = ohms (Ω), C = farads (F)",
      applications: "Delayed switching, pulse generation, timing control",
    }
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

  const troubleshootingGuides = [
    {
      problem: "LED Not Lighting Up",
      possibleCauses: [
        "LED is connected backward (reverse polarity)",
        "Current-limiting resistor value is too high",
        "Faulty LED",
        "Insufficient voltage supply",
        "Poor connection or broken wire",
        "Microcontroller pin not configured as output"
      ],
      solutions: [
        "Check LED orientation - longer leg (anode) should connect to the positive side through a resistor",
        "Try a smaller resistor value (e.g., 220Ω instead of 1kΩ)",
        "Test the LED with a simple battery and resistor",
        "Verify power supply voltage is sufficient (typically 2V+ for most LEDs)",
        "Check all connections with a multimeter for continuity",
        "Ensure the pin is set as OUTPUT in your code"
      ],
      preventionTips: "Always include a current-limiting resistor with LEDs. Double-check LED polarity before powering your circuit."
    },
    {
      problem: "Inconsistent Button/Switch Behavior",
      possibleCauses: [
        "Switch bouncing (mechanical switches make multiple contacts when pressed)",
        "Missing pull-up or pull-down resistor",
        "Poor connection or oxidized contacts",
        "Incorrect pin configuration in code"
      ],
      solutions: [
        "Add a debounce capacitor (0.1μF) across the switch terminals or implement debounce in software",
        "Add a pull-up resistor (10kΩ) between the input pin and power or enable internal pull-up resistors in code",
        "Clean switch contacts or replace the switch",
        "Verify pin configuration in code (INPUT or INPUT_PULLUP)"
      ],
      preventionTips: "Always use pull-up/pull-down resistors with switches and buttons. Consider implementing debouncing for reliable readings."
    },
    {
      problem: "Overheating Components",
      possibleCauses: [
        "Exceeding component power ratings",
        "Incorrect resistor values causing too much current",
        "Short circuit",
        "Poor ventilation"
      ],
      solutions: [
        "Verify all components are within their power rating specifications",
        "Calculate and use appropriate resistor values to limit current",
        "Check for unintended connections or solder bridges",
        "Add cooling or improve air circulation around hot components"
      ],
      preventionTips: "Always calculate expected current and power dissipation before building circuits. Use components with appropriate power ratings."
    },
    {
      problem: "Unpredictable Behavior with Sensors",
      possibleCauses: [
        "Noisy power supply",
        "Missing filter capacitors",
        "Ground loops or poor grounding",
        "Signal interference"
      ],
      solutions: [
        "Use a clean, stable power supply",
        "Add decoupling capacitors (0.1μF) near sensor power pins",
        "Implement a single-point grounding strategy",
        "Use shielded cables and keep wires short"
      ],
      preventionTips: "For sensitive analog sensors, always add decoupling capacitors and consider filtering in software."
    },
    {
      problem: "Microcontroller Not Programming",
      possibleCauses: [
        "Incorrect USB connection",
        "Board not in bootloader mode",
        "Wrong board selected in IDE",
        "Damaged USB port or cable",
        "Missing drivers"
      ],
      solutions: [
        "Try a different USB port or cable",
        "Press reset button while initiating upload (or hold BOOTSEL while connecting for RP2040)",
        "Verify correct board selection in your IDE",
        "Test the cable with another device",
        "Install required drivers for your board/chip"
      ],
      preventionTips: "Keep a known-good USB cable specifically for programming. Document the exact steps needed to put your specific board in bootloader mode."
    },
    {
      problem: "I2C Communication Failing",
      possibleCauses: [
        "Incorrect address for I2C device",
        "Missing pull-up resistors on SDA/SCL lines",
        "Bus capacitance too high for speed",
        "Power supply issues",
        "Wiring errors"
      ],
      solutions: [
        "Verify device address (use an I2C scanner sketch if needed)",
        "Add 4.7kΩ pullup resistors to both SDA and SCL lines",
        "Lower I2C clock speed in code",
        "Ensure all devices share a common ground",
        "Double-check all wiring connections"
      ],
      preventionTips: "I2C requires pullup resistors! Start with lower clock speeds (100kHz) until communication is working, then optimize if needed."
    },
    {
      problem: "Serial Communication Issues",
      possibleCauses: [
        "Mismatched baud rates",
        "TX/RX connections swapped",
        "Different voltage levels",
        "Missing common ground",
        "Buffer overflow"
      ],
      solutions: [
        "Ensure both devices use the same baud rate",
        "Connect TX to RX and RX to TX between devices",
        "Use level shifters for devices with different logic levels",
        "Connect grounds between devices",
        "Implement flow control or larger buffers"
      ],
      preventionTips: "Serial is one of the simplest protocols but remember: TX connects to RX (not TX-TX), and always establish a common ground."
    },
    {
      problem: "Motor Not Spinning",
      possibleCauses: [
        "Insufficient power supply",
        "Motor driver/transistor not powerful enough",
        "Missing flyback diode for inductive load",
        "Incorrect wiring",
        "Damaged motor or driver"
      ],
      solutions: [
        "Use an adequate power supply (most motors need more current than USB can provide)",
        "Select an appropriate motor driver for your motor's voltage and current requirements",
        "Add a flyback diode across motor terminals",
        "Verify all connections according to driver documentation",
        "Test motor directly with a battery"
      ],
      preventionTips: "Motors need more current than microcontrollers can provide directly. Always use a proper driver circuit and separate power supply."
    },
    {
      problem: "Erratic Behavior After Adding New Components",
      possibleCauses: [
        "Power supply overloaded",
        "Ground connections not properly shared",
        "Signal interference between components",
        "Incompatible voltage levels"
      ],
      solutions: [
        "Upgrade power supply or add separate supplies with common ground",
        "Ensure all components share a common ground",
        "Physically separate sensitive analog circuits from digital noise sources",
        "Add level shifters between components with different voltage requirements"
      ],
      preventionTips: "Build and test your circuit incrementally. Add one component at a time and verify operation before continuing."
    }
  ];

  const gizboNotes = [
    {
      title: "Gizbo's First Law of Electronics",
      content: "Smoke is always a bad sign. If you see the magic smoke escape from a component, it's never coming back! Treat your components with respect, check your wiring twice, and measure your voltages once.",
      tips: "Power off your circuit before making changes. Calculate current limits before applying power. Start with lower voltages when testing new circuits."
    },
    {
      title: "The Goblin Guide to Debugging",
      content: "Even master tinkers like myself spend 90% of our time finding bugs and 10% fixing them. The best way to find a bug is to change one thing at a time! Random changes will only create more chaos—and while I love chaos, it doesn't fix circuits.",
      tips: "Document what you've tried. Use a multimeter liberally. Test components individually before combining them."
    },
    {
      title: "Secret Workshop Wisdom",
      content: "Your most powerful tool isn't your soldering iron or even your multimeter—it's your notebook! The best engineers keep detailed notes about what works, what doesn't, and most importantly, WHY something failed. Future you will thank past you for good notes.",
      tips: "Draw your circuits. Note unexpected behavior. Record successful component values."
    },
    {
      title: "Gizbo's Theory of Explosions",
      content: "While explosions are fun (and I've caused my fair share in the name of science), they're generally not great for electronics. Always check polarity on capacitors and diodes. The bigger the capacitor, the bigger the boom!",
      tips: "Electrolytic capacitors are polarized—connect them backward and they go boom! LEDs are diodes—they only work one way."
    },
    {
      title: "The Forge and The Workbench",
      content: "In my forge, I melt metals and shape items of power. In your workshop, you're doing the same with electrons! Treat your builds with the same care as a master craftsman, and they'll serve you well.",
      tips: "Keep your workspace clean. Organize components. Label wires and connections."
    },
    {
      title: "The Goblin's Guide to LEDs",
      content: "LEDs are like tiny stars you can hold in your hand! But unlike stars, they need the right amount of current or they'll burn out instantly. Always pair them with a resistor, unless you enjoy collecting tiny burned-out pieces of disappointment.",
      tips: "Different color LEDs need different resistors. Red: ~150Ω, Green/Yellow: ~100Ω, Blue/White: ~68Ω at 5V. When in doubt, go higher resistance."
    },
    {
      title: "The Tale of the Missing Ground",
      content: "Once I spent three days trying to figure out why my project wouldn't work. I'd checked everything thrice! Turns out I forgot to connect the ground. THREE DAYS! Remember, electricity is like water—it needs a complete path to flow. No ground, no flow!",
      tips: "Always double-check your ground connections. Many mysterious problems can be traced back to a missing or poor ground connection."
    },
    {
      title: "Gizbo's Capacitor Chronicles",
      content: "Capacitors are like tiny batteries that charge and discharge very quickly. They're perfect for smoothing out power fluctuations or creating timing circuits. But beware! They can hold a charge long after power is removed. Many a goblin apprentice has been zapped by a forgotten capacitor!",
      tips: "Discharge large capacitors before handling them. Use a resistor across the terminals (never your fingers!). Wait 5 time constants for complete discharge."
    },
    {
      title: "Transistor Trickery",
      content: "Transistors are magical little devices—tiny electronic switches and amplifiers! With just a small current at the base/gate, you can control a much larger current. It's like using a tiny stream to redirect a mighty river. That's real power!",
      tips: "NPN transistors: collector high, emitter low. N-channel MOSFETs: drain high, source low. Always use a current-limiting resistor on the base/gate."
    },
    {
      title: "The Microcontroller Manifesto",
      content: "Microcontrollers are like tiny brains for your circuits. They can make decisions, process data, and control outputs according to your programming. Remember though, they're very literal—they'll do exactly what you tell them, not what you meant to tell them!",
      tips: "Start with simple programs and add complexity gradually. Use delay() sparingly—it blocks everything else. Consider using state machines for complex behavior."
    },
    {
      title: "The Great Solder Spill of '87",
      content: "Back in the Forge Realm in '87, I accidentally knocked over a cauldron of molten solder. Created an impromptu silver river right through my workshop! Learned two important lessons that day: proper workspace organization and how to solder an entire project in one go. The second method is not recommended.",
      tips: "Hold your soldering iron like a pencil. Touch both the pad and component lead simultaneously. Apply solder to the junction, not the iron tip."
    },
    {
      title: "Battery Babble",
      content: "Batteries are finicky creatures. They start out full of energy and slowly get tired, unlike capacitors which discharge rapidly. Different battery chemistries have different personalities too! Alkaline cells are like reliable workers, lithium cells are sprinters, and lead-acid batteries are the sturdy packhorses of the battery world.",
      tips: "Match battery capacity to your project's needs. For long-term projects, consider rechargeable options or external power supplies."
    },
    {
      title: "The Wizard's Oscilloscope",
      content: "If a multimeter is a compass, then an oscilloscope is a detailed map! It lets you SEE electricity over time. First time I used one, I stayed up three days straight just watching signals bounce around. It's like peeking into electricity's secret diary!",
      tips: "Start with AUTO mode to find your signal. Use single-shot triggering for one-time events. Save interesting waveforms for future reference."
    },
    {
      title: "Logic Analyzer Legends",
      content: "Logic analyzers are perfect for debugging digital protocols. I once tracked down a bug in my crystal-powered communication device that only happened every 4,096 cycles. Without my logic analyzer, I'd still be scratching my head and blaming it on moon phase interference!",
      tips: "Set triggers to capture the exact event you're interested in. Use protocol decoders for I2C, SPI, etc., rather than trying to interpret raw signals."
    },
    {
      title: "Sensory Perception",
      content: "Sensors are your circuit's eyes, ears, and skin—they let your electronics perceive the world! Temperature, light, sound, movement, pressure... there's a sensor for almost everything. Just remember, the physical world is messy, so always filter and validate sensor data before making decisions based on it.",
      tips: "Add capacitors close to analog sensors to reduce noise. Take multiple readings and average them for more stable results. Consider using digital filtering techniques for highly variable inputs."
    },
    {
      title: "Forbidden Wire Tricks",
      content: "No copper wire available? In a pinch, I've used everything from gold thread (works excellently but expensive) to steel wool strands (burns spectacularly—not recommended). Most surprising substitute? Hair from a unicorn's mane—conducts electricity AND magic, but tends to teleport small components to random dimensions.",
      tips: "Always use proper gauge wire for your current requirements. Color-code your wiring harnesses. Make secure, permanent connections for production, but use breadboards or wire-wrap for prototyping."
    },
    {
      title: "Ohm's Law in Practice",
      content: "Ohm's Law (V=IR) might seem simple, but it's a powerful tool. I once built a heating element by precisely calculating the resistance needed to generate exactly 150°C from a 12V supply. The principle works for everything from LEDs to motors. Master Ohm's Law, and electricity bends to your will!",
      tips: "Memorize the Ohm's Law triangle: V at top, I and R at bottom. Cover the value you want to find and multiply or divide the remaining values as shown by their positions."
    },
    {
      title: "The Motor Madness",
      content: "Motors are hungry beasts! They draw a huge surge of current when starting up, and they generate nasty voltage spikes when stopping. My first robot project nearly fried itself when the back-EMF from its motors blew out my control circuits. Now I always add protection diodes and separate power supplies!",
      tips: "Use a motor driver IC or transistor circuit with flyback diodes. Keep motor power separate from logic power when possible. Add capacitors across motor terminals to reduce RF interference."
    },
    {
      title: "Power Supply Principles",
      content: "The foundation of any good electronic project is a stable power supply. Voltage regulators are your friends! They maintain steady output even as batteries drain or loads change. Linear regulators are simple but inefficient; switching regulators are efficient but noisier. Choose wisely based on your project's needs.",
      tips: "Add capacitors on both input and output of regulators. Use a heat sink for high-current applications. Consider using pre-built modules for complex requirements."
    },
    {
      title: "Thermal Theories",
      content: "Heat is both friend and foe in electronics. Too much will destroy components, but sometimes you need a bit! I once designed a crystal oscillator circuit that wouldn't start in cold weather. The solution? A tiny heating element that kept it at optimal temperature. Understanding thermal management will take your projects to the next level!",
      tips: "Components with heat sinks should have good airflow. Use thermal paste for better heat transfer. Consider temperature coefficients when designing precision circuits."
    },
    {
      title: "Interference Incantations",
      content: "Electromagnetic interference (EMI) is like an invisible gremlin that disrupts your circuits! I once had a project that worked perfectly until someone used a microwave nearby. The solution was proper shielding and filtering. Remember, in our interconnected world, your circuit is never truly alone!",
      tips: "Use metal enclosures for sensitive circuits. Add ferrite beads on cables that enter/exit the enclosure. Keep digital and analog grounds separated but connected at a single point."
    },
    {
      title: "Protocol Puzzles",
      content: "Communication protocols are like different languages for your devices. I2C, SPI, UART, CAN... each has strengths and weaknesses. I2C is like a busy city bus route with many stops; SPI is like dedicated lanes for each passenger. Choose the right protocol for your project's needs!",
      tips: "I2C: good for many devices sharing two wires. SPI: faster but uses more pins. UART: simple but limited to point-to-point unless you add addressing."
    },
    {
      title: "The Legendary Lost Breadboard",
      content: "Legend tells of a perfect breadboard without flaky connections that mysteriously disappear. Some say it was forged in the depths of Mount Circuit by ancient technomancers. I've searched for decades but found only regular breadboards that work great until you breathe on them wrong. Then it's debugging time!",
      tips: "Press jumper wires firmly into breadboard holes. Trim component leads to appropriate length. Use solid core wire, not stranded, for breadboard connections."
    },
    {
      title: "PCB Perfection",
      content: "Moving from breadboard to PCB is like upgrading from a tent to a castle! Suddenly your circuit is reliable, compact, and professional. My first PCB had traces so thin they dissolved during etching, and pads that lifted off with the first touch of the soldering iron. Learn from my mistakes—design with manufacturing tolerances in mind!",
      tips: "Use at least 10mil traces for signal lines, 20mil for power. Add test points for debugging. Consider how you'll program or update firmware after assembly."
    },
    {
      title: "Hidden Knowledge: The Resistor Dance",
      content: "*This note appears to be written in a different handwriting and glows slightly when you read it*\n\nWhen resistors are placed just so, in the sacred formation known as the Wheatstone Bridge, they can detect the smallest changes in the magical flow. The ancient ones used this to seek balance between realms.",
      tips: "A balanced bridge produces zero voltage across the middle when all ratios are equal. Any imbalance produces a voltage proportional to the difference."
    },
    {
      title: "Hidden Knowledge: Crystal Whispers",
      content: "*The ink on this page seems to shift and change as you look at it*\n\nQuartz crystals don't just oscillate at precise frequencies—they resonate with the underlying fabric of reality. At exactly 32.768 kHz, a properly cut crystal can briefly peer through the veil between dimensions. Why do you think so many clocks use this frequency?",
      tips: "Crystal oscillators need appropriate load capacitors to start and maintain stable oscillation. These capacitors should match the crystal's specifications."
    },
    {
      title: "Hidden Knowledge: The Lone Electron",
      content: "*This note is written on what appears to be scorched parchment*\n\nElectrons don't actually 'flow' through a conductor—they 'dance' from atom to atom, passing energy rather than themselves moving long distances. The ancient mages knew this and created metals with spiral atomic structures, allowing instantaneous power transfer across any distance. Sadly, the secret was lost during the Great Capacitor Discharge of the Third Age.",
      tips: "Electron drift velocity in copper is only about 0.1mm per second, yet electrical signals can propagate near the speed of light due to electromagnetic wave effects."
    },
    {
      title: "Hidden Knowledge: The Void Gate",
      content: "*This page has a faint smell of ozone*\n\nA vacuum tube is more than an obsolete electronic component—it's a doorway. In the space between cathode and anode, where electrons leap across nothingness, there exists a moment of quantum uncertainty. The fifth Archmage of Circuit Mountain used this principle to create devices that could process thoughts directly. His final invention showed him his own end... he never built another.",
      tips: "Modern vacuum tubes are still used in high-end audio equipment and RF amplifiers due to their unique harmonic characteristics and resilience to electromagnetic pulses."
    }
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
  // Create the troubleshooting content
  const troubleshootingContent = (
    <div className="p-4 overflow-auto h-full">
      <h2 className="text-lg font-bold mb-3 text-blue-700">Troubleshooting Guide</h2>
      
      <div className="flex items-center bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
        <ThumbsUp className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
        <p className="text-sm text-blue-700">
          Having issues with your circuit? Check these common problems and solutions.
          Remember to always disconnect power before making changes to your circuit!
        </p>
      </div>
      
      <div className="space-y-4">
        {troubleshootingGuides.map((guide, idx) => (
          <div key={idx} className="bg-white p-4 rounded shadow border border-gray-200">
            <h3 className="text-md font-bold text-red-600 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              {guide.problem}
            </h3>
            
            <div className="mt-3">
              <h4 className="font-semibold text-sm text-gray-700 mb-1">Possible Causes:</h4>
              <ul className="list-disc list-inside ml-2 text-sm space-y-1">
                {guide.possibleCauses.map((cause, causeIdx) => (
                  <li key={causeIdx} className="text-gray-700">{cause}</li>
                ))}
              </ul>
            </div>
            
            <div className="mt-3 bg-green-50 p-3 rounded border border-green-100">
              <h4 className="font-semibold text-sm text-gray-700 mb-1 flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                Solutions:
              </h4>
              <ol className="list-decimal list-inside ml-2 text-sm space-y-1">
                {guide.solutions.map((solution, solIdx) => (
                  <li key={solIdx} className="text-gray-700">{solution}</li>
                ))}
              </ol>
            </div>
            
            <div className="mt-3 bg-yellow-50 p-2 rounded border border-yellow-200 text-sm">
              <span className="font-semibold">Prevention Tips:</span> {guide.preventionTips}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Create Gizbo's notes content
  const gizboNotesContent = (
    <div className="p-4 overflow-auto h-full">
      <h2 className="text-lg font-bold mb-3 text-blue-700 flex items-center">
        <span>Gizbo's Workshop Notes</span>
        <Sparkles className="ml-2 h-5 w-5 text-yellow-400" />
      </h2>
      
      <div className="flex mb-4">
        <img 
          src={gizboImage} 
          alt="Gizbo the Goblin" 
          className="w-24 h-24 object-contain rounded mr-4 border-2 border-gray-300"  
        />
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-300 flex-1">
          <p className="italic text-sm text-gray-700">
            "Welcome to my collection of arcane electronic wisdom! I've jotted down some notes from 
            my centuries of tinkering. Some might call it 'trade secrets' but knowledge should be 
            shared! Just don't tell the other goblins I'm giving away our secrets..."
            <span className="block mt-1 text-right font-semibold">— Gizbo, Master Tinker</span>
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        {gizboNotes.map((note, idx) => (
          <div 
            key={idx} 
            className={`bg-white p-4 rounded shadow border ${note.title.includes('Hidden Knowledge') ? 'border-purple-300 bg-purple-50' : 'border-gray-200'}`}
          >
            <h3 className={`text-md font-bold flex items-center ${note.title.includes('Hidden Knowledge') ? 'text-purple-700' : 'text-yellow-600'}`}>
              <Sparkles className="h-4 w-4 mr-2" />
              {note.title}
            </h3>
            
            <div className="my-3">
              <p className="text-sm text-gray-700 whitespace-pre-line">{note.content}</p>
            </div>
            
            <div className="mt-4 bg-amber-50 p-2 rounded border border-amber-200 text-sm">
              <span className="font-semibold">Gizbo's Tips:</span> {note.tips}
            </div>
          </div>
        ))}
      </div>
      
      {showSecret && (
        <div className="mt-8 border-2 border-purple-300 rounded-lg p-4 bg-purple-50 shadow-lg">
          <h3 className="text-md font-bold text-purple-700 flex items-center">
            <Sparkles className="h-5 w-5 mr-2" />
            Secret Goblin Lore Unlocked!
          </h3>
          <p className="my-2 text-sm text-purple-800 font-medium">
            You've discovered my hidden note! Well done, curious one. As a reward, here's a bit of ancient goblin wisdom:
          </p>
          <div className="p-3 bg-purple-100 rounded border border-purple-200 font-mono text-sm">
            "The best circuit is one that works... the second best is one that doesn't explode. Remember this when experimenting."
          </div>
          <p className="mt-3 text-xs text-gray-500 text-right">Don't tell anyone about this secret. It'll be our little mystery.</p>
        </div>
      )}
    </div>
  );

  // Helper function to render active tab content
  const getActiveTabContent = () => {
    switch(selectedTab) {
      case 0: return formulasContent;
      case 1: return pinMappingsContent;
      case 2: return commonCircuitsContent;
      case 3: return referenceTablesContent;
      case 4: return troubleshootingContent;
      case 5: return gizboNotesContent;
      default: return formulasContent;
    }
  };
  
  // Search functionality
  const filterContent = (searchTerm: string) => {
    if (!searchTerm.trim()) return null;
    const term = searchTerm.toLowerCase();
    
    let results = [];
    
    // Search through formulas
    const matchingFormulas = formulas.filter(formula => 
      formula.title.toLowerCase().includes(term) || 
      formula.description.toLowerCase().includes(term) ||
      formula.formula.toLowerCase().includes(term) ||
      formula.applications?.toLowerCase().includes(term)
    );
    
    if (matchingFormulas.length > 0) {
      results.push({
        section: 'Formulas',
        id: 0,
        matches: matchingFormulas.map(f => ({ title: f.title, snippet: f.formula }))
      });
    }
    
    // Search through pin mappings
    const matchingPins = pinMappings.filter(mapping => 
      mapping.title.toLowerCase().includes(term) ||
      mapping.description.toLowerCase().includes(term) ||
      mapping.mappings.some(pin => 
        pin.pin.toLowerCase().includes(term) || 
        pin.description.toLowerCase().includes(term)
      )
    );
    
    if (matchingPins.length > 0) {
      results.push({
        section: 'Pin Mappings',
        id: 1,
        matches: matchingPins.map(p => ({ title: p.title, snippet: p.description.slice(0, 50) + '...' }))
      });
    }
    
    // Search through circuits
    const matchingCircuits = commonCircuits.filter(circuit => 
      circuit.title.toLowerCase().includes(term) ||
      circuit.description.toLowerCase().includes(term) ||
      circuit.components.some(c => c.toLowerCase().includes(term))
    );
    
    if (matchingCircuits.length > 0) {
      results.push({
        section: 'Common Circuits',
        id: 2,
        matches: matchingCircuits.map(c => ({ title: c.title, snippet: c.description.slice(0, 50) + '...' }))
      });
    }
    
    // Search through troubleshooting guides
    const matchingTroubleshooting = troubleshootingGuides.filter(guide => 
      guide.problem.toLowerCase().includes(term) ||
      guide.possibleCauses.some(cause => cause.toLowerCase().includes(term)) ||
      guide.solutions.some(solution => solution.toLowerCase().includes(term))
    );
    
    if (matchingTroubleshooting.length > 0) {
      results.push({
        section: 'Troubleshooting',
        id: 4,
        matches: matchingTroubleshooting.map(t => ({ title: t.problem, snippet: t.possibleCauses[0] }))
      });
    }
    
    // Search through Gizbo's notes
    const matchingNotes = gizboNotes.filter(note => 
      note.title.toLowerCase().includes(term) ||
      note.content.toLowerCase().includes(term) ||
      note.tips.toLowerCase().includes(term)
    );
    
    if (matchingNotes.length > 0) {
      results.push({
        section: 'Gizbo\'s Notes',
        id: 5,
        matches: matchingNotes.map(n => ({ title: n.title, snippet: n.content.slice(0, 50) + '...' }))
      });
    }
    
    return results;
  };
  
  // Check for easter egg in search
  const checkForEasterEgg = (term: string) => {
    if (term.toLowerCase() === 'goblin secrets' || term.toLowerCase() === 'gizbo secret') {
      setShowSecret(true);
    }
  };
  
  const searchResults = searchTerm ? filterContent(searchTerm) : null;

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
        {/* Search */}
        <div className="bg-gray-100 border-b border-gray-300 p-2 flex items-center">
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              placeholder="Search for formulas, components, troubleshooting..."
              className="w-full p-2 pl-8 rounded border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                checkForEasterEgg(e.target.value);
              }}
            />
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            {searchTerm && (
              <button 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {/* Clear search and show hint */}
          {searchTerm && (
            <div className="ml-2 text-xs text-blue-600 italic">
              Searching across all categories
            </div>
          )}
        </div>
        
        {/* Tabs */}
        <div className="flex bg-gray-200 border-b border-gray-300 p-1">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-t transition-colors ${
                selectedTab === category.id && !searchTerm
                  ? 'bg-white text-blue-600 border-t border-l border-r border-gray-300 border-b-white'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
              }`}
              onClick={() => {
                setSelectedTab(category.id);
                setSearchTerm('');
              }}
            >
              <span className="mr-1">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
        
        {/* Tab content */}
        <div className="flex-1 overflow-auto">
          {searchTerm ? (
            <div className="p-4 overflow-auto h-full">
              <h2 className="text-lg font-bold mb-3 text-blue-700">Search Results for "{searchTerm}"</h2>
              
              {searchResults && searchResults.length > 0 ? (
                <div className="space-y-6">
                  {searchResults.map((result, idx) => (
                    <div key={idx} className="bg-white p-4 rounded shadow border border-gray-200">
                      <h3 className="text-md font-bold text-blue-700 flex items-center justify-between">
                        <div className="flex items-center">
                          {result.id === 0 && <FileText className="mr-2 h-4 w-4" />}
                          {result.id === 1 && <Cpu className="mr-2 h-4 w-4" />}
                          {result.id === 2 && <Zap className="mr-2 h-4 w-4" />}
                          {result.id === 3 && <FileSpreadsheet className="mr-2 h-4 w-4" />}
                          {result.id === 4 && <AlertTriangle className="mr-2 h-4 w-4" />}
                          {result.id === 5 && <Sparkles className="mr-2 h-4 w-4" />}
                          {result.section}
                        </div>
                        <button 
                          className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded"
                          onClick={() => {
                            setSelectedTab(result.id);
                            setSearchTerm('');
                          }}
                        >
                          View All
                        </button>
                      </h3>
                      <div className="mt-3 space-y-2 divide-y divide-gray-100">
                        {result.matches.map((match, matchIdx) => (
                          <div key={matchIdx} className="p-2 hover:bg-gray-50">
                            <div className="font-medium text-blue-600">{match.title}</div>
                            <div className="text-sm text-gray-600 mt-1">{match.snippet}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2"><Search className="h-10 w-10 mx-auto" /></div>
                  <h3 className="text-lg font-medium">No results found</h3>
                  <p className="text-gray-500 mt-1">Try a different search term or browse the categories</p>
                </div>
              )}
            </div>
          ) : (
            getActiveTabContent()
          )}
        </div>
      </div>
    </div>
  );
};

export default ElectronicsCheatSheetWindow;