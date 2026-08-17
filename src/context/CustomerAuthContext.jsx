import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, getProfile, upsertProfile } from '../lib/supabase';

const CustomerAuthContext = createContext(null);

export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hydrate from localStorage on mount
  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      try {
        const stored = JSON.parse(localStorage.getItem('servora-customer') || 'null');
        if (stored?.customer && stored?.token) {
          if (!cancelled) {
            setCustomer(stored.customer);
            setToken(stored.token);
          }
        } else {
          // Check if Supabase session exists with a customer role
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && !cancelled) {
            const profile = await getProfile(session.user.id);
            if (profile?.role === 'customer') {
              setCustomer({
                id: profile.id,
                name: profile.name,
                email: profile.email,
                phone: profile.phone,
                points: profile.points,
                totalSpent: profile.total_spent,
                visitCount: profile.visit_count,
              });
              setToken(session.access_token);
            }
          }
        }
      } catch {
        // ignore
      }
      if (!cancelled) setLoading(false);
    }
    hydrate();
    return () => { cancelled = true; };
  }, []);

  const persist = (data) => {
    localStorage.setItem('servora-customer', JSON.stringify(data));
    setCustomer(data.customer);
    setToken(data.token);
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);

    const profile = await getProfile(data.user.id);
    if (!profile) {
      // Profile might not exist yet — create it
      const newProfile = await upsertProfile(data.user.id, {
        name: data.user.user_metadata?.full_name || email,
        email,
        role: 'customer',
      });
      if (!newProfile) throw new Error('Failed to create customer profile');
    }

    const finalProfile = profile || await getProfile(data.user.id);
    const customerData = {
      id: finalProfile.id,
      name: finalProfile.name,
      email: finalProfile.email,
      phone: finalProfile.phone,
      points: finalProfile.points,
      totalSpent: finalProfile.total_spent,
      visitCount: finalProfile.visit_count,
    };
    persist({ customer: customerData, token: data.session.access_token });
    return customerData;
  };

  const register = async (form) => {
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.name,
          role: 'customer',
        },
      },
    });
    if (error) throw new Error(error.message);

    // Ensure profile exists with customer role
    const profile = await getProfile(data.user.id);
    if (!profile) {
      await upsertProfile(data.user.id, {
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        role: 'customer',
      });
    }

    const finalProfile = await getProfile(data.user.id);
    const customerData = {
      id: finalProfile.id,
      name: finalProfile.name,
      email: finalProfile.email,
      phone: finalProfile.phone,
      points: finalProfile.points,
      totalSpent: finalProfile.total_spent,
      visitCount: finalProfile.visit_count,
    };
    persist({ customer: customerData, token: data.session?.access_token || null });
    return customerData;
  };

  const logout = async () => {
    // Don't sign out of Supabase entirely — the staff user might also be logged in.
    // Just clear the customer session locally.
    localStorage.removeItem('servora-customer');
    setCustomer(null);
    setToken(null);
  };

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      const stored = JSON.parse(localStorage.getItem('servora-customer') || 'null');
      if (!stored?.customer?.id) return;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', stored.customer.id)
        .single();
      if (error) return null;

      const enriched = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        points: profile.points,
        totalSpent: profile.total_spent,
        visitCount: profile.visit_count,
      };

      // Fetch orders
      const { data: orders } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('customer_id', profile.id)
        .order('created_at', { ascending: false });

      // Fetch reservations
      const { data: reservations } = await supabase
        .from('reservations')
        .select('*')
        .eq('customer_id', profile.id)
        .order('created_at', { ascending: false });

      const fullCustomer = { ...enriched, orders: orders || [], reservations: reservations || [] };
      setCustomer(fullCustomer);
      localStorage.setItem('servora-customer', JSON.stringify({ customer: fullCustomer, token }));
      return fullCustomer;
    } catch {
      return null;
    }
  }, [token]);

  return (
    <CustomerAuthContext.Provider value={{ customer, token, loading, login, register, logout, refresh }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (!context) throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  return context;
};
