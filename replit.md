# Inventr Circuit Builder Platform

## Overview

This is a comprehensive educational platform for electronics and maker education, featuring interactive circuit building, simulation, and gamified learning experiences. The platform combines traditional STEM learning with modern gamification elements including quests, inventory systems, and character progression.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### Profile Window Retro Integration (July 10, 2025)
- Fixed architectural issue with duplicate popup windows in profile system
- Converted ProfileWindow from modal overlay to proper retro window system integration
- Redesigned profile UI to match retro Windows 95 aesthetic with proper borders and inset styling
- Profile now opens as single retro-style window instead of creating competing modal overlay
- Maintained all profile functionality: user stats, title selection, Discord role display

### Discord OAuth Role Integration (July 10, 2025)
- Successfully implemented Discord OAuth authentication with proper Replit domain callback
- Added Discord bot integration for server role fetching using bot token
- Created role mapping system from Discord server roles to app permissions (admin, moderator, premium, user)
- Added debug endpoints for troubleshooting Discord role issues
- System now fetches real Discord roles instead of using placeholder roles

## System Architecture

### Backend Architecture
- **Framework**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Custom session-based authentication with secure password hashing using bcrypt
- **Session Management**: Express-session with PostgreSQL store for persistent sessions
- **API Design**: RESTful endpoints organized by feature domains

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Components**: ShadCN UI components built on Radix UI primitives
- **Styling**: TailwindCSS with custom pixel art and retro gaming aesthetics
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing

### Circuit Simulation Engine
- **Core Technology**: AVR8js for real Arduino microcontroller emulation
- **Architecture**: Worker-based simulation engine to prevent UI blocking
- **Component System**: Modular component library with visual representations
- **Code Editor**: Monaco Editor integration for Arduino IDE-like experience

## Key Components

### Authentication & User Management
- Secure password storage with bcrypt hashing and salt
- Session-based authentication with HTTP-only cookies
- Role-based access control (admin/user permissions)
- User profiles with XP, levels, and inventory tracking

### Quest System
- Daily challenge system with quest-of-the-day functionality
- Adventure lines for sequential quest progression
- XP-based leveling system with material rewards
- Admin panel for quest creation and management

### Inventory & Crafting System
- Six primary resource types: cloth, metal, tech scrap, sensor crystal, circuit board, alchemy ink
- Recipe-based crafting system with pattern matching
- Loot box system with rarity-based rewards
- Character equipment slots for gear progression

### Circuit Builder & Simulation
- Visual circuit builder with drag-and-drop components
- Real-time Arduino simulation using AVR8js
- Component library with LEDs, displays, sensors, and input devices
- Code editor with syntax highlighting and error detection
- Project saving and sharing capabilities

### Educational Content Management
- Quest creation tools with AI-powered content generation
- Component kit management system
- Educational resource organization
- Progress tracking and achievement system

## Data Flow

1. **User Authentication**: Users log in through secure session-based authentication
2. **Quest Assignment**: Daily quests are assigned based on adventure lines and user progress
3. **Circuit Building**: Users build circuits using the visual editor and write Arduino code
4. **Simulation Execution**: AVR8js worker processes execute the compiled code and update component states
5. **Submission & Rewards**: Completed quests award XP and materials to user inventory
6. **Crafting & Progression**: Users craft equipment and progress through levels

## External Dependencies

### Production Dependencies
- **Authentication**: bcrypt for password hashing, express-session for session management
- **Database**: @neondatabase/serverless for PostgreSQL connectivity
- **Circuit Simulation**: AVR8js for Arduino emulation
- **Code Editor**: Monaco Editor for Arduino IDE experience
- **UI Framework**: React, TailwindCSS, Radix UI components
- **File Processing**: Multer for secure file uploads

### Development Dependencies
- **Build Tools**: Vite, TypeScript, ESBuild
- **Database Management**: Drizzle ORM and Drizzle Kit for migrations
- **Code Quality**: ESLint, TypeScript strict mode

## Deployment Strategy

### Development Environment
- Local development with Vite hot module replacement
- PostgreSQL database (local or cloud)
- Environment variables for configuration
- Replit integration for collaborative development

### Production Considerations
- **Security**: CSRF protection, XSS prevention, secure headers
- **Performance**: Worker-based simulation, optimized builds
- **Scalability**: Session store in database, stateless API design
- **Monitoring**: Request logging, error tracking

### Database Schema
- User management with roles and inventory
- Quest system with components and rewards
- Circuit projects with sharing capabilities
- Crafting recipes and item definitions
- Achievement tracking and progression

The platform is designed to be modular and extensible, with clear separation between the educational content management system, the circuit simulation engine, and the gamification layer. The architecture supports both individual learning and collaborative features through the sharing system.