/*
  U8g2lib.cpp - Simplified U8g2 Arduino library implementation
  
  This is a streamlined version focused on SSD1306 OLED displays over I2C.
  For full functionality, use the complete U8g2 library.
*/

#include "U8g2lib.h"

// SSD1306 Commands
#define SSD1306_SETCONTRAST 0x81
#define SSD1306_DISPLAYALLON_RESUME 0xA4
#define SSD1306_DISPLAYALLON 0xA5
#define SSD1306_NORMALDISPLAY 0xA6
#define SSD1306_INVERTDISPLAY 0xA7
#define SSD1306_DISPLAYOFF 0xAE
#define SSD1306_DISPLAYON 0xAF
#define SSD1306_SETDISPLAYOFFSET 0xD3
#define SSD1306_SETCOMPINS 0xDA
#define SSD1306_SETVCOMDETECT 0xDB
#define SSD1306_SETDISPLAYCLOCKDIV 0xD5
#define SSD1306_SETPRECHARGE 0xD9
#define SSD1306_SETMULTIPLEX 0xA8
#define SSD1306_SETLOWCOLUMN 0x00
#define SSD1306_SETHIGHCOLUMN 0x10
#define SSD1306_SETSTARTLINE 0x40
#define SSD1306_MEMORYMODE 0x20
#define SSD1306_COLUMNADDR 0x21
#define SSD1306_PAGEADDR 0x22
#define SSD1306_COMSCANINC 0xC0
#define SSD1306_COMSCANDEC 0xC8
#define SSD1306_SEGREMAP 0xA0
#define SSD1306_CHARGEPUMP 0x8D

// Simple 6x10 font data (basic ASCII characters)
const uint8_t u8g2_font_6x10_tf[] = {
  // Font header (simplified)
  0, 0, 0, 0, 0, 10, 0, 0, 0, 0, 6, 10, 0, 0, 0, 0,
  // Character data would go here - simplified for demo
  // In a real implementation, this would contain bitmap data for each character
};

U8G2::U8G2(void) {
  _width = 128;
  _height = 64;
  _draw_color = 1;
  _font_mode = 0;
  _font_direction = 0;
  _i2c_address = 0x3C;
  _display_enabled = false;
  _contrast = 127;
  _flip_mode = 0;
  tx = 0;
  ty = 0;
}

bool U8G2::begin(void) {
  // Initialize serial for simulator communication
  Serial.begin(115200);
  
  // Output initialization command for the simulator
  Serial.println("OLED:init");
  
  Wire.begin();
  initDisplay();
  clearDisplay();
  setPowerSave(0);
  return true;
}

void U8G2::initDisplay(void) {
  // SSD1306 initialization sequence
  sendCommand(SSD1306_DISPLAYOFF);
  sendCommand(SSD1306_SETDISPLAYCLOCKDIV);
  sendCommand(0x80);
  sendCommand(SSD1306_SETMULTIPLEX);
  sendCommand(_height - 1);
  sendCommand(SSD1306_SETDISPLAYOFFSET);
  sendCommand(0x0);
  sendCommand(SSD1306_SETSTARTLINE | 0x0);
  sendCommand(SSD1306_CHARGEPUMP);
  sendCommand(0x14);
  sendCommand(SSD1306_MEMORYMODE);
  sendCommand(0x00);
  sendCommand(SSD1306_SEGREMAP | 0x1);
  sendCommand(SSD1306_COMSCANDEC);
  
  if (_height == 64) {
    sendCommand(SSD1306_SETCOMPINS);
    sendCommand(0x12);
  } else {
    sendCommand(SSD1306_SETCOMPINS);
    sendCommand(0x02);
  }
  
  sendCommand(SSD1306_SETCONTRAST);
  sendCommand(_contrast);
  sendCommand(SSD1306_SETPRECHARGE);
  sendCommand(0xF1);
  sendCommand(SSD1306_SETVCOMDETECT);
  sendCommand(0x40);
  sendCommand(SSD1306_DISPLAYALLON_RESUME);
  sendCommand(SSD1306_NORMALDISPLAY);
  sendCommand(SSD1306_DISPLAYON);
}

void U8G2::sendCommand(uint8_t cmd) {
  Wire.beginTransmission(_i2c_address);
  Wire.write(0x00); // Control byte for command
  Wire.write(cmd);
  Wire.endTransmission();
}

void U8G2::sendData(uint8_t data) {
  Wire.beginTransmission(_i2c_address);
  Wire.write(0x40); // Control byte for data
  Wire.write(data);
  Wire.endTransmission();
}

void U8G2::clearDisplay(void) {
  clearBuffer();
  sendBuffer();
}

void U8G2::clearBuffer(void) {
  // Output a serial command for the simulator to parse
  Serial.println("OLED:clear");
  
  memset(_buffer, 0, sizeof(_buffer));
}

void U8G2::sendBuffer(void) {
  sendCommand(SSD1306_PAGEADDR);
  sendCommand(0);
  sendCommand((_height / 8) - 1);
  sendCommand(SSD1306_COLUMNADDR);
  sendCommand(0);
  sendCommand(_width - 1);
  
  // Send buffer data in chunks
  for (int i = 0; i < sizeof(_buffer); i += 16) {
    Wire.beginTransmission(_i2c_address);
    Wire.write(0x40); // Data control byte
    int chunk_size = min(16, (int)sizeof(_buffer) - i);
    for (int j = 0; j < chunk_size; j++) {
      Wire.write(_buffer[i + j]);
    }
    Wire.endTransmission();
  }
}

void U8G2::setPowerSave(uint8_t is_enable) {
  if (is_enable) {
    sendCommand(SSD1306_DISPLAYOFF);
    _display_enabled = false;
  } else {
    sendCommand(SSD1306_DISPLAYON);
    _display_enabled = true;
  }
}

void U8G2::setContrast(uint8_t value) {
  _contrast = value;
  sendCommand(SSD1306_SETCONTRAST);
  sendCommand(value);
}

void U8G2::setFlipMode(uint8_t mode) {
  _flip_mode = mode;
  // Implementation would depend on specific flip requirements
}

void U8G2::setI2CAddress(uint8_t adr) {
  _i2c_address = adr;
}

void U8G2::setDrawColor(uint8_t color_index) {
  _draw_color = color_index ? 1 : 0;
}

uint8_t U8G2::getDrawColor(void) {
  return _draw_color;
}

void U8G2::drawPixel(u8g2_uint_t x, u8g2_uint_t y) {
  if (x >= _width || y >= _height) return;
  
  int index = x + (y / 8) * _width;
  if (_draw_color) {
    _buffer[index] |= (1 << (y & 7));
  } else {
    _buffer[index] &= ~(1 << (y & 7));
  }
}

void U8G2::drawHLine(u8g2_uint_t x, u8g2_uint_t y, u8g2_uint_t w) {
  for (u8g2_uint_t i = 0; i < w; i++) {
    drawPixel(x + i, y);
  }
}

void U8G2::drawVLine(u8g2_uint_t x, u8g2_uint_t y, u8g2_uint_t h) {
  for (u8g2_uint_t i = 0; i < h; i++) {
    drawPixel(x, y + i);
  }
}

void U8G2::drawLine(u8g2_uint_t x1, u8g2_uint_t y1, u8g2_uint_t x2, u8g2_uint_t y2) {
  // Bresenham's line algorithm (simplified)
  int dx = abs(x2 - x1);
  int dy = abs(y2 - y1);
  int sx = (x1 < x2) ? 1 : -1;
  int sy = (y1 < y2) ? 1 : -1;
  int err = dx - dy;
  
  while (true) {
    drawPixel(x1, y1);
    if (x1 == x2 && y1 == y2) break;
    int e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x1 += sx; }
    if (e2 < dx) { err += dx; y1 += sy; }
  }
}

void U8G2::drawFrame(u8g2_uint_t x, u8g2_uint_t y, u8g2_uint_t w, u8g2_uint_t h) {
  // Output a serial command for the simulator to parse
  Serial.print("OLED:frame:");
  Serial.print(x);
  Serial.print(":");
  Serial.print(y);
  Serial.print(":");
  Serial.print(w);
  Serial.print(":");
  Serial.println(h);
  
  drawHLine(x, y, w);
  drawHLine(x, y + h - 1, w);
  drawVLine(x, y, h);
  drawVLine(x + w - 1, y, h);
}

void U8G2::drawBox(u8g2_uint_t x, u8g2_uint_t y, u8g2_uint_t w, u8g2_uint_t h) {
  // Output a serial command for the simulator to parse
  Serial.print("OLED:filledRect:");
  Serial.print(x);
  Serial.print(":");
  Serial.print(y);
  Serial.print(":");
  Serial.print(w);
  Serial.print(":");
  Serial.println(h);
  
  for (u8g2_uint_t i = 0; i < h; i++) {
    drawHLine(x, y + i, w);
  }
}

void U8G2::drawRFrame(u8g2_uint_t x, u8g2_uint_t y, u8g2_uint_t w, u8g2_uint_t h, u8g2_uint_t r) {
  // Simplified rounded frame - just draw regular frame for now
  drawFrame(x, y, w, h);
}

void U8G2::drawRBox(u8g2_uint_t x, u8g2_uint_t y, u8g2_uint_t w, u8g2_uint_t h, u8g2_uint_t r) {
  // Simplified rounded box - just draw regular box for now
  drawBox(x, y, w, h);
}

void U8G2::drawCircle(u8g2_uint_t x0, u8g2_uint_t y0, u8g2_uint_t rad) {
  // Output a serial command for the simulator to parse
  Serial.print("OLED:circle:");
  Serial.print(x0);
  Serial.print(":");
  Serial.print(y0);
  Serial.print(":");
  Serial.println(rad);
  
  // Bresenham's circle algorithm (simplified)
  int x = rad;
  int y = 0;
  int err = 0;
  
  while (x >= y) {
    drawPixel(x0 + x, y0 + y);
    drawPixel(x0 + y, y0 + x);
    drawPixel(x0 - y, y0 + x);
    drawPixel(x0 - x, y0 + y);
    drawPixel(x0 - x, y0 - y);
    drawPixel(x0 - y, y0 - x);
    drawPixel(x0 + y, y0 - x);
    drawPixel(x0 + x, y0 - y);
    
    if (err <= 0) {
      y += 1;
      err += 2*y + 1;
    }
    if (err > 0) {
      x -= 1;
      err -= 2*x + 1;
    }
  }
}

void U8G2::drawDisc(u8g2_uint_t x0, u8g2_uint_t y0, u8g2_uint_t rad) {
  // Output a serial command for the simulator to parse
  Serial.print("OLED:filledCircle:");
  Serial.print(x0);
  Serial.print(":");
  Serial.print(y0);
  Serial.print(":");
  Serial.println(rad);
  
  // Filled circle - simplified implementation
  for (int y = -rad; y <= rad; y++) {
    for (int x = -rad; x <= rad; x++) {
      if (x*x + y*y <= rad*rad) {
        drawPixel(x0 + x, y0 + y);
      }
    }
  }
}

void U8G2::setFont(const uint8_t *font) {
  // In a full implementation, this would set the font data pointer
}

void U8G2::setFontMode(uint8_t is_transparent) {
  _font_mode = is_transparent;
}

void U8G2::setFontDirection(uint8_t dir) {
  _font_direction = dir;
}

void U8G2::setFontPosBaseline(void) {
  // Font positioning implementation
}

void U8G2::setFontPosBottom(void) {
  // Font positioning implementation
}

void U8G2::setFontPosTop(void) {
  // Font positioning implementation
}

void U8G2::setFontPosCenter(void) {
  // Font positioning implementation
}

u8g2_uint_t U8G2::drawStr(u8g2_uint_t x, u8g2_uint_t y, const char *s) {
  // Output a serial command for the simulator to parse
  Serial.print("OLED:text:");
  Serial.print(s);
  Serial.print(":");
  Serial.print(x);
  Serial.print(":");
  Serial.println(y);
  
  return strlen(s) * 6; // Assuming 6-pixel wide characters
}

u8g2_uint_t U8G2::drawUTF8(u8g2_uint_t x, u8g2_uint_t y, const char *s) {
  return drawStr(x, y, s);
}

u8g2_uint_t U8G2::getStrWidth(const char *s) {
  return strlen(s) * 6; // Simplified calculation
}

u8g2_uint_t U8G2::getUTF8Width(const char *s) {
  return getStrWidth(s);
}

void U8G2::firstPage(void) {
  // Page mode implementation - for now just clear buffer
  clearBuffer();
}

uint8_t U8G2::nextPage(void) {
  // Page mode implementation - for now just send buffer and return 0
  sendBuffer();
  return 0;
}

size_t U8G2::write(uint8_t ch) {
  // Simple character output for Print interface
  if (ch == '\n') {
    ty += 10; // Move to next line
    tx = 0;
  } else if (ch >= 32) {
    // Draw character (simplified - just advance cursor)
    tx += 6;
    if (tx >= _width) {
      tx = 0;
      ty += 10;
    }
  }
  return 1;
}