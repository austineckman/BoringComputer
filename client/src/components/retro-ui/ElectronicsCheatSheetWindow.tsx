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
      title: "Inductance in Series",
      formula: "Ltotal = L₁ + L₂ + ... + Lₙ",
      description: "The total inductance of inductors connected in series",
      notes: "Similar to series resistors formula"
    },
    {
      title: "Inductance in Parallel",
      formula: "1/Ltotal = 1/L₁ + 1/L₂ + ... + 1/Lₙ",
      description: "The total inductance of inductors connected in parallel",
      notes: "Similar to parallel resistors formula" 
    },
    {
      title: "Voltage Divider",
      formula: "Vout = Vin × (R₂ ÷ (R₁ + R₂))",
      description: "Output voltage from a voltage divider circuit",
      notes: "R₁ is connected to Vin, R₂ is connected to ground, Vout is measured across R₂"
    },
    {
      title: "Current Divider",
      formula: "I₁ = Itotal × (R₂ ÷ (R₁ + R₂))",
      description: "Current through one branch of parallel resistors",
      notes: "I₁ is the current through R₁, Itotal is the total current entering the parallel circuit"
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
      title: "RL Time Constant",
      formula: "τ = L ÷ R",
      description: "Time constant for a resistor-inductor circuit",
      notes: "Time (in seconds) for current to reach ~63% of final value"
    },
    {
      title: "RC Low-Pass Filter",
      formula: "fc = 1 ÷ (2π × R × C)",
      description: "Cutoff frequency for RC low-pass filter",
      notes: "Frequency (in Hz) at which signal power drops to 50% (-3dB)"
    },
    {
      title: "RC High-Pass Filter",
      formula: "fc = 1 ÷ (2π × R × C)",
      description: "Cutoff frequency for RC high-pass filter",
      notes: "Uses same formula as low-pass, but applies to frequencies above fc"
    },
    {
      title: "LC Resonant Frequency",
      formula: "fr = 1 ÷ (2π × √(L × C))",
      description: "Resonant frequency of LC circuit",
      notes: "At this frequency, inductive and capacitive reactances are equal"
    },
    {
      title: "Capacitive Reactance",
      formula: "Xc = 1 ÷ (2π × f × C)",
      description: "Opposition to current flow in a capacitor",
      notes: "Measured in ohms (Ω). Decreases as frequency increases"
    },
    {
      title: "Inductive Reactance",
      formula: "XL = 2π × f × L",
      description: "Opposition to current flow in an inductor",
      notes: "Measured in ohms (Ω). Increases as frequency increases"
    },
    {
      title: "Impedance (Series RL)",
      formula: "Z = √(R² + XL²)",
      description: "Total opposition to current in series RL circuit",
      notes: "Combines resistance and inductive reactance"
    },
    {
      title: "Impedance (Series RC)",
      formula: "Z = √(R² + Xc²)",
      description: "Total opposition to current in series RC circuit",
      notes: "Combines resistance and capacitive reactance"
    },
    {
      title: "Impedance (Series RLC)",
      formula: "Z = √(R² + (XL - Xc)²)",
      description: "Total opposition to current in series RLC circuit",
      notes: "XL and Xc partially cancel each other out"
    },
    {
      title: "Frequency and Period",
      formula: "f = 1 ÷ T",
      description: "Relationship between frequency (f) and period (T)",
      variations: [
        { formula: "T = 1 ÷ f", description: "Finding period from frequency" }
      ],
      notes: "f is in Hz, T is in seconds"
    },
    {
      title: "RMS Voltage (Sine Wave)",
      formula: "Vrms = Vpeak ÷ √2",
      description: "Root Mean Square (RMS) voltage of sine wave",
      variations: [
        { formula: "Vrms ≈ 0.707 × Vpeak", description: "Simplified approximation" },
        { formula: "Vpeak = Vrms × √2", description: "Finding peak from RMS" }
      ],
      notes: "Standard AC voltage measurements are in RMS"
    },
    {
      title: "Battery Life",
      formula: "Hours = Battery Capacity (mAh) ÷ Current Draw (mA)",
      description: "Estimated battery life under constant load",
      notes: "Real-world battery life is typically less due to various factors"
    },
    {
      title: "Voltage Regulation",
      formula: "Regulation (%) = ((Vno-load - Vfull-load) ÷ Vfull-load) × 100",
      description: "Percentage voltage regulation of a power supply",
      notes: "Lower percentage indicates better regulation"
    },
    {
      title: "Wheatstone Bridge Balance",
      formula: "R₁/R₂ = R₃/R₄",
      description: "Condition for a balanced Wheatstone bridge circuit",
      notes: "When balanced, the voltage between the middle points is zero"
    },
    {
      title: "Transformer Voltage Ratio",
      formula: "Vs/Vp = Ns/Np",
      description: "Relationship between voltages and turns in a transformer",
      variations: [
        { formula: "Vs = Vp × (Ns/Np)", description: "Finding secondary voltage" }
      ],
      notes: "Vs = secondary voltage, Vp = primary voltage, Ns = secondary turns, Np = primary turns"
    },
    {
      title: "Transformer Current Ratio",
      formula: "Ip/Is = Ns/Np",
      description: "Relationship between currents and turns in a transformer",
      variations: [
        { formula: "Is = Ip × (Np/Ns)", description: "Finding secondary current" }
      ],
      notes: "Is = secondary current, Ip = primary current, Ns = secondary turns, Np = primary turns"
    },
    {
      title: "PWM Duty Cycle",
      formula: "Duty Cycle (%) = (Ton ÷ (Ton + Toff)) × 100",
      description: "Percentage of time a PWM signal is in the ON state",
      variations: [
        { formula: "Vavg = Vmax × Duty Cycle/100", description: "Average voltage with PWM" }
      ],
      notes: "Ton = time in high state, Toff = time in low state"
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
      title: "Logic Gates",
      content: `
Basic Gates:
AND: Output HIGH only when all inputs HIGH
OR: Output HIGH when any input HIGH
NOT: Inverts input (HIGH→LOW, LOW→HIGH)
NAND: AND followed by NOT (Universal gate)
NOR: OR followed by NOT (Universal gate)
XOR: Output HIGH when odd number of inputs HIGH
XNOR: Output HIGH when even number of inputs HIGH

Truth Tables (A,B → Output):
AND: (0,0→0) (0,1→0) (1,0→0) (1,1→1)
OR:  (0,0→0) (0,1→1) (1,0→1) (1,1→1)
XOR: (0,0→0) (0,1→1) (1,0→1) (1,1→0)
NAND:(0,0→1) (0,1→1) (1,0→1) (1,1→0)
NOR: (0,0→1) (0,1→0) (1,0→0) (1,1→0)
      `
    },
    {
      title: "Microcontroller Comparison",
      content: `
Arduino Uno:
• Processor: ATmega328P (8-bit)
• Clock: 16 MHz
• Flash: 32KB
• RAM: 2KB
• Digital I/O: 14 pins (6 PWM)
• Analog In: 6 pins
• Operating voltage: 5V

ESP32:
• Processor: Tensilica Xtensa LX6 (32-bit dual-core)
• Clock: Up to 240 MHz
• Flash: 4MB+
• RAM: 520KB
• GPIO: 36 pins
• Built-in Wi-Fi and Bluetooth
• Operating voltage: 3.3V

Raspberry Pi Pico:
• Processor: RP2040 (32-bit dual-core ARM Cortex M0+)
• Clock: 133 MHz
• Flash: 2MB
• RAM: 264KB
• GPIO: 26 pins
• Operating voltage: 3.3V

BBC micro:bit:
• Processor: nRF51822 (32-bit ARM Cortex M0)
• Clock: 16 MHz
• Flash: 256KB
• RAM: 16KB
• GPIO: 19 pins (accessible via edge connector)
• Built-in LEDs, buttons, accelerometer
      `
    },
    {
      title: "Communication Protocols",
      content: `
I²C (Inter-Integrated Circuit):
• 2-wire: SDA (data) and SCL (clock)
• Address-based with master/slave architecture
• Speeds: 100kHz (standard), 400kHz (fast), 1MHz+ (fast plus)
• Multiple slaves on same bus (each with unique address)
• Pull-up resistors required

SPI (Serial Peripheral Interface):
• 4-wire: MOSI, MISO, SCK, SS/CS
• Faster than I²C, typically 10-20MHz
• One master, multiple slaves (separate chip select for each)
• Full-duplex (simultaneous send/receive)

UART (Universal Asynchronous Receiver/Transmitter):
• 2-wire: TX and RX (cross-connected)
• Common baud rates: 9600, 115200
• No clock signal, requires preset baud rate
• Simple but only connects two devices directly

CAN (Controller Area Network):
• 2-wire differential: CANH and CANL
• Very robust, used in automotive applications
• Multi-master, message-based protocol
• Typical speeds: 125kbps to 1Mbps
• Requires termination resistors
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
      title: "Advanced Electrical Formulas",
      content: `
Reactance:
• Inductive Reactance: XL = 2πfL
• Capacitive Reactance: XC = 1/(2πfC)
• Impedance (series RL): Z = √(R² + XL²)
• Impedance (series RC): Z = √(R² + XC²)
• Impedance (series RLC): Z = √(R² + (XL - XC)²)

Resonance:
• Resonant Frequency: f = 1/(2π√(LC))
• Q factor (series): Q = (1/R)√(L/C)
• Q factor (parallel): Q = R√(C/L)

Filter Cutoff:
• Low-pass: fc = 1/(2πRC)
• High-pass: fc = 1/(2πRC)
• Band-pass: BW = fh - fl, Q = f₀/BW
      `
    },
    {
      title: "PCB Design Guidelines",
      content: `
Trace Width Rules of Thumb:
• Signal traces: 8-10mil (0.2-0.25mm)
• Power traces (<1A): 15-20mil (0.4-0.5mm)
• Power traces (1-2A): 30-40mil (0.75-1mm)
• Power traces (>2A): Calculate for 1oz copper: width in mils = (current/0.015)^0.5

Clearances:
• Trace to trace: 6-8mil (0.15-0.2mm)
• Trace to pad: 8-10mil (0.2-0.25mm)
• Trace to board edge: 20mil (0.5mm)
• Trace to mounting hole: 20mil (0.5mm)

Vias:
• Signal via: 0.6mm hole, 1.0mm pad
• Power via: 0.8mm hole, 1.2mm pad
• Via in pad: Filled and plated

General:
• Route tracks at 45° angles, not 90°
• Use ground pour on all layers
• Include fiducials for assembly
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
    },
    {
      title: "Component Symbols",
      content: `
Passive Components:
• Resistor: −/\/\/−   (US) or −[]− (EU)
• Potentiometer: −/\/\/−⊥
• Capacitor: −||−  (non-polarized) or  −|(+−  (polarized)
• Inductor: −ΩΩΩΩ−
• Transformer: −ΩΩΩΩ−|−ΩΩΩΩ−
• Crystal/Resonator: −⊡−

Semiconductors:
• Diode: −|>|−
• LED: −|>|⤧
• Zener Diode: −|>|−⤧
• BJT (NPN): −⟋|⟋
                ⟍
• BJT (PNP): −⟋|⟍
                ⟋
• MOSFET (N-channel): −□⟋
                         ⟍
• MOSFET (P-channel): −□⟍
                         ⟋

Sources and others:
• Battery: −|−||−
• Ground: −⊥
• Fuse: −◠◡−
• SPST Switch: −○−
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