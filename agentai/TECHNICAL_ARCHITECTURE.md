# CraftingTable OS - Technical Architecture Analysis

## Database Layer - PostgreSQL + Drizzle ORM

### Core Schema Structure (shared/schema.ts)

**users table** - Session-based authentication with Discord integration:
```typescript
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  displayName: text("display_name"), // Custom name override system
  email: text("email"),
  password: text("password"), // bcrypt hashed for local auth
  discordId: text("discord_id"), // OAuth linking
  avatar: text("avatar_url"), // Discord CDN URLs
  roles: json("roles").$type<string[]>().default([]), // ['admin', 'Founder', 'CraftingTable']
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

**quests table** - Hierarchical quest system with component kit integration:
```typescript
export const quests = pgTable("quests", {
  id: bigint("id", { mode: "number" }).primaryKey(), // Date.now() timestamp IDs
  title: text("title").notNull(),
  description: text("description").notNull(), // Flavor text
  missionBrief: text("mission_brief"), // Actual learning instructions
  adventureLine: text("adventure_line").notNull(), // "30 Days Lost in Space"
  difficulty: integer("difficulty").notNull(),
  orderInLine: integer("order_in_line").notNull().default(0),
  xpReward: integer("xp_reward").notNull().default(100),
  kitId: text("kit_id").references(() => componentKits.id), // Hardware requirement
  solutionCode: text("solution_code"), // Arduino code solution
  wiringInstructions: text("wiring_instructions"), // Step-by-step guide
  wiringDiagram: text("wiring_diagram"), // Image URL
  heroImage: text("hero_image"), // Main quest visual
  status: text("status").default("available"),
});
```

**questComments table** - Real-time community interaction:
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

## Authentication System (server/routes.ts)

### Session Management with Performance Optimization

Cookie parsing is optimized to skip static assets:
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
  
  // Only parse cookies for API routes when cookie header exists
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

### Authentication Middleware

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

Discord OAuth fetches server roles via bot token:
```typescript
app.get('/api/user/discord-roles', authenticate, async (req, res) => {
  const discordId = req.user.discordId;
  const guildId = process.env.DISCORD_GUILD_ID;
  const botToken = process.env.DISCORD_BOT_TOKEN;
  
  const response = await axios.get(
    `https://discord.com/api/v10/guilds/${guildId}/members/${discordId}`,
    { headers: { Authorization: `Bot ${botToken}` } }
  );
  
  // Map Discord role IDs to human-readable names
  const roleNames = memberData.roles.map(roleId => {
    const role = guildData.roles.find(r => r.id === roleId);
    return role ? role.name : null;
  }).filter(Boolean);
  
  res.json({ roles: roleNames });
});
```

## Frontend Architecture (client/src/components/retro-ui/RetroDesktop.tsx)

### Window Management System

Complete desktop environment with multi-window support:
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

Window state management with React hooks:
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

Desktop icon positioning and click handlers:
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
    name: "BMAH", // Black Market Auction House
    icon: shopCoinImage,
    position: { x: 20, y: 220 }
  }
];

const handleIconClick = (iconId: string) => {
  switch (iconId) {
    case 'quest-giver':
      openWindow({
        id: 'quest-app',
        title: 'Quest Giver',
        icon: questImage,
        content: <FullscreenQuestsApp onClose={() => closeWindow('quest-app')} />,
        position: { x: 50, y: 50, width: 1200, height: 800 }
      });
      break;
    // ... more cases
  }
};
```

## TanStack Query Data Management

### Query Client Configuration

Default query function eliminates need for individual queryFn definitions:
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

### Array-Based Query Keys for Cache Invalidation

Hierarchical cache invalidation using array segments:
```typescript
// Comments query uses array format for proper cache invalidation
const { data: comments, isLoading } = useQuery({
  queryKey: ['/api/quests', questId, 'comments'],
  // No queryFn needed - uses default
});

// Mutation with targeted cache invalidation
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

## Comment System Implementation

### Backend API with User Data Joins

Comments endpoint with proper user data selection:
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

### Role-Based Comment Styling

Dynamic styling based on Discord roles:
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

### Display Name Override System

Profile settings allow custom display name instead of Discord username:
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

Backend endpoint:
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

## Active Quest Interface Layout

### Split-Screen Design with Sticky Chat

Lesson content scrollable, chat sidebar fixed:
```typescript
<div className="flex h-full bg-retro-bg-primary">
  {/* Main Content Area - Scrollable */}
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
      
      {/* Expected Result */}
      <div className="bg-retro-bg-secondary p-4 border-2 border-retro-border rounded">
        <h3 className="text-lg font-bold mb-3">Expected Result</h3>
        {quest.resultGif && (
          <img src={quest.resultGif} alt="Expected circuit behavior" className="max-w-full" />
        )}
      </div>
      
      {/* Solution Helper with Timer */}
      <SolutionHelper 
        quest={quest}
        timeRemaining={solutionTimeRemaining}
        onReveal={() => setSolutionRevealed(true)}
      />
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

## Audio System Architecture

### Howler.js Integration with Auto-Play

Background music manager with track progression:
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
    console.log('PlayTrack called with index:', index);
    
    if (currentHowl.current) {
      currentHowl.current.stop();
      console.log('Track stopped');
    }
    
    const track = tracks[index];
    console.log('Creating new Howl for track:', track);
    
    currentHowl.current = new Howl({
      src: [track],
      volume: volume,
      onload: () => {
        console.log('Track loaded');
        if (autoPlayEnabled) {
          currentHowl.current?.play();
          setIsPlaying(true);
          console.log('Track started playing');
        }
      },
      onend: () => {
        console.log('Track ended, autoPlayEnabled:', autoPlayEnabled);
        if (autoPlayEnabled) {
          console.log('Auto-playing next track...');
          const nextIndex = (index + 1) % tracks.length;
          console.log('Playing next track at index', nextIndex);
          playTrack(nextIndex);
          setCurrentTrack(nextIndex);
        }
      },
      onerror: (id, error) => {
        console.error('Audio error:', error);
      }
    });
  }, [tracks, volume, autoPlayEnabled]);
```

## File Upload System with CSRF Protection

### Multer Configuration for Image Uploads

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
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});
```

### CSRF Protected Upload Endpoints

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

Frontend upload with CSRF token:
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

## Performance Optimizations

### Database Query Optimization

User session lookup with proper indexing:
```sql
CREATE INDEX idx_users_discord_id ON users(discord_id);
CREATE INDEX idx_quest_comments_quest_id ON quest_comments(quest_id);
CREATE INDEX idx_quest_comments_user_id ON quest_comments(user_id);
```

### Frontend Performance

Virtual scrolling for large datasets:
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

const QuestList = ({ quests }: { quests: Quest[] }) => {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: quests.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
  });
  
  return (
    <div ref={parentRef} className="h-full overflow-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map(virtualRow => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <QuestCard quest={quests[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
};
```

This architecture analysis covers the actual implementation patterns, performance optimizations, and data flow within CraftingTable OS.