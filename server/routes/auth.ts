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
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  const user = req.user as Express.User;
  
  console.log('Full user object from session:', user);
  
  return res.json({
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    email: user.email,
    discordId: user.discordId,  // Make sure to include discordId
    avatar: user.avatar,
    roles: user.roles,
    level: user.level,
    inventory: user.inventory,
    titles: user.titles || [],
    activeTitle: user.activeTitle
  });
});

export default router;