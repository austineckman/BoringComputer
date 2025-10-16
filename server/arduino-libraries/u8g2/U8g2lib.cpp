
/*
  U8g2lib.cpp - Simplified U8g2 Arduino library implementation
  
  This is a streamlined version focused on SSD1306 OLED displays over I2C.
  For full functionality, use the complete U8g2 library.
*/

#include "U8g2lib.h"
#include <emscripten.h>

// External JavaScript function to update display
EM_JS(void, js_update_oled_display, (const char* display_id, const char* json_data), {
  const displayIdStr = UTF8ToString(display_id);
  const jsonStr = UTF8ToString(json_data);
  
  try {
    const data = JSON.parse(jsonStr);
    
    // Send to simulator context
    if (window.simulatorContext) {
      window.simulatorContext.updateOLEDDisplay(displayIdStr, data);
    }
    
    console.log('[U8g2 Native] Updated OLED display:', displayIdStr, data);
  } catch (e) {
    console.error('[U8g2 Native] Error updating display:', e);
  }
});

// Simple 6x10 font data (basic ASCII characters)
const uint8_t u8g2_font_6x10_tf[] = {
  0, 0, 0, 0, 0, 10, 0, 0, 0, 0, 6, 10, 0, 0, 0, 0,
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
  _element_count = 0;
  
  // Generate unique display ID based on memory address
  static int display_counter = 0;
  snprintf(_display_id, sizeof(_display_id), "oled-display-%d", display_counter++);
}

bool U8G2::begin(void) {
  Wire.begin();
  clearDisplay();
  setPowerSave(0);
  
  // Notify simulator that display is initialized
  char json[256];
  snprintf(json, sizeof(json), "{\"initialized\":true,\"width\":%d,\"height\":%d}", _width, _height);
  js_update_oled_display(_display_id, json);
  
  Serial.print("[U8g2] Display initialized: ");
  Serial.println(_display_id);
  
  return true;
}

void U8G2::sendCommand(uint8_t cmd) {
  Wire.beginTransmission(_i2c_address);
  Wire.write(0x00);
  Wire.write(cmd);
  Wire.endTransmission();
}

void U8G2::sendData(uint8_t data) {
  Wire.beginTransmission(_i2c_address);
  Wire.write(0x40);
  Wire.write(data);
  Wire.endTransmission();
}

void U8G2::clearDisplay(void) {
  clearBuffer();
  sendBuffer();
}

void U8G2::clearBuffer(void) {
  memset(_buffer, 0, sizeof(_buffer));
  _element_count = 0;
}

void U8G2::sendBuffer(void) {
  // Build JSON with all drawing elements
  char json[4096];
  int offset = snprintf(json, sizeof(json), "{\"elements\":[");
  
  for (int i = 0; i < _element_count && i < MAX_ELEMENTS; i++) {
    DisplayElement &elem = _elements[i];
    
    if (i > 0) offset += snprintf(json + offset, sizeof(json) - offset, ",");
    
    switch (elem.type) {
      case ELEM_TEXT:
        offset += snprintf(json + offset, sizeof(json) - offset,
          "{\"type\":\"text\",\"x\":%d,\"y\":%d,\"text\":\"%s\"}",
          elem.x, elem.y, elem.text);
        break;
      case ELEM_PIXEL:
        offset += snprintf(json + offset, sizeof(json) - offset,
          "{\"type\":\"pixel\",\"x\":%d,\"y\":%d}",
          elem.x, elem.y);
        break;
      case ELEM_LINE:
        offset += snprintf(json + offset, sizeof(json) - offset,
          "{\"type\":\"line\",\"x1\":%d,\"y1\":%d,\"x2\":%d,\"y2\":%d}",
          elem.x, elem.y, elem.x2, elem.y2);
        break;
      case ELEM_FRAME:
        offset += snprintf(json + offset, sizeof(json) - offset,
          "{\"type\":\"frame\",\"x\":%d,\"y\":%d,\"width\":%d,\"height\":%d}",
          elem.x, elem.y, elem.width, elem.height);
        break;
      case ELEM_BOX:
        offset += snprintf(json + offset, sizeof(json) - offset,
          "{\"type\":\"filledRect\",\"x\":%d,\"y\":%d,\"width\":%d,\"height\":%d}",
          elem.x, elem.y, elem.width, elem.height);
        break;
      case ELEM_CIRCLE:
        offset += snprintf(json + offset, sizeof(json) - offset,
          "{\"type\":\"circle\",\"x\":%d,\"y\":%d,\"radius\":%d}",
          elem.x, elem.y, elem.radius);
        break;
      case ELEM_DISC:
        offset += snprintf(json + offset, sizeof(json) - offset,
          "{\"type\":\"filledCircle\",\"x\":%d,\"y\":%d,\"radius\":%d}",
          elem.x, elem.y, elem.radius);
        break;
    }
  }
  
  offset += snprintf(json + offset, sizeof(json) - offset, "]}");
  
  // Send to JavaScript
  js_update_oled_display(_display_id, json);
  
  Serial.print("[U8g2] Sent ");
  Serial.print(_element_count);
  Serial.println(" elements to display");
}

void U8G2::setPowerSave(uint8_t is_enable) {
  _display_enabled = !is_enable;
  sendCommand(is_enable ? 0xAE : 0xAF);
}

void U8G2::setContrast(uint8_t value) {
  _contrast = value;
}

void U8G2::setFlipMode(uint8_t mode) {
  _flip_mode = mode;
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
  if (_element_count >= MAX_ELEMENTS) return;
  
  DisplayElement &elem = _elements[_element_count++];
  elem.type = ELEM_PIXEL;
  elem.x = x;
  elem.y = y;
}

void U8G2::drawHLine(u8g2_uint_t x, u8g2_uint_t y, u8g2_uint_t w) {
  if (_element_count >= MAX_ELEMENTS) return;
  
  DisplayElement &elem = _elements[_element_count++];
  elem.type = ELEM_LINE;
  elem.x = x;
  elem.y = y;
  elem.x2 = x + w;
  elem.y2 = y;
}

void U8G2::drawVLine(u8g2_uint_t x, u8g2_uint_t y, u8g2_uint_t h) {
  if (_element_count >= MAX_ELEMENTS) return;
  
  DisplayElement &elem = _elements[_element_count++];
  elem.type = ELEM_LINE;
  elem.x = x;
  elem.y = y;
  elem.x2 = x;
  elem.y2 = y + h;
}

void U8G2::drawLine(u8g2_uint_t x1, u8g2_uint_t y1, u8g2_uint_t x2, u8g2_uint_t y2) {
  if (_element_count >= MAX_ELEMENTS) return;
  
  DisplayElement &elem = _elements[_element_count++];
  elem.type = ELEM_LINE;
  elem.x = x1;
  elem.y = y1;
  elem.x2 = x2;
  elem.y2 = y2;
}

void U8G2::drawFrame(u8g2_uint_t x, u8g2_uint_t y, u8g2_uint_t w, u8g2_uint_t h) {
  if (_element_count >= MAX_ELEMENTS) return;
  
  DisplayElement &elem = _elements[_element_count++];
  elem.type = ELEM_FRAME;
  elem.x = x;
  elem.y = y;
  elem.width = w;
  elem.height = h;
}

void U8G2::drawBox(u8g2_uint_t x, u8g2_uint_t y, u8g2_uint_t w, u8g2_uint_t h) {
  if (_element_count >= MAX_ELEMENTS) return;
  
  DisplayElement &elem = _elements[_element_count++];
  elem.type = ELEM_BOX;
  elem.x = x;
  elem.y = y;
  elem.width = w;
  elem.height = h;
}

void U8G2::drawRFrame(u8g2_uint_t x, u8g2_uint_t y, u8g2_uint_t w, u8g2_uint_t h, u8g2_uint_t r) {
  drawFrame(x, y, w, h);
}

void U8G2::drawRBox(u8g2_uint_t x, u8g2_uint_t y, u8g2_uint_t w, u8g2_uint_t h, u8g2_uint_t r) {
  drawBox(x, y, w, h);
}

void U8G2::drawCircle(u8g2_uint_t x0, u8g2_uint_t y0, u8g2_uint_t rad) {
  if (_element_count >= MAX_ELEMENTS) return;
  
  DisplayElement &elem = _elements[_element_count++];
  elem.type = ELEM_CIRCLE;
  elem.x = x0;
  elem.y = y0;
  elem.radius = rad;
}

void U8G2::drawDisc(u8g2_uint_t x0, u8g2_uint_t y0, u8g2_uint_t rad) {
  if (_element_count >= MAX_ELEMENTS) return;
  
  DisplayElement &elem = _elements[_element_count++];
  elem.type = ELEM_DISC;
  elem.x = x0;
  elem.y = y0;
  elem.radius = rad;
}

void U8G2::setFont(const uint8_t *font) {
  // Font handling simplified
}

void U8G2::setFontMode(uint8_t is_transparent) {
  _font_mode = is_transparent;
}

void U8G2::setFontDirection(uint8_t dir) {
  _font_direction = dir;
}

void U8G2::setFontPosBaseline(void) {}
void U8G2::setFontPosBottom(void) {}
void U8G2::setFontPosTop(void) {}
void U8G2::setFontPosCenter(void) {}

u8g2_uint_t U8G2::drawStr(u8g2_uint_t x, u8g2_uint_t y, const char *s) {
  if (_element_count >= MAX_ELEMENTS) return 0;
  
  DisplayElement &elem = _elements[_element_count++];
  elem.type = ELEM_TEXT;
  elem.x = x;
  elem.y = y;
  strncpy(elem.text, s, sizeof(elem.text) - 1);
  elem.text[sizeof(elem.text) - 1] = '\0';
  
  Serial.print("[U8g2] drawStr: '");
  Serial.print(s);
  Serial.print("' at (");
  Serial.print(x);
  Serial.print(", ");
  Serial.print(y);
  Serial.println(")");
  
  return strlen(s) * 6;
}

u8g2_uint_t U8G2::drawUTF8(u8g2_uint_t x, u8g2_uint_t y, const char *s) {
  return drawStr(x, y, s);
}

u8g2_uint_t U8G2::getStrWidth(const char *s) {
  return strlen(s) * 6;
}

u8g2_uint_t U8G2::getUTF8Width(const char *s) {
  return getStrWidth(s);
}

void U8G2::firstPage(void) {
  clearBuffer();
}

uint8_t U8G2::nextPage(void) {
  sendBuffer();
  return 0;
}

size_t U8G2::write(uint8_t ch) {
  if (ch == '\n') {
    ty += 10;
    tx = 0;
  } else if (ch >= 32) {
    tx += 6;
    if (tx >= _width) {
      tx = 0;
      ty += 10;
    }
  }
  return 1;
}
