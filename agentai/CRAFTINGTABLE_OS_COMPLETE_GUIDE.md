
<old_str></old_str>
<new_str># CraftingTable OS - Complete System Documentation

## System Overview

**CraftingTable OS** is a retro desktop environment inspired by Windows 95, built as an educational platform for electronics learning and gamified STEM education. It combines a nostalgic user interface with modern web technologies to create an immersive learning experience.

## Core Architecture

### Frontend Stack
- **React 18 + TypeScript**: Component-based UI framework
- **Vite**: Lightning-fast build tool and dev server
- **TailwindCSS**: Utility-first styling framework
- **ShadCN UI**: High-quality component library
- **Monaco Editor**: VS Code-like code editing capabilities

### Backend Stack
- **Node.js + Express**: RESTful API server
- **PostgreSQL + Drizzle ORM**: Type-safe database operations
- **Discord OAuth 2.0**: Authentication and role management
- **Session-based Auth**: Secure user state management

### Key Technologies
- **AVR8js**: Real Arduino microcontroller simulation
- **Canvas-based Rendering**: Custom circuit builder interface
- **Drag & Drop API**: Interactive component placement
- **Web Audio API**: Immersive sound system

## Desktop Environment

### Window Management System

The OS features a complete window manager with:

```typescript
interface Window {
  id: string;
  title: string;
  content: ReactNode;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMaximized: boolean;
  isMinimized: boolean;
  zIndex: number;
  icon?: string;
  isResizable: boolean;
}
```

**Core Features:**
- Multi-window support with overlapping management
- Drag & drop window positioning
- Resize handles on all corners and edges
- Minimize/maximize/close controls
- Taskbar with window switching
- Alt+Tab window cycling
- Right-click context menus

### Start Menu System

The retro start menu provides access to:
- **Programs**: All installed applications
- **Settings**: System configuration
- **Help**: Documentation and support
- **Shut Down**: System logout/restart

### Taskbar Components

- **Start Button**: Opens the main system menu
- **Quick Launch**: Frequently used application shortcuts
- **Window Buttons**: Active application management
- **System Tray**: Background services and notifications
- **Clock**: Current time display

## Core Applications

### 1. Circuit Builder Pro
**Purpose**: Visual circuit design and Arduino simulation

**Features:**
- Drag-and-drop component placement
- Real-time circuit simulation using AVR8js
- Component library (LEDs, resistors, sensors, etc.)
- Wire routing with automatic connection detection
- Arduino code integration with Monaco Editor
- Serial monitor for debugging
- Component property editor
- Save/load circuit projects

**Technical Implementation:**
- Canvas-based rendering for performance
- SVG components for scalability
- Pin connection validation
- Real-time electrical simulation
- Component state management

### 2. Gizbo's Forge (Crafting System)
**Purpose**: Item crafting and resource management

**Features:**
- 3x3 crafting grid interface
- Drag-and-drop recipe creation
- Resource inventory management
- Recipe discovery system
- Success/failure animations
- Sound effects for immersion

**Game Mechanics:**
- Material consumption on crafting
- Random success rates for rare items
- Recipe unlocking through progression
- Component kit integration

### 3. Quest Giver Interface
**Purpose**: Mission and challenge management

**Features:**
- Daily quest rotation
- Progress tracking
- Reward distribution
- Completion validation
- Leaderboard integration

**Quest Types:**
- Circuit building challenges
- Component identification tasks
- Code debugging missions
- Electronics theory quizzes

### 4. The Oracle (AI Assistant)
**Purpose**: Educational support and guidance

**Features:**
- Context-aware help system
- Code review and suggestions
- Circuit analysis
- Learning path recommendations
- Interactive tutorials

### 5. Inventory Management
**Purpose**: Item and resource tracking

**Features:**
- Grid-based inventory display
- Item tooltips and descriptions
- Sorting and filtering
- Drag-and-drop organization
- Equipment slots for character gear

**Inventory Categories:**
- **Electronic Components**: Resistors, LEDs, sensors
- **Crafting Materials**: Cloth, metal, tech scrap
- **Tools**: Multimeters, soldering equipment
- **Consumables**: Loot boxes, temporary boosters

### 6. Code Reference Window
**Purpose**: Programming language documentation

**Features:**
- Multi-language support (Python, C++, JavaScript)
- Syntax highlighting
- Interactive examples
- Search functionality
- Bookmark system
- Recent terms history

### 7. Component Glossary
**Purpose**: Electronics component encyclopedia

**Features:**
- Visual component identification
- Technical specifications
- Usage examples
- Schematic symbols
- Real-world applications

### 8. Terminal Emulator
**Purpose**: Command-line interface access

**Features:**
- Linux command execution
- File system navigation
- Git operations
- Package management
- System diagnostics

### 9. Web Browser
**Purpose**: Internet access within the OS

**Features:**
- Tabbed browsing
- Bookmark management
- History tracking
- Download management
- Developer tools access

### 10. Audio Player (Jukebox)
**Purpose**: Background music and sound management

**Features:**
- Playlist management
- Volume control
- Sound effect configuration
- Audio visualization
- Loop/shuffle modes

## Character & Progression System

### Player Profile
```typescript
interface User {
  id: number;
  username: string;
  displayName: string;
  email: string;
  discordId: string;
  avatar: string;
  roles: string[];
  level: number;
  xp: number;
  xpToNextLevel: number;
  completedQuests: string[];
  inventory: Record<string, number>;
  titles: string[];
  activeTitle: string | null;
}
```

### Experience & Leveling
- **XP Sources**: Quest completion, circuit building, crafting success
- **Level Benefits**: Unlock new components, recipes, and features
- **Progression Gates**: Advanced content locked behind level requirements

### Achievement System
- **Categories**: Explorer, Builder, Crafter, Scholar
- **Tiers**: Apprentice → Journeyman → Master → Archmage
- **Rewards**: Titles, exclusive items, cosmetic upgrades

## Lore & Narrative Framework

### The Great Collapse
A dimensional catastrophe that tore apart reality, causing rare materials and strange relics to fall from the skies. This event created the opportunity for scavenging and invention.

### Gizbo Sparkwrench
**Role**: Chaotic Good Inventor/Leader of Scraplight Cartel
**Background**: Goblin inventor who built his own village and now leads a network of tinkerers and scavengers
**Goals**: Scavenge rare components, invent reality-breaking gear, make a fortune, accidentally save the world

### The Scraplight Cartel
**Structure**: Loose business cooperative of inventors and scavengers
**Motto**: "If you can fix it, you can own it"
**Purpose**: Trade in reality-breaking components from dimensional rifts

### Adventure Lines
**30 Days Lost in Space**: Repair a damaged spacecraft using electronics
**Cogsworth Academy**: Learn from a clockwork robot professor
**Neon Realm**: Explore a cyberpunk digital dimension
**Nebula Station**: Build communication systems in space
**Pandora's Circuits**: Unlock ancient technological mysteries

## Technical Implementation Details

### State Management
```typescript
// Global state structure
interface AppState {
  user: User | null;
  windows: Window[];
  activeWindowId: string | null;
  inventory: Record<string, number>;
  quests: Quest[];
  achievements: Achievement[];
  settings: SystemSettings;
}
```

### Window System Architecture
```typescript
class WindowManager {
  private windows: Map<string, Window> = new Map();
  private zIndexCounter: number = 1000;
  
  openWindow(config: WindowConfig): string;
  closeWindow(id: string): void;
  focusWindow(id: string): void;
  minimizeWindow(id: string): void;
  maximizeWindow(id: string): void;
  updatePosition(id: string, position: Position): void;
  updateSize(id: string, size: Size): void;
}
```

### Component System
```typescript
interface CircuitComponent {
  id: string;
  type: ComponentType;
  position: Position;
  rotation: number;
  properties: Record<string, any>;
  pins: Pin[];
  connections: Connection[];
}
```

### Quest System
```typescript
interface Quest {
  id: string;
  title: string;
  description: string;
  objectives: Objective[];
  rewards: Reward[];
  requirements: Requirement[];
  status: 'available' | 'active' | 'completed';
  adventureLine: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
}
```

## Audio System

### Background Music
- **Ambient Tracks**: Create immersive learning environments
- **Dynamic Switching**: Context-aware music changes
- **User Control**: Volume, playlist management

### Sound Effects
- **UI Feedback**: Button clicks, window sounds
- **Game Events**: Crafting success, quest completion
- **System Sounds**: Startup, shutdown, notifications

### Implementation
```typescript
class AudioManager {
  private audioContext: AudioContext;
  private musicTracks: Map<string, AudioBuffer>;
  private soundEffects: Map<string, AudioBuffer>;
  
  playMusic(trackName: string, loop: boolean): void;
  playSoundEffect(effectName: string): void;
  setMasterVolume(volume: number): void;
  setMusicVolume(volume: number): void;
  setSFXVolume(volume: number): void;
}
```

## Security & Authentication

### Discord Integration
- **OAuth 2.0 Flow**: Secure user authentication
- **Role Mapping**: Discord roles → System permissions
- **Guild Verification**: Ensure users are in the correct server

### Session Management
```typescript
interface UserSession {
  userId: number;
  sessionId: string;
  expiresAt: Date;
  ipAddress: string;
  userAgent: string;
  csrfToken: string;
}
```

### Authorization Levels
- **Guest**: Limited read-only access
- **Student**: Full learning features
- **Instructor**: Quest creation, student management
- **Admin**: System configuration, user management
- **Founder**: Full system access

## Database Schema

### Core Tables
```sql
-- Users and authentication
users (id, username, discord_id, email, avatar, roles, level, xp, inventory)
sessions (id, user_id, token, expires_at, csrf_token)

-- Quest and progression system
quests (id, title, description, objectives, rewards, adventure_line)
user_quest_progress (user_id, quest_id, status, progress, completed_at)
achievements (id, name, description, tier, requirements)
user_achievements (user_id, achievement_id, earned_at)

-- Item and crafting system
items (id, name, type, rarity, description, properties)
recipes (id, name, ingredients, result, unlock_requirements)
user_inventory (user_id, item_id, quantity)

-- Circuit and project system
circuit_projects (id, user_id, name, data, created_at, updated_at)
component_kits (id, name, components, description, unlock_level)
```

## API Endpoints

### Authentication
```
POST /api/auth/discord - Discord OAuth initiation
GET /api/auth/callback - OAuth callback handler
GET /api/auth/me - Current user info
POST /api/auth/logout - Session termination
```

### Quest System
```
GET /api/quests - Available quests
GET /api/quests/:id - Quest details
POST /api/quests/:id/accept - Accept quest
POST /api/quests/:id/submit - Submit completion
GET /api/quest-progress - User progress
```

### Inventory & Crafting
```
GET /api/inventory - User inventory
GET /api/items - All items database
POST /api/craft - Attempt crafting
GET /api/recipes - Available recipes
```

### Circuit Builder
```
GET /api/circuits - User's saved circuits
POST /api/circuits - Save circuit project
PUT /api/circuits/:id - Update circuit
DELETE /api/circuits/:id - Delete circuit
GET /api/components - Available components
```

## Deployment & Infrastructure

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/craftingtable

# Discord OAuth
DISCORD_CLIENT_ID=your-client-id
DISCORD_CLIENT_SECRET=your-client-secret
DISCORD_BOT_TOKEN=your-bot-token
DISCORD_GUILD_ID=your-server-id

# Security
SESSION_SECRET=your-secret-key
CSRF_SECRET=your-csrf-secret
```

### Production Configuration
- **HTTPS**: SSL/TLS encryption required
- **CORS**: Properly configured origins
- **Rate Limiting**: API endpoint protection
- **File Upload**: Secure handling and validation
- **Error Logging**: Comprehensive monitoring

## Performance Considerations

### Frontend Optimization
- **Code Splitting**: Lazy loading of applications
- **Asset Optimization**: Image compression, sprite sheets
- **Virtual Scrolling**: Large inventory/component lists
- **Memoization**: React.memo for expensive components

### Backend Optimization
- **Database Indexing**: Query performance optimization
- **Connection Pooling**: Efficient database connections
- **Caching**: Redis for session and frequently accessed data
- **Asset CDN**: Static file delivery optimization

## Educational Integration

### Learning Objectives
- **Electronics Fundamentals**: Ohm's law, circuit analysis
- **Programming Concepts**: Variables, functions, control structures
- **Problem Solving**: Debugging, troubleshooting
- **Project Management**: Planning, execution, documentation

### Assessment Methods
- **Hands-on Projects**: Real circuit building
- **Code Reviews**: Peer and automated feedback
- **Quiz Systems**: Knowledge verification
- **Portfolio Building**: Project documentation

### Accessibility Features
- **Screen Reader Support**: ARIA labels and descriptions
- **Keyboard Navigation**: Full keyboard accessibility
- **High Contrast**: Visual accessibility options
- **Text Scaling**: Adjustable font sizes

## Future Roadmap

### Planned Features
- **Multiplayer Collaboration**: Real-time circuit building
- **AR/VR Integration**: Immersive learning experiences
- **AI Tutoring**: Personalized learning assistance
- **Mobile Companion**: Smartphone integration
- **Hardware Integration**: Real Arduino connectivity

### Scalability Plans
- **Microservices**: Breaking down monolithic structure
- **Kubernetes**: Container orchestration
- **Global CDN**: Worldwide content delivery
- **Database Sharding**: Horizontal scaling

---

This documentation serves as a comprehensive guide to CraftingTable OS, covering all aspects from user interface to backend architecture. Use this as the foundation for understanding and extending the system's capabilities.
</new_str>
