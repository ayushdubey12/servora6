import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getOrders, createOrder, updateOrderStatus, claimOrder, releaseOrder, getOrder } from '../lib/api';
import { useAuth } from './AuthContext';

const OrderContext = createContext(null);

function orderFromRow(row) {
  const claimedBy = row.claimedBy
    ? { id: row.claimedBy.id, name: row.claimedBy.name, role: row.claimedBy.role }
    : null;
  return {
    id: row.id,
    restaurantId: row.restaurantId || row.restaurant_id,
    tableNumber: row.tableNumber || row.table_number,
    customerName: row.customerName || row.customer_name,
    status: row.status,
    paymentStatus: row.paymentStatus || row.payment_status,
    subtotal: (row.subtotal || 0) / 100,
    tax: (row.tax || 0) / 100,
    total: (row.total || 0) / 100,
    claimedById: row.claimedById || row.claimed_by_id,
    customerId: row.customerId || row.customer_id,
    pointsEarned: row.pointsEarned || row.points_earned,
    createdAt: row.createdAt || row.created_at,
    updatedAt: row.updatedAt || row.updated_at,
    claimedBy,
    items: (row.items || []).map(item => ({
      id: item.id,
      orderId: item.orderId || item.order_id,
      itemId: item.itemId || item.item_id,
      name: item.name,
      quantity: item.quantity,
      price: (item.price || 0) / 100,
      menuItem: item.menuItem || item.menu_items || null,
    })),
  };
}

export function OrderProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch all orders on mount / when auth changes
  useEffect(() => {
    if (!isAuthenticated) { setOrders([]); setLoading(false); return; }
    setLoading(true);
    getOrders()
      .then(data => {
        if (data) setOrders(data.map(orderFromRow));
      })
      .catch(err => console.error('[Orders fetch]', err))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  // Poll for order updates every 10 seconds (simpler than WebSockets)
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(async () => {
      try {
        const data = await getOrders();
        if (data) setOrders(data.map(orderFromRow));
      } catch {
        // ignore polling errors
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Also poll for a specific order (used by customer tracking page)
  const fetchAndTrackOrder = useCallback(async (orderId) => {
    try {
      const data = await getOrder(orderId);
      if (data) {
        const parsed = orderFromRow(data);
        setOrders(prev => {
          const idx = prev.findIndex(o => o.id === orderId);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = parsed;
            return next;
          }
          return [parsed, ...prev];
        });
        setCurrentOrder(parsed);
        return parsed;
      }
    } catch {
      // ignore
    }
    return null;
  }, []);

  const updateOrderStatusFn = useCallback(async (orderId, status) => {
    const updated = await updateOrderStatus(orderId, status);
    if (updated) {
      setOrders(prev => prev.map(o => o.id === updated.id ? orderFromRow(updated) : o));
    }
  }, []);

  const addOrder = useCallback(async (payload) => {
    const resolvedItems = payload.items.map(entry => ({
      itemId: entry.itemId,
      name: entry.name,
      quantity: entry.quantity,
    }));

    const order = await createOrder({
      restaurantId: payload.restaurantId,
      tableNumber: payload.tableNumber,
      customerName: payload.customerName,
      items: resolvedItems,
      customerId: payload.customerId,
    });

    const finalOrder = order ? orderFromRow(order) : null;
    if (finalOrder) {
      setOrders(prev => [finalOrder, ...prev]);
    }
    setCurrentOrder(finalOrder);
    return finalOrder;
  }, []);

  const claimOrderFn = useCallback(async (orderId, waiterId) => {
    const updated = await claimOrder(orderId, waiterId);
    if (updated) {
      setOrders(prev => prev.map(o => o.id === updated.id ? orderFromRow(updated) : o));
      return orderFromRow(updated);
    }
    return null;
  }, []);

  const releaseOrderFn = useCallback(async (orderId) => {
    const updated = await releaseOrder(orderId);
    if (updated) {
      setOrders(prev => prev.map(o => o.id === updated.id ? orderFromRow(updated) : o));
      return orderFromRow(updated);
    }
    return null;
  }, []);

  const fetchOrder = useCallback(async (orderId) => {
    try {
      const data = await getOrder(orderId);
      return data ? orderFromRow(data) : null;
    } catch {
      return null;
    }
  }, []);

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
      updateOrderStatus: updateOrderStatusFn,
      addOrder,
      claimOrder: claimOrderFn,
      releaseOrder: releaseOrderFn,
      fetchOrder,
      fetchAndTrackOrder,
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
