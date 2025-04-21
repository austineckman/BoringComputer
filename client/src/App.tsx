import { Route, Switch } from "wouter";
import { useEffect } from "react";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Quests from "@/pages/quests";
import Inventory from "@/pages/inventory";
import Workshop from "@/pages/workshop";
import Achievements from "@/pages/achievements";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/lib/protected-route";

function App() {
  const { user, loading, authenticate } = useAuth();
  
  useEffect(() => {
    // Check if there's a token in the URL (from Discord redirect)
    const hashParams = new URLSearchParams(window.location.hash.substr(1));
    const accessToken = hashParams.get("access_token");
    
    if (accessToken) {
      authenticate(accessToken);
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [authenticate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
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
      
      <ProtectedRoute path="/inventory">
        <MainLayout>
          <Inventory />
        </MainLayout>
      </ProtectedRoute>
      
      <ProtectedRoute path="/workshop">
        <MainLayout>
          <Workshop />
        </MainLayout>
      </ProtectedRoute>
      
      <ProtectedRoute path="/achievements">
        <MainLayout>
          <Achievements />
        </MainLayout>
      </ProtectedRoute>
      
      <ProtectedRoute path="/admin">
        <MainLayout>
          <Admin />
        </MainLayout>
      </ProtectedRoute>
      
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

export default App;
