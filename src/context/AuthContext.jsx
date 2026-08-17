import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, getProfile, upsertProfile } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hydrate session on mount and listen for auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const accessToken = session.access_token;
        setToken(accessToken);
        hydrateUser(session.user, accessToken);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const accessToken = session.access_token;
        setToken(accessToken);
        await hydrateUser(session.user, accessToken);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setToken(null);
        setRestaurant(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function hydrateUser(authUser, accessToken) {
    // Get the user's profile (contains role, restaurant_id, etc.)
    let profile = await getProfile(authUser.id);

    // If no profile exists yet (trigger didn't fire), create one
    if (!profile) {
      profile = await upsertProfile(authUser.id, {
        name: authUser.user_metadata?.full_name || authUser.email,
        email: authUser.email,
        role: authUser.user_metadata?.role || 'customer',
      });
    }

    // Only set as authenticated if the user has a staff role
    if (profile && ['owner', 'chef', 'waiter'].includes(profile.role)) {
      setUser({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        phone: profile.phone,
        restaurantId: profile.restaurant_id,
      });
      setIsAuthenticated(true);

      // If the profile has a restaurant_id, fetch the restaurant
      if (profile.restaurant_id) {
        const { data: rest } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', profile.restaurant_id)
          .single();
        if (rest) setRestaurant(rest);
      }

      // Persist to localStorage for backward compatibility with components
      // that read it directly (e.g. authHeaders in WaiterSetup)
      localStorage.setItem('servora-auth', JSON.stringify({
        user: {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          phone: profile.phone,
          restaurantId: profile.restaurant_id,
        },
        token: accessToken,
      }));
    } else {
      // Customer role — not a staff user
      setIsAuthenticated(false);
    }

    setLoading(false);
  }

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);

    const profile = await getProfile(data.user.id);
    if (!profile || !['owner', 'chef', 'waiter'].includes(profile?.role)) {
      await supabase.auth.signOut();
      throw new Error('No staff account found. Please check your credentials.');
    }

    const loggedInUser = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      phone: profile.phone,
      restaurantId: profile.restaurant_id,
    };
    return loggedInUser;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('servora-auth');
    setUser(null);
    setIsAuthenticated(false);
    setToken(null);
    setRestaurant(null);
  };

  const register = async (data) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.name,
          role: 'owner',
        },
      },
    });
    if (error) throw new Error(error.message);

    // Create profile with role=owner
    const userId = authData.user.id;
    await upsertProfile(userId, {
      name: data.name,
      email: data.email,
      role: 'owner',
    });

    // Create the restaurant
    const slug = data.restaurantName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const { data: rest, error: restError } = await supabase
      .from('restaurants')
      .insert({ name: data.restaurantName, slug, description: '' })
      .select()
      .single();
    if (restError) throw new Error(restError.message);

    // Link restaurant to profile
    await upsertProfile(userId, { restaurant_id: rest.id });

    // Set state
    const profile = await getProfile(userId);
    setUser({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      restaurantId: profile.restaurant_id,
    });
    setRestaurant(rest);
    setIsAuthenticated(true);
    setToken(authData.session?.access_token || null);

    localStorage.setItem('servora-auth', JSON.stringify({
      user: { id: profile.id, name: profile.name, email: profile.email, role: profile.role, restaurantId: profile.restaurant_id },
      token: authData.session?.access_token,
    }));

    return true;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, token, restaurant, loading, login, logout, register }}>
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
