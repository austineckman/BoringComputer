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
- **Founder Role Admin Mapping**: Anyone with "Founder" Discord role automatically gets admin privileges in CraftingTable OS
- Fixed role authentication to properly fetch and display real Discord server roles in profile window

### Authentication Endpoint Fix (July 10, 2025)
- Fixed critical authentication endpoint mismatch between frontend and backend
- Frontend was calling `/api/auth/user` but backend only provides `/api/auth/me`
- Updated all frontend authentication hooks to use correct `/api/auth/me` endpoint
- This resolves Oracle access control system to properly recognize admin privileges
- Backend logs confirm user session has proper roles: ['CraftingTable', 'Founder', 'Academy', 'Server Booster', 'admin']

### Discord Role Database Sync Fix (July 13, 2025)
- **Root Cause Identified**: Discord OAuth role fetching failed during initial authentication, leaving user with empty roles `[]` in database
- Fixed by directly updating user roles in database using SQL: `UPDATE users SET roles = '["admin", "Founder", "CraftingTable", "Academy", "Server Booster"]'::json`
- Session deserialization now correctly shows all Discord roles instead of empty array
- Oracle icon now properly appears for admin users with Founder role
- This ensures campaign automation interface access for authorized users

### Direct Quest Creation Workflow (July 13, 2025)
- **Complete Context Menu Removal**: Eliminated popup context menu system that was interrupting workflow
- **Streamlined Quest Creation**: Plus button now instantly creates connected quests with automatic positioning
- **Automatic Wire Connections**: New quests automatically connect to parent quests with visual connection lines
- **Proper Kit Integration**: Fixed quest filtering by ensuring new quests have proper component requirements for selected kit
- **Enhanced User Experience**: Direct creation eliminates popup interruptions, provides 350px horizontal spacing, and slight vertical offset for visual variety

### Shop Rebranding (July 13, 2025)
- **Renamed Shop Interface**: Changed "Shop" to "BMAH (Black Market Auction House)" in RetroDesktop component
- Updated both desktop icon instances to reflect new branding
- Maintains existing shop functionality while providing more immersive gaming nomenclature

### Gizbo's Scraplight Cartel UI Redesign (July 13, 2025)
- **Complete UI Modernization**: Rebuilt interface from scratch with clean, modern design replacing cluttered pirate theme
- **Authentic Character Integration**: Properly implemented Gizbo as "Chaotic Good Inventor" from Scraplight Cartel per established lore
- **Professional Visual Design**: Clean white background, card-based layout, responsive grid system for auction listings
- **Correct Lore Implementation**: "Great Collapse" dimensional rifts, reality-breaking gadgets, "scrap" currency, inventor personality
- **Character Portrait Placeholder**: Added dedicated space for Gizbo's image surrounded by workshop/loot aesthetic
- **Streamlined Experience**: Removed confusing pirate terminology, simplified navigation, modern loading states and interactions

### GitHub Repository Setup (July 13, 2025)
- **Repository Preparation**: Updated .gitignore with comprehensive exclusions for environment variables and build artifacts
- **Documentation Update**: Enhanced README.md with proper CraftingTable OS branding and Discord integration details
- **Setup Automation**: Created setup-github.sh script for easy repository initialization and GitHub connection
- **Setup Guide**: Added comprehensive GITHUB_SETUP.md with step-by-step instructions for repository creation and deployment
- **Project Structure**: Documented complete project architecture including Discord OAuth setup and environment variables

### Active Quest Screen Implementation (July 15, 2025)
- **Tutorial-Style Learning Interface**: Created comprehensive active quest screen with educational focus
- **Video Tutorial Integration**: Added video player section at top for step-by-step learning content
- **Circuit Result Display**: Implemented expected result section showing circuit GIFs and demonstrations
- **Discord Community Integration**: Added comment system with replies, reactions, and real-time Discord member interaction
- **Timed Solution Helper**: Implemented 5-minute timer that unlocks solution cheat with code and wiring instructions
- **Quest Management**: Added complete quest, abandon quest, and return to list functionality
- **Backend API Support**: Created REST endpoints for comments, reactions, quest completion, and abandonment

### Shopkeeper System (July 10, 2025)
- Redesigned shop from external website to in-app shopkeeper window
- Created ShopWindow component with Keymaster character selling Keys for 100 gold each
- Added interactive shopkeeper dialogue system with randomized responses
- Implemented purchase API endpoint `/api/shop/purchase` with inventory management
- Shop features multiple purchase options (1, 5, or 10 keys) with proper gold validation
- Integrated with user inventory system for real-time gold and key tracking

### Component Kit Visualization Enhancement (July 13, 2025)
- Added large component kit images to quest system for clear kit identification
- Kit images display prominently above adventure lines in main quest view
- When viewing specific adventure line, kit image appears at top with kit name and description
- Images use pixel art rendering to maintain retro aesthetic
- Responsive design adapts to different screen sizes
- Visual enhancement helps users understand which hardware kit is needed for each quest series

### Major Emulator Cleanup (July 10, 2025)
- **MASSIVE CLEANUP**: Removed 18+ broken/competing emulator implementations that were causing confusion
- Deleted: CleanEmulator, DirectEmulatorLogger, DirectFixedEmulator, EmergencyFixedEmulator, FixedEmulatorConnector, ForcedLEDComponent, HeroEmulator, HeroEmulatorConnector, MinimalEmulator, RealAVR8EmulatorConnector, ReliableEmulator, SimpleEmulator, StandaloneBlinker, VisibleLEDComponent, WorkingEmulator, EmulatedButtonComponent, EmulatedLEDComponent, EmulatedOLEDComponent, UniversalEmulatorApp
- Removed broken simulator implementations: AVR8Simulator, ProperAVR8Simulator, RealSimulatorContext
- Cleaned up broken test pages and routes: emulator-test.tsx, clean-emulator.tsx, EmulatorLauncher.tsx
- Fixed broken imports in App.tsx and CircuitBuilderWindow.tsx
- **Goal**: Consolidate to ONE working emulator implementation instead of 18+ broken ones
- **Next**: Build single, clean BasicEmulator as the definitive sandbox emulator

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