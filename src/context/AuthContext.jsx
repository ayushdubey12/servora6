import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function getStoredAuth() {
  try {
    const stored = localStorage.getItem('servora-auth');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    const stored = getStoredAuth();
    if (stored?.user && stored?.token) {
      setUser(stored.user);
      setToken(stored.token);
      setRestaurant(stored.restaurant || null);
      setIsAuthenticated(true);
    }
  }, []);

  const persistAuth = (authData) => {
    localStorage.setItem('servora-auth', JSON.stringify(authData));
    setUser(authData.user);
    setToken(authData.token);
    setRestaurant(authData.restaurant || null);
    setIsAuthenticated(true);
  };

  const login = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Login failed');
    }

    persistAuth({ user: data.data.user, token: data.data.token, refreshToken: data.data.refreshToken, restaurant: data.data.restaurant });
    return data.data.user;
  };

  const logout = () => {
    localStorage.removeItem('servora-auth');
    setUser(null);
    setToken(null);
    setRestaurant(null);
    setIsAuthenticated(false);
  };

  const register = async (data) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Registration failed');
    }

    persistAuth({ user: result.data.user, token: result.data.token, refreshToken: result.data.refreshToken, restaurant: result.data.restaurant });
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, token, restaurant, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export function roleHome(role) {
  if (role === 'chef') return '/kitchen';
  if (role === 'waiter') return '/staff';
  return '/dashboard';
}
