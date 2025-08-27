import { Router } from "express";
import passport from "passport";

const router = Router();

// Discord OAuth login route
router.get("/discord", passport.authenticate("discord"));

// Discord OAuth callback route
router.get("/discord/callback", 
  passport.authenticate("discord", { failureRedirect: "/auth" }),
  (req, res) => {
    console.log('Discord OAuth callback - user authenticated:', !!req.user);
    console.log('Discord OAuth callback - isAuthenticated:', req.isAuthenticated());
    console.log('Discord OAuth callback - user object:', req.user);
    
    // Successful authentication, redirect to home
    res.redirect("/");
  }
);



// Logout route
router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    
    // Destroy the session completely
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
        return res.status(500).json({ message: "Session destruction failed" });
      }
      
      // Clear the session cookie
      res.clearCookie('connect.sid');
      res.json({ message: "Logout successful" });
    });
  });
});



// Get current user  
router.get("/me", (req, res) => {
  console.log('Auth check - isAuthenticated:', req.isAuthenticated());
  console.log('Auth check - user object exists:', !!req.user);
  console.log('Auth check - session ID:', req.sessionID);
  
  // DEVELOPMENT MODE: Create mock user if not authenticated in development
  if (process.env.NODE_ENV === 'development' && !req.isAuthenticated()) {
    console.log('Development mode: Creating mock user for testing');
    const mockUser = {
      id: "22",
      username: "austineckman",
      displayName: "austineckman",
      discordId: "511323492197597185",
      email: "austin@inventr.io",
      avatar: "https://cdn.discordapp.com/avatars/511323492197597185/7b894475b8ad9a842383159a44c5aa7a.png",
      roles: ["admin", "Founder", "CraftingTable", "Academy", "Server Booster"],
      level: 1,
      inventory: { gold: 164 },
      completedQuests: [],
      xp: 0,
      xpToNextLevel: 300,
      titles: [],
      activeTitle: null
    };
    
    return res.json(mockUser);
  }
  
  if (!req.isAuthenticated()) {
    console.log('User not authenticated - returning 401');
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  const user = req.user as Express.User;
  
  console.log('Full user object from session:', user);
  console.log('User ID type:', typeof user.id, 'Value:', user.id);
  console.log('User roles:', user.roles);
  
  return res.json({
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    email: user.email,
    discordId: user.discordId,  // Make sure to include discordId
    avatar: user.avatar,
    roles: user.roles || [],
    level: user.level || 1,
    inventory: user.inventory || {},
    titles: user.titles || [],
    activeTitle: user.activeTitle,
    completedQuests: user.completedQuests || [],
    xp: user.xp || 0,
    xpToNextLevel: user.xpToNextLevel || 300
  });
});

export default router;