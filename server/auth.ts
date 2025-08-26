import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { Strategy as DiscordStrategy } from "passport-discord";
import session from "express-session";
import { storage } from "./storage";
import { User } from "@shared/schema";

// Type definitions for Express
declare global {
  namespace Express {
    // Define user type for passport
    interface User {
      id: string;
      username: string;
      displayName: string | null;
      discordId: string;
      email: string | null;
      avatar: string | null;
      roles: string[] | null;
      level: number | null;
      inventory: Record<string, number> | null;
      // Add any other properties you need from User type
    }
  }
}

// Authentication middleware
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // In development mode, bypass authentication for easier testing
  if (process.env.NODE_ENV === 'development' && !req.isAuthenticated()) {
    // Create a mock user for development
    req.user = {
      id: "22",
      username: "austineckman",
      displayName: "austineckman",
      discordId: "511323492197597185",
      email: "austin@inventr.io",
      avatar: "https://cdn.discordapp.com/avatars/511323492197597185/7b894475b8ad9a842383159a44c5aa7a.png",
      roles: ["admin", "Founder", "CraftingTable", "Academy", "Server Booster"],
      level: 1,
      inventory: { gold: 164 }
    };
  }
  
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

// Admin-only middleware
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }

  // Check if user has admin role (either explicit admin or Founder)
  const user = req.user as User;
  if (!user.roles?.includes('admin') && !user.roles?.includes('Founder')) {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
};

// Setup authentication for the Express app
export function setupAuth(app: any): void {
  // Configure session middleware
  // Determine if we should use secure cookies based on request protocol
  const useSecureCookies = process.env.NODE_ENV === "production";

  app.use(
    session({
      secret: process.env.SESSION_SECRET || "quest-giver-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false, // Always use non-secure cookies in development
        httpOnly: true, // Prevents JavaScript from reading the cookie
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'lax', // Use lax for development compatibility
      },
      store: storage.sessionStore,
      name: 'connect.sid', // Use standard session name for compatibility
    })
  );

  // Initialize Passport and restore authentication state from session
  app.use(passport.initialize());
  app.use(passport.session());

  // Dynamic callback URL based on environment
  const getCallbackURL = () => {
    // Check for explicit callback URL override first
    if (process.env.DISCORD_CALLBACK_URL) {
      console.log("Using explicit Discord callback URL:", process.env.DISCORD_CALLBACK_URL);
      return process.env.DISCORD_CALLBACK_URL;
    }
    
    // Always use the production domain for live deployments
    // Check if we're in a live deployment (not dev environment)
    const replitDomains = process.env.REPLIT_DOMAINS;
    if (replitDomains) {
      const primaryDomain = replitDomains.split(',')[0];
      // If the domain contains 'replit.dev', it's a development instance
      if (primaryDomain.includes('replit.dev')) {
        const callbackUrl = `https://${primaryDomain}/api/auth/discord/callback`;
        console.log("Using Replit dev domain Discord callback URL:", callbackUrl);
        return callbackUrl;
      } else {
        // For live deployments, always use the production domain
        const callbackUrl = "https://computer.craftingtable.com/api/auth/discord/callback";
        console.log("Using production Discord callback URL (live deployment):", callbackUrl);
        return callbackUrl;
      }
    }
    
    // In explicit production environment, use the production domain
    if (process.env.NODE_ENV === "production") {
      const callbackUrl = "https://computer.craftingtable.com/api/auth/discord/callback";
      console.log("Using production Discord callback URL:", callbackUrl);
      return callbackUrl;
    }
    
    // Fallback to localhost for local development
    const callbackUrl = "http://localhost:5000/api/auth/discord/callback";
    console.log("Using localhost Discord callback URL:", callbackUrl);
    return callbackUrl;
  };

  const callbackURL = getCallbackURL();

  // Configure Discord strategy for OAuth
  passport.use(
    new DiscordStrategy(
      {
        clientID: process.env.DISCORD_CLIENT_ID!,
        clientSecret: process.env.DISCORD_CLIENT_SECRET!,
        callbackURL: callbackURL,
        scope: ["identify", "email", "guilds"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log("Discord authentication for user:", profile.username);
          console.log("Discord profile ID:", profile.id);
          console.log("Available environment variables:", {
            hasGuildId: !!process.env.DISCORD_GUILD_ID,
            hasBotToken: !!process.env.DISCORD_BOT_TOKEN,
            guildId: process.env.DISCORD_GUILD_ID?.slice(0, 4) + "...",
            botTokenLength: process.env.DISCORD_BOT_TOKEN?.length
          });

          // Fetch user's actual Discord server roles
          let discordRoles: string[] = []; // Start empty, no defaults
          const guildId = process.env.DISCORD_GUILD_ID;
          const botToken = process.env.DISCORD_BOT_TOKEN;

          if (guildId && botToken) {
            console.log("Attempting to fetch Discord roles for", profile.username);
            try {
              // First check if user is in the server
              const userGuildsResponse = await fetch(
                'https://discord.com/api/v10/users/@me/guilds',
                {
                  headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                  },
                }
              );

              if (userGuildsResponse.ok) {
                const userGuilds = await userGuildsResponse.json();
                const userGuild = userGuilds.find((guild: any) => guild.id === guildId);

                if (userGuild) {
                  console.log(`User ${profile.username} is a member of Discord server`);

                  // Now fetch the user's actual roles in the server using bot token
                  const memberResponse = await fetch(
                    `https://discord.com/api/v10/guilds/${guildId}/members/${profile.id}`,
                    {
                      headers: {
                        'Authorization': `Bot ${botToken}`,
                        'Content-Type': 'application/json',
                      },
                    }
                  );

                  if (memberResponse.ok) {
                    const member = await memberResponse.json();
                    const roleIds = member.roles || [];

                    // Fetch all server roles to map IDs to names
                    const rolesResponse = await fetch(
                      `https://discord.com/api/v10/guilds/${guildId}/roles`,
                      {
                        headers: {
                          'Authorization': `Bot ${botToken}`,
                          'Content-Type': 'application/json',
                        },
                      }
                    );

                    if (rolesResponse.ok) {
                      const allRoles = await rolesResponse.json();

                      // Map role IDs to role names, excluding @everyone
                      discordRoles = roleIds
                        .map((roleId: string) => {
                          const role = allRoles.find((r: any) => r.id === roleId);
                          return role?.name;
                        })
                        .filter((name: string) => name && name !== '@everyone');

                      // Add admin role for users with Founder role
                      if (discordRoles.includes('Founder')) {
                        if (!discordRoles.includes('admin')) {
                          discordRoles.push('admin');
                        }
                        console.log(`${profile.username} is a Founder - granted admin privileges`);
                      }

                      console.log(`${profile.username} final roles (with admin mapping):`, discordRoles);
                    } else {
                      console.error('Failed to fetch server roles:', memberResponse.status);
                    }
                  } else {
                    console.error('Failed to fetch member data:', memberResponse.status);
                  }
                } else {
                  console.log(`User ${profile.username} is not a member of the Discord server`);
                }
              } else {
                const errorText = await userGuildsResponse.text();
                console.log(`Error fetching guilds for ${profile.username}:`, userGuildsResponse.status, errorText);
              }
            } catch (roleError) {
              console.error('Error fetching Discord server roles:', roleError);
            }
          } else {
            console.log('Discord configuration missing - cannot fetch roles');
          }

          // Development mode: Force admin access for austineckman
          if (process.env.NODE_ENV === 'development' && profile.username === 'austineckman') {
            console.log('Development mode: Granting admin access to austineckman');
            discordRoles = ['admin', 'Founder', 'CraftingTable', 'Academy', 'Server Booster'];
          }

          // Try to find existing user by Discord ID
          let user = await storage.getUserByDiscordId(profile.id);

          if (!user) {
            // Create new user from Discord profile
            console.log("Creating new user from Discord profile:", profile.username);
            user = await storage.createUser({
              discordId: profile.id,
              username: profile.username,
              displayName: profile.displayName || profile.globalName || profile.username, // Use Discord display name if available
              email: profile.email || null,
              avatar: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : null,
              roles: discordRoles,
              level: 1,
              inventory: {},
              completedQuests: [], // Explicitly initialize completedQuests for new users
              xp: 0,
              xpToNextLevel: 300,
              titles: [],
            });
          } else {
            // Update existing user info and roles
            console.log("Updating existing Discord user:", profile.username);
            user = await storage.updateUser(user.id, {
              username: profile.username,
              displayName: profile.displayName || profile.globalName || profile.username, // Update display name from Discord
              email: profile.email || user.email,
              roles: discordRoles, // Update roles from Discord
              avatar: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : user.avatar,
            });
          }

          console.log("Discord authentication successful for user:", user.username);
          return done(null, user);
        } catch (error) {
          console.error("Discord authentication error:", error);
          return done(error);
        }
      }
    )
  );

  // Serialize user to the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from the session
  passport.deserializeUser(async (id: number, done) => {
    try {
      // Only log if we encounter an error or can't find the user
      const user = await storage.getUser(id);
      if (user) {
        done(null, user);
      } else {
        console.log('User not found during session deserialization:', id);
        done(null, false);
      }
    } catch (error) {
      console.error('Error deserializing user:', error);
      done(error, null);
    }
  });
}