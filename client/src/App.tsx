import { Route, Switch } from "wouter";
import { useEffect, useState } from "react";
import Home from "@/pages/home";
import DesktopHome from "@/pages/desktop-home";
import Desktop from "@/pages/desktop"; // Import the new Desktop page
import AuthPage from "@/pages/auth-page";
import Quests from "@/pages/quests";
import QuestDetail from "@/pages/quest-detail";
import AdventureLine from "@/pages/adventure-line";
import Inventory from "@/pages/new-inventory";
import UnifiedInventory from "@/pages/unified-inventory";
import Character from "@/pages/character";
import Forge from "@/pages/forge";
import Achievements from "@/pages/achievements";
import Settings from "@/pages/settings";
import Logout from "@/pages/logout";
import Admin from "@/pages/admin";
import AdminItems from "@/pages/admin-items";
import AdminRecipes from "@/pages/admin-recipes";
import AdminQuests from "@/pages/admin-quests";
import AdminLootboxes from "@/pages/admin-lootboxes";
import AdminSimple from "@/pages/admin-simple";
import AdminBasic from "@/pages/admin-basic";
import AdminKits from "@/pages/admin-kits";
import AdminUsers from "@/pages/admin-users";
import AdminStats from "@/pages/admin-stats";
import AdminSettings from "@/pages/admin-settings";
import AdminQuestGenerator from "@/pages/admin-quest-generator";
import LootBoxPreview from "@/pages/loot-box-preview";
import EmulatorTest from "@/pages/emulator-test";
import NotFound from "@/pages/not-found";
import MainLayout from "@/components/layout/MainLayout";
import FullscreenUniversalEmulatorApp from "@/components/retro-ui/FullscreenUniversalEmulatorApp";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { ProtectedRoute, AdminRoute } from "@/lib/protected-route";
import { SoundProvider } from "@/context/SoundContext";
import { AuthProvider } from "@/hooks/use-auth";
import { AudioPlayerProvider } from "@/contexts/AudioPlayerContext";

function App() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  // Check if there's a token in the URL (for Discord redirect)
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substr(1));
    const accessToken = hashParams.get("access_token");
    
    if (accessToken) {
      setIsAuthenticating(true);
      
      // Make API call to authenticate with Discord token
      const authenticateWithDiscord = async () => {
        try {
          const response = await fetch('/api/auth/discord', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: accessToken }),
          });
          
          if (response.ok) {
            // If authentication successful, redirect to home
            window.location.href = '/';
          }
        } catch (error) {
          console.error('Error authenticating with Discord:', error);
        } finally {
          setIsAuthenticating(false);
          // Clean up the URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      };
      
      authenticateWithDiscord();
    }
  }, []);

  if (isAuthenticating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <AudioPlayerProvider>
      <AuthProvider>
        <Switch>
        <Route path="/login">
          <AuthPage />
        </Route>
        
        <Route path="/auth">
          <AuthPage />
        </Route>
        
        <Route path="/logout">
          <Logout />
        </Route>
        
        {/* Protected routes */}
        <ProtectedRoute 
          path="/" 
          component={DesktopHome} 
        />
        
        <ProtectedRoute 
          path="/quests" 
          component={() => (
            <MainLayout>
              <Quests />
            </MainLayout>
          )} 
        />

        <ProtectedRoute 
          path="/adventure/:id" 
          component={() => (
            <MainLayout>
              <AdventureLine />
            </MainLayout>
          )} 
        />

        <ProtectedRoute 
          path="/quests/:id" 
          component={() => (
            <MainLayout>
              <QuestDetail />
            </MainLayout>
          )} 
        />
        
        <ProtectedRoute 
          path="/inventory" 
          component={() => (
            <MainLayout>
              <Inventory />
            </MainLayout>
          )} 
        />
        
        <ProtectedRoute 
          path="/unified-inventory" 
          component={() => (
            <MainLayout>
              <UnifiedInventory />
            </MainLayout>
          )} 
        />
        
        <ProtectedRoute 
          path="/loot-box-preview/:id" 
          component={() => (
            <MainLayout>
              <LootBoxPreview />
            </MainLayout>
          )} 
        />
        
        <ProtectedRoute 
          path="/character" 
          component={() => (
            <MainLayout>
              <Character />
            </MainLayout>
          )} 
        />
        
        <ProtectedRoute 
          path="/forge" 
          component={() => (
            <MainLayout>
              <Forge />
            </MainLayout>
          )} 
        />
        
        {/* Redirect workshop to forge */}
        <ProtectedRoute 
          path="/workshop" 
          component={() => (
            <MainLayout>
              <Forge />
            </MainLayout>
          )} 
        />
        
        <ProtectedRoute 
          path="/achievements" 
          component={() => (
            <MainLayout>
              <Achievements />
            </MainLayout>
          )} 
        />
        
        <AdminRoute 
          path="/admin" 
          component={Admin} 
        />
        
        <AdminRoute 
          path="/admin-items" 
          component={AdminItems} 
        />
        
        <AdminRoute 
          path="/admin-recipes" 
          component={AdminRecipes} 
        />
        
        <AdminRoute 
          path="/admin-quests" 
          component={AdminQuests} 
        />
        
        <AdminRoute 
          path="/admin-lootboxes" 
          component={AdminLootboxes} 
        />
        
        <AdminRoute 
          path="/admin-basic" 
          component={AdminBasic} 
        />
        
        <AdminRoute 
          path="/admin-simple" 
          component={AdminSimple} 
        />
        
        <AdminRoute 
          path="/admin-kits" 
          component={AdminKits} 
        />
        
        <AdminRoute 
          path="/admin-users" 
          component={AdminUsers} 
        />

        <AdminRoute 
          path="/admin-stats" 
          component={AdminStats} 
        />
        
        <AdminRoute 
          path="/admin-settings" 
          component={AdminSettings} 
        />
        
        <AdminRoute 
          path="/admin-quest-generator" 
          component={AdminQuestGenerator} 
        />
        
        <ProtectedRoute 
          path="/settings" 
          component={() => (
            <MainLayout>
              <Settings />
            </MainLayout>
          )} 
        />

        <ProtectedRoute
          path="/universal-emulator"
          component={() => (
            <FullscreenUniversalEmulatorApp onClose={() => window.location.href = '/'} />
          )}
        />
        
        <Route
          path="/emulator-test"
          component={EmulatorTest}
        />
        
        <Route>
          <NotFound />
        </Route>
      </Switch>
    </AuthProvider>
    </AudioPlayerProvider>
  );
}

export default App;
