import { Route, Switch } from "wouter";
import { useEffect, useState } from "react";
import Home from "@/pages/home";
import DesktopHome from "@/pages/desktop-home";
import Desktop from "@/pages/desktop"; // Import the new Desktop page
import AuthPage from "@/pages/auth-page";
import Login from "@/pages/login";
import Quests from "@/pages/quests";
import QuestDetail from "@/pages/quest-detail";
import MissionPage from "@/pages/mission";
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

import NotFound from "@/pages/not-found";
import MainLayout from "@/components/layout/MainLayout";
import FullscreenUniversalEmulatorApp from "@/components/retro-ui/FullscreenUniversalEmulatorApp";
import SimulatorDemo from "@/components/circuit-builder/demo/SimulatorDemo";
import SimpleBlinkDemo from "@/components/circuit-builder/demo/SimpleBlinkDemo";
import RGBLEDDemo from "@/pages/RGBLEDDemo";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { ProtectedRoute, AdminRoute } from "@/lib/protected-route";
import { SoundProvider } from "@/context/SoundContext";
import { AuthProvider } from "@/hooks/use-auth";
import { AudioPlayerProvider } from "@/contexts/AudioPlayerContext";
import RetroBootScreen from "@/components/retro-ui/RetroBootScreen";

function App() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // Error boundary
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('App Error:', event.error);
      setHasError(true);
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  
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

  if (hasError) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#000',
        color: '#fff',
        fontFamily: 'monospace'
      }}>
        <h1>App Error</h1>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            background: '#333',
            color: '#fff',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Reload Page
        </button>
      </div>
    );
  }

  if (isAuthenticating) {
    return (
      <RetroBootScreen 
        onComplete={() => {
          // Allow the boot screen to complete naturally
          // The authentication process will handle the redirect
        }}
      />
    );
  }

  return (
    <AudioPlayerProvider>
      <AuthProvider>

        <Switch>
        <Route path="/login">
          <Login />
        </Route>
        
        <Route path="/auth">
          <Login />
        </Route>
        
        <Route path="/logout">
          <Logout />
        </Route>
        
        {/* Default route - show login if not authenticated, desktop if authenticated */}
        <Route path="/">
          <DesktopHome />
        </Route>
        
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
          path="/mission/:questId" 
          component={() => <MissionPage />} 
        />
        
        <ProtectedRoute 
          path="/simulator-demo" 
          component={() => <SimulatorDemo />} 
        />
        
        <ProtectedRoute 
          path="/blink-demo" 
          component={() => <SimpleBlinkDemo />} 
        />
        
        <ProtectedRoute 
          path="/rgb-demo" 
          component={() => <RGBLEDDemo />} 
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
        

        
        <Route>
          <NotFound />
        </Route>
      </Switch>
    </AuthProvider>
    </AudioPlayerProvider>
  );
}

export default App;
