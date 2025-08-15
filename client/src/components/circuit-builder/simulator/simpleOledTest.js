// Simple OLED test code to verify display functionality
export const simpleOledTest = `
#include <U8g2lib.h>
#include <Wire.h>

U8G2_SSD1306_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0);

void setup() {
  u8g2.begin();
}

void loop() {
  u8g2.clearBuffer();
  u8g2.setFont(u8g2_font_ncenB14_tr);
  u8g2.drawStr(10, 30, "Test Display");
  u8g2.sendBuffer();
  delay(1000);
}
`;

// Lander display test code
export const landerDisplayTest = `
#include <U8g2lib.h>

U8G2_SH1106_128X64_NONAME_F_HW_I2C lander_display(U8G2_R0, U8X8_PIN_NONE);

void setup() {
  lander_display.begin();
  lander_display.setFont(u8g2_font_ncenB08_tr);
}

void loop() {
  lander_display.clearBuffer();
  lander_display.setFontPosTop();
  
  // Simple direct text display
  lander_display.drawStr(20, 10, "Exploration Lander");
  lander_display.drawStr(30, 25, "Hello World!");
  lander_display.drawStr(35, 40, "Stand by");
  
  lander_display.sendBuffer();
  delay(500);
}
`;