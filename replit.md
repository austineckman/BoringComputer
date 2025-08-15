# Inventr Circuit Builder Platform

## Overview
Inventr is an educational platform for electronics and maker education, combining interactive circuit building, simulation, and gamified learning. It offers a comprehensive STEM learning experience with features like quests, an inventory system, and character progression. The platform aims to make learning about electronics engaging and accessible, supporting both individual learning and collaborative features through project sharing.

## User Preferences
Preferred communication style: Simple, everyday language.
Platform compatibility: Works on Windows, compatibility issues noted on Mac.

## System Architecture
### Backend Architecture
- **Framework**: Node.js with Express.js.
- **Database**: PostgreSQL with Drizzle ORM for type-safe operations.
- **Authentication**: Custom session-based authentication with bcrypt for secure password hashing and Express-session for persistent sessions.
- **API Design**: RESTful endpoints organized by feature domains.

### Frontend Architecture
- **Framework**: React with TypeScript.
- **Build Tool**: Vite for development and optimized builds.
- **UI Components**: ShadCN UI built on Radix UI primitives, styled with TailwindCSS for a pixel art and retro gaming aesthetic.
- **State Management**: TanStack Query for server state management.
- **Routing**: Wouter for client-side routing.
- **UI/UX Decisions**: Incorporates a retro Windows 95 aesthetic, pixel art gold coin assets, CS:GO-inspired lootbox animations, and RuneScape-style quest interfaces. Wire drawing uses a click-based system with smooth Bezier curves for a natural, hand-drawn look.

### Circuit Simulation Engine
- **Core Technology**: AVR8js for authentic Arduino microcontroller emulation.
- **Architecture**: Worker-based to prevent UI blocking.
- **Component System**: Modular library with visual representations, supporting multi-pin components and real-time state updates (e.g., RGB LEDs, DipSwitches).
- **Code Editor**: Monaco Editor integration for an Arduino IDE-like experience, supporting comprehensive Arduino function libraries, advanced C++ syntax, and variable declaration.
- **Simulator Capabilities**: Implements `analogRead()`, `digitalRead()`, `tone()`, `noTone()`, I2C/Wire library, OLED display functions, 7-segment display support, `analogWrite()` (PWM), and multi-hop circuit tracing for realistic resistor-based circuits.

### Key Features and System Design
- **Authentication & User Management**: Secure session management, role-based access control, user profiles with XP, levels, and inventory tracking. Includes Discord OAuth integration for roles.
- **Quest System**: Supports sequential quest unlocking, tab-based filtering, visual locking, and numbering. Features an admin panel (Oracle) for creation, management, reordering, and solution helper integration (code, wiring instructions, diagrams). Quest cards are redesigned with hero images, component requirements, and reward visualizations.
- **Inventory & Crafting System**: Manages six primary resource types, supports recipe-based crafting, and includes a loot box system with rarity-based rewards and authentic animation.
- **Circuit Builder & Simulation**: Visual drag-and-drop builder, real-time Arduino simulation, and project saving/sharing.
- **Arduino Library Management System (Added Aug 15, 2025)**: Comprehensive library storage and API system at `server/arduino-libraries/` with organized directory structure, metadata files (`library.json`), keywords.txt for IDE syntax highlighting, and RESTful endpoints. Currently includes four production-ready libraries: Keypad (v3.1.0) for 4x4 matrix keypads, BasicEncoder (v1.1.4) for rotary encoder knobs, TM1637Display (v1.4.0) for 4-digit 7-segment LED displays, and U8g2 (v2.36.12) for SSD1306 OLED displays with graphics and text capabilities. All libraries include comprehensive function documentation, practical examples, component mappings, and complete Arduino IDE integration.
- **Educational Content Management**: Tools for quest creation, component kit management, and progress tracking. Includes an educational wire color guide.
- **Branding Consolidation**: Standardized branding across the platform, including "BMAH (Black Market Auction House)" instead of pirate themes, and professional UI designs for various interfaces.
- **Wire Positioning System (RESOLVED Aug 14, 2025)**: All circuit components now use a unified coordinate system for precise wire attachment alignment using direct clientX/clientY coordinates and proper JSON pin data parsing.
- **OLED Visual Display System (COMPLETED Aug 15, 2025)**: Fully functional OLED simulation with real-time visual output. Supports U8g2 library functions including drawStr(), drawFrame(), drawCircle(), and drawDisc(). Features white text rendering on black background with proper canvas-based display that overlays the physical OLED component. Enhanced Arduino code parsing with comprehensive parameter extraction and visual debugging capabilities.

## External Dependencies
### Production Dependencies
- **Authentication**: `bcrypt`, `express-session`.
- **Database**: `@neondatabase/serverless` (PostgreSQL).
- **Circuit Simulation**: `AVR8js`.
- **Code Editor**: `Monaco Editor`.
- **UI Framework**: `React`, `TailwindCSS`, `Radix UI`.
- **File Processing**: `Multer` for file uploads.

### Development Dependencies
- **Build Tools**: `Vite`, `TypeScript`, `ESBuild`.
- **Database Management**: `Drizzle ORM` and `Drizzle Kit`.
- **Code Quality**: `ESLint`.