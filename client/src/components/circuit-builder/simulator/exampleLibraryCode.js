/**
 * Example Arduino sketches for various components
 * These examples demonstrate how to use different libraries
 */

// OLED Display Example using U8g2 library
export const oledDisplayExample = `
#include <U8g2lib.h>
#include <Wire.h>

// Initialize OLED display with I2C
U8g2_SSD1306_128X64_NONAME_F_HW_I2C u8g2(U8g2_R0, U8X8_PIN_NONE);

void setup() {
  u8g2.begin();  // Initialize the display
  
  // Set the font
  u8g2.setFont(u8g2_font_ncenB08_tr);
}

void loop() {
  // Clear the display buffer
  u8g2.clearBuffer();
  
  // Draw a title
  u8g2.drawStr(0, 10, "OLED Example");
  
  // Draw some graphics
  u8g2.drawFrame(0, 15, 128, 48);  // Draw a frame
  u8g2.drawStr(5, 30, "Hello, Maker!");
  
  // Draw a small animation (a bouncing ball)
  static int x = 64;
  static int y = 32;
  static int dx = 1;
  static int dy = 1;
  
  x += dx;
  y += dy;
  
  if (x <= 15 || x >= 113) dx = -dx;
  if (y <= 25 || y >= 53) dy = -dy;
  
  u8g2.drawDisc(x, y, 5);  // Draw a filled circle
  
  // Send the buffer to the display
  u8g2.sendBuffer();
  
  delay(30);  // Small delay for animation
}
`;

// 7-Segment Display Example using TM1637 library
export const sevenSegmentExample = `
#include <TM1637Display.h>

// Define the connections pins
#define CLK 2
#define DIO 3

// Create display object
TM1637Display display(CLK, DIO);

// Array to store the digits to display
uint8_t digits[] = {0xff, 0xff, 0xff, 0xff};

void setup() {
  // Set the brightness (0-7)
  display.setBrightness(5);
  
  // Show a welcome message
  display.setSegments(SEG_HELLO);
  delay(1000);
  
  // Clear the display
  display.clear();
}

void loop() {
  // Count up from 0 to 9999
  for (int i = 0; i <= 9999; i++) {
    display.showNumberDec(i, true);  // Display with leading zeros
    delay(10);  // Change speed
  }
  
  // Display some special characters
  display.setSegments(SEG_DONE);
  delay(1000);
}

// Special character definitions
const uint8_t SEG_HELLO[] = {
  SEG_B | SEG_C | SEG_E | SEG_F | SEG_G,           // H
  SEG_A | SEG_D | SEG_E | SEG_F | SEG_G,           // E
  SEG_D | SEG_E | SEG_F,                           // L
  SEG_D | SEG_E | SEG_F,                           // L
};

const uint8_t SEG_DONE[] = {
  SEG_B | SEG_C | SEG_D | SEG_E | SEG_G,           // d
  SEG_A | SEG_B | SEG_C | SEG_D | SEG_E | SEG_F,   // O
  SEG_C | SEG_E | SEG_G,                          // n
  SEG_A | SEG_D | SEG_E | SEG_F | SEG_G            // E
};
`;

// 4x4 Keypad Example using Keypad library
export const keypadExample = `
#include <Keypad.h>

// Define the keypad layout
const byte ROWS = 4;
const byte COLS = 4;
char keys[ROWS][COLS] = {
  {'1','2','3','A'},
  {'4','5','6','B'},
  {'7','8','9','C'},
  {'*','0','#','D'}
};

// Connect to the row and column pins
byte rowPins[ROWS] = {9, 8, 7, 6};
byte colPins[COLS] = {5, 4, 3, 2};

// Create the keypad
Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);

// LED for feedback
const int ledPin = 13;

void setup() {
  Serial.begin(9600);
  pinMode(ledPin, OUTPUT);
  Serial.println("Keypad Test: Press any key");
}

void loop() {
  // Get the pressed key
  char key = keypad.getKey();
  
  // If a key is pressed, print it and blink the LED
  if (key) {
    Serial.print("Key pressed: ");
    Serial.println(key);
    
    digitalWrite(ledPin, HIGH);
    delay(100);
    digitalWrite(ledPin, LOW);
    
    // Special actions for certain keys
    if (key == 'A') {
      // A pressed - rapid LED blink
      for (int i = 0; i < 5; i++) {
        digitalWrite(ledPin, HIGH);
        delay(50);
        digitalWrite(ledPin, LOW);
        delay(50);
      }
    }
    
    if (key == 'D') {
      // D pressed - slow LED blink
      for (int i = 0; i < 3; i++) {
        digitalWrite(ledPin, HIGH);
        delay(500);
        digitalWrite(ledPin, LOW);
        delay(500);
      }
    }
  }
}
`;

// Rotary Encoder Example using BasicEncoder library
export const rotaryEncoderExample = `
#include <BasicEncoder.h>

// Define rotary encoder pins (CLK, DT, SW)
#define ENCODER_PIN_A 2
#define ENCODER_PIN_B 3
#define ENCODER_BUTTON 4

// Create an encoder object
BasicEncoder encoder(ENCODER_PIN_A, ENCODER_PIN_B);

// Variables for encoder state
int counter = 0;
int lastCounter = 0;
bool buttonPressed = false;

// LED for visual feedback
const int ledPin = 13;

void setup() {
  Serial.begin(9600);
  
  // Set up button input
  pinMode(ENCODER_BUTTON, INPUT_PULLUP);
  
  // Set up LED output
  pinMode(ledPin, OUTPUT);
  
  Serial.println("Rotary Encoder Test:");
  Serial.println("- Turn the encoder to change values");
  Serial.println("- Press the button to reset");
}

void loop() {
  // Update encoder state
  encoder.service();
  
  // Get encoder value
  counter = counter + encoder.get_change();
  
  // Constrain counter to reasonable values
  counter = constrain(counter, 0, 100);
  
  // Check if value has changed
  if (counter != lastCounter) {
    Serial.print("Encoder value: ");
    Serial.println(counter);
    lastCounter = counter;
    
    // Visual feedback - blink LED
    digitalWrite(ledPin, HIGH);
    delay(10);
    digitalWrite(ledPin, LOW);
  }
  
  // Check button press
  if (digitalRead(ENCODER_BUTTON) == LOW && !buttonPressed) {
    buttonPressed = true;
    counter = 0;  // Reset counter when button is pressed
    Serial.println("Button pressed - reset to 0");
    
    // Visual feedback - longer LED pulse
    digitalWrite(ledPin, HIGH);
    delay(500);
    digitalWrite(ledPin, LOW);
  }
  
  // Reset button state when released
  if (digitalRead(ENCODER_BUTTON) == HIGH && buttonPressed) {
    buttonPressed = false;
  }
  
  delay(10);  // Short delay for stability
}
`;

// Complex example using multiple libraries together
export const multiLibraryExample = `
#include <U8g2lib.h>
#include <TM1637Display.h>
#include <Keypad.h>
#include <BasicEncoder.h>
#include <Wire.h>

// OLED Display setup
U8g2_SSD1306_128X64_NONAME_F_HW_I2C u8g2(U8g2_R0, U8X8_PIN_NONE);

// 7-Segment Display setup
#define SEG_CLK 8
#define SEG_DIO 9
TM1637Display display(SEG_CLK, SEG_DIO);

// Keypad setup
const byte ROWS = 4;
const byte COLS = 4;
char keys[ROWS][COLS] = {
  {'1','2','3','A'},
  {'4','5','6','B'},
  {'7','8','9','C'},
  {'*','0','#','D'}
};
byte rowPins[ROWS] = {7, 6, 5, 4};
byte colPins[COLS] = {3, 2, A0, A1};
Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);

// Rotary encoder setup
#define ENCODER_PIN_A A2
#define ENCODER_PIN_B A3
#define ENCODER_BUTTON A4
BasicEncoder encoder(ENCODER_PIN_A, ENCODER_PIN_B);

// State variables
int value = 0;
char lastKey = ' ';
String mode = "IDLE";
int brightness = 5;

// Built-in LED for feedback
const int ledPin = 13;

void setup() {
  Serial.begin(9600);
  
  // Initialize displays
  u8g2.begin();
  u8g2.setFont(u8g2_font_ncenB08_tr);
  
  display.setBrightness(brightness);
  display.clear();
  
  // Setup button input
  pinMode(ENCODER_BUTTON, INPUT_PULLUP);
  
  // Setup LED
  pinMode(ledPin, OUTPUT);
  
  // Initial display update
  updateOLED();
  updateSegDisplay();
  
  Serial.println("Multi-Library Example Ready");
}

void loop() {
  // Handle encoder
  encoder.service();
  int change = encoder.get_change();
  if (change != 0) {
    value = constrain(value + change, 0, 9999);
    updateOLED();
    updateSegDisplay();
    
    // Feedback
    digitalWrite(ledPin, HIGH);
    delay(10);
    digitalWrite(ledPin, LOW);
  }
  
  // Handle encoder button
  if (digitalRead(ENCODER_BUTTON) == LOW) {
    delay(50); // Debounce
    if (digitalRead(ENCODER_BUTTON) == LOW) {
      value = 0;
      updateOLED();
      updateSegDisplay();
      
      // Feedback
      digitalWrite(ledPin, HIGH);
      delay(300);
      digitalWrite(ledPin, LOW);
      
      // Wait for release
      while (digitalRead(ENCODER_BUTTON) == LOW) delay(10);
    }
  }
  
  // Handle keypad
  char key = keypad.getKey();
  if (key) {
    lastKey = key;
    
    // Handle different keys
    switch (key) {
      case 'A':
        mode = "MODE A";
        brightness = 1;
        break;
      case 'B':
        mode = "MODE B";
        brightness = 4;
        break;
      case 'C':
        mode = "MODE C";
        brightness = 7;
        break;
      case 'D':
        value = 0;
        break;
      case '*':
        value = value / 10;
        break;
      case '#':
        value = value * 2;
        break;
      default:
        // Number keys
        if (key >= '0' && key <= '9') {
          if (value < 1000)
            value = (value * 10) + (key - '0');
        }
        break;
    }
    
    // Update displays
    updateOLED();
    updateSegDisplay();
    display.setBrightness(brightness);
    
    // Feedback
    digitalWrite(ledPin, HIGH);
    delay(100);
    digitalWrite(ledPin, LOW);
  }
  
  delay(10);
}

// Update the OLED display
void updateOLED() {
  u8g2.clearBuffer();
  
  // Title
  u8g2.drawStr(0, 10, "Multi-Library Demo");
  u8g2.drawLine(0, 12, 128, 12);
  
  // Mode display
  u8g2.drawStr(0, 25, "Mode:");
  u8g2.drawStr(40, 25, mode.c_str());
  
  // Value display
  char valueStr[20];
  sprintf(valueStr, "Value: %d", value);
  u8g2.drawStr(0, 40, valueStr);
  
  // Last key pressed
  char keyStr[20];
  sprintf(keyStr, "Key: %c", lastKey == ' ' ? '_' : lastKey);
  u8g2.drawStr(0, 55, keyStr);
  
  // Brightness indicator
  u8g2.drawStr(60, 55, "Bright:");
  for (int i = 0; i < brightness; i++) {
    u8g2.drawBox(100 + (i*4), 51, 3, 8);
  }
  
  u8g2.sendBuffer();
}

// Update the 7-segment display
void updateSegDisplay() {
  display.showNumberDec(value, true);
}
`;

export default {
  oledDisplayExample,
  sevenSegmentExample,
  keypadExample,
  rotaryEncoderExample,
  multiLibraryExample
};