import { Router } from "express";
import passport from "passport";

const router = Router();

// Discord OAuth login route
router.get("/discord", passport.authenticate("discord"));

// Discord OAuth callback route
router.get("/discord/callback", 
  passport.authenticate("discord", { failureRedirect: "/auth" }),
  (req, res) => {
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
    
    res.json({ message: "Logout successful" });
  });
});



// Get current user
router.get("/me", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  const user = req.user as Express.User;
  
  // Debug logging removed
  
  return res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    discordId: user.discordId,  // Make sure to include discordId
    roles: user.roles,
    level: user.level,
    inventory: user.inventory,
    titles: user.titles || [],
    activeTitle: user.activeTitle
  });
});

export default router;