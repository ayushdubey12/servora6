import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

const ReservationContext = createContext(null);

function reservationFromRow(row) {
  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    customerId: row.customer_id,
    customerName: row.customer_name,
    phone: row.phone,
    email: row.email,
    partySize: row.party_size,
    date: row.date,
    time: row.time,
    notes: row.notes,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function ReservationProvider({ children }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef(null);

  const fetchReservations = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setReservations(data.map(reservationFromRow));
    } catch {
      /* keep current list */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  // Subscribe to real-time reservation changes
  useEffect(() => {
    const channel = supabase
      .channel('reservations-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'reservations' },
        (payload) => {
          setReservations(prev => [reservationFromRow(payload.new), ...prev]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'reservations' },
        (payload) => {
          setReservations(prev => prev.map(r => (r.id === payload.new.id ? reservationFromRow(payload.new) : r)));
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
  }, []);

  const createReservation = useCallback(async (payload) => {
    // Resolve restaurant
    let restaurantId = payload.restaurantId;
    if (!restaurantId) {
      const { data: rest } = await supabase.from('restaurants').select('id').limit(1).single();
      restaurantId = rest?.id;
    }

    const { data, error } = await supabase
      .from('reservations')
      .insert({
        restaurant_id: restaurantId,
        customer_id: payload.customerId || null,
        customer_name: payload.customerName,
        phone: payload.phone || null,
        email: payload.email || null,
        party_size: Number(payload.partySize),
        date: payload.date,
        time: payload.time,
        notes: payload.notes || null,
        status: 'PENDING',
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return reservationFromRow(data);
  }, []);

  const updateReservationStatus = useCallback(async (id, status) => {
    const { data, error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    setReservations(prev => prev.map(r => (r.id === id ? reservationFromRow(data) : r)));
    return reservationFromRow(data);
  }, []);

  return (
    <ReservationContext.Provider
      value={{ reservations, loading, fetchReservations, createReservation, updateReservationStatus }}
    >
      {children}
    </ReservationContext.Provider>
  );
}

export const useReservations = () => {
  const context = useContext(ReservationContext);
  if (!context) throw new Error('useReservations must be used within ReservationProvider');
  return context;
};
