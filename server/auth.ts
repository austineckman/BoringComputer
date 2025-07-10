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
  
  // Check if user has admin role
  const user = req.user as User;
  if (!user.roles?.includes('admin')) {
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
        secure: useSecureCookies, // Use secure cookies in production
        httpOnly: true, // Prevents JavaScript from reading the cookie
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: useSecureCookies ? 'none' : 'lax', // Allow cross-site cookie in production with HTTPS
      },
      store: storage.sessionStore,
      name: 'app.sid', // Don't use the default connect.sid name (reveals Express usage)
    })
  );

  // Initialize Passport and restore authentication state from session
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Discord strategy for OAuth
  passport.use(
    new DiscordStrategy(
      {
        clientID: process.env.DISCORD_CLIENT_ID!,
        clientSecret: process.env.DISCORD_CLIENT_SECRET!,
        callbackURL: "https://6586fd3c-2e1e-45c9-a302-dec0ad1fb0bd-00-10hxex3vuoklp.picard.replit.dev/api/auth/discord/callback",
        scope: ["identify", "email", "guilds"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log("Discord authentication for user:", profile.username);
          
          // Fetch user's roles from your specific Discord server
          let discordRoles: string[] = ['user']; // Default role
          const guildId = process.env.DISCORD_GUILD_ID;
          
          if (accessToken && guildId) {
            try {
              // Use bot token to get user's roles in the specific server
              const guildMemberResponse = await fetch(
                `https://discord.com/api/v10/guilds/${guildId}/members/${profile.id}`,
                {
                  headers: {
                    'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
                    'Content-Type': 'application/json',
                  },
                }
              );
              
              if (guildMemberResponse.ok) {
                const memberData = await guildMemberResponse.json();
                const userRoleIds = memberData.roles || [];
                console.log(`User ${profile.username} has ${userRoleIds.length} roles in your Discord server`);
                
                // Fetch the guild roles to map IDs to names using bot token
                const rolesResponse = await fetch(
                  `https://discord.com/api/v10/guilds/${guildId}/roles`,
                  {
                    headers: {
                      'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
                      'Content-Type': 'application/json',
                    },
                  }
                );
                
                if (rolesResponse.ok) {
                  const guildRoles = await rolesResponse.json();
                  const roleMap = guildRoles.reduce((acc: any, role: any) => {
                    acc[role.id] = role.name;
                    return acc;
                  }, {});
                  
                  // Convert role IDs to role names
                  const userRoleNames = userRoleIds
                    .map((roleId: string) => roleMap[roleId])
                    .filter((roleName: string) => roleName && roleName !== '@everyone');
                  
                  console.log(`User ${profile.username} Discord roles:`, userRoleNames);
                  
                  // Map Discord roles to app permissions
                  discordRoles = ['user']; // Start with default
                  
                  // Check for admin-level roles
                  const adminRoles = ['admin', 'administrator', 'owner', 'server owner'];
                  if (userRoleNames.some(role => adminRoles.includes(role.toLowerCase()))) {
                    discordRoles.push('admin');
                  }
                  
                  // Check for moderator roles
                  const modRoles = ['moderator', 'mod', 'staff', 'helper'];
                  if (userRoleNames.some(role => modRoles.includes(role.toLowerCase()))) {
                    discordRoles.push('moderator');
                  }
                  
                  // Check for premium/supporter roles
                  const premiumRoles = ['premium', 'supporter', 'vip', 'patron', 'donor'];
                  if (userRoleNames.some(role => premiumRoles.includes(role.toLowerCase()))) {
                    discordRoles.push('premium');
                  }
                  
                  console.log(`Mapped to app roles:`, discordRoles);
                } else {
                  console.log(`Could not fetch roles from your Discord server`);
                }
              } else {
                const errorText = await guildMemberResponse.text();
                console.log(`Error fetching member data for ${profile.username}:`, guildMemberResponse.status, errorText);
                console.log(`This could mean: bot not in server, missing permissions, or user not in server`);
              }
            } catch (roleError) {
              console.error('Error fetching Discord server roles:', roleError);
            }
          } else {
            if (!guildId) {
              console.log('DISCORD_GUILD_ID not configured - using default user role');
            }
          }
          
          // Try to find existing user by Discord ID
          let user = await storage.getUserByDiscordId(profile.id);
          
          if (!user) {
            // Create new user from Discord profile
            console.log("Creating new user from Discord profile:", profile.username);
            user = await storage.createUser({
              discordId: profile.id,
              username: profile.username,
              email: profile.email || null,
              avatar: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : null,
              roles: discordRoles,
              level: 1,
              inventory: {},
            });
          } else {
            // Update existing user info and roles
            console.log("Updating existing Discord user:", profile.username);
            user = await storage.updateUser(user.id, {
              username: profile.username,
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
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
}