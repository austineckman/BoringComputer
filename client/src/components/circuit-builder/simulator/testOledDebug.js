// Test file to debug OLED display issues

export const testStaticBool = `
#include <U8g2lib.h>

U8G2_SH1106_128X64_NONAME_F_HW_I2C lander_display(U8G2_R0);

void setup() {
  lander_display.begin();
  lander_display.setFont(u8g2_font_ncenB08_tr);
}

void loop() {
  static bool blink_on = true;
  
  lander_display.clearBuffer();
  lander_display.setFontPosTop();
  
  // Test 1: Simple text display
  lander_display.drawStr(10, 10, "Line 1: Test");
  lander_display.drawStr(10, 25, "Line 2: Hello");
  
  // Test 2: Conditional display
  if (blink_on) {
    lander_display.drawStr(10, 40, "BLINKING TEXT");
  }
  
  // Toggle the blink state
  blink_on = !blink_on;
  
  lander_display.sendBuffer();
  delay(500);
}
`;

export const testCalculatedPositions = `
#include <U8g2lib.h>

U8G2_SH1106_128X64_NONAME_F_HW_I2C lander_display(U8G2_R0);

void setup() {
  lander_display.begin();
  lander_display.setFont(u8g2_font_ncenB08_tr);
}

void loop() {
  byte font_height = 8; // Simplified for testing
  
  lander_display.clearBuffer();
  lander_display.setFontPosTop();
  
  // Test calculated positions
  lander_display.drawStr(10, 0, "Top Line");
  lander_display.drawStr(10, font_height, "Second Line");
  lander_display.drawStr(10, font_height * 2, "Third Line");
  
  // Test complex calculation
  byte centered_y = 32; // Middle of 64 pixel display
  lander_display.drawStr(10, centered_y, "Centered");
  
  lander_display.sendBuffer();
  delay(1000);
}
`;