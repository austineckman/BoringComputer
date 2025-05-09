// Example Arduino code snippets that use external libraries

export const oledDisplayExample = `
#include <U8g2lib.h>
#include <Wire.h>

// Initialize the OLED display
U8G2_SSD1306_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0, /* reset=*/ U8X8_PIN_NONE);

void setup() {
  u8g2.begin();
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  // Update display
  u8g2.clearBuffer();
  u8g2.setFont(u8g2_font_ncenB08_tr);
  u8g2.drawStr(0, 10, "Hello World!");
  u8g2.drawStr(0, 24, "OLED Display");
  u8g2.sendBuffer();
  
  // Blink LED to show activity
  digitalWrite(LED_BUILTIN, HIGH);
  delay(1000);
  digitalWrite(LED_BUILTIN, LOW);
  delay(1000);
}
`;

export const sevenSegmentExample = `
#include <TM1637Display.h>

// Define the connections pins
#define CLK 9
#define DIO 8

// Create a display object
TM1637Display display(CLK, DIO);

// Variables for counting
int counter = 0;

void setup() {
  // Set brightness (0-7)
  display.setBrightness(5);
  display.clear();
  
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  // Display the counter value
  display.showNumberDec(counter);
  
  // Increment counter
  counter = (counter + 1) % 10000;
  
  // Blink LED
  digitalWrite(LED_BUILTIN, HIGH);
  delay(500);
  digitalWrite(LED_BUILTIN, LOW);
  delay(500);
}
`;

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

// Connect keypad ROW0, ROW1, ROW2 and ROW3 to these Arduino pins.
byte rowPins[ROWS] = {9, 8, 7, 6};
// Connect keypad COL0, COL1, COL2 and COL3 to these Arduino pins.
byte colPins[COLS] = {5, 4, 3, 2};

// Create the Keypad
Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);

void setup() {
  Serial.begin(9600);
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  char key = keypad.getKey();
  
  // If a key is pressed, blink the LED
  if (key) {
    digitalWrite(LED_BUILTIN, HIGH);
    delay(100);
    digitalWrite(LED_BUILTIN, LOW);
  }
  
  delay(100);
}
`;

export const rotaryEncoderExample = `
#include <BasicEncoder.h>

// Define the encoder pins
#define ENCODER_PIN_A 2  // Connect to CLK on the encoder
#define ENCODER_PIN_B 3  // Connect to DT on the encoder
#define ENCODER_BUTTON 4 // Connect to SW on the encoder

// Create the encoder object
BasicEncoder encoder(ENCODER_PIN_A, ENCODER_PIN_B);

// Variables for tracking encoder position
int lastPosition = 0;
bool buttonState = false;

void setup() {
  Serial.begin(9600);
  
  // Initialize the encoder pins
  pinMode(ENCODER_PIN_A, INPUT_PULLUP);
  pinMode(ENCODER_PIN_B, INPUT_PULLUP);
  pinMode(ENCODER_BUTTON, INPUT_PULLUP);
  
  // Initialize the built-in LED
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  // Read the encoder position
  int position = encoder.getPosition();
  
  // Blink LED based on encoder direction
  if (position != lastPosition) {
    if (position > lastPosition) {
      // Clockwise rotation
      digitalWrite(LED_BUILTIN, HIGH);
      delay(100);
      digitalWrite(LED_BUILTIN, LOW);
    } else {
      // Counter-clockwise rotation
      digitalWrite(LED_BUILTIN, HIGH);
      delay(50);
      digitalWrite(LED_BUILTIN, LOW);
      delay(50);
      digitalWrite(LED_BUILTIN, HIGH);
      delay(50);
      digitalWrite(LED_BUILTIN, LOW);
    }
    
    lastPosition = position;
  }
  
  // Check the button state
  bool currentButtonState = !digitalRead(ENCODER_BUTTON); // Active LOW
  if (currentButtonState != buttonState) {
    buttonState = currentButtonState;
    if (buttonState) {
      // Button pressed - blink quickly
      for (int i = 0; i < 5; i++) {
        digitalWrite(LED_BUILTIN, HIGH);
        delay(50);
        digitalWrite(LED_BUILTIN, LOW);
        delay(50);
      }
    }
  }
  
  delay(10); // Small delay for stability
}
`;

// Combined example with multiple libraries
export const multiLibraryExample = `
#include <U8g2lib.h>
#include <TM1637Display.h>
#include <Keypad.h>
#include <BasicEncoder.h>
#include <Wire.h>

// OLED Display setup
U8G2_SSD1306_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0, /* reset=*/ U8X8_PIN_NONE);

// 7-Segment Display setup
#define CLK_PIN 9
#define DIO_PIN 8
TM1637Display display(CLK_PIN, DIO_PIN);

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

// Encoder setup
#define ENCODER_A A2
#define ENCODER_B A3
#define ENCODER_BTN A4
BasicEncoder encoder(ENCODER_A, ENCODER_B);

// Variables
int counter = 0;
int encoderPos = 0;
char lastKey = ' ';

void setup() {
  Serial.begin(9600);
  
  // Initialize displays
  u8g2.begin();
  display.setBrightness(5);
  display.clear();
  
  // Initialize encoder button
  pinMode(ENCODER_BTN, INPUT_PULLUP);
  
  // Initialize built-in LED
  pinMode(LED_BUILTIN, OUTPUT);
  
  // Show initial screen
  updateOLED();
}

void loop() {
  // Read encoder
  int newPos = encoder.getPosition();
  if (newPos != encoderPos) {
    counter += (newPos - encoderPos);
    encoderPos = newPos;
    updateDisplays();
  }
  
  // Read keypad
  char key = keypad.getKey();
  if (key) {
    lastKey = key;
    // If numeric, use the key value
    if (key >= '0' && key <= '9') {
      counter = counter * 10 + (key - '0');
      if (counter > 9999) counter = 9999;
    }
    // Special keys
    else if (key == '*') {
      counter = 0; // Reset
    }
    else if (key == '#') {
      counter = counter / 10; // Backspace
    }
    updateDisplays();
    blinkLED();
  }
  
  // Check encoder button
  if (!digitalRead(ENCODER_BTN)) {
    counter = 0;
    updateDisplays();
    delay(200); // debounce
  }
  
  delay(10);
}

void updateDisplays() {
  // Update 7-segment display
  display.showNumberDec(counter);
  
  // Update OLED
  updateOLED();
}

void updateOLED() {
  u8g2.clearBuffer();
  u8g2.setFont(u8g2_font_ncenB08_tr);
  
  // Display counter
  u8g2.drawStr(0, 10, "Counter:");
  char buf[10];
  snprintf(buf, sizeof(buf), "%d", counter);
  u8g2.drawStr(60, 10, buf);
  
  // Display last key
  u8g2.drawStr(0, 30, "Last Key:");
  char keyBuf[2] = {lastKey, '\\0'};
  u8g2.drawStr(60, 30, keyBuf);
  
  // Display encoder position
  u8g2.drawStr(0, 50, "Encoder:");
  snprintf(buf, sizeof(buf), "%d", encoderPos);
  u8g2.drawStr(60, 50, buf);
  
  u8g2.sendBuffer();
}

void blinkLED() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(50);
  digitalWrite(LED_BUILTIN, LOW);
}
`;