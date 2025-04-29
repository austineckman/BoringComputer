/**
 * Available circuit component options for the circuit builder
 */

// Define base path for component images
const imageBasePath = '/assets/';

// List of available components with their properties and pin configurations
export const componentOptions = [
  {
    name: 'heroboard',
    displayName: 'Hero Board',
    description: 'The main microcontroller board',
    category: 'controllers',
    imagePath: `${imageBasePath}hero-board.icon.png`,
    pinConfig: [
      { id: 'd0', type: 'bidirectional', label: 'Digital 0' },
      { id: 'd1', type: 'bidirectional', label: 'Digital 1' },
      { id: 'd2', type: 'bidirectional', label: 'Digital 2' },
      { id: 'd3', type: 'bidirectional', label: 'Digital 3' },
      { id: 'd4', type: 'bidirectional', label: 'Digital 4' },
      { id: 'd5', type: 'bidirectional', label: 'Digital 5' },
      { id: 'd6', type: 'bidirectional', label: 'Digital 6' },
      { id: 'd7', type: 'bidirectional', label: 'Digital 7' },
      { id: 'd8', type: 'bidirectional', label: 'Digital 8' },
      { id: 'd9', type: 'bidirectional', label: 'Digital 9' },
      { id: 'd10', type: 'bidirectional', label: 'Digital 10' },
      { id: 'd11', type: 'bidirectional', label: 'Digital 11' },
      { id: 'd12', type: 'bidirectional', label: 'Digital 12' },
      { id: 'd13', type: 'bidirectional', label: 'Digital 13' },
      { id: 'a0', type: 'input', label: 'Analog 0' },
      { id: 'a1', type: 'input', label: 'Analog 1' },
      { id: 'a2', type: 'input', label: 'Analog 2' },
      { id: 'a3', type: 'input', label: 'Analog 3' },
      { id: 'a4', type: 'input', label: 'Analog 4' },
      { id: 'a5', type: 'input', label: 'Analog 5' },
      { id: '5v', type: 'output', label: '5V Power' },
      { id: '3v3', type: 'output', label: '3.3V Power' },
      { id: 'gnd', type: 'bidirectional', label: 'Ground' },
      { id: 'rst', type: 'input', label: 'Reset' }
    ]
  },
  {
    name: 'led',
    displayName: 'LED',
    description: 'Light-emitting diode',
    category: 'outputs',
    imagePath: `${imageBasePath}led.icon.png`,
    pinConfig: [
      { id: 'anode', type: 'input', label: 'Anode (+)' },
      { id: 'cathode', type: 'output', label: 'Cathode (-)' }
    ]
  },
  {
    name: 'rgb-led',
    displayName: 'RGB LED',
    description: 'Multi-color LED',
    category: 'outputs',
    imagePath: `${imageBasePath}rgb-led.icon.png`,
    pinConfig: [
      { id: 'common', type: 'output', label: 'Common' },
      { id: 'red', type: 'input', label: 'Red' },
      { id: 'green', type: 'input', label: 'Green' },
      { id: 'blue', type: 'input', label: 'Blue' }
    ]
  },
  {
    name: 'resistor',
    displayName: 'Resistor',
    description: 'Limits current flow',
    category: 'passives',
    imagePath: `${imageBasePath}resistor.icon.png`,
    pinConfig: [
      { id: 'pin1', type: 'bidirectional', label: 'Pin 1' },
      { id: 'pin2', type: 'bidirectional', label: 'Pin 2' }
    ]
  },
  {
    name: 'photoresistor',
    displayName: 'Photoresistor',
    description: 'Light-sensitive resistor',
    category: 'sensors',
    imagePath: `${imageBasePath}photoresistor.icon.png`,
    pinConfig: [
      { id: 'pin1', type: 'bidirectional', label: 'Pin 1' },
      { id: 'pin2', type: 'bidirectional', label: 'Pin 2' }
    ]
  },
  {
    name: 'buzzer',
    displayName: 'Buzzer',
    description: 'Makes sound',
    category: 'outputs',
    imagePath: `${imageBasePath}buzzer.icon.png`,
    pinConfig: [
      { id: 'positive', type: 'input', label: 'Positive (+)' },
      { id: 'negative', type: 'output', label: 'Negative (-)' }
    ]
  },
  {
    name: 'custom-keypad',
    displayName: 'Custom Keypad',
    description: '4x4 matrix keypad',
    category: 'inputs',
    imagePath: `${imageBasePath}custom-keypad.icon.png`,
    pinConfig: [
      { id: 'row1', type: 'output', label: 'Row 1' },
      { id: 'row2', type: 'output', label: 'Row 2' },
      { id: 'row3', type: 'output', label: 'Row 3' },
      { id: 'row4', type: 'output', label: 'Row 4' },
      { id: 'col1', type: 'input', label: 'Column 1' },
      { id: 'col2', type: 'input', label: 'Column 2' },
      { id: 'col3', type: 'input', label: 'Column 3' },
      { id: 'col4', type: 'input', label: 'Column 4' }
    ]
  },
  {
    name: 'rotary-encoder',
    displayName: 'Rotary Encoder',
    description: 'Rotation sensor with button',
    category: 'inputs',
    imagePath: `${imageBasePath}rotary-encoder.icon.png`,
    pinConfig: [
      { id: 'clk', type: 'output', label: 'CLK' },
      { id: 'dt', type: 'output', label: 'DT' },
      { id: 'sw', type: 'output', label: 'Switch' },
      { id: 'vcc', type: 'input', label: 'VCC' },
      { id: 'gnd', type: 'output', label: 'GND' }
    ]
  },
  {
    name: 'oled-display',
    displayName: 'OLED Display',
    description: 'Small graphical display',
    category: 'outputs',
    imagePath: `${imageBasePath}oled-display.icon.png`,
    pinConfig: [
      { id: 'sda', type: 'input', label: 'SDA' },
      { id: 'scl', type: 'input', label: 'SCL' },
      { id: 'vcc', type: 'input', label: 'VCC' },
      { id: 'gnd', type: 'output', label: 'GND' }
    ]
  },
  {
    name: 'segmented-display',
    displayName: '7-Segment Display',
    description: 'Numeric LED display',
    category: 'outputs',
    imagePath: `${imageBasePath}segmented-display.icon.png`,
    pinConfig: [
      { id: 'a', type: 'input', label: 'Segment A' },
      { id: 'b', type: 'input', label: 'Segment B' },
      { id: 'c', type: 'input', label: 'Segment C' },
      { id: 'd', type: 'input', label: 'Segment D' },
      { id: 'e', type: 'input', label: 'Segment E' },
      { id: 'f', type: 'input', label: 'Segment F' },
      { id: 'g', type: 'input', label: 'Segment G' },
      { id: 'dp', type: 'input', label: 'Decimal Point' },
      { id: 'common', type: 'output', label: 'Common' }
    ]
  },
  {
    name: 'dip-switch-3',
    displayName: 'DIP Switch (3)',
    description: 'Three-switch DIP package',
    category: 'inputs',
    imagePath: `${imageBasePath}dip-switch-3.icon.png`,
    pinConfig: [
      { id: 'in1', type: 'bidirectional', label: 'Input 1' },
      { id: 'out1', type: 'bidirectional', label: 'Output 1' },
      { id: 'in2', type: 'bidirectional', label: 'Input 2' },
      { id: 'out2', type: 'bidirectional', label: 'Output 2' },
      { id: 'in3', type: 'bidirectional', label: 'Input 3' },
      { id: 'out3', type: 'bidirectional', label: 'Output 3' }
    ]
  }
];

// Function to generate a unique ID
export const generateId = () => {
  return Math.random().toString(36).substring(2, 10);
};