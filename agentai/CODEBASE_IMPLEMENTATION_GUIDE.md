# CraftingTable OS - Actual Codebase Implementation Guide

## System Architecture Analysis

CraftingTable OS is a React-based desktop environment built on Express/PostgreSQL stack with Discord OAuth integration. The system implements a retro Windows 95 aesthetic for educational electronics learning.

### Core Technology Stack

**Frontend (client/)**:
- React 18 + TypeScript with Vite build system
- TailwindCSS + ShadCN UI components
- TanStack Query for server state management
- Wouter for client-side routing
- Howler.js for audio management
- Monaco Editor for code editing

**Backend (server/)**:
- Express.js API with session-based authentication
- PostgreSQL database with Drizzle ORM
- Discord OAuth with bot token role fetching
- Multer for file uploads with CSRF protection
- bcrypt for password hashing

**Key Implementation Details**:
- Window management system using React state
- Real-time comment system with Discord role styling
- Custom display name override system
- Audio auto-play with track progression
- Hierarchical quest system with component kit integration

## Database Schema Implementation (shared/schema.ts)

### users Table Structure
```typescript
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  displayName: text("display_name"), // Overrides Discord username
  email: text("email"),
  password: text("password"), // bcrypt hashed
  discordId: text("discord_id"),
  avatar: text("avatar_url"),
  roles: json("roles").$type<string[]>().default([]), 
  level: integer("level").default(1),
  xp: integer("xp").default(0),
  xpToNextLevel: integer("xp_to_next_level").default(300),
  completedQuests: json("completed_quests").$type<number[]>().default([]),
  inventory: json("inventory").$type<Record<string, number>>().default({}),
  titles: json("titles").$type<string[]>().default([]),
  activeTitle: text("active_title"),
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login").defaultNow(),
});
```

### quests Table with Solution Helper
```typescript
export const quests = pgTable("quests", {
  id: bigint("id", { mode: "number" }).primaryKey(), // Date.now() timestamps
  title: text("title").notNull(),
  description: text("description").notNull(), // Flavor text
  missionBrief: text("mission_brief"), // Actual instructions
  adventureLine: text("adventure_line").notNull(),
  difficulty: integer("difficulty").notNull(),
  orderInLine: integer("order_in_line").notNull().default(0),
  xpReward: integer("xp_reward").notNull().default(100),
  solutionCode: text("solution_code"), // Arduino code solution
  wiringInstructions: text("wiring_instructions"),
  wiringDiagram: text("wiring_diagram"), // Image URL
  solutionNotes: text("solution_notes"),
  heroImage: text("hero_image"),
  status: text("status").default("available"),
});
```

### questComments with User Relations
```typescript
export const questComments = pgTable("quest_comments", {
  id: serial("id").primaryKey(),
  questId: text("quest_id").notNull(),
  userId: integer("user_id").references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const questCommentsRelations = relations(questComments, ({ one }) => ({
  user: one(users, {
    fields: [questComments.userId],
    references: [users.id],
  }),
}));
```

## Desktop Environment Implementation

### Window Management (client/src/components/retro-ui/RetroDesktop.tsx)

**Core Window Interface**:
```typescript
interface RetroWindow {
  id: string;
  title: string;
  icon: string;
  content: React.ReactNode;
  position: WindowPosition;
  isMinimized: boolean;
  isActive: boolean;
}

interface WindowPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

**State Management**:
```typescript
const [windows, setWindows] = useState<RetroWindow[]>([]);
const [activeWindow, setActiveWindow] = useState<string | null>(null);

const openWindow = useCallback((windowConfig: Partial<RetroWindow>) => {
  const newWindow: RetroWindow = {
    id: `${windowConfig.id}-${Date.now()}`,
    title: windowConfig.title || 'Untitled',
    icon: windowConfig.icon || '',
    content: windowConfig.content || null,
    position: windowConfig.position || { x: 100, y: 100, width: 600, height: 400 },
    isMinimized: false,
    isActive: true
  };
  
  setWindows(prev => [...prev, newWindow]);
  setActiveWindow(newWindow.id);
}, []);
```

**Desktop Icons Configuration**:
```typescript
const desktopIcons = [
  {
    id: "quest-giver",
    name: "Quest Giver",
    icon: questImage,
    position: { x: 20, y: 20 }
  },
  {
    id: "circuit-builder", 
    name: "Circuit Builder",
    icon: ledIconImage,
    position: { x: 20, y: 120 }
  },
  {
    id: "gizbo-bmah",
    name: "BMAH",
    icon: shopCoinImage,
    position: { x: 20, y: 220 }
  }
];
```

## Authentication System (server/routes.ts)

### Session-Based Authentication with Performance Optimization

**Cookie Parsing Optimization**:
```typescript
app.use((req, res, next) => {
  // Skip expensive cookie parsing for static assets
  if (req.path.includes('.') || 
      req.path.includes('/assets/') || 
      req.path.includes('/@') || 
      req.path.includes('/_')) {
    return next();
  }
  
  const cookies: Record<string, string> = {};
  
  if (req.path.startsWith('/api') && req.headers.cookie) {
    req.headers.cookie.split(';').forEach(cookie => {
      const parts = cookie.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        cookies[key] = value;
      }
    });
  }
  
  req.cookies = cookies;
  next();
});
```

**Authentication Middleware**:
```typescript
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const sessionId = req.cookies?.sessionId;
  
  if (!sessionId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const user = await storage.getUserBySessionId(sessionId);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  req.user = user;
  next();
};
```

### Discord Role Integration

**Role Fetching via Discord Bot API**:
```typescript
app.get('/api/user/discord-roles', authenticate, async (req, res) => {
  const discordId = req.user.discordId;
  const guildId = process.env.DISCORD_GUILD_ID;
  const botToken = process.env.DISCORD_BOT_TOKEN;
  
  try {
    const memberResponse = await axios.get(
      `https://discord.com/api/v10/guilds/${guildId}/members/${discordId}`,
      { headers: { Authorization: `Bot ${botToken}` } }
    );
    
    const guildResponse = await axios.get(
      `https://discord.com/api/v10/guilds/${guildId}`,
      { headers: { Authorization: `Bot ${botToken}` } }
    );
    
    const memberData = memberResponse.data;
    const guildData = guildResponse.data;
    
    const roleNames = memberData.roles.map(roleId => {
      const role = guildData.roles.find(r => r.id === roleId);
      return role ? role.name : null;
    }).filter(Boolean);
    
    res.json({
      guildId: guildId,
      serverName: guildData.name,
      userId: discordId,
      username: req.user.username,
      roles: guildData.roles.filter(role => memberData.roles.includes(role.id))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Discord roles' });
  }
});
```

## Quest System Implementation

### Quest Comments with User Data

**Backend API with User Joins**:
```typescript
app.get('/api/quests/:questId/comments', authenticate, async (req, res) => {
  const { questId } = req.params;
  
  const comments = await db
    .select({
      id: questComments.id,
      questId: questComments.questId,
      content: questComments.content,
      createdAt: questComments.createdAt,
      user: {
        id: users.id,
        username: users.username,
        displayName: users.displayName, // Critical for custom names
        avatar: users.avatar,
        roles: users.roles,
      },
    })
    .from(questComments)
    .leftJoin(users, eq(questComments.userId, users.id))
    .where(eq(questComments.questId, questId))
    .orderBy(desc(questComments.createdAt));
    
  res.json(comments);
});
```

**Comment Submission**:
```typescript
app.post('/api/quests/:questId/comments', authenticate, async (req, res) => {
  const { questId } = req.params;
  const { content } = req.body;
  const userId = req.user.id;
  
  const [comment] = await db
    .insert(questComments)
    .values({
      questId: questId,
      userId: userId,
      content: content,
    })
    .returning();
    
  // Return comment with user data for immediate display
  const commentWithUser = await db
    .select({
      id: questComments.id,
      questId: questComments.questId,
      content: questComments.content,
      createdAt: questComments.createdAt,
      user: {
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatar: users.avatar,
        roles: users.roles,
      },
    })
    .from(questComments)
    .leftJoin(users, eq(questComments.userId, users.id))
    .where(eq(questComments.id, comment.id));
    
  res.json(commentWithUser[0]);
});
```

### Active Quest Interface Layout

**Split-Screen with Sticky Chat** (client/src/components/retro-ui/ActiveQuestScreen.tsx):
```typescript
<div className="flex h-full bg-retro-bg-primary">
  {/* Main Content - Scrollable */}
  <div className="flex-1 overflow-y-auto">
    <div className="p-6 space-y-6">
      {/* Mission Brief */}
      <div className="bg-retro-bg-secondary p-4 border-2 border-retro-border rounded">
        <h2 className="text-xl font-bold mb-3">Mission Brief</h2>
        <p className="text-retro-text leading-relaxed">{quest.missionBrief}</p>
      </div>
      
      {/* Tutorial Video */}
      {quest.tutorialVideo && (
        <div className="bg-black p-4 border-2 border-retro-border rounded">
          <video controls className="w-full">
            <source src={quest.tutorialVideo} type="video/mp4" />
          </video>
        </div>
      )}
      
      {/* Solution Helper with Timer */}
      {showSolutionHelper && (
        <div className="bg-yellow-100 border-2 border-yellow-300 p-4 rounded">
          <h3 className="text-lg font-bold mb-3">Solution Helper</h3>
          <div className="space-y-4">
            {quest.solutionCode && (
              <div>
                <h4 className="font-semibold">Arduino Code:</h4>
                <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
                  {quest.solutionCode}
                </pre>
              </div>
            )}
            {quest.wiringInstructions && (
              <div>
                <h4 className="font-semibold">Wiring Instructions:</h4>
                <p className="whitespace-pre-line">{quest.wiringInstructions}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  </div>
  
  {/* Chat Sidebar - Fixed Width, Independent Scroll */}
  <div className="w-80 bg-retro-bg-secondary border-l-2 border-retro-border flex flex-col">
    <div className="flex-1 overflow-y-auto p-4">
      {comments.map(comment => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
    
    {/* Comment Input - Always Visible */}
    <div className="p-4 border-t-2 border-retro-border">
      <CommentInput onSubmit={handleAddComment} />
    </div>
  </div>
</div>
```

## TanStack Query Implementation

### Query Client with Default Query Function

**Configuration** (client/src/lib/queryClient.ts):
```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const response = await fetch(queryKey[0] as string);
        if (!response.ok) {
          throw new Error(`${response.status}: ${response.statusText}`);
        }
        return response.json();
      },
    },
  },
});
```

### Array-Based Query Keys

**Comments Query Implementation**:
```typescript
// Comments query uses array format for proper cache invalidation
const { data: comments, isLoading } = useQuery({
  queryKey: ['/api/quests', questId, 'comments'],
  // No queryFn needed - uses default
});

// Comment mutation with targeted cache invalidation
const addCommentMutation = useMutation({
  mutationFn: async (commentData) => {
    return apiRequest(`/api/quests/${questId}/comments`, {
      method: 'POST',
      body: commentData,
    });
  },
  onSuccess: () => {
    // Invalidates only comments for this specific quest
    queryClient.invalidateQueries(['/api/quests', questId, 'comments']);
  },
});
```

## Role-Based Styling System

### Discord Role Styling Function

```typescript
const getRoleStyles = (roles: string[]) => {
  if (roles.includes('Founder')) {
    return { 
      usernameColor: 'text-orange-400',
      tag: { text: 'FOUNDER', color: 'bg-orange-500' }
    };
  }
  if (roles.includes('CraftingTable')) {
    return {
      usernameColor: 'text-blue-400', 
      tag: { text: 'TEAM', color: 'bg-blue-500' }
    };
  }
  if (roles.includes('Mod')) {
    return {
      usernameColor: 'text-red-400',
      tag: { text: 'MOD', color: 'bg-red-500' }
    };
  }
  if (roles.includes('Beta Tester')) {
    return {
      usernameColor: 'text-purple-400',
      tag: { text: 'BETA TESTER', color: 'bg-purple-500' }
    };
  }
  if (roles.includes('Academy')) {
    return {
      usernameColor: 'text-yellow-400',
      tag: { text: 'ACADEMY', color: 'bg-yellow-500' }
    };
  }
  return { usernameColor: 'text-gray-300', tag: null };
};
```

## Display Name Override System

### Profile Settings Implementation

**Frontend Component**:
```typescript
const [editingDisplayName, setEditingDisplayName] = useState(false);
const [displayNameValue, setDisplayNameValue] = useState(user?.displayName || user?.username || '');

const handleSaveDisplayName = async () => {
  try {
    await apiRequest('/api/user/display-name', {
      method: 'PUT',
      body: { displayName: displayNameValue },
    });
    queryClient.invalidateQueries(['/api/auth/me']);
    setEditingDisplayName(false);
  } catch (error) {
    console.error('Failed to update display name:', error);
  }
};
```

**Backend Endpoint**:
```typescript
app.put('/api/user/display-name', authenticate, async (req, res) => {
  const { displayName } = req.body;
  const userId = req.user.id;
  
  await db
    .update(users)
    .set({ displayName })
    .where(eq(users.id, userId));
    
  res.json({ success: true });
});
```

## Audio System Implementation

### Howler.js Audio Manager

**Auto-Play with Track Progression**:
```typescript
const useAudioPlayer = () => {
  const [currentTrack, setCurrentTrack] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.8);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState<boolean>(true);
  const currentHowl = useRef<Howl | null>(null);
  
  const tracks = [
    "/sounds/Chappy.mp3",
    "/sounds/Empty Arcade.mp3", 
    "/sounds/Factory New.mp3",
    "/sounds/Glitched Grid.mp3",
    "/sounds/HERO's Anthem.mp3",
    "/sounds/Pixel Hearth.mp3",
    "/sounds/Pixelated Warriors.mp3",
    "/sounds/Spooky Cat.mp3",
    "/sounds/TAVERN.EXE.mp3",
    "/sounds/Thief in the fog.mp3"
  ];
  
  const playTrack = useCallback((index: number) => {
    if (currentHowl.current) {
      currentHowl.current.stop();
    }
    
    const track = tracks[index];
    
    currentHowl.current = new Howl({
      src: [track],
      volume: volume,
      onload: () => {
        if (autoPlayEnabled) {
          currentHowl.current?.play();
          setIsPlaying(true);
        }
      },
      onend: () => {
        if (autoPlayEnabled) {
          const nextIndex = (index + 1) % tracks.length;
          playTrack(nextIndex);
          setCurrentTrack(nextIndex);
        }
      },
      onerror: (id, error) => {
        console.error('Audio error:', error);
      }
    });
  }, [tracks, volume, autoPlayEnabled]);
  
  return {
    currentTrack,
    isPlaying,
    volume,
    autoPlayEnabled,
    playTrack,
    setVolume,
    setAutoPlayEnabled
  };
};
```

## File Upload System

### CSRF Protected Image Uploads

**Multer Configuration**:
```typescript
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'public', 'uploads', 'hero-images');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});
```

**Upload Endpoint with CSRF Protection**:
```typescript
app.post('/api/admin/upload/hero-image', 
  adminAuth, 
  conditionalCsrfProtection,
  upload.single('heroImage'), 
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const filename = req.file.filename;
    const imageUrl = `/uploads/hero-images/${filename}`;
    
    res.json({ imageUrl });
  }
);
```

**Frontend Upload Implementation**:
```typescript
const uploadHeroImage = async (file: File) => {
  const formData = new FormData();
  formData.append('heroImage', file);
  formData.append('_csrf', csrfToken);
  
  const response = await fetch('/api/admin/upload/hero-image', {
    method: 'POST',
    headers: {
      'X-CSRF-Token': csrfToken,
    },
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Upload failed');
  }
  
  return response.json();
};
```

This documentation reflects the actual implementation patterns used throughout the CraftingTable OS codebase, providing AI agents with accurate technical specifications for extending and maintaining the system.