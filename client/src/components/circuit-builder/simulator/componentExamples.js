/**
 * Component Examples with Auto-Placement
 * Each example includes:
 * - Arduino code
 * - Component definitions with positions
 * - Wiring instructions
 */

// Helper function to create a Hero Board at standard position
const createHeroBoard = () => ({
  id: 'heroboard-example',
  type: 'heroboard',
  x: 400,
  y: 350,
  props: {
    label: 'Hero Board',
    description: 'Arduino UNO R3 compatible microcontroller board'
  }
});

// ==================== LED EXAMPLE ====================
export const ledComponentExample = {
  id: 'led',
  name: 'LED Blink',
  description: 'Basic LED on/off control',
  components: [
    createHeroBoard(),
    {
      id: 'led-example-1',
      type: 'led',
      x: 250,
      y: 350,
      props: {
        label: 'LED',
        description: 'Light Emitting Diode'
      }
    }
  ],
  wires: [],
  code: `/*
 * LED BLINK EXAMPLE
 * Connect LED to Pin 13
 */

const int ledPin = 13;

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("LED Blink Started!");
}

void loop() {
  digitalWrite(ledPin, HIGH);
  Serial.println("LED ON");
  delay(1000);
  
  digitalWrite(ledPin, LOW);
  Serial.println("LED OFF");
  delay(1000);
}`
};

// ==================== RGB LED EXAMPLE ====================
export const rgbLedComponentExample = {
  id: 'rgb-led',
  name: 'RGB LED Colors',
  description: 'Control an RGB LED to display different colors',
  components: [
    createHeroBoard(),
    {
      id: 'rgb-led-example-1',
      type: 'rgb-led',
      x: 250,
      y: 350,
      props: {
        label: 'RGB LED',
        description: 'Multi-color LED - Connect Red:Pin 9, Green:Pin 10, Blue:Pin 11'
      }
    }
  ],
  wires: [],
  code: `/*
 * RGB LED COLOR CYCLE
 * Wiring:
 * - Red pin → Pin 9
 * - Green pin → Pin 10  
 * - Blue pin → Pin 11
 * - Common pin → GND
 */

void setup() {
  pinMode(9, OUTPUT);
  pinMode(10, OUTPUT);
  pinMode(11, OUTPUT);
  Serial.begin(9600);
  Serial.println("RGB LED Started!");
}

void loop() {
  // Red
  Serial.println("RED");
  analogWrite(9, 255);
  analogWrite(10, 0);
  analogWrite(11, 0);
  delay(1000);
  
  // Green  
  Serial.println("GREEN");
  analogWrite(9, 0);
  analogWrite(10, 255);
  analogWrite(11, 0);
  delay(1000);
  
  // Blue
  Serial.println("BLUE");
  analogWrite(9, 0);
  analogWrite(10, 0);
  analogWrite(11, 255);
  delay(1000);
  
  // Yellow
  Serial.println("YELLOW");
  analogWrite(9, 255);
  analogWrite(10, 255);
  analogWrite(11, 0);
  delay(1000);
  
  // Cyan
  Serial.println("CYAN");
  analogWrite(9, 0);
  analogWrite(10, 255);
  analogWrite(11, 255);
  delay(1000);
  
  // Magenta
  Serial.println("MAGENTA");
  analogWrite(9, 255);
  analogWrite(10, 0);
  analogWrite(11, 255);
  delay(1000);
  
  // White
  Serial.println("WHITE");
  analogWrite(9, 255);
  analogWrite(10, 255);
  analogWrite(11, 255);
  delay(1000);
}`
};

// ==================== OLED DISPLAY EXAMPLE ====================
export const oledDisplayComponentExample = {
  id: 'oled-display',
  name: 'OLED Display',
  description: 'Show text and graphics on an OLED screen',
  components: [
    createHeroBoard(),
    {
      id: 'oled-display-example-1',
      type: 'oled-display',
      x: 250,
      y: 300,
      props: {
        label: 'OLED Display',
        description: '128x64 I2C Display - Connect SDA:A4, SCL:A5'
      }
    }
  ],
  wires: [],
  code: `/*
 * OLED DISPLAY GRAPHICS
 * Wiring:
 * - VCC → 5V
 * - GND → GND
 * - SDA → Pin A4
 * - SCL → Pin A5
 */

#include <U8g2lib.h>
#include <Wire.h>

U8G2_SSD1306_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0);

int counter = 0;

void setup() {
  u8g2.begin();
  Serial.begin(9600);
  Serial.println("OLED Display Started!");
}

void loop() {
  u8g2.clearBuffer();
  
  // Title
  u8g2.setFont(u8g2_font_ncenB14_tr);
  u8g2.drawStr(0, 20, "Hello!");
  
  // Counter
  u8g2.setFont(u8g2_font_ncenB08_tr);
  char buffer[20];
  sprintf(buffer, "Count: %d", counter);
  u8g2.drawStr(0, 35, buffer);
  
  // Graphics
  u8g2.drawCircle(96, 32, 15);
  u8g2.drawFrame(0, 45, 128, 19);
  
  // Progress bar
  int barWidth = (counter % 100) + 10;
  u8g2.drawBox(5, 50, barWidth, 9);
  
  u8g2.sendBuffer();
  
  counter++;
  delay(100);
  
  if (counter > 999) counter = 0;
}`
};

// ==================== BUZZER EXAMPLE ====================
export const buzzerComponentExample = {
  id: 'buzzer',
  name: 'Buzzer Tones',
  description: 'Play different tones and melodies',
  components: [
    createHeroBoard(),
    {
      id: 'buzzer-example-1',
      type: 'buzzer',
      x: 250,
      y: 350,
      props: {
        label: 'Buzzer',
        description: 'Piezo Buzzer - Connect to Pin 8'
      }
    }
  ],
  wires: [],
  code: `/*
 * BUZZER MELODY
 * Wiring:
 * - Positive (+) → Pin 8
 * - Negative (-) → GND
 */

const int buzzerPin = 8;

#define NOTE_C4  262
#define NOTE_D4  294
#define NOTE_E4  330
#define NOTE_F4  349
#define NOTE_G4  392
#define NOTE_A4  440

void setup() {
  pinMode(buzzerPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("Buzzer Started!");
}

void loop() {
  Serial.println("Playing scale...");
  
  tone(buzzerPin, NOTE_C4, 300);
  delay(350);
  tone(buzzerPin, NOTE_D4, 300);
  delay(350);
  tone(buzzerPin, NOTE_E4, 300);
  delay(350);
  tone(buzzerPin, NOTE_F4, 300);
  delay(350);
  tone(buzzerPin, NOTE_G4, 300);
  delay(350);
  tone(buzzerPin, NOTE_A4, 300);
  delay(350);
  
  Serial.println("Beep pattern...");
  for(int i = 0; i < 3; i++) {
    tone(buzzerPin, 1000, 100);
    delay(200);
  }
  
  delay(2000);
}`
};

// ==================== DIP SWITCH EXAMPLE ====================
export const dipSwitchComponentExample = {
  id: 'dip-switch',
  name: 'DIP Switch Input',
  description: 'Read switch states and control outputs',
  components: [
    createHeroBoard(),
    {
      id: 'dipswitch-example-1',
      type: 'dip-switch',
      x: 250,
      y: 350,
      props: {
        label: 'DIP Switch',
        description: '4-Position Switch - Connect to Pins 2-5'
      }
    }
  ],
  wires: [],
  code: `/*
 * DIP SWITCH INPUT
 * Wiring:
 * - Switch 1 → Pin 2
 * - Switch 2 → Pin 3
 * - Switch 3 → Pin 4
 * - Switch 4 → Pin 5
 * - Common → GND
 */

const int sw1Pin = 2;
const int sw2Pin = 3;
const int sw3Pin = 4;
const int sw4Pin = 5;

void setup() {
  pinMode(sw1Pin, INPUT_PULLUP);
  pinMode(sw2Pin, INPUT_PULLUP);
  pinMode(sw3Pin, INPUT_PULLUP);
  pinMode(sw4Pin, INPUT_PULLUP);
  
  Serial.begin(9600);
  Serial.println("DIP Switch Started!");
}

void loop() {
  bool sw1 = !digitalRead(sw1Pin);
  bool sw2 = !digitalRead(sw2Pin);
  bool sw3 = !digitalRead(sw3Pin);
  bool sw4 = !digitalRead(sw4Pin);
  
  int value = (sw4 << 3) | (sw3 << 2) | (sw2 << 1) | sw1;
  
  Serial.print("Switches: ");
  Serial.print(sw4 ? "1" : "0");
  Serial.print(sw3 ? "1" : "0");
  Serial.print(sw2 ? "1" : "0");
  Serial.print(sw1 ? "1" : "0");
  Serial.print(" = ");
  Serial.println(value);
  
  delay(500);
}`
};

// ==================== PHOTORESISTOR EXAMPLE ====================
export const photoresistorComponentExample = {
  id: 'photoresistor',
  name: 'Light Sensor',
  description: 'Read light levels with a photoresistor',
  components: [
    createHeroBoard(),
    {
      id: 'photoresistor-example-1',
      type: 'photoresistor',
      x: 250,
      y: 350,
      props: {
        label: 'Photoresistor',
        description: 'Light Sensor - Connect to Pin A0'
      }
    }
  ],
  wires: [],
  code: `/*
 * PHOTORESISTOR LIGHT SENSOR
 * Wiring:
 * - One leg → 5V
 * - Other leg → A0 and 10kΩ resistor to GND
 */

const int sensorPin = A0;

void setup() {
  Serial.begin(9600);
  Serial.println("Light Sensor Started!");
}

void loop() {
  int lightValue = analogRead(sensorPin);
  int lightPercent = map(lightValue, 0, 1023, 0, 100);
  
  Serial.print("Light: ");
  Serial.print(lightValue);
  Serial.print(" (");
  Serial.print(lightPercent);
  Serial.print("%) - ");
  
  if (lightValue < 200) {
    Serial.println("Very Bright");
  } else if (lightValue < 400) {
    Serial.println("Bright");
  } else if (lightValue < 600) {
    Serial.println("Normal");
  } else if (lightValue < 800) {
    Serial.println("Dim");
  } else {
    Serial.println("Dark");
  }
  
  delay(500);
}`
};

// ==================== 7-SEGMENT DISPLAY EXAMPLE ====================
export const sevenSegmentComponentExample = {
  id: 'seven-segment',
  name: '7-Segment Display',
  description: 'Show numbers on a 4-digit display',
  components: [
    createHeroBoard(),
    {
      id: 'segment-display-example-1',
      type: 'segmented-display',
      x: 250,
      y: 300,
      props: {
        label: '7-Segment Display',
        description: 'TM1637 Display - Connect CLK:Pin 2, DIO:Pin 3'
      }
    }
  ],
  wires: [],
  code: `/*
 * 7-SEGMENT DISPLAY COUNTER
 * Wiring:
 * - CLK → Pin 2
 * - DIO → Pin 3
 * - VCC → 5V
 * - GND → GND
 */

#include <TM1637Display.h>

#define CLK 2
#define DIO 3

TM1637Display display(CLK, DIO);

int counter = 0;

void setup() {
  display.setBrightness(5);
  Serial.begin(9600);
  Serial.println("7-Segment Display Started!");
}

void loop() {
  display.showNumberDec(counter, true);
  Serial.print("Count: ");
  Serial.println(counter);
  
  counter++;
  if (counter > 9999) counter = 0;
  
  delay(100);
}`
};

// ==================== ALL EXAMPLES ARRAY ====================
export const allComponentExamples = [
  ledComponentExample,
  rgbLedComponentExample,
  oledDisplayComponentExample,
  buzzerComponentExample,
  dipSwitchComponentExample,
  photoresistorComponentExample,
  sevenSegmentComponentExample
];
