import React, { useState, useEffect } from 'react';
import { 
  X, 
  Minimize2, 
  Search, 
  Book, 
  Cpu, 
  Layers, 
  HelpCircle,
  Zap,
  Settings as Tool,
  CircuitBoard as Circuit,
  Wrench,
  AlertTriangle,
  BookOpen 
} from 'lucide-react';
import './retro-ui.css';

// Import component images directly
import ledImg from '@assets/led.icon.png';
import rgbLedImg from '@assets/rgb-led.icon.png';
import resistorImg from '@assets/resistor.icon.png';
import photoresistorImg from '@assets/photoresistor.icon.png';
import buzzerImg from '@assets/buzzer.icon.svg';
import rotaryEncoderImg from '@assets/rotary-encoder.icon.png';
import oledDisplayImg from '@assets/oled-display.icon.png';
import segmentedDisplayImg from '@assets/segmented-display.icon.png';
import heroboardImg from '@assets/hero-board.icon.png';
import customKeypadImg from '@assets/custom-keypad.icon.png';
import dipSwitchImg from '@assets/dip-switch-3.icon.png';
import breadboardImg from '@assets/breadboard.png';

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
  technicalDetails?: string;
  circuitRole?: string;
  commonIssues?: string;
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
    iconSrc: ledImg,
    description: 'Light Emitting Diode - A semiconductor device that emits light when current flows through it',
    generalInfo: 'LEDs are widely used as indicator lamps in many devices and are increasingly used for lighting. They consume far less energy than incandescent lamps, have longer lifespans (up to 50,000+ hours), and are more durable than traditional bulbs. LEDs work by emitting light when current flows through a semiconductor material, typically gallium arsenide or gallium phosphide.',
    pins: [
      {
        id: 'led-anode',
        name: 'Anode (+)',
        description: 'The positive terminal of the LED, which connects to the positive voltage supply. This is where current enters the LED component.',
        voltageRange: 'Typically 1.8V to 3.3V depending on color:\n- Red: 1.8-2.2V\n- Yellow/Green: 2.0-2.5V\n- Blue/White: 2.5-3.3V\n- Infrared: 1.2-1.6V',
        usageNotes: 'Must be connected to the positive supply through a current-limiting resistor to prevent the LED from burning out. Typically identified by the longer lead on through-hole LEDs. For surface-mount LEDs, check the datasheet for polarity markings.',
        technicalDetails: 'The anode is connected to the P-type semiconductor material in the LED\'s PN junction. When forward-biased (anode more positive than cathode), electrons from the N-type material recombine with holes in the P-type material, releasing energy in the form of photons (light).',
        circuitRole: 'In a standard LED circuit, the anode connects to the positive voltage source via a current-limiting resistor. For a typical LED with a 20mA current rating, the resistor value can be calculated using: R = (Vsupply - Vled) / 0.02A.',
        warnings: 'Never connect an LED directly to a power source without a current-limiting resistor. Doing so will allow excessive current to flow, destroying the LED instantly.',
        relatedTerms: ['Forward Voltage', 'Current Limiting', 'PN Junction', 'Diode']
      },
      {
        id: 'led-cathode',
        name: 'Cathode (-)',
        description: 'The negative terminal of the LED, which connects to ground or the negative supply voltage. This is where current exits the LED component.',
        usageNotes: 'Usually identified by a flat spot or notch on the LED package or by a shorter lead on through-hole LEDs. In circuit diagrams, it\'s marked by the flat line of the diode symbol.',
        technicalDetails: 'The cathode is connected to the N-type semiconductor material in the LED\'s PN junction. The N-type material has excess electrons, which flow toward the P-type material when the LED is forward-biased.',
        circuitRole: 'In standard circuits, the cathode is typically connected directly to ground or the negative terminal of the power supply. In common-cathode configurations (like in 7-segment displays), multiple LED cathodes are connected together to share a common ground connection.',
        commonIssues: 'Incorrect orientation is one of the most common problems with LEDs. When an LED doesn\'t light up, checking the cathode-anode orientation should be your first troubleshooting step.',
        relatedTerms: ['Ground', 'Common Cathode', 'Polarity', 'PN Junction']
      }
    ]
  },
  {
    id: 'rgb-led',
    name: 'RGB LED',
    iconSrc: rgbLedImg,
    description: 'A LED that can emit different colors by combining red, green, and blue light',
    generalInfo: 'RGB LEDs contain three separate LEDs (red, green, and blue) in one package. By controlling the intensity of each color, you can create any color in the rainbow. These versatile components are widely used in displays, ambient lighting, indicators, and multimedia applications. RGB LEDs are available in both common-anode (shared positive terminal) and common-cathode (shared negative terminal) configurations.',
    pins: [
      {
        id: 'rgb-common',
        name: 'Common Terminal',
        description: 'The common terminal of the RGB LED, either common anode (connected to positive) or common cathode (connected to ground). This serves as the shared connection for all three LED channels.',
        usageNotes: 'Most RGB LEDs are common anode, meaning this pin connects to positive voltage. In this configuration, you turn on a color by setting its corresponding pin LOW. For common cathode RGB LEDs, this pin connects to ground, and colors are activated by setting their pins HIGH.',
        technicalDetails: 'In a common anode configuration, the P-type semiconductor material of all three LEDs is connected to this single terminal. In a common cathode, the N-type semiconductor from all three LEDs joins at this point.',
        circuitRole: 'This pin should be connected directly to the power source (for common anode) or ground (for common cathode) to provide the common reference point for all three LED elements.',
        commonIssues: 'Using the wrong type of RGB LED (common anode vs. common cathode) for your circuit will result in no illumination or unexpected behavior. Always verify which type you have before connecting.',
        relatedTerms: ['Common Anode', 'Common Cathode', 'RGB Color Model']
      },
      {
        id: 'rgb-red',
        name: 'Red Terminal',
        description: 'Controls the red component of the RGB LED. By varying the voltage/current to this pin, you can adjust the intensity of the red light output.',
        voltageRange: 'Forward voltage typically 1.8-2.2V. Requires a current-limiting resistor calculated for this voltage drop.',
        usageNotes: 'Connect this pin to a PWM-capable output on your microcontroller through a current-limiting resistor (typically 220Ω to 330Ω) to control brightness levels.',
        technicalDetails: 'The red LED element uses semiconductor materials with a wider bandgap than the blue element, resulting in its lower forward voltage. It typically employs aluminum gallium arsenide (AlGaAs) or gallium arsenide phosphide (GaAsP).',
        circuitRole: 'In color mixing applications, this pin is controlled independently of the other color pins to create the red component of any mixed color. Maximum red intensity (255 in RGB color notation) is achieved by fully activating only this pin.',
        relatedTerms: ['PWM', 'Color Mixing', 'Forward Voltage', 'Current Limiting']
      },
      {
        id: 'rgb-green',
        name: 'Green Terminal',
        description: 'Controls the green component of the RGB LED. By varying the voltage/current to this pin, you can adjust the intensity of the green light output.',
        voltageRange: 'Forward voltage typically 2.0-3.2V. Requires a current-limiting resistor calculated for this specific voltage drop.',
        usageNotes: 'Connect this pin to a PWM-capable output on your microcontroller through a current-limiting resistor (typically 100Ω to 220Ω) to control brightness levels. Green LEDs often appear brighter to the human eye, so you may need to adjust the PWM value to balance the perceived brightness.',
        technicalDetails: 'The green LED element typically uses indium gallium nitride (InGaN) or gallium phosphide (GaP) semiconductor materials.',
        circuitRole: 'In color mixing applications, this pin is controlled independently of the other color pins to create the green component of any mixed color. Pure green (0,255,0 in RGB notation) is achieved by fully activating only this pin.',
        relatedTerms: ['PWM', 'Color Mixing', 'Forward Voltage', 'Current Limiting']
      },
      {
        id: 'rgb-blue',
        name: 'Blue Terminal',
        description: 'Controls the blue component of the RGB LED. By varying the voltage/current to this pin, you can adjust the intensity of the blue light output.',
        voltageRange: 'Forward voltage typically 2.7-3.4V, which is higher than the red and green components. Requires a properly sized current-limiting resistor for this specific voltage drop.',
        usageNotes: 'Connect this pin to a PWM-capable output on your microcontroller through a current-limiting resistor (typically 100Ω or less) to control brightness levels. Due to its higher forward voltage, the blue component may need a different resistor value than red and green to achieve balanced color mixing.',
        technicalDetails: 'The blue LED element typically uses indium gallium nitride (InGaN) semiconductor material, which has a narrower bandgap resulting in higher energy (blue) photon emission.',
        circuitRole: 'In color mixing applications, this pin is controlled independently of the other color pins to create the blue component of any mixed color. Pure blue (0,0,255 in RGB notation) is achieved by fully activating only this pin.',
        relatedTerms: ['PWM', 'Color Mixing', 'Forward Voltage', 'Current Limiting']
      }
    ]
  },
  {
    id: 'resistor',
    name: 'Resistor',
    iconSrc: resistorImg,
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
    iconSrc: photoresistorImg,
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
    iconSrc: buzzerImg,
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
    iconSrc: rotaryEncoderImg,
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
    iconSrc: oledDisplayImg,
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
    iconSrc: segmentedDisplayImg,
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
    iconSrc: heroboardImg,
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
  },
  {
    id: 'custom-keypad',
    name: 'Custom Keypad',
    iconSrc: customKeypadImg,
    description: 'A programmable keypad for user input in electronic projects',
    generalInfo: 'Custom keypads provide a way for users to input numerical data or select options in electronic projects. They can be arranged in various configurations and are commonly used in security systems, calculators, and control panels.',
    pins: [
      {
        id: 'keypad-row',
        name: 'Row Pins',
        description: 'Pins that connect to the rows of the keypad matrix.',
        usageNotes: 'Typically set as OUTPUT pins when scanning the keypad.',
        relatedTerms: ['Matrix Scanning', 'Multiplexing']
      },
      {
        id: 'keypad-col',
        name: 'Column Pins',
        description: 'Pins that connect to the columns of the keypad matrix.',
        usageNotes: 'Typically set as INPUT pins with pull-up resistors when scanning the keypad.',
        relatedTerms: ['Matrix Scanning', 'Multiplexing', 'Pull-up Resistor']
      }
    ]
  },
  {
    id: 'breadboard',
    name: 'Breadboard',
    iconSrc: breadboardImg,
    description: 'A solderless prototyping platform for quickly building electronic circuits',
    generalInfo: 'Breadboards are reusable devices with connection points (tie points) arranged in a grid. They allow electronic components to be temporarily connected without soldering, making them ideal for prototyping and experimentation. Standard breadboards typically have 30 rows and 5-10 columns on each side of the central channel. Full-size breadboards often have 60+ rows while mini breadboards may have only 17 rows. They are the foundation of electronics prototyping and education.',
    pins: [
      {
        id: 'breadboard-power-rail-positive',
        name: 'Power Rails (+)',
        description: 'Horizontal rows running along the top and bottom edges, typically marked with red lines, used for connecting to positive voltage. These continuous strips extend the full length of the breadboard.',
        usageNotes: 'Usually connected to a power supply\'s positive terminal. All points along the same rail are internally connected. It\'s common practice to use red wires for connections to these rails to maintain consistent color coding in your circuits.',
        technicalDetails: 'Power rails are connected by metal strips running horizontally under the plastic casing. They can handle currents up to about 1-2A in most breadboards, though this varies by manufacturer and quality.',
        circuitRole: 'Provides a common positive voltage distribution point for the entire circuit. In more complex circuits, these rails can be split in the middle (by removing jumpers) to provide different voltage levels on the same breadboard.',
        commonIssues: 'Poor connections in power rails are a common source of intermittent circuit behavior. Always verify solid connections, and consider using multiple entry points for circuits that draw significant current.',
        relatedTerms: ['Power Supply', 'Voltage', 'Current Distribution']
      },
      {
        id: 'breadboard-power-rail-negative',
        name: 'Power Rails (-)',
        description: 'Horizontal rows running along the top and bottom edges, typically marked with blue or black lines, used for connecting to ground. These provide a common ground reference for your circuit.',
        usageNotes: 'Usually connected to a power supply\'s ground terminal. All points along the same rail are internally connected. It\'s standard practice to use black or blue wires for connections to the ground rails.',
        technicalDetails: 'Like the positive rails, the negative rails consist of metal strips running horizontally under the plastic casing. The separation between power rails helps prevent accidental short circuits.',
        circuitRole: 'Serves as the common ground reference point for the entire circuit. A proper ground connection is essential for most electronic circuits to function correctly.',
        commonIssues: 'Ground loops can occur when multiple paths to ground exist, potentially causing noise in sensitive circuits. For precision analog circuits, consider using a star-shaped ground topology with a single connection point.',
        relatedTerms: ['Ground', 'Common Reference', 'Ground Loop']
      },
      {
        id: 'breadboard-terminal-strips',
        name: 'Terminal Strips',
        description: 'The main central area with 5-hole rows. Each row is internally connected horizontally, but separated by a central gap. This is where most of your components are placed and interconnected.',
        usageNotes: 'Each group of 5 connected holes allows multiple connections to a single component pin. The central divider separates the rows into two independent sections. Points with the same letter-number designation (like E5) on opposite sides of the central gap are NOT connected.',
        technicalDetails: 'The connections in terminal strips are made with metal clips that create a tight fit around component leads and wires. Typical spacing between holes is 0.1\" (2.54mm), matching the standard pin spacing of most through-hole components and DIP ICs.',
        circuitRole: 'Terminal strips form the primary workspace of the breadboard where components are placed and interconnected. Their arrangement makes it easy to create circuits without soldering while maintaining relatively compact layouts.',
        commonIssues: 'Over time, the metal clips inside can lose tension, resulting in poor connections. If a circuit stops working, try relocating components to unused sections of the breadboard. Repeatedly inserting thick wires can permanently damage the connection points.',
        relatedTerms: ['Prototyping', 'Circuit Assembly', 'DIP IC Mounting']
      },
      {
        id: 'breadboard-central-gap',
        name: 'Central Gap/Channel',
        description: 'The dividing channel down the middle of the breadboard that electrically separates the two sides. This gap is specifically sized to accommodate standard DIP (Dual In-line Package) integrated circuits.',
        usageNotes: 'Ideal for mounting DIP ICs and other multi-pin components that need independent connections on each side. The standard width allows ICs to straddle the gap with their pins inserted into the terminal strips on either side.',
        technicalDetails: 'The gap is typically about 0.3\" (7.5mm) wide, designed specifically to fit the standard width of DIP ICs. This standardized spacing is one of the key design elements that makes breadboards so universally useful for prototyping.',
        circuitRole: 'The central gap provides electrical isolation between the two sides of the breadboard, allowing integrated circuits to be mounted with each pin independently connected to different parts of the circuit.',
        commonIssues: 'When working with wider components or modules that don\'t fit the standard DIP format, you may need to use jumper wires to bridge connections across the gap, which can make circuits more complex and error-prone.',
        relatedTerms: ['DIP IC', 'Integrated Circuit Mounting', 'Pin Spacing']
      }
    ]
  },
  {
    id: 'dip-switch',
    name: 'DIP Switch',
    iconSrc: dipSwitchImg,
    description: 'A set of manual switches in a Dual In-line Package',
    generalInfo: 'DIP switches allow users to manually configure hardware settings. Each switch can be set to one of two positions (on/off), providing binary configuration options for electronic circuits. They are commonly used for hardware configuration that rarely needs to be changed.',
    pins: [
      {
        id: 'dip-common',
        name: 'Common Terminal',
        description: 'The common connection for all switches, typically connected to ground or power.',
        relatedTerms: ['Pull-up Resistor', 'Hardware Configuration']
      },
      {
        id: 'dip-switch-terminal',
        name: 'Switch Terminals',
        description: 'Individual terminals for each switch that connect to the common terminal when the switch is closed.',
        usageNotes: 'Typically connected to microcontroller input pins with pull-up/pull-down resistors.',
        relatedTerms: ['Pull-up Resistor', 'Digital Signal']
      }
    ]
  },

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
    relatedComponents: ['led', 'oled-display', 'heroboard', 'breadboard']
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
    relatedComponents: ['heroboard', 'oled-display', 'breadboard']
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
  },
  {
    term: 'Matrix Scanning',
    definition: 'A technique used to efficiently read multiple buttons or keys using a grid of rows and columns, reducing the number of input pins required.',
    relatedComponents: ['custom-keypad']
  },
  {
    term: 'Multiplexing',
    definition: 'A method of sharing pins by sequentially activating different rows or columns in a matrix, allowing control of many outputs with fewer pins.',
    relatedComponents: ['custom-keypad', 'segmented-display']
  },
  {
    term: 'Hardware Configuration',
    definition: 'Physical settings on electronic devices that determine how the hardware behaves, often set using switches, jumpers, or other mechanical selectors.',
    relatedComponents: ['dip-switch']
  },
  {
    term: 'Audio Processing',
    definition: 'The manipulation and control of audio signals in electronic circuits, including amplification, filtering, and digital conversion.',
    relatedComponents: ['breadboard']
  },
  {
    term: 'Amplification',
    definition: 'The process of increasing the power, voltage, or current of a signal using an electronic amplifier circuit.',
    relatedComponents: ['breadboard']
  },
  {
    term: 'Digital Control',
    definition: 'The use of digital signals to control electronic devices and systems, often through microcontrollers or digital interfaces.',
    relatedComponents: ['breadboard', 'heroboard', 'dip-switch']
  },
  {
    term: 'DIP IC',
    definition: 'Dual In-line Package Integrated Circuit - A common package type for integrated circuits with two parallel rows of pins designed to fit across the central channel of a breadboard.',
    relatedComponents: ['breadboard', 'heroboard']
  },
  {
    term: 'Current Distribution',
    definition: 'The way electrical current is routed throughout a circuit. In breadboards, this is facilitated by the internal metal strips that connect groups of holes together.',
    relatedComponents: ['breadboard', 'heroboard']
  },
  {
    term: 'Pin Spacing',
    definition: 'The standardized distance between pins or connection points in electronic components. Standard breadboards use 0.1" (2.54mm) spacing to match most through-hole components.',
    relatedComponents: ['breadboard', 'heroboard']
  },
  {
    term: 'Ground Loop',
    definition: 'An unwanted current path created when multiple ground connections form a loop, often causing noise or interference in sensitive circuits.',
    relatedComponents: ['breadboard', 'heroboard']
  },
  {
    term: 'RGB Color Model',
    definition: 'A color model that combines red, green, and blue light to create a wide spectrum of colors. Each component can be varied in intensity to produce different hues.',
    relatedComponents: ['rgb-led']
  },
  {
    term: 'PN Junction',
    definition: 'The boundary between P-type and N-type semiconductor materials that forms the basic building block of diodes, LEDs, and many other semiconductor devices.',
    relatedComponents: ['led', 'rgb-led']
  },
  {
    term: 'Diode',
    definition: 'A semiconductor device that allows current to flow in one direction only (from anode to cathode). LEDs are specialized diodes that emit light when current flows through them.',
    relatedComponents: ['led', 'rgb-led']
  },
  {
    term: 'Polarity',
    definition: 'The characteristic of electronic components having distinct positive and negative terminals that must be connected correctly for proper operation.',
    relatedComponents: ['led', 'rgb-led', 'oled-display']
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
        
        {/* Right panel - Pin information with expanded educational content */}
        <div className="w-1/2 p-4 bg-gray-50 overflow-y-auto">
          {selectedPin ? (
            <div>
              <h3 className="text-lg font-bold border-b border-gray-300 pb-2 mb-4">{selectedPin.name}</h3>
              
              {/* Core Information Section */}
              <div className="mb-5">
                <h4 className="font-bold text-gray-700 text-base">Description:</h4>
                <p className="text-sm">{selectedPin.description}</p>
              </div>
              
              {/* Expandable Sections with Educational Content */}
              <div className="space-y-6">
                {/* Voltage & Electrical Characteristics */}
                {selectedPin.voltageRange && (
                  <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-200">
                    <h4 className="font-bold text-gray-800 flex items-center cursor-pointer mb-3">
                      <Zap size={18} className="mr-2 text-yellow-500" />
                      Voltage & Electrical Characteristics
                    </h4>
                    <div>
                      <div className="mb-3">
                        <h5 className="font-semibold text-gray-700 text-sm">Specified Range:</h5>
                        <p className="whitespace-pre-line text-sm">{selectedPin.voltageRange}</p>
                      </div>
                      
                      {/* Educational Content: Voltage Measurement */}
                      <div className="mt-4 border-t pt-3 border-dashed border-gray-200">
                        <h5 className="font-semibold text-gray-700 text-sm">How to Measure:</h5>
                        <p className="text-sm mt-1">
                          To measure the voltage at this pin, use a multimeter set to DC voltage mode. Connect the black probe 
                          to ground and the red probe to the pin. For accurate results, ensure your circuit is powered and the 
                          component is functioning properly during measurement.
                        </p>
                        
                        <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
                          <span className="font-semibold">Pro Tip:</span> When troubleshooting voltage issues, always compare 
                          your readings with the expected voltage range. A significant deviation might indicate a problem with 
                          the component, power supply, or connections.
                        </div>
                      </div>
                      
                      {/* Educational Content: Voltage Considerations */}
                      <div className="mt-4">
                        <h5 className="font-semibold text-gray-700 text-sm">Safe Operating Conditions:</h5>
                        <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                          <li>Never exceed the maximum rated voltage</li>
                          <li>Voltage spikes can damage the component, consider using protection circuits</li>
                          <li>Temperature affects voltage tolerances - components may need derating in extreme conditions</li>
                          <li>Power supply stability directly impacts component performance and longevity</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Implementation Guide */}
                {selectedPin.usageNotes && (
                  <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-200">
                    <h4 className="font-bold text-gray-800 flex items-center cursor-pointer mb-3">
                      <Tool size={18} className="mr-2 text-gray-700" />
                      Implementation Guide
                    </h4>
                    <div>
                      <div className="mb-3">
                        <h5 className="font-semibold text-gray-700 text-sm">Basic Usage:</h5>
                        <p className="whitespace-pre-line text-sm">{selectedPin.usageNotes}</p>
                      </div>
                      
                      {/* Educational Content: Best Practices */}
                      <div className="mt-4 border-t pt-3 border-dashed border-gray-200">
                        <h5 className="font-semibold text-gray-700 text-sm">Best Practices:</h5>
                        <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                          <li>Use appropriate wire gauge for current requirements</li>
                          <li>Keep connections short and direct to minimize noise and resistance</li>
                          <li>Apply heat-shrink tubing to exposed connections for insulation</li>
                          <li>Use wire markers or colored wires for easy identification</li>
                          <li>Consider using terminal blocks or connectors for frequent disconnections</li>
                        </ul>
                      </div>
                      
                      {/* Educational Content: Implementation Tools */}
                      <div className="mt-4">
                        <h5 className="font-semibold text-gray-700 text-sm">Recommended Tools:</h5>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                          <div className="p-2 bg-gray-50 rounded">
                            <span className="font-semibold block">Precision Tweezers</span>
                            For handling small components
                          </div>
                          <div className="p-2 bg-gray-50 rounded">
                            <span className="font-semibold block">Wire Strippers</span>
                            For clean, precise wire preparation
                          </div>
                          <div className="p-2 bg-gray-50 rounded">
                            <span className="font-semibold block">Digital Multimeter</span>
                            For testing connections and voltages
                          </div>
                          <div className="p-2 bg-gray-50 rounded">
                            <span className="font-semibold block">Soldering Iron</span>
                            For permanent, reliable connections
                          </div>
                        </div>
                      </div>
                      
                      {/* Educational Content: Connection Quality */}
                      <div className="mt-4 p-2 bg-blue-50 rounded text-xs">
                        <span className="font-semibold">Pro Tip:</span> The quality of connections significantly affects reliability. 
                        Always check for:
                        <ul className="list-disc list-inside mt-1">
                          <li>Firm, secure contact without strain</li>
                          <li>No exposed conductors that could short</li>
                          <li>No cold solder joints (appearing dull or grainy)</li>
                          <li>Sufficient strain relief on cables and wires</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Technical Deep Dive */}
                {selectedPin.technicalDetails && (
                  <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-200">
                    <h4 className="font-bold text-gray-800 flex items-center cursor-pointer mb-3">
                      <Cpu size={18} className="mr-2 text-indigo-600" />
                      Technical Deep Dive
                    </h4>
                    <div>
                      <div className="mb-3">
                        <h5 className="font-semibold text-gray-700 text-sm">Technical Details:</h5>
                        <p className="whitespace-pre-line text-sm">{selectedPin.technicalDetails}</p>
                      </div>
                      
                      {/* Educational Content: Scientific Principles */}
                      <div className="mt-4 border-t pt-3 border-dashed border-gray-200">
                        <h5 className="font-semibold text-gray-700 text-sm">Scientific Principles:</h5>
                        <p className="text-sm mt-1">
                          This component operates based on fundamental electrical principles. Understanding these principles helps 
                          with troubleshooting and optimal design:
                        </p>
                        <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                          <li><span className="font-semibold">Ohm's Law</span>: Current (I) = Voltage (V) / Resistance (R)</li>
                          <li><span className="font-semibold">Kirchhoff's Current Law</span>: The sum of currents entering a node equals the sum leaving</li>
                          <li><span className="font-semibold">Kirchhoff's Voltage Law</span>: The sum of voltages around any closed loop is zero</li>
                          <li><span className="font-semibold">Power Calculation</span>: Power (P) = Voltage (V) × Current (I)</li>
                        </ul>
                      </div>
                      
                      {/* Educational Content: Material Science */}
                      <div className="mt-4">
                        <h5 className="font-semibold text-gray-700 text-sm">Material Science Insights:</h5>
                        <p className="text-sm mt-1">
                          The electrical properties of this component are determined by the materials used in its construction. 
                          Different materials provide specific characteristics:
                        </p>
                        <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                          <li>Conductors (copper, gold, aluminum) facilitate current flow with minimal resistance</li>
                          <li>Insulators (rubber, plastic, ceramic) prevent unwanted current paths</li>
                          <li>Semiconductors (silicon, germanium) have controllable conductivity</li>
                          <li>Substrate materials affect heat dissipation and mechanical stability</li>
                        </ul>
                      </div>
                      
                      {/* Educational Content: Historical Context */}
                      <div className="mt-4 p-2 bg-gray-50 rounded text-xs">
                        <span className="font-semibold">Historical Context:</span> The development of this technology has evolved 
                        significantly over decades. Early versions were larger, less efficient, and had shorter lifespans. Modern 
                        manufacturing techniques and materials science advancements have led to the miniaturized, reliable components 
                        we use today.
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Circuit Integration */}
                {selectedPin.circuitRole && (
                  <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-200">
                    <h4 className="font-bold text-gray-800 flex items-center cursor-pointer mb-3">
                      <Circuit size={18} className="mr-2 text-green-600" />
                      Circuit Integration
                    </h4>
                    <div>
                      <div className="mb-3">
                        <h5 className="font-semibold text-gray-700 text-sm">Role in Circuits:</h5>
                        <p className="whitespace-pre-line text-sm">{selectedPin.circuitRole}</p>
                      </div>
                      
                      {/* Educational Content: Common Circuit Configurations */}
                      <div className="mt-4 border-t pt-3 border-dashed border-gray-200">
                        <h5 className="font-semibold text-gray-700 text-sm">Common Circuit Configurations:</h5>
                        <div className="mt-2 space-y-3">
                          <div className="p-2 bg-gray-50 rounded text-sm">
                            <span className="font-semibold block">Basic Configuration</span>
                            <p>The simplest implementation, suitable for most applications. Provides standard functionality with minimal additional components.</p>
                          </div>
                          <div className="p-2 bg-gray-50 rounded text-sm">
                            <span className="font-semibold block">Protected Configuration</span>
                            <p>Includes additional components like resistors, capacitors, or diodes to protect the pin from voltage spikes, noise, or reverse polarity.</p>
                          </div>
                          <div className="p-2 bg-gray-50 rounded text-sm">
                            <span className="font-semibold block">Enhanced Performance Configuration</span>
                            <p>Optimized for specific performance characteristics like speed, power efficiency, or noise reduction at the cost of additional complexity.</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Educational Content: Practical Applications */}
                      <div className="mt-4">
                        <h5 className="font-semibold text-gray-700 text-sm">Practical Application Examples:</h5>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                          <div className="p-2 bg-gray-50 rounded">
                            <span className="font-semibold block">Temperature Monitoring</span>
                            Used in weather stations, industrial equipment, and home automation
                          </div>
                          <div className="p-2 bg-gray-50 rounded">
                            <span className="font-semibold block">Visual Indicators</span>
                            Status lights, alert systems, and decorative lighting
                          </div>
                          <div className="p-2 bg-gray-50 rounded">
                            <span className="font-semibold block">Data Communication</span>
                            Signal transmission in various protocols (I2C, SPI, UART)
                          </div>
                          <div className="p-2 bg-gray-50 rounded">
                            <span className="font-semibold block">Power Management</span>
                            Energy distribution, voltage regulation, and current control
                          </div>
                        </div>
                      </div>
                      
                      {/* Educational Content: Integration Tips */}
                      <div className="mt-4 p-2 bg-blue-50 rounded text-xs">
                        <span className="font-semibold">Design Tips:</span> When integrating this component:
                        <ul className="list-disc list-inside mt-1">
                          <li>Consider signal integrity for high-speed or sensitive connections</li>
                          <li>Plan your PCB layout to minimize interference and crosstalk</li>
                          <li>Use bypass capacitors near power pins to filter noise</li>
                          <li>Include test points for easier debugging and verification</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Troubleshooting Guide */}
                {selectedPin.commonIssues && (
                  <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-200">
                    <h4 className="font-bold text-gray-800 flex items-center cursor-pointer mb-3">
                      <Wrench size={18} className="mr-2 text-orange-500" />
                      Troubleshooting Guide
                    </h4>
                    <div>
                      <div className="mb-3">
                        <h5 className="font-semibold text-gray-700 text-sm">Common Issues:</h5>
                        <p className="whitespace-pre-line text-sm">{selectedPin.commonIssues}</p>
                      </div>
                      
                      {/* Educational Content: Diagnostic Procedures */}
                      <div className="mt-4 border-t pt-3 border-dashed border-gray-200">
                        <h5 className="font-semibold text-gray-700 text-sm">Diagnostic Procedures:</h5>
                        <div className="mt-2 space-y-3">
                          <div className="p-2 bg-gray-50 rounded text-xs">
                            <span className="font-semibold block">Visual Inspection</span>
                            <ol className="list-decimal list-inside mt-1">
                              <li>Check for physical damage or discoloration</li>
                              <li>Verify correct orientation and placement</li>
                              <li>Inspect soldering quality and connection integrity</li>
                              <li>Look for environmental contaminants (dust, moisture)</li>
                            </ol>
                          </div>
                          <div className="p-2 bg-gray-50 rounded text-xs">
                            <span className="font-semibold block">Electrical Testing</span>
                            <ol className="list-decimal list-inside mt-1">
                              <li>Measure voltage with reference to ground</li>
                              <li>Check continuity of connections</li>
                              <li>Test for shorts or unexpected resistance</li>
                              <li>Monitor signal quality with oscilloscope if applicable</li>
                            </ol>
                          </div>
                          <div className="p-2 bg-gray-50 rounded text-xs">
                            <span className="font-semibold block">Functional Testing</span>
                            <ol className="list-decimal list-inside mt-1">
                              <li>Verify component responds to control signals</li>
                              <li>Test individual functions independently</li>
                              <li>Substitute with known good component when possible</li>
                              <li>Check peripheral components that may affect operation</li>
                            </ol>
                          </div>
                        </div>
                      </div>
                      
                      {/* Educational Content: Problem-Solution Table */}
                      <div className="mt-4">
                        <h5 className="font-semibold text-gray-700 text-sm">Quick Reference: Symptoms & Solutions</h5>
                        <table className="min-w-full mt-2 text-xs bg-white">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="py-1 px-2 text-left">Symptom</th>
                              <th className="py-1 px-2 text-left">Potential Cause</th>
                              <th className="py-1 px-2 text-left">Solution</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            <tr>
                              <td className="py-1 px-2">No response</td>
                              <td className="py-1 px-2">No power, incorrect wiring</td>
                              <td className="py-1 px-2">Check power supply, verify connections</td>
                            </tr>
                            <tr>
                              <td className="py-1 px-2">Intermittent operation</td>
                              <td className="py-1 px-2">Loose connection, cold solder joint</td>
                              <td className="py-1 px-2">Reseat connections, reflow solder joints</td>
                            </tr>
                            <tr>
                              <td className="py-1 px-2">Overheating</td>
                              <td className="py-1 px-2">Excessive current, poor ventilation</td>
                              <td className="py-1 px-2">Check for shorts, improve cooling, add heat sink</td>
                            </tr>
                            <tr>
                              <td className="py-1 px-2">Incorrect output</td>
                              <td className="py-1 px-2">Configuration error, interference</td>
                              <td className="py-1 px-2">Verify settings, add filtering, improve shielding</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Safety Warnings */}
                {selectedPin.warnings && (
                  <div className="mb-4 p-3 bg-red-50 rounded-lg shadow-sm border border-red-200">
                    <h4 className="font-bold text-red-800 flex items-center mb-3">
                      <AlertTriangle size={18} className="mr-2" />
                      Safety Warnings
                    </h4>
                    <p className="whitespace-pre-line text-sm">{selectedPin.warnings}</p>
                    
                    {/* Educational Content: Safety Procedures */}
                    <div className="mt-4 pt-3 border-t border-dashed border-red-200">
                      <h5 className="font-semibold text-red-700 text-sm">Safety Best Practices:</h5>
                      <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                        <li>Always power down circuits before making connections</li>
                        <li>Use appropriate personal protective equipment when necessary</li>
                        <li>Have proper fire safety equipment nearby when working with electronics</li>
                        <li>Follow manufacturer guidelines and datasheets for all components</li>
                        <li>Be extra cautious when working with high voltages or currents</li>
                      </ul>
                      
                      <div className="mt-3 p-2 bg-white rounded text-xs">
                        <span className="font-semibold text-red-600">Remember:</span> Safety should always be the primary concern. 
                        No project is worth risking personal injury or property damage. When in doubt, seek advice from more experienced makers 
                        or consult professional resources.
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Advanced Learning Resources */}
                <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-200">
                  <h4 className="font-bold text-gray-800 flex items-center cursor-pointer mb-3">
                    <BookOpen size={18} className="mr-2 text-purple-600" />
                    Advanced Learning Resources
                  </h4>
                  <div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Deepen your knowledge</span> with these resources:</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 text-xs">
                        <div className="p-2 bg-purple-50 rounded">
                          <span className="font-semibold block text-purple-700">📚 Books & Publications</span>
                          <ul className="list-disc list-inside mt-1">
                            <li>The Art of Electronics (Horowitz & Hill)</li>
                            <li>Practical Electronics for Inventors (Scherz)</li>
                            <li>Make: Electronics (Platt)</li>
                          </ul>
                        </div>
                        <div className="p-2 bg-blue-50 rounded">
                          <span className="font-semibold block text-blue-700">🌐 Online Courses</span>
                          <ul className="list-disc list-inside mt-1">
                            <li>MIT OpenCourseWare: Circuits & Electronics</li>
                            <li>Khan Academy: Electrical Engineering</li>
                            <li>Coursera: Fundamentals of Digital Systems</li>
                          </ul>
                        </div>
                        <div className="p-2 bg-green-50 rounded">
                          <span className="font-semibold block text-green-700">🔍 Technical Resources</span>
                          <ul className="list-disc list-inside mt-1">
                            <li>Manufacturer datasheets & application notes</li>
                            <li>IEEE publications on component design</li>
                            <li>NIST technical standards & guidelines</li>
                          </ul>
                        </div>
                        <div className="p-2 bg-yellow-50 rounded">
                          <span className="font-semibold block text-yellow-700">👥 Community Forums</span>
                          <ul className="list-disc list-inside mt-1">
                            <li>Electronics Stack Exchange</li>
                            <li>Reddit r/AskElectronics & r/ECE</li>
                            <li>Maker-focused Discord communities</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Related Terms and Glossary */}
              {selectedPin.relatedTerms && selectedPin.relatedTerms.length > 0 && (
                <div className="mt-6 p-3 bg-white rounded-lg shadow-sm border border-gray-200">
                  <h4 className="font-bold text-gray-800 flex items-center mb-3">
                    <BookOpen size={18} className="mr-2 text-blue-600" />
                    Related Terminology
                  </h4>
                  <p className="text-sm mb-3">
                    Understanding these related concepts will give you a more comprehensive grasp of how this component works:
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedPin.relatedTerms.map(term => {
                      const glossaryTerm = GLOSSARY.find(g => g.term.toLowerCase() === term.toLowerCase());
                      return (
                        <div
                          key={term}
                          className="px-3 py-1.5 bg-blue-50 text-blue-800 rounded-full text-sm cursor-pointer hover:bg-blue-100 transition-colors"
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
              <div className="text-center max-w-md">
                <div className="mb-4">
                  <Circuit size={48} className="mx-auto text-gray-400" />
                </div>
                <h3 className="text-lg font-bold mb-2">Component Encyclopedia</h3>
                <p className="mb-4">Select a component pin from the left panel to view detailed information, technical specifications, and educational content.</p>
                <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                  <p className="font-semibold">Maker Tip:</p>
                  <p>Understanding component pins and their functions is essential for successful circuit design and troubleshooting.</p>
                </div>
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
