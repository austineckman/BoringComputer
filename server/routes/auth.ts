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



// Get current user - NO MOCK USERS, real Discord auth only
router.get("/me", (req, res) => {
  console.log('Auth check - isAuthenticated:', req.isAuthenticated());
  console.log('Auth check - user object exists:', !!req.user);
  console.log('Auth check - session ID:', req.sessionID);
  console.log('Auth check - session passport user:', req.session?.passport?.user);
  
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