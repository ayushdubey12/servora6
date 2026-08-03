import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const OrderContext = createContext(null);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

let _socket = null;
function getSocket() {
  if (!_socket) {
    _socket = io(API_BASE_URL, { autoConnect: false });
    _socket.connect();
  }
  return _socket;
}

export function OrderProvider({ children }) {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch all orders on mount / when user changes
  useEffect(() => {
    if (!user) { setOrders([]); setLoading(false); return; }
    setLoading(true);
    fetch(`${API_BASE_URL}/api/orders`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setOrders(d.data);
      })
      .finally(() => setLoading(false));
  }, [user, token]);

  // Socket.io listeners for real-time order events
  useEffect(() => {
    const socket = getSocket();
    socket.on('order:new', (order) => {
      setOrders((prev) => [order, ...prev]);
    });
    socket.on('order:update', (updated) => {
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    });
    return () => {
      socket.off('order:new');
      socket.off('order:update');
    };
  }, []);

  const updateOrderStatus = useCallback(async (orderId, status) => {
    await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ status }),
    });
  }, [token]);

  const addOrder = useCallback(async (payload) => {
    const restaurantId = payload.restaurantId || user?.restaurantId || (() => {
      try { const a = JSON.parse(localStorage.getItem('servora-auth') || '{}'); return a.restaurant?.id || ''; }
      catch { return ''; }
    })();
    const res = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ ...payload, restaurantId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to place order');
    setCurrentOrder(data.data);
    return data.data;
  }, [user, token]);

  const claimOrder = useCallback(async (orderId, waiterId) => {
    const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/claim`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ waiterId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to claim order');
    return data;
  }, [token]);

  const releaseOrder = useCallback(async (orderId) => {
    const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/release`, {
      method: 'PUT',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to release order');
    return data;
  }, [token]);

  // Derived views that mirror what the old mock-based context exposed
  const derived = useMemo(() => ({
    activeOrders: orders.filter((o) => !['COMPLETED', 'CANCELLED'].includes(o.status)),
    newOrders: orders.filter((o) => o.status === 'PENDING' || o.status === 'NEW'),
    preparingOrders: orders.filter((o) => o.status === 'PREPARING'),
    readyOrders: orders.filter((o) => o.status === 'READY'),
    completedOrders: orders.filter((o) => o.status === 'COMPLETED'),
  }), [orders]);

  return (
    <OrderContext.Provider value={{
      orders, currentOrder, setCurrentOrder,
      updateOrderStatus, addOrder, claimOrder, releaseOrder,
      loading,
      ...derived,
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrders must be used within OrderProvider');
  return context;
};
