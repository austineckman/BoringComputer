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
    // Check if we're in guest mode on app start
    const urlParams = new URLSearchParams(window.location.search);
    const isGuestMode = urlParams.get('guest') === 'true';
    const storedGuestMode = localStorage.getItem('guestMode') === 'true';

    if (isGuestMode || storedGuestMode) {
      // Set up guest user
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
      setIsLoading(false);
    } else {
      // Try to fetch real user data (but only once, not in a loop)
      fetchUserData();
    }
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
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