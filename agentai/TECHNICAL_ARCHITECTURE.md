
# CraftingTable OS - Technical Architecture Guide

## System Architecture Overview

CraftingTable OS is built as a modern full-stack web application with a retro desktop environment interface. The architecture follows a client-server model with clear separation of concerns.

## Frontend Architecture

### Core Technologies
- **React 18**: Component-based UI framework with hooks
- **TypeScript**: Type-safe development environment
- **Vite**: Fast build tool and development server
- **TailwindCSS**: Utility-first CSS framework
- **ShadCN UI**: Pre-built component library

### Desktop Environment Implementation

#### Window Management System
```typescript
interface WindowState {
  windows: Window[];
  activeWindowId: string | null;
  zIndexCounter: number;
}

interface Window {
  id: string;
  title: string;
  content: ReactNode;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMaximized: boolean;
  isMinimized: boolean;
  zIndex: number;
  isResizable: boolean;
}
```

The window manager uses React state management with context providers to maintain window states across the application.

#### Desktop Applications

**Circuit Builder Pro**
- Canvas-based rendering for performance
- Component drag-and-drop with collision detection
- Real-time Arduino simulation using AVR8js
- Wire routing with automatic connection validation
- Monaco Editor integration for code editing

**Gizbo's Forge (Crafting System)**
- Grid-based inventory management
- Drag-and-drop crafting interface
- Recipe validation and success animations
- Material consumption tracking

**Quest System**
- Dynamic quest loading from server
- Progress tracking with XP calculations
- Adventure line categorization
- Completion validation

## Backend Architecture

### Core Technologies
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **PostgreSQL**: Relational database
- **Drizzle ORM**: Type-safe database operations
- **Discord OAuth 2.0**: Authentication provider

### Database Schema

#### Core Tables
```sql
-- User Management
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  discord_id VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255),
  avatar TEXT,
  roles TEXT[],
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  inventory JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP DEFAULT NOW()
);

-- Quest System
CREATE TABLE quests (
  id VARCHAR(50) PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  objectives JSONB,
  rewards JSONB,
  requirements JSONB,
  adventure_line VARCHAR(100),
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
  created_at TIMESTAMP DEFAULT NOW()
);

-- User Progress Tracking
CREATE TABLE user_quest_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  quest_id VARCHAR(50) REFERENCES quests(id),
  status VARCHAR(20) DEFAULT 'available',
  progress JSONB DEFAULT '{}',
  completed_at TIMESTAMP,
  UNIQUE(user_id, quest_id)
);

-- Items and Crafting
CREATE TABLE items (
  id VARCHAR(50) PRIMARY KEY,
  name TEXT NOT NULL,
  type VARCHAR(50),
  rarity VARCHAR(20),
  description TEXT,
  properties JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE recipes (
  id VARCHAR(50) PRIMARY KEY,
  name TEXT NOT NULL,
  ingredients JSONB NOT NULL,
  result JSONB NOT NULL,
  unlock_requirements JSONB,
  success_rate FLOAT DEFAULT 1.0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Circuit Projects
CREATE TABLE circuit_projects (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### API Architecture

#### Authentication Flow
```typescript
// Discord OAuth 2.0 Flow
POST /api/auth/discord -> Redirects to Discord
GET /api/auth/callback -> Processes OAuth callback
GET /api/auth/me -> Returns current user session
POST /api/auth/logout -> Destroys session
```

#### Quest System APIs
```typescript
// Quest Management
GET /api/quests -> List available quests
GET /api/quests/:id -> Quest details
POST /api/quests/:id/accept -> Accept quest
POST /api/quests/:id/submit -> Submit completion
GET /api/quest-progress -> User progress summary
```

#### Inventory & Crafting APIs
```typescript
// Inventory Management
GET /api/inventory -> User's current inventory
POST /api/inventory/add -> Add items to inventory
POST /api/inventory/remove -> Remove items from inventory

// Crafting System
POST /api/craft -> Attempt crafting recipe
GET /api/recipes -> Available recipes
GET /api/items -> Item database
```

### Security Implementation

#### Session Management
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

#### Authorization Middleware
```typescript
// Role-based access control
const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.session.user;
    if (!user || !roles.some(role => user.roles.includes(role))) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

## Circuit Simulation Architecture

### AVR8js Integration
The Arduino simulation uses AVR8js library for real microcontroller emulation:

```typescript
class ArduinoEmulator {
  private cpu: CPU;
  private timer: Timer;
  private usart: USART;
  private portB: AVRIOPort;
  private portC: AVRIOPort;
  private portD: AVRIOPort;

  constructor() {
    this.cpu = new CPU(new Uint16Array(0x8000));
    this.timer = new Timer(this.cpu, timer0Config);
    this.usart = new USART(this.cpu, usart0Config);
    // Port initialization...
  }

  loadProgram(hexData: string): void {
    const program = parseIntelHex(hexData);
    this.cpu.flash.set(program);
  }

  step(): void {
    this.cpu.tick();
  }
}
```

### Component System
Each circuit component implements a standardized interface:

```typescript
interface CircuitComponent {
  id: string;
  type: ComponentType;
  position: Position;
  rotation: number;
  pins: Pin[];
  properties: ComponentProperties;
  
  render(ctx: CanvasRenderingContext2D): void;
  update(deltaTime: number): void;
  onPinStateChange(pin: Pin, state: PinState): void;
}
```

## Audio System Architecture

### Background Music Manager
```typescript
class AudioManager {
  private audioContext: AudioContext;
  private musicTracks: Map<string, AudioBuffer>;
  private soundEffects: Map<string, AudioBuffer>;
  private currentMusic: AudioBufferSourceNode | null;
  
  async loadTrack(name: string, url: string): Promise<void> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    this.musicTracks.set(name, audioBuffer);
  }
  
  playMusic(trackName: string, loop: boolean = true): void {
    const track = this.musicTracks.get(trackName);
    if (!track) return;
    
    this.stopMusic();
    this.currentMusic = this.audioContext.createBufferSource();
    this.currentMusic.buffer = track;
    this.currentMusic.loop = loop;
    this.currentMusic.connect(this.audioContext.destination);
    this.currentMusic.start();
  }
}
```

## Performance Optimizations

### Frontend Optimizations
- **Code Splitting**: Lazy loading of desktop applications
- **Virtual Scrolling**: For large inventory lists
- **Canvas Optimization**: Efficient rendering for circuit builder
- **Memoization**: React.memo for expensive components
- **Asset Optimization**: Image compression and sprite sheets

### Backend Optimizations
- **Database Indexing**: Optimized queries for user data
- **Connection Pooling**: Efficient database connections
- **Response Caching**: Static content caching
- **Rate Limiting**: API endpoint protection

## Deployment Architecture

### Environment Configuration
```bash
# Production Environment Variables
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:pass@localhost:5432/craftingtable

# Discord OAuth
DISCORD_CLIENT_ID=your-client-id
DISCORD_CLIENT_SECRET=your-client-secret
DISCORD_BOT_TOKEN=your-bot-token
DISCORD_GUILD_ID=your-server-id

# Security
SESSION_SECRET=your-session-secret
CSRF_SECRET=your-csrf-secret
```

### Build Process
```bash
# Frontend build
npm run build:client
# Outputs to client/dist

# Backend build
npm run build:server
# Outputs to server/dist

# Full production build
npm run build
```

### Error Handling & Logging
```typescript
// Centralized error handling
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`[${new Date().toISOString()}] Error:`, error);
  
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ error: 'Internal server error' });
  } else {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});
```

## Scalability Considerations

### Database Scaling
- **Read Replicas**: For heavy read operations
- **Connection Pooling**: PgBouncer for connection management
- **Query Optimization**: Proper indexing and query analysis

### Application Scaling
- **Horizontal Scaling**: Multiple server instances
- **Load Balancing**: Nginx or similar for request distribution
- **Session Storage**: Redis for shared session storage
- **CDN Integration**: Static asset delivery optimization

### Monitoring & Observability
- **Application Metrics**: Response times, error rates
- **Database Monitoring**: Query performance, connection counts
- **User Analytics**: Feature usage, performance metrics
- **Health Checks**: Automated system status monitoring

---

This technical architecture guide provides the foundation for understanding CraftingTable OS's implementation details and scaling strategies.
