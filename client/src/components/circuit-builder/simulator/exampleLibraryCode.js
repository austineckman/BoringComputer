/**
 * Comprehensive Arduino Component Examples
 * Each example includes:
 * - Wiring diagram instructions
 * - Working code that demonstrates the component
 * - Detailed explanations of how the component works
 */

// ==================== LED EXAMPLE ====================
export const ledExample = `/*
 * LED BLINK EXAMPLE
 * =================
 * This example demonstrates how to control a basic LED.
 * 
 * WIRING DIAGRAM:
 * ---------------
 * 1. Place an LED on your breadboard
 * 2. Connect LED anode (longer leg) to Arduino Pin 13
 * 3. Connect LED cathode (shorter leg) to a 220Ω resistor
 * 4. Connect the other end of the resistor to GND
 * 
 * HOW IT WORKS:
 * -------------
 * LEDs (Light Emitting Diodes) only allow current to flow in one direction.
 * The resistor limits current to prevent burning out the LED.
 * digitalWrite() sends HIGH (5V) or LOW (0V) to turn the LED on/off.
 */

const int ledPin = 13;  // Pin connected to LED

void setup() {
  pinMode(ledPin, OUTPUT);  // Set pin as output
  Serial.begin(9600);
  Serial.println("LED Blink Example Started!");
}

void loop() {
  digitalWrite(ledPin, HIGH);  // Turn LED ON (5V)
  Serial.println("LED ON");
  delay(1000);                 // Wait 1 second
  
  digitalWrite(ledPin, LOW);   // Turn LED OFF (0V)
  Serial.println("LED OFF");
  delay(1000);                 // Wait 1 second
}`;

// ==================== RGB LED EXAMPLE ====================
export const rgbLedExample = `/*
 * RGB LED COLOR CYCLE EXAMPLE
 * ===========================
 * This example shows how to create different colors with an RGB LED.
 * 
 * WIRING DIAGRAM:
 * ---------------
 * Common Cathode RGB LED:
 * 1. Connect common pin (longest leg) to GND
 * 2. Connect Red pin through 220Ω resistor to Pin 9
 * 3. Connect Green pin through 220Ω resistor to Pin 10
 * 4. Connect Blue pin through 220Ω resistor to Pin 11
 * 
 * HOW IT WORKS:
 * -------------
 * RGB LEDs contain three separate LEDs (Red, Green, Blue) in one package.
 * By mixing different intensities of each color using PWM (analogWrite),
 * we can create millions of different colors.
 * PWM values range from 0 (off) to 255 (full brightness).
 */

const int redPin = 9;    // Red LED pin (PWM)
const int greenPin = 10; // Green LED pin (PWM)
const int bluePin = 11;  // Blue LED pin (PWM)

void setup() {
  pinMode(redPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  pinMode(bluePin, OUTPUT);
  Serial.begin(9600);
  Serial.println("RGB LED Color Cycle Started!");
}

void setColor(int red, int green, int blue) {
  analogWrite(redPin, red);
  analogWrite(greenPin, green);
  analogWrite(bluePin, blue);
  
  Serial.print("Color - R:");
  Serial.print(red);
  Serial.print(" G:");
  Serial.print(green);
  Serial.print(" B:");
  Serial.println(blue);
}

void loop() {
  // Red
  setColor(255, 0, 0);
  delay(1000);
  
  // Green
  setColor(0, 255, 0);
  delay(1000);
  
  // Blue
  setColor(0, 0, 255);
  delay(1000);
  
  // Yellow (Red + Green)
  setColor(255, 255, 0);
  delay(1000);
  
  // Cyan (Green + Blue)
  setColor(0, 255, 255);
  delay(1000);
  
  // Magenta (Red + Blue)
  setColor(255, 0, 255);
  delay(1000);
  
  // White (All colors)
  setColor(255, 255, 255);
  delay(1000);
  
  // Fade through rainbow
  for(int i = 0; i < 255; i++) {
    setColor(255 - i, i, 0);  // Red to Green
    delay(10);
  }
  for(int i = 0; i < 255; i++) {
    setColor(0, 255 - i, i);  // Green to Blue
    delay(10);
  }
  for(int i = 0; i < 255; i++) {
    setColor(i, 0, 255 - i);  // Blue to Red
    delay(10);
  }
}`;

// ==================== BUZZER EXAMPLE ====================
export const buzzerExample = `/*
 * BUZZER MELODY EXAMPLE
 * =====================
 * This example plays different tones and a simple melody on a buzzer.
 * 
 * WIRING DIAGRAM:
 * ---------------
 * 1. Connect buzzer positive (+) pin to Arduino Pin 8
 * 2. Connect buzzer negative (-) pin to GND
 * 
 * HOW IT WORKS:
 * -------------
 * Piezo buzzers vibrate at different frequencies to produce different pitches.
 * The tone() function generates a square wave at the specified frequency.
 * noTone() stops the sound. Duration can be specified in milliseconds.
 */

const int buzzerPin = 8;  // Pin connected to buzzer

// Note frequencies (in Hz)
#define NOTE_C4  262
#define NOTE_D4  294
#define NOTE_E4  330
#define NOTE_F4  349
#define NOTE_G4  392
#define NOTE_A4  440
#define NOTE_B4  494
#define NOTE_C5  523

// Simple melody: "Mary Had a Little Lamb"
int melody[] = {
  NOTE_E4, NOTE_D4, NOTE_C4, NOTE_D4, NOTE_E4, NOTE_E4, NOTE_E4,
  NOTE_D4, NOTE_D4, NOTE_D4, NOTE_E4, NOTE_G4, NOTE_G4,
  NOTE_E4, NOTE_D4, NOTE_C4, NOTE_D4, NOTE_E4, NOTE_E4, NOTE_E4,
  NOTE_E4, NOTE_D4, NOTE_D4, NOTE_E4, NOTE_D4, NOTE_C4
};

// Note durations: 4 = quarter note, 8 = eighth note, etc.
int noteDurations[] = {
  4, 4, 4, 4, 4, 4, 2,
  4, 4, 2, 4, 4, 2,
  4, 4, 4, 4, 4, 4, 4,
  4, 4, 4, 4, 4, 2
};

void setup() {
  pinMode(buzzerPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("Buzzer Melody Example Started!");
}

void loop() {
  Serial.println("Playing scale...");
  
  // Play a scale
  tone(buzzerPin, NOTE_C4, 200);
  delay(250);
  tone(buzzerPin, NOTE_D4, 200);
  delay(250);
  tone(buzzerPin, NOTE_E4, 200);
  delay(250);
  tone(buzzerPin, NOTE_F4, 200);
  delay(250);
  tone(buzzerPin, NOTE_G4, 200);
  delay(250);
  tone(buzzerPin, NOTE_A4, 200);
  delay(250);
  tone(buzzerPin, NOTE_B4, 200);
  delay(250);
  tone(buzzerPin, NOTE_C5, 200);
  delay(250);
  
  delay(1000);
  
  Serial.println("Playing melody...");
  
  // Play the melody
  for (int i = 0; i < 26; i++) {
    int noteDuration = 1000 / noteDurations[i];
    tone(buzzerPin, melody[i], noteDuration);
    
    // Pause between notes
    int pauseBetweenNotes = noteDuration * 1.30;
    delay(pauseBetweenNotes);
    
    noTone(buzzerPin);  // Stop the tone
  }
  
  Serial.println("Melody complete!");
  delay(3000);  // Wait 3 seconds before repeating
}`;

// ==================== DIP SWITCH EXAMPLE ====================
export const dipSwitchExample = `/*
 * DIP SWITCH INPUT EXAMPLE
 * ========================
 * This example reads the state of a 4-position DIP switch.
 * 
 * WIRING DIAGRAM:
 * ---------------
 * 1. Connect DIP switch common pin to GND
 * 2. Connect switch 1 to Arduino Pin 2
 * 3. Connect switch 2 to Arduino Pin 3
 * 4. Connect switch 3 to Arduino Pin 4
 * 5. Connect switch 4 to Arduino Pin 5
 * 
 * HOW IT WORKS:
 * -------------
 * DIP switches are arrays of simple on/off switches.
 * We use internal pull-up resistors (INPUT_PULLUP) to avoid external resistors.
 * When switch is OFF, pin reads HIGH (pulled up).
 * When switch is ON, pin reads LOW (connected to GND).
 */

const int switch1Pin = 2;
const int switch2Pin = 3;
const int switch3Pin = 4;
const int switch4Pin = 5;
const int ledPin = 13;

void setup() {
  // Set switch pins as inputs with internal pull-up resistors
  pinMode(switch1Pin, INPUT_PULLUP);
  pinMode(switch2Pin, INPUT_PULLUP);
  pinMode(switch3Pin, INPUT_PULLUP);
  pinMode(switch4Pin, INPUT_PULLUP);
  
  pinMode(ledPin, OUTPUT);
  
  Serial.begin(9600);
  Serial.println("DIP Switch Example Started!");
  Serial.println("Flip switches to see their states");
}

void loop() {
  // Read switch states (LOW = ON, HIGH = OFF due to pull-up)
  bool sw1 = !digitalRead(switch1Pin);  // Invert for intuitive reading
  bool sw2 = !digitalRead(switch2Pin);
  bool sw3 = !digitalRead(switch3Pin);
  bool sw4 = !digitalRead(switch4Pin);
  
  // Calculate binary value from switches
  int value = (sw4 << 3) | (sw3 << 2) | (sw2 << 1) | sw1;
  
  // Print switch states
  Serial.print("Switches: ");
  Serial.print(sw4 ? "1" : "0");
  Serial.print(sw3 ? "1" : "0");
  Serial.print(sw2 ? "1" : "0");
  Serial.print(sw1 ? "1" : "0");
  Serial.print(" = ");
  Serial.println(value);
  
  // Control LED based on switch combinations
  if (sw1) {
    // Switch 1 ON: LED blinks fast
    digitalWrite(ledPin, HIGH);
    delay(100);
    digitalWrite(ledPin, LOW);
    delay(100);
  } else if (sw2) {
    // Switch 2 ON: LED blinks slow
    digitalWrite(ledPin, HIGH);
    delay(500);
    digitalWrite(ledPin, LOW);
    delay(500);
  } else if (sw3) {
    // Switch 3 ON: LED stays on
    digitalWrite(ledPin, HIGH);
    delay(200);
  } else if (sw4) {
    // Switch 4 ON: LED fades (using PWM simulation)
    for(int i = 0; i < 10; i++) {
      digitalWrite(ledPin, HIGH);
      delay(i);
      digitalWrite(ledPin, LOW);
      delay(10 - i);
    }
  } else {
    // All switches OFF: LED off
    digitalWrite(ledPin, LOW);
    delay(200);
  }
}`;

// ==================== PHOTORESISTOR EXAMPLE ====================
export const photoresistorExample = `/*
 * PHOTORESISTOR LIGHT SENSOR EXAMPLE
 * ==================================
 * This example reads light levels and creates a night light.
 * 
 * WIRING DIAGRAM:
 * ---------------
 * 1. Connect one leg of photoresistor to 5V
 * 2. Connect other leg to both:
 *    - Arduino Pin A0 (analog input)
 *    - 10kΩ resistor to GND (voltage divider)
 * 3. Connect LED to Pin 13 (with 220Ω resistor to GND)
 * 
 * HOW IT WORKS:
 * -------------
 * Photoresistors (LDRs) change resistance based on light intensity.
 * Bright light = low resistance, Dark = high resistance.
 * We create a voltage divider to read this as an analog value (0-1023).
 * Higher values = darker, Lower values = brighter.
 */

const int photoresistorPin = A0;  // Analog input pin
const int ledPin = 13;            // LED output pin
const int threshold = 500;        // Light/dark threshold

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("Photoresistor Light Sensor Started!");
  Serial.println("Cover the sensor to turn on the LED");
}

void loop() {
  // Read the analog value from photoresistor
  int lightValue = analogRead(photoresistorPin);
  
  // Map to percentage for easier understanding
  int lightPercent = map(lightValue, 0, 1023, 100, 0);
  
  Serial.print("Light level: ");
  Serial.print(lightValue);
  Serial.print(" (");
  Serial.print(lightPercent);
  Serial.print("%) - ");
  
  // Determine light conditions
  if (lightValue < 200) {
    Serial.println("Very Bright");
    digitalWrite(ledPin, LOW);
  } else if (lightValue < 400) {
    Serial.println("Bright");
    digitalWrite(ledPin, LOW);
  } else if (lightValue < 600) {
    Serial.println("Normal");
    digitalWrite(ledPin, LOW);
  } else if (lightValue < 800) {
    Serial.println("Dim");
    // Blink LED slowly
    digitalWrite(ledPin, HIGH);
    delay(500);
    digitalWrite(ledPin, LOW);
  } else {
    Serial.println("Dark - Night Light ON");
    digitalWrite(ledPin, HIGH);
  }
  
  delay(500);  // Read every half second
}`;

// ==================== OLED DISPLAY EXAMPLE ====================
export const oledDisplayExample = `/*
 * OLED DISPLAY GRAPHICS EXAMPLE
 * =============================
 * This example shows text, graphics, and animations on an OLED display.
 * 
 * WIRING DIAGRAM (I2C):
 * --------------------
 * 1. Connect OLED VCC to Arduino 5V
 * 2. Connect OLED GND to Arduino GND
 * 3. Connect OLED SCL to Arduino A5 (SCL)
 * 4. Connect OLED SDA to Arduino A4 (SDA)
 * 
 * HOW IT WORKS:
 * -------------
 * OLED displays are made of organic LEDs that emit light when powered.
 * We use I2C communication (2 wires) to send commands and data.
 * The U8g2 library handles the complex display protocols.
 * Graphics are drawn to a buffer, then sent to display with sendBuffer().
 */

#include <U8g2lib.h>
#include <Wire.h>

// Initialize 128x64 OLED display with I2C
U8g2_SSD1306_128X64_NONAME_F_HW_I2C u8g2(U8g2_R0, U8X8_PIN_NONE);

int counter = 0;
int ballX = 64, ballY = 32;
int ballDX = 2, ballDY = 1;

void setup() {
  u8g2.begin();  // Initialize display
  u8g2.setFont(u8g2_font_ncenB08_tr);  // Set font
  Serial.begin(9600);
  Serial.println("OLED Display Example Started!");
}

void loop() {
  u8g2.clearBuffer();  // Clear display buffer
  
  // Draw title
  u8g2.drawStr(0, 10, "OLED Demo");
  
  // Draw frame
  u8g2.drawFrame(0, 12, 128, 52);
  
  // Display counter
  char buffer[20];
  sprintf(buffer, "Count: %d", counter);
  u8g2.drawStr(5, 25, buffer);
  
  // Animate bouncing ball
  ballX += ballDX;
  ballY += ballDY;
  
  // Bounce off walls
  if (ballX <= 5 || ballX >= 123) ballDX = -ballDX;
  if (ballY <= 17 || ballY >= 59) ballDY = -ballDY;
  
  // Draw ball
  u8g2.drawDisc(ballX, ballY, 3);
  
  // Draw progress bar
  int barWidth = (counter % 100);
  u8g2.drawBox(14, 55, barWidth, 5);
  u8g2.drawFrame(14, 55, 100, 5);
  
  // Send buffer to display
  u8g2.sendBuffer();
  
  counter++;
  delay(50);  // Animation speed
  
  // Reset counter
  if (counter > 999) counter = 0;
}`;

// ==================== 7-SEGMENT DISPLAY EXAMPLE ====================
export const sevenSegmentExample = `/*
 * 7-SEGMENT DISPLAY COUNTER EXAMPLE
 * =================================
 * This example shows numbers and patterns on a 4-digit 7-segment display.
 * 
 * WIRING DIAGRAM (TM1637):
 * -----------------------
 * 1. Connect display VCC to Arduino 5V
 * 2. Connect display GND to Arduino GND
 * 3. Connect display CLK to Arduino Pin 2
 * 4. Connect display DIO to Arduino Pin 3
 * 
 * HOW IT WORKS:
 * -------------
 * 7-segment displays use 7 LEDs arranged to show digits 0-9.
 * The TM1637 chip controls 4 digits using only 2 wires (CLK and DIO).
 * Each segment can be individually controlled to create numbers and letters.
 */

#include <TM1637Display.h>

// Define connection pins
#define CLK 2
#define DIO 3

// Create display object
TM1637Display display(CLK, DIO);

void setup() {
  display.setBrightness(5);  // Set brightness (0-7)
  Serial.begin(9600);
  Serial.println("7-Segment Display Example Started!");
  
  // Show startup animation
  uint8_t data[] = {0xff, 0xff, 0xff, 0xff};  // All segments on
  display.setSegments(data);
  delay(500);
  display.clear();
  delay(500);
}

void loop() {
  Serial.println("Counting 0-9999...");
  
  // Count from 0 to 100 quickly
  for (int i = 0; i <= 100; i++) {
    display.showNumberDec(i, true);  // true = show leading zeros
    delay(20);
  }
  
  delay(1000);
  
  // Show time format (12:34)
  Serial.println("Showing time format...");
  display.showNumberDecEx(1234, 0b01000000, true);  // Show colon
  delay(2000);
  
  // Temperature display (23°C)
  Serial.println("Showing temperature...");
  display.showNumberDec(23, false, 2, 0);  // Show at position 0-1
  
  // Custom segments for °C
  uint8_t celsius[] = {
    SEG_A | SEG_D | SEG_E | SEG_F,  // °
    SEG_A | SEG_D | SEG_E | SEG_F   // C
  };
  display.setSegments(celsius, 2, 2);  // Show at position 2-3
  delay(2000);
  
  // Brightness fade demo
  Serial.println("Brightness demo...");
  for (int brightness = 0; brightness <= 7; brightness++) {
    display.setBrightness(brightness);
    display.showNumberDec(8888, true);
    delay(300);
  }
  for (int brightness = 7; brightness >= 0; brightness--) {
    display.setBrightness(brightness);
    display.showNumberDec(8888, true);
    delay(300);
  }
  
  display.setBrightness(5);  // Reset brightness
  display.clear();
  delay(1000);
}`;

// ==================== KEYPAD EXAMPLE ====================
export const keypadExample = `/*
 * 4x4 MATRIX KEYPAD EXAMPLE
 * =========================
 * This example reads input from a 16-button keypad.
 * 
 * WIRING DIAGRAM:
 * ---------------
 * Keypad has 8 pins (4 rows, 4 columns):
 * 1. Row 1 to Arduino Pin 9
 * 2. Row 2 to Arduino Pin 8
 * 3. Row 3 to Arduino Pin 7
 * 4. Row 4 to Arduino Pin 6
 * 5. Column 1 to Arduino Pin 5
 * 6. Column 2 to Arduino Pin 4
 * 7. Column 3 to Arduino Pin 3
 * 8. Column 4 to Arduino Pin 2
 * 
 * HOW IT WORKS:
 * -------------
 * Matrix keypads use a grid of rows and columns.
 * Pressing a button connects one row to one column.
 * The library scans each row/column combination to detect pressed keys.
 */

#include <Keypad.h>

const byte ROWS = 4;  // Four rows
const byte COLS = 4;  // Four columns

// Define the keymap
char keys[ROWS][COLS] = {
  {'1','2','3','A'},
  {'4','5','6','B'},
  {'7','8','9','C'},
  {'*','0','#','D'}
};

// Connect keypad ROW0, ROW1, ROW2, ROW3 to these Arduino pins
byte rowPins[ROWS] = {9, 8, 7, 6};

// Connect keypad COL0, COL1, COL2, COL3 to these Arduino pins
byte colPins[COLS] = {5, 4, 3, 2};

// Create the Keypad object
Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);

String inputString = "";
const int ledPin = 13;

void setup() {
  Serial.begin(9600);
  pinMode(ledPin, OUTPUT);
  Serial.println("4x4 Keypad Example Started!");
  Serial.println("Enter numbers, * to clear, # to submit");
}

void loop() {
  char key = keypad.getKey();  // Get the key
  
  if (key) {  // If a key is pressed
    Serial.print("Key Pressed: ");
    Serial.println(key);
    
    // Flash LED on keypress
    digitalWrite(ledPin, HIGH);
    delay(100);
    digitalWrite(ledPin, LOW);
    
    // Handle special keys
    if (key == '*') {
      inputString = "";  // Clear input
      Serial.println("Input cleared!");
    } 
    else if (key == '#') {
      Serial.print("You entered: ");
      Serial.println(inputString);
      
      // Special codes
      if (inputString == "1234") {
        Serial.println("Correct code! Access granted!");
        // Blink LED rapidly
        for(int i = 0; i < 10; i++) {
          digitalWrite(ledPin, HIGH);
          delay(50);
          digitalWrite(ledPin, LOW);
          delay(50);
        }
      } else {
        Serial.println("Invalid code!");
      }
      
      inputString = "";  // Clear after submit
    }
    else {
      inputString += key;  // Add to input string
      Serial.print("Current input: ");
      Serial.println(inputString);
    }
  }
}`;

// ==================== ROTARY ENCODER EXAMPLE ====================
export const rotaryEncoderExample = `/*
 * ROTARY ENCODER MENU EXAMPLE
 * ===========================
 * This example uses a rotary encoder to navigate a menu and adjust values.
 * 
 * WIRING DIAGRAM:
 * ---------------
 * 1. Connect encoder CLK to Arduino Pin 2
 * 2. Connect encoder DT to Arduino Pin 3
 * 3. Connect encoder SW (button) to Arduino Pin 4
 * 4. Connect encoder VCC to Arduino 5V
 * 5. Connect encoder GND to Arduino GND
 * 
 * HOW IT WORKS:
 * -------------
 * Rotary encoders output pulses when rotated.
 * By reading the sequence of pulses on CLK and DT pins,
 * we can determine rotation direction and amount.
 * The built-in button (SW) is used for selection.
 */

#include <BasicEncoder.h>

// Define encoder pins
#define ENCODER_CLK 2
#define ENCODER_DT 3
#define ENCODER_SW 4

// Create encoder object
BasicEncoder encoder(ENCODER_CLK, ENCODER_DT);

// Menu variables
int menuPosition = 0;
int selectedValue = 50;
bool inMenu = true;
unsigned long lastButtonPress = 0;

const char* menuItems[] = {
  "LED Brightness",
  "Blink Speed",
  "Sound Volume",
  "Exit Menu"
};
const int menuSize = 4;

// LED for visual feedback
const int ledPin = 13;
int ledBrightness = 128;
int blinkSpeed = 500;

void setup() {
  Serial.begin(9600);
  pinMode(ENCODER_SW, INPUT_PULLUP);
  pinMode(ledPin, OUTPUT);
  
  Serial.println("Rotary Encoder Menu Example");
  Serial.println("Turn to navigate, press to select");
  Serial.println("============================");
  displayMenu();
}

void displayMenu() {
  Serial.println("\\nMENU:");
  for (int i = 0; i < menuSize; i++) {
    if (i == menuPosition) {
      Serial.print("> ");  // Current selection
    } else {
      Serial.print("  ");
    }
    Serial.print(menuItems[i]);
    
    // Show current values
    if (i == 0) Serial.print(" [" + String(ledBrightness) + "]");
    if (i == 1) Serial.print(" [" + String(blinkSpeed) + "ms]");
    
    Serial.println();
  }
}

void adjustValue(int item) {
  Serial.print("Adjusting ");
  Serial.println(menuItems[item]);
  Serial.println("Turn encoder to change, press to save");
  
  int value = 0;
  if (item == 0) value = ledBrightness;
  if (item == 1) value = blinkSpeed;
  
  while (digitalRead(ENCODER_SW) == HIGH) {
    encoder.service();
    int change = encoder.get_change();
    
    if (change != 0) {
      if (item == 0) {  // LED Brightness
        ledBrightness = constrain(ledBrightness + change * 10, 0, 255);
        Serial.print("Brightness: ");
        Serial.println(ledBrightness);
        analogWrite(ledPin, ledBrightness);
      }
      else if (item == 1) {  // Blink Speed
        blinkSpeed = constrain(blinkSpeed + change * 50, 100, 2000);
        Serial.print("Blink Speed: ");
        Serial.print(blinkSpeed);
        Serial.println("ms");
      }
    }
    delay(10);
  }
  
  Serial.println("Value saved!");
  delay(500);
}

void loop() {
  encoder.service();  // Update encoder
  
  // Check for rotation
  int change = encoder.get_change();
  if (change != 0 && inMenu) {
    menuPosition = (menuPosition + change + menuSize) % menuSize;
    displayMenu();
  }
  
  // Check for button press
  if (digitalRead(ENCODER_SW) == LOW) {
    if (millis() - lastButtonPress > 300) {  // Debounce
      lastButtonPress = millis();
      
      Serial.print("\\nSelected: ");
      Serial.println(menuItems[menuPosition]);
      
      // Handle menu selection
      switch(menuPosition) {
        case 0:  // LED Brightness
        case 1:  // Blink Speed
          adjustValue(menuPosition);
          displayMenu();
          break;
          
        case 3:  // Exit
          Serial.println("Exiting menu...");
          inMenu = false;
          break;
      }
    }
  }
  
  // Demo LED blink with current settings
  if (!inMenu) {
    digitalWrite(ledPin, HIGH);
    delay(blinkSpeed / 2);
    digitalWrite(ledPin, LOW);
    delay(blinkSpeed / 2);
  }
}`;

// ==================== MULTI-COMPONENT EXAMPLE ====================
export const multiLibraryExample = `/*
 * MULTI-COMPONENT INTEGRATION EXAMPLE
 * ===================================
 * This example combines multiple components into a working system.
 * Creates a temperature monitor with display and alarm.
 * 
 * COMPONENTS USED:
 * ----------------
 * - OLED Display (I2C)
 * - Photoresistor (light sensor as temperature simulator)
 * - Buzzer (alarm)
 * - LED (status indicator)
 * - DIP Switch (settings)
 * 
 * WIRING:
 * -------
 * OLED: SDA->A4, SCL->A5, VCC->5V, GND->GND
 * Photoresistor: One leg->5V, Other leg->A0 & 10kΩ->GND
 * Buzzer: (+)->Pin 8, (-)-> GND
 * LED: Anode->Pin 13, Cathode->220Ω->GND
 * DIP Switch: Common->GND, SW1->Pin 2, SW2->Pin 3
 * 
 * HOW IT WORKS:
 * -------------
 * This system simulates a temperature monitor.
 * Light level from photoresistor simulates temperature.
 * OLED displays current "temperature" and status.
 * Buzzer sounds alarm if threshold exceeded.
 * DIP switches control alarm on/off and units (C/F).
 */

#include <U8g2lib.h>
#include <Wire.h>

// Pin definitions
const int photoresistorPin = A0;
const int buzzerPin = 8;
const int ledPin = 13;
const int alarmSwitch = 2;
const int unitsSwitch = 3;

// Display object
U8g2_SSD1306_128X64_NONAME_F_HW_I2C u8g2(U8g2_R0, U8X8_PIN_NONE);

// System variables
float temperature = 25.0;
bool alarmEnabled = true;
bool useFahrenheit = false;
bool alarmActive = false;
const float alarmThreshold = 30.0;  // Celsius

void setup() {
  // Initialize pins
  pinMode(buzzerPin, OUTPUT);
  pinMode(ledPin, OUTPUT);
  pinMode(alarmSwitch, INPUT_PULLUP);
  pinMode(unitsSwitch, INPUT_PULLUP);
  
  // Initialize display
  u8g2.begin();
  u8g2.setFont(u8g2_font_ncenB08_tr);
  
  Serial.begin(9600);
  Serial.println("Multi-Component System Started!");
}

float readTemperature() {
  // Simulate temperature from light sensor
  int lightValue = analogRead(photoresistorPin);
  // Map light (0-1023) to temperature (10-40°C)
  return map(lightValue, 0, 1023, 10, 40);
}

float celsiusToFahrenheit(float celsius) {
  return (celsius * 9.0 / 5.0) + 32.0;
}

void updateDisplay() {
  u8g2.clearBuffer();
  
  // Title
  u8g2.drawStr(20, 10, "Temp Monitor");
  u8g2.drawLine(0, 12, 128, 12);
  
  // Temperature display
  char tempStr[20];
  float displayTemp = useFahrenheit ? celsiusToFahrenheit(temperature) : temperature;
  sprintf(tempStr, "%.1f %c", displayTemp, useFahrenheit ? 'F' : 'C');
  
  // Large temperature text
  u8g2.setFont(u8g2_font_ncenB14_tr);
  u8g2.drawStr(30, 35, tempStr);
  u8g2.setFont(u8g2_font_ncenB08_tr);
  
  // Status bar
  u8g2.drawStr(0, 50, alarmEnabled ? "Alarm: ON" : "Alarm: OFF");
  
  if (alarmActive) {
    u8g2.drawStr(70, 50, "ALERT!");
    u8g2.drawFrame(68, 42, 50, 12);
  }
  
  // Graph visualization (simple bar)
  int barHeight = map(temperature, 10, 40, 0, 20);
  u8g2.drawBox(100, 64 - barHeight, 10, barHeight);
  u8g2.drawFrame(98, 42, 14, 22);
  
  u8g2.sendBuffer();
}

void checkAlarm() {
  if (alarmEnabled && temperature > alarmThreshold) {
    if (!alarmActive) {
      Serial.println("ALARM! Temperature too high!");
      alarmActive = true;
    }
    
    // Sound alarm
    tone(buzzerPin, 1000, 100);
    
    // Flash LED
    digitalWrite(ledPin, HIGH);
    delay(100);
    digitalWrite(ledPin, LOW);
    delay(100);
  } else {
    alarmActive = false;
    digitalWrite(ledPin, LOW);
    noTone(buzzerPin);
  }
}

void loop() {
  // Read switches
  alarmEnabled = !digitalRead(alarmSwitch);
  useFahrenheit = !digitalRead(unitsSwitch);
  
  // Read temperature
  temperature = readTemperature();
  
  // Update display
  updateDisplay();
  
  // Check alarm condition
  checkAlarm();
  
  // Serial output
  Serial.print("Temp: ");
  Serial.print(temperature);
  Serial.print("C, Alarm: ");
  Serial.print(alarmEnabled ? "ON" : "OFF");
  Serial.print(", Units: ");
  Serial.println(useFahrenheit ? "F" : "C");
  
  delay(500);  // Update rate
}`;

// Export all examples as an array for easy dropdown population
export const allExamples = [
  { id: 'led', name: 'LED - Basic Blink', code: ledExample },
  { id: 'rgbled', name: 'RGB LED - Color Cycle', code: rgbLedExample },
  { id: 'buzzer', name: 'Buzzer - Melody Player', code: buzzerExample },
  { id: 'dipswitch', name: 'DIP Switch - Input Reading', code: dipSwitchExample },
  { id: 'photoresistor', name: 'Photoresistor - Light Sensor', code: photoresistorExample },
  { id: 'oled', name: 'OLED Display - Graphics', code: oledDisplayExample },
  { id: 'sevenSegment', name: '7-Segment - Counter Display', code: sevenSegmentExample },
  { id: 'keypad', name: 'Keypad - Code Entry', code: keypadExample },
  { id: 'encoder', name: 'Rotary Encoder - Menu System', code: rotaryEncoderExample },
  { id: 'multi', name: 'Multi-Component - Temp Monitor', code: multiLibraryExample }
];

// Keep backwards compatibility exports
export { 
  ledExample as defaultCode
};