import { Route, Switch } from "wouter";
import { useEffect, useState } from "react";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Quests from "@/pages/quests";
import QuestDetail from "@/pages/quest-detail";
import Inventory from "@/pages/new-inventory";
import UnifiedInventory from "@/pages/unified-inventory";
import Character from "@/pages/character";
import Forge from "@/pages/forge";
import Achievements from "@/pages/achievements";
import Settings from "@/pages/settings";
import Admin from "@/pages/admin";
import AdminItems from "@/pages/admin-items";
import AdminRecipes from "@/pages/admin-recipes";
import AdminQuests from "@/pages/admin-quests";
import AdminLootboxes from "@/pages/admin-lootboxes";
import AdminSimple from "@/pages/admin-simple";
import AdminBasic from "@/pages/admin-basic";
import LootBoxPreview from "@/pages/loot-box-preview";
import NotFound from "@/pages/not-found";
import MainLayout from "@/components/layout/MainLayout";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { ProtectedRoute } from "@/lib/protected-route";
import { AdminRoute } from "@/lib/admin-route";
import { SoundProvider } from "@/context/SoundContext";
import { AuthProvider } from "@/hooks/use-auth";

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
    <AuthProvider>
      <Switch>
        <Route path="/login">
          <Login />
        </Route>
        
        <Route path="/auth">
          <Login />
        </Route>
        
        {/* Protected routes */}
        <ProtectedRoute path="/">
          <MainLayout>
            <Home />
          </MainLayout>
        </ProtectedRoute>
        
        <ProtectedRoute path="/quests">
          <MainLayout>
            <Quests />
          </MainLayout>
        </ProtectedRoute>

        <ProtectedRoute path="/quests/:id">
          <MainLayout>
            <QuestDetail />
          </MainLayout>
        </ProtectedRoute>
        
        <ProtectedRoute path="/inventory">
          <MainLayout>
            <Inventory />
          </MainLayout>
        </ProtectedRoute>
        
        <ProtectedRoute path="/unified-inventory">
          <MainLayout>
            <UnifiedInventory />
          </MainLayout>
        </ProtectedRoute>
        
        <ProtectedRoute path="/loot-box-preview/:id">
          <MainLayout>
            <LootBoxPreview />
          </MainLayout>
        </ProtectedRoute>
        
        <ProtectedRoute path="/character">
          <MainLayout>
            <Character />
          </MainLayout>
        </ProtectedRoute>
        
        <ProtectedRoute path="/forge">
          <MainLayout>
            <Forge />
          </MainLayout>
        </ProtectedRoute>
        
        {/* Redirect workshop to forge */}
        <ProtectedRoute path="/workshop">
          <MainLayout>
            <Forge />
          </MainLayout>
        </ProtectedRoute>
        
        <ProtectedRoute path="/achievements">
          <MainLayout>
            <Achievements />
          </MainLayout>
        </ProtectedRoute>
        
        <AdminRoute path="/admin">
          <Admin />
        </AdminRoute>
        
        <AdminRoute path="/admin-items">
          <AdminItems />
        </AdminRoute>
        
        <AdminRoute path="/admin-recipes">
          <AdminRecipes />
        </AdminRoute>
        
        <AdminRoute path="/admin-quests">
          <AdminQuests />
        </AdminRoute>
        
        <AdminRoute path="/admin-lootboxes">
          <AdminLootboxes />
        </AdminRoute>
        
        <AdminRoute path="/admin-basic">
          <AdminBasic />
        </AdminRoute>
        
        <AdminRoute path="/admin-simple">
          <AdminSimple />
        </AdminRoute>
        
        <ProtectedRoute path="/settings">
          <MainLayout>
            <Settings />
          </MainLayout>
        </ProtectedRoute>
        
        <Route>
          <NotFound />
        </Route>
      </Switch>
    </AuthProvider>
  );
}

export default App;
