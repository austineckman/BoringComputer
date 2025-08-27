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



// Get current user - returns user data if authenticated, null if guest
router.get("/me", (req, res) => {
  if (!req.isAuthenticated()) {
    // Return null for guest users - frontend will handle guest mode
    return res.json(null);
  }
  
  const user = req.user as Express.User;
  
  return res.json({
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    email: user.email,
    discordId: user.discordId,
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