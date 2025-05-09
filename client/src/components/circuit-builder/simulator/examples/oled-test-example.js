// Arduino code example for U8g2 OLED display
// This should work with our simulator when properly wired

const basicOLEDExample = `
#include <Wire.h>
#include <U8g2lib.h>

// Initialize U8g2 library with proper constructor for SSD1306 128x64 I2C OLED
U8g2_SSD1306_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0, /* reset=*/ U8X8_PIN_NONE);

void setup() {
  // Initialize the display
  u8g2.begin();
  
  // Set font
  u8g2.setFont(u8g2_font_ncenB10_tr);
}

void loop() {
  // Clear display buffer
  u8g2.clearBuffer();
  
  // Draw text
  u8g2.drawStr(0, 20, "OLED Example");
  
  // Send buffer to display
  u8g2.sendBuffer();
  
  // Wait a second
  delay(1000);
  
  // Clear buffer again
  u8g2.clearBuffer();
  
  // Draw different text
  u8g2.drawStr(0, 20, "OLED changed");
  
  // Send updated buffer to display
  u8g2.sendBuffer();
  
  // Wait a second
  delay(1000);
}
`;

export default basicOLEDExample;