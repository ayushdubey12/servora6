import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getProfile } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hydrate session on mount from localStorage
  useEffect(() => {
    async function hydrate() {
      try {
        const stored = JSON.parse(localStorage.getItem('servora-auth') || 'null');
        if (stored?.user && stored?.token) {
          // Verify token is still valid by fetching profile
          try {
            const { user: freshUser, restaurant: freshRestaurant } = await getProfile();
            if (freshUser && ['owner', 'chef', 'waiter'].includes(freshUser.role)) {
              setUser({
                id: freshUser.id,
                name: freshUser.name,
                email: freshUser.email,
                role: freshUser.role,
                phone: freshUser.phone,
                restaurantId: freshUser.restaurantId,
              });
              setRestaurant(freshRestaurant);
              setToken(stored.token);
              setIsAuthenticated(true);
              // Update localStorage with fresh data so other contexts get the right restaurantId
              localStorage.setItem('servora-auth', JSON.stringify({
                user: { ...stored.user, restaurantId: freshUser.restaurantId },
                token: stored.token,
              }));
            }
          } catch {
            // Token invalid, clear
            localStorage.removeItem('servora-auth');
          }
        }
      } catch {
        // ignore
      }
      setLoading(false);
    }
    hydrate();
  }, []);

  const login = async (email, password) => {
    const data = await loginUser(email, password);

    if (!['owner', 'chef', 'waiter'].includes(data.user.role)) {
      throw new Error('No staff account found. Please check your credentials.');
    }

    setUser(data.user);
    setRestaurant(data.restaurant);
    setToken(data.token);
    setIsAuthenticated(true);

    localStorage.setItem('servora-auth', JSON.stringify({
      user: data.user,
      token: data.token,
    }));

    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('servora-auth');
    setUser(null);
    setIsAuthenticated(false);
    setToken(null);
    setRestaurant(null);
  };

  const register = async (data) => {
    const result = await registerUser({
      email: data.email,
      password: data.password,
      name: data.name,
      restaurantName: data.restaurantName,
    });

    setUser(result.user);
    setRestaurant(result.restaurant);
    setToken(result.token);
    setIsAuthenticated(true);

    localStorage.setItem('servora-auth', JSON.stringify({
      user: result.user,
      token: result.token,
    }));

    return true;
  };

  const signInWithGoogle = async () => {
    // Google OAuth not supported with self-hosted backend
    // Redirect to a mock or disable for now
    throw new Error('Google sign-in is not available with the current backend. Please use email/password.');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, token, restaurant, loading, login, logout, register, signInWithGoogle }}>
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
  if (role === 'admin') return '/admin';
  return '/dashboard';
}
