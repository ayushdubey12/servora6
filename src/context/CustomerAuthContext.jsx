import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getProfile, registerCustomer, loginCustomer, getCustomerProfile } from '../lib/api';

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
    const data = await loginCustomer(email, password);

    const customerData = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      phone: data.user.phone,
      restaurantId: null,
    };
    persist({ customer: customerData, token: data.token });
    return customerData;
  };

  const register = async (form) => {
    const data = await registerCustomer({
      email: form.email,
      password: form.password,
      name: form.name,
      phone: form.phone || null,
    });

    const customerData = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      phone: data.user.phone,
      restaurantId: null,
    };
    persist({ customer: customerData, token: data.token });
    return customerData;
  };

  const logout = async () => {
    localStorage.removeItem('servora-customer');
    setCustomer(null);
    setToken(null);
  };

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      const stored = JSON.parse(localStorage.getItem('servora-customer') || 'null');
      if (!stored?.customer?.id) return;

      const profile = await getCustomerProfile();
      const fullCustomer = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        points: profile.points,
      };
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
