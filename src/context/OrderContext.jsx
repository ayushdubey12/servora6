import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const OrderContext = createContext(null);

function orderFromRow(row) {
  const claimedBy = row.claimed_by
    ? { id: row.claimed_by.id, name: row.claimed_by.name, role: row.claimed_by.role }
    : null;
  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    tableNumber: row.table_number,
    customerName: row.customer_name,
    status: row.status,
    paymentStatus: row.payment_status,
    subtotal: row.subtotal,
    tax: row.tax,
    total: row.total,
    claimedById: row.claimed_by_id,
    customerId: row.customer_id,
    pointsEarned: row.points_earned,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    claimedBy,
    items: (row.items || []).map(item => ({
      id: item.id,
      orderId: item.order_id,
      itemId: item.item_id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      menuItem: item.menu_items ? { id: item.menu_items.id, name: item.menu_items.name } : null,
    })),
  };
}

export function OrderProvider({ children }) {
  const { isAuthenticated, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef(null);

  // Fetch all orders on mount / when auth changes
  useEffect(() => {
    if (!isAuthenticated) { setOrders([]); setLoading(false); return; }
    setLoading(true);
    supabase
      .from('orders')
      .select('*, items:order_items(*, menu_items(id, name)), claimed_by:profiles!orders_claimed_by_id_fkey(id, name, role)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setOrders(data.map(orderFromRow));
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated, token]);

  // Subscribe to real-time order changes
  useEffect(() => {
    if (!isAuthenticated) return;

    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        async (payload) => {
          // Fetch the full order with items
          const { data: fullOrder } = await supabase
            .from('orders')
            .select('*, items:order_items(*, menu_items(id, name)), claimed_by:profiles!orders_claimed_by_id_fkey(id, name, role)')
            .eq('id', payload.new.id)
            .single();
          if (fullOrder) setOrders(prev => [orderFromRow(fullOrder), ...prev]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        async (payload) => {
          const { data: fullOrder } = await supabase
            .from('orders')
            .select('*, items:order_items(*, menu_items(id, name)), claimed_by:profiles!orders_claimed_by_id_fkey(id, name, role)')
            .eq('id', payload.new.id)
            .single();
          if (fullOrder) {
            setOrders(prev => prev.map(o => (o.id === fullOrder.id ? orderFromRow(fullOrder) : o)));
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [isAuthenticated]);

  const updateOrderStatus = useCallback(async (orderId, status) => {
    const updateData = { status };
    if (status === 'PAID' || status === 'COMPLETED') {
      updateData.payment_status = 'PAID';
    }
    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);
    if (error) throw new Error(error.message);
  }, []);

  const addOrder = useCallback(async (payload) => {
    // Resolve the restaurant
    let restaurantId = payload.restaurantId;
    if (!restaurantId) {
      const { data: rest } = await supabase.from('restaurants').select('id').limit(1).single();
      restaurantId = rest?.id;
    }
    if (!restaurantId) throw new Error('No restaurant configured');

    const { tableNumber, customerName, items, customerId } = payload;

    if (!tableNumber || !customerName || !items?.length) {
      throw new Error('Table number, customer name, and items are required');
    }

    // Resolve menu items to get prices
    const resolvedItems = [];
    for (const entry of items) {
      const { data: menuItem } = await supabase
        .from('menu_items')
        .select('id, name, price')
        .eq('id', entry.itemId)
        .single();
      resolvedItems.push({
        item_id: menuItem?.id || null,
        name: menuItem?.name || entry.name || 'Unknown Item',
        quantity: entry.quantity,
        price: menuItem?.price || 0,
      });
    }

    const subtotal = resolvedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        restaurant_id: restaurantId,
        table_number: Number(tableNumber),
        customer_name: customerName,
        status: 'PENDING',
        payment_status: 'PENDING',
        subtotal,
        tax,
        total,
        customer_id: customerId || null,
        points_earned: Math.floor(total),
      })
      .select('*, items:order_items(*, menu_items(id, name)), claimed_by:profiles!orders_claimed_by_id_fkey(id, name, role)')
      .single();

    if (error) throw new Error(error.message);

    // Insert order items
    if (order) {
      const orderItems = resolvedItems.map(item => ({
        order_id: order.id,
        item_id: item.item_id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      }));
      await supabase.from('order_items').insert(orderItems);
    }

    const finalOrder = order ? orderFromRow(order) : null;
    setCurrentOrder(finalOrder);
    return finalOrder;
  }, []);

  const claimOrder = useCallback(async (orderId, waiterId) => {
    // First check current status
    const { data: order } = await supabase
      .from('orders')
      .select('status, claimed_by_id')
      .eq('id', orderId)
      .single();

    if (order?.claimed_by_id && order.claimed_by_id !== waiterId) {
      throw new Error('Order already claimed by another waiter');
    }

    const updateData = { claimed_by_id: waiterId };
    if (order?.status === 'PENDING') updateData.status = 'ACCEPTED';

    const { data: updated, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select('*, items:order_items(*, menu_items(id, name)), claimed_by:profiles!orders_claimed_by_id_fkey(id, name, role)')
      .single();

    if (error) throw new Error(error.message);
    return updated ? orderFromRow(updated) : null;
  }, []);

  const releaseOrder = useCallback(async (orderId) => {
    const { data: order } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .single();

    const updateData = { claimed_by_id: null };
    if (order?.status === 'ACCEPTED') updateData.status = 'PENDING';

    const { data: updated, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select('*, items:order_items(*, menu_items(id, name)), claimed_by:profiles!orders_claimed_by_id_fkey(id, name, role)')
      .single();

    if (error) throw new Error(error.message);
    return updated ? orderFromRow(updated) : null;
  }, []);

  // Fetch a single order by ID (used by customer pages)
  const fetchOrder = useCallback(async (orderId) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*, menu_items(id, name)), claimed_by:profiles!orders_claimed_by_id_fkey(id, name, role)')
      .eq('id', orderId)
      .single();
    if (error) return null;
    return orderFromRow(data);
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
      updateOrderStatus, addOrder, claimOrder, releaseOrder,
      fetchOrder,
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
