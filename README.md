# CraftingTable OS - Electronics Learning Platform

A comprehensive educational platform combining electronics learning with gamified experiences, featuring interactive circuit building, quest systems, and the Scraplight Cartel's treasure distribution network led by Gizbo Sparkwrench.

## Overview

CraftingTable OS is a cutting-edge educational platform that transforms electronics learning through gamification, featuring:

- **Interactive Circuit Builder**: Real Arduino simulation with AVR8js
- **Quest System**: Gamified learning with XP, levels, and adventure lines
- **Scraplight Cartel**: Gizbo's treasure auction system for rare components
- **Discord Integration**: Role-based authentication and community features
- **Retro Desktop Environment**: Windows 95-inspired interface with modern functionality
- **Inventory & Crafting**: RPG-style material collection and equipment crafting

## Technology Stack

- **Frontend**: TypeScript, React, Vite, TailwindCSS, ShadCN UI components
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Discord OAuth integration with role-based access control
- **Circuit Simulation**: AVR8js for real Arduino microcontroller emulation
- **UI Framework**: Retro desktop environment with Windows 95 aesthetics
- **Real-time Features**: Quest system with live inventory management

## Security Features

This application implements various security best practices, including:

- **CSRF Protection**: All state-changing API requests require a valid CSRF token
- **Content Security Policy**: Strict CSP headers to prevent XSS attacks
- **Secure File Uploads**: Comprehensive file validation, type checking, and sanitization
- **Secure Password Storage**: Bcrypt password hashing with proper salting
- **Session Security**: HTTP-only cookies with secure settings and proper expiration
- **Input Validation**: Server-side validation for all user input
- **XSS Protection**: Headers and content sanitization to prevent cross-site scripting

## Installation

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+

### Setup

1. Clone the repository:
   ```
   git clone https://github.com/austineckman/BoringComputer.git
   cd BoringComputer
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up the database:
   ```
   npm run db:push
   ```

4. Start the development server:
   ```
   npm run dev
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/craftingtable

# Discord OAuth
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
DISCORD_BOT_TOKEN=your-discord-bot-token
DISCORD_GUILD_ID=your-discord-server-id

# Session Secret
SESSION_SECRET=your-secret-key-here

# Node Environment
NODE_ENV=development
```

> **Note**: You'll need to set up a Discord application and bot to get the OAuth credentials. See the Discord Integration section below.

## Project Structure

- `/client` - Frontend React application with retro desktop interface
- `/server` - Express backend API with Discord integration
- `/shared` - Shared TypeScript schemas and utilities
- `/public` - Static assets and icons
- `/attached_assets` - Project resources and lore documents

## Discord Integration

CraftingTable OS uses Discord for authentication and role management:

1. **Create a Discord Application**:
   - Go to https://discord.com/developers/applications
   - Create a new application
   - Note your Client ID and Client Secret

2. **Create a Discord Bot**:
   - In your application, go to the Bot section
   - Create a bot and note the Bot Token
   - Enable all necessary intents

3. **Set up OAuth2**:
   - In OAuth2 section, add your callback URL
   - For development: `http://localhost:5000/api/callback`
   - Grant necessary scopes: `identify`, `email`, `guilds`

4. **Role Mapping**:
   - "Founder" Discord role automatically grants admin privileges
   - Custom role mapping available in `server/auth.ts`

## Key Features

### Gizbo's Scraplight Cartel
- Reality-bending component auction system
- Authentic character lore from the Great Collapse
- Dimension-cracking relics distribution network

### Quest System
- Adventure lines with sequential progression
- XP-based leveling and material rewards
- Component kit integration for hands-on learning

### Circuit Builder
- Real Arduino simulation using AVR8js
- Visual component library with drag-and-drop interface
- Monaco Editor integration for code development

## Security Overview

### CSRF Protection

The application uses a custom CSRF token implementation that:

1. Generates unique tokens per session
2. Requires tokens for all state-changing operations (POST, PUT, DELETE)
3. Implements proper token validation and error handling

### File Upload Security

File uploads are protected through:

1. File type validation (both MIME type and magic numbers)
2. Size limits on uploads
3. Secure random filename generation
4. Content validation for uploaded files

### API Security

All API endpoints implement:

1. Proper authentication checking
2. Input validation
3. Rate limiting for sensitive operations
4. Error handling that doesn't leak sensitive information

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[MIT License](LICENSE)

## Acknowledgments

- [Inventr.io](https://inventr.io/) for inspiration
- [AVR8js](https://github.com/wokwi/avr8js) for the Arduino simulation
- All open source libraries and tools used in this project