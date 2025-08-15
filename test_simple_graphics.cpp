// Simple test to verify OLED graphics functions work
#include <U8g2lib.h>

U8G2_SH1106_128X64_NONAME_F_HW_I2C display(U8G2_R0, U8X8_PIN_NONE);

void setup() {
  display.begin();
}

void loop() {
  display.clearBuffer();
  
  // Test basic text
  display.setFont(u8g_font_6x10);
  display.drawStr(10, 10, "Graphics Test");
  
  // Test filled rectangle (drawBox)
  display.drawBox(10, 20, 30, 15);
  
  // Test hollow rectangle (drawFrame) 
  display.drawFrame(50, 20, 30, 15);
  
  // Test filled circle (drawDisc)
  display.drawDisc(25, 50, 8);
  
  // Test hollow circle (drawCircle)
  display.drawCircle(65, 50, 8);
  
  // Test triangle
  display.drawTriangle(90, 40, 110, 40, 100, 55);
  
  // Test line
  display.drawLine(10, 55, 50, 45);
  
  display.sendBuffer();
  delay(1000);
}