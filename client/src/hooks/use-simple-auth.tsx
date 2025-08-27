import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface SimpleAuthUser {
  id: string;
  username: string;
  displayName: string;
  email: string | null;
  roles: string[];
  level: number;
  inventory: { gold: number };
  isGuest?: boolean;
}

interface SimpleAuthContextType {
  user: SimpleAuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginAsGuest: () => void;
  logout: () => void;
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

export function SimpleAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SimpleAuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Clear guest mode if we just authenticated
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('authenticated') === 'true') {
      localStorage.removeItem('guestMode');
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // ALWAYS try to fetch real user data first - Discord auth takes priority
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Add a minimum loading time to show the Matrix effect
      const fetchPromise = fetch('/api/auth/me', {
        credentials: 'include'
      });
      
      const minLoadTime = new Promise(resolve => setTimeout(resolve, 1500));
      
      const [response] = await Promise.all([fetchPromise, minLoadTime]);
      
      if (response.ok) {
        const userData = await response.json();
        // Clear guest mode if we have a real user
        localStorage.removeItem('guestMode');
        setUser(userData);
      } else {
        // Only use guest mode if explicitly requested via URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const isGuestMode = urlParams.get('guest') === 'true';
        
        if (isGuestMode) {
          const guestUser: SimpleAuthUser = {
            id: 'guest',
            username: 'Guest',
            displayName: 'Guest User',
            email: null,
            roles: ['guest'],
            level: 1,
            inventory: { gold: 0 },
            isGuest: true,
          };
          setUser(guestUser);
          localStorage.setItem('guestMode', 'true');
        } else {
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsGuest = () => {
    const guestUser: SimpleAuthUser = {
      id: 'guest',
      username: 'Guest',
      displayName: 'Guest User',
      email: null,
      roles: ['guest'],
      level: 1,
      inventory: { gold: 0 },
      isGuest: true,
    };
    
    setUser(guestUser);
    localStorage.setItem('guestMode', 'true');
    window.location.href = '/?guest=true';
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('guestMode');
    window.location.href = '/login';
  };

  const value: SimpleAuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    loginAsGuest,
    logout,
  };

  return (
    <SimpleAuthContext.Provider value={value}>
      {children}
    </SimpleAuthContext.Provider>
  );
}

export function useSimpleAuth() {
  const context = useContext(SimpleAuthContext);
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
}