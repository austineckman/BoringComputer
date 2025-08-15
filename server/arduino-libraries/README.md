# Arduino Libraries for Circuit Simulator

This directory contains Arduino libraries that are integrated with the circuit simulator. Each library is organized in its own subdirectory with proper metadata and examples.

## Library Structure

Each library directory should contain:
- **Source files** (.h and .cpp files)
- **library.json** - Metadata including functions, examples, and component mappings
- **README.md** (optional) - Additional documentation

## Current Libraries

### Keypad Library (v3.1.0)
- **Location**: `keypad/`
- **Component**: Custom 4x4 Keypad
- **Description**: Matrix keypad library supporting multiple keypresses
- **Files**: `Keypad.h`, `Keypad.cpp`, `Key.h`, `Key.cpp`
- **Key Functions**: `getKey()`, `getKeys()`, `isPressed()`, `setDebounceTime()`

### BasicEncoder Library (v1.1.4)
- **Location**: `basic-encoder/`
- **Component**: Rotary Encoder
- **Description**: Simple rotary encoder reading for control knobs (header-only)
- **Files**: `BasicEncoder.h`
- **Key Functions**: `service()`, `get_change()`, `get_count()`, `reset()`

## Adding New Libraries

When adding a new library:

1. Create a new directory with the library name (lowercase, hyphenated)
2. Add all source files (.h and .cpp)
3. Create a `library.json` metadata file with:
   - Library information (name, version, description, authors)
   - Component mappings (which circuit components use this library)
   - Function documentation (syntax, parameters, returns)
   - Example code snippets
   - Constants and enums

4. Update this README.md file
5. The library will automatically be available in the Arduino code editor

## Library Integration

Libraries are automatically:
- Made available as includes in the Arduino code editor
- Provided with autocomplete and syntax highlighting
- Linked to their corresponding circuit components
- Served with documentation and examples

## Planned Libraries

- **U8g2** - OLED Display library
- **TM1637** - 7-Segment Display library  
- **Wire/I2C** - I2C communication library
- **SPI** - SPI communication library

## File Naming Conventions

- Library directories: lowercase with hyphens (e.g., `keypad`, `u8g2-oled`)
- Source files: PascalCase matching Arduino conventions (e.g., `Keypad.h`, `U8g2lib.h`)
- Metadata: `library.json` (standardized)
- Documentation: `README.md` (optional)