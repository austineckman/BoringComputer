/**
 * OLED Display Example Code
 * 
 * This file contains various examples of Arduino code for OLED displays
 * using common libraries like U8g2 and Adafruit_SSD1306.
 */

export const OLED_EXAMPLES = {
  // Basic U8g2 OLED Example
  U8G2_BASIC: `
#include <Arduino.h>
#include <U8g2lib.h>
#include <Wire.h>

U8G2_SSD1306_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0, U8X8_PIN_NONE);

void setup() {
  Serial.begin(9600);
  u8g2.begin();
  u8g2.setFont(u8g2_font_ncenB08_tr);
}

void loop() {
  // Clear display buffer
  u8g2.clearBuffer();
  
  // Draw a border around the screen
  u8g2.drawFrame(0, 0, 128, 64);
  
  // Display text
  u8g2.drawStr(10, 20, "Hello, World!");
  u8g2.drawStr(10, 40, "U8g2 OLED Display");
  
  // Draw a rectangle
  u8g2.drawBox(90, 10, 30, 20);
  
  // Send buffer to display
  u8g2.sendBuffer();
  
  delay(1000);
}`,

  // Advanced U8g2 Example with Animation
  U8G2_ANIMATION: `
#include <Arduino.h>
#include <U8g2lib.h>
#include <Wire.h>

U8G2_SSD1306_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0, U8X8_PIN_NONE);

int x = 64;
int y = 32;
int dx = 1;
int dy = 1;

void setup() {
  Serial.begin(9600);
  u8g2.begin();
  u8g2.setFont(u8g2_font_ncenB08_tr);
}

void loop() {
  // Animation logic
  x += dx;
  y += dy;
  
  // Bounce off edges
  if (x <= 5 || x >= 123) dx = -dx;
  if (y <= 5 || y >= 59) dy = -dy;

  // Clear display buffer
  u8g2.clearBuffer();
  
  // Draw a frame
  u8g2.drawFrame(0, 0, 128, 64);
  
  // Draw animated circle
  u8g2.drawCircle(x, y, 5);
  
  // Display text
  u8g2.drawStr(5, 12, "Bouncing Ball");
  
  // Draw coordinates
  char buf[20];
  sprintf(buf, "X:%d Y:%d", x, y);
  u8g2.drawStr(5, 60, buf);
  
  // Send buffer to display
  u8g2.sendBuffer();
  
  delay(50);
}`,

  // Adafruit SSD1306 Basic Example
  ADAFRUIT_BASIC: `
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET    -1

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

void setup() {
  Serial.begin(9600);
  
  // Initialize the OLED display
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("SSD1306 allocation failed"));
    for(;;);
  }
  
  // Clear the display buffer
  display.clearDisplay();
}

void loop() {
  // Clear display
  display.clearDisplay();
  
  // Set text properties
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  
  // Display text
  display.setCursor(0, 0);
  display.println("Hello, World!");
  display.setCursor(0, 20);
  display.println("Adafruit SSD1306");
  
  // Draw a rectangle
  display.drawRect(85, 5, 40, 25, SSD1306_WHITE);
  display.fillRect(90, 10, 30, 15, SSD1306_WHITE);
  
  // Draw a circle
  display.drawCircle(32, 40, 10, SSD1306_WHITE);
  
  // Update the display
  display.display();
  
  delay(1000);
}`,

  // Simple example for drawing text
  TEXT_EXAMPLE: `
#include <Wire.h>
#include <U8g2lib.h>

U8G2_SSD1306_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0, U8X8_PIN_NONE);

void setup(void) {
  u8g2.begin();
  u8g2.setFont(u8g2_font_ncenB08_tr);
}

void loop(void) {
  u8g2.clearBuffer();
  
  // Draw different text at different positions
  u8g2.drawStr(0, 10, "Hello Arduino!");
  u8g2.drawStr(0, 25, "OLED Display");
  u8g2.drawStr(0, 40, "Working!");
  u8g2.drawStr(0, 55, "Text Example");
  
  u8g2.sendBuffer();
  
  delay(1000);
}`,

  // Simple example for drawing shapes
  SHAPES_EXAMPLE: `
#include <Wire.h>
#include <U8g2lib.h>

U8G2_SSD1306_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0, U8X8_PIN_NONE);

void setup(void) {
  u8g2.begin();
}

void loop(void) {
  u8g2.clearBuffer();
  
  // Draw a filled box
  u8g2.drawBox(5, 10, 20, 20);
  
  // Draw an empty frame
  u8g2.drawFrame(40, 10, 20, 20);
  
  // Draw a circle
  u8g2.drawCircle(90, 20, 10);
  
  // Draw a line
  u8g2.drawLine(5, 40, 100, 60);
  
  u8g2.sendBuffer();
  
  delay(1000);
}`,

  // Minimal example to test the parser
  MINIMAL: `
#include <U8g2lib.h>
#include <Wire.h>

U8G2_SSD1306_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0, U8X8_PIN_NONE);

void setup() {
  u8g2.begin();
}

void loop() {
  u8g2.clearBuffer();
  u8g2.drawBox(10, 10, 50, 20);
  u8g2.drawStr(5, 50, "OLED TEST");
  u8g2.sendBuffer();
  delay(1000);
}`
};

// Export a single example for quick testing
export const DEFAULT_OLED_EXAMPLE = OLED_EXAMPLES.MINIMAL;