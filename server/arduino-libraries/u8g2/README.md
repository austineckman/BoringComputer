# U8g2 - Simplified OLED Library

This is a streamlined version of the popular U8g2 library, focused on SSD1306 OLED displays connected via I2C. 

## About U8g2

U8g2 is a monochrome graphics library for embedded devices that supports many OLED and LCD controllers. This simplified version includes core functionality for:

- SSD1306 OLED displays (128x64 and 128x32)
- I2C communication
- Basic graphics primitives
- Text rendering
- Arduino Print interface compatibility

## Hardware Connection

For SSD1306 OLED displays over I2C:
- **VCC** → 3.3V or 5V
- **GND** → Ground  
- **SCL** → Arduino SCL pin (A5 on Uno)
- **SDA** → Arduino SDA pin (A4 on Uno)

## Supported Display Types

- **128x64 SSD1306** - Standard OLED module
- **128x32 SSD1306** - Compact OLED module

## Basic Usage

```cpp
#include <U8g2lib.h>
#include <Wire.h>

// Create display object
U8G2_SSD1306_128X64_NONAME_F_HW_I2C u8g2(/* reset=*/ U8X8_PIN_NONE);

void setup() {
  u8g2.begin();
}

void loop() {
  u8g2.clearBuffer();
  u8g2.drawStr(0, 20, "Hello World!");
  u8g2.sendBuffer();
  delay(1000);
}
```

## Key Functions

### Display Control
- `begin()` - Initialize display
- `clearBuffer()` - Clear drawing buffer
- `sendBuffer()` - Update display with buffer contents
- `clearDisplay()` - Clear display immediately

### Drawing Functions  
- `drawPixel(x, y)` - Draw single pixel
- `drawLine(x1, y1, x2, y2)` - Draw line
- `drawBox(x, y, w, h)` - Draw filled rectangle
- `drawFrame(x, y, w, h)` - Draw rectangle outline
- `drawCircle(x, y, r)` - Draw circle outline
- `drawDisc(x, y, r)` - Draw filled circle

### Text Functions
- `drawStr(x, y, text)` - Draw text string
- `setFont(font)` - Set text font
- `print()` - Arduino Print interface

### Display Settings
- `setContrast(value)` - Adjust brightness (0-255)
- `setPowerSave(enable)` - Sleep mode control
- `setDrawColor(color)` - Set drawing color (0=black, 1=white)

## Full U8g2 Library

For complete functionality with all supported displays and advanced features, install the full U8g2 library:
- Over 70 supported display controllers
- 700+ fonts included
- Advanced graphics functions
- Multiple communication interfaces

**Repository**: https://github.com/olikraus/u8g2

## License

BSD-2-Clause (same as original U8g2 library)