/*
  U8g2lib.h - Simplified U8g2 Arduino library for OLED displays
  
  This is a streamlined version of the U8g2 library focused on core OLED functionality.
  Full U8g2 library: https://github.com/olikraus/u8g2
  
  Copyright (c) 2016, olikraus@gmail.com
  Licensed under BSD-2-Clause
*/

#ifndef U8G2LIB_HH
#define U8G2LIB_HH

#include <Arduino.h>
#include <Print.h>
#include <Wire.h>
#include <SPI.h>

// Basic data types
typedef uint16_t u8g2_uint_t;
typedef int16_t u8g2_long_t;

// Draw color constants
#define U8G2_DRAW_COLOR_TRANSPARENT 0
#define U8G2_DRAW_COLOR_OPAQUE 1

// Font positioning
#define U8G2_FONT_POS_BASELINE 0
#define U8G2_FONT_POS_BOTTOM 1
#define U8G2_FONT_POS_TOP 2
#define U8G2_FONT_POS_CENTER 3

// Common display sizes
#define U8G2_SSD1306_128X64_WIDTH 128
#define U8G2_SSD1306_128X64_HEIGHT 64
#define U8G2_SSD1306_128X32_WIDTH 128
#define U8G2_SSD1306_128X32_HEIGHT 32

class U8G2 : public Print {
  private:
    uint8_t _width;
    uint8_t _height;
    uint8_t _buffer[1024]; // Buffer for 128x64 display (1024 bytes)
    uint8_t _draw_color;
    uint8_t _font_mode;
    uint8_t _font_direction;
    uint8_t _i2c_address;
    
    // Display state
    bool _display_enabled;
    uint8_t _contrast;
    uint8_t _flip_mode;
    
    void sendCommand(uint8_t cmd);
    void sendData(uint8_t data);
    
  public:
    // Constructor
    U8G2(void);
    
    // Basic setup and control
    bool begin(void);
    void initDisplay(void);
    void clearDisplay(void);
    void setPowerSave(uint8_t is_enable);
    void setContrast(uint8_t value);
    void setFlipMode(uint8_t mode);
    void setI2CAddress(uint8_t adr);
    
    // Display dimensions
    u8g2_uint_t getDisplayHeight(void) { return _height; }
    u8g2_uint_t getDisplayWidth(void) { return _width; }
    
    // Buffer management
    void sendBuffer(void);
    void clearBuffer(void);
    void firstPage(void);
    uint8_t nextPage(void);
    
    // Drawing functions
    void setDrawColor(uint8_t color_index);
    uint8_t getDrawColor(void);
    void drawPixel(u8g2_uint_t x, u8g2_uint_t y);
    void drawHLine(u8g2_uint_t x, u8g2_uint_t y, u8g2_uint_t w);
    void drawVLine(u8g2_uint_t x, u8g2_uint_t y, u8g2_uint_t h);
    void drawLine(u8g2_uint_t x1, u8g2_uint_t y1, u8g2_uint_t x2, u8g2_uint_t y2);
    
    // Shapes
    void drawFrame(u8g2_uint_t x, u8g2_uint_t y, u8g2_uint_t w, u8g2_uint_t h);
    void drawBox(u8g2_uint_t x, u8g2_uint_t y, u8g2_uint_t w, u8g2_uint_t h);
    void drawRFrame(u8g2_uint_t x, u8g2_uint_t y, u8g2_uint_t w, u8g2_uint_t h, u8g2_uint_t r);
    void drawRBox(u8g2_uint_t x, u8g2_uint_t y, u8g2_uint_t w, u8g2_uint_t h, u8g2_uint_t r);
    void drawCircle(u8g2_uint_t x0, u8g2_uint_t y0, u8g2_uint_t rad);
    void drawDisc(u8g2_uint_t x0, u8g2_uint_t y0, u8g2_uint_t rad);
    
    // Text functions
    void setFont(const uint8_t *font);
    void setFontMode(uint8_t is_transparent);
    void setFontDirection(uint8_t dir);
    void setFontPosBaseline(void);
    void setFontPosBottom(void);
    void setFontPosTop(void);
    void setFontPosCenter(void);
    
    u8g2_uint_t drawStr(u8g2_uint_t x, u8g2_uint_t y, const char *s);
    u8g2_uint_t drawUTF8(u8g2_uint_t x, u8g2_uint_t y, const char *s);
    u8g2_uint_t getStrWidth(const char *s);
    u8g2_uint_t getUTF8Width(const char *s);
    
    // Print interface implementation
    virtual size_t write(uint8_t ch);
    
    // Cursor management for Print interface
    u8g2_uint_t tx, ty;
    void setCursor(u8g2_uint_t x, u8g2_uint_t y) { tx = x; ty = y; }
    void home(void) { tx = 0; ty = 0; }
};

// Common display constructors for different SSD1306 configurations
class U8G2_SSD1306_128X64_NONAME_F_HW_I2C : public U8G2 {
  public:
    U8G2_SSD1306_128X64_NONAME_F_HW_I2C() : U8G2() { 
      _width = 128; 
      _height = 64; 
      _i2c_address = 0x3C;
    }
};

class U8G2_SSD1306_128X32_UNIVISION_F_HW_I2C : public U8G2 {
  public:
    U8G2_SSD1306_128X32_UNIVISION_F_HW_I2C() : U8G2() { 
      _width = 128; 
      _height = 32; 
      _i2c_address = 0x3C;
    }
};

// Basic font (simplified)
extern const uint8_t u8g2_font_6x10_tf[];

#endif // U8G2LIB_HH