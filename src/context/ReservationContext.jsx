import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getReservations, createReservation as apiCreateReservation, updateReservationStatus as apiUpdateReservationStatus } from '../lib/api';

const ReservationContext = createContext(null);

function reservationFromRow(row) {
  return {
    id: row.id,
    restaurantId: row.restaurantId || row.restaurant_id,
    customerId: row.customerId || row.customer_id,
    customerName: row.customerName || row.customer_name,
    phone: row.phone || row.customerPhone || row.customer_phone,
    email: row.email || row.customerEmail || row.customer_email,
    partySize: row.partySize || row.party_size,
    date: row.date,
    time: row.time,
    notes: row.notes,
    status: row.status,
    createdAt: row.createdAt || row.created_at,
    updatedAt: row.updatedAt || row.updated_at,
  };
}

export function ReservationProvider({ children }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = useCallback(async () => {
    try {
      const data = await getReservations();
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

  // Poll for updates
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const data = await getReservations();
        if (data) setReservations(data.map(reservationFromRow));
      } catch {
        // ignore
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const createReservationFn = useCallback(async (payload) => {
    const data = await apiCreateReservation({
      restaurantId: payload.restaurantId,
      customerId: payload.customerId || null,
      customerName: payload.customerName,
      customerPhone: payload.phone || null,
      customerEmail: payload.email || null,
      partySize: Number(payload.partySize),
      date: payload.date,
      time: payload.time,
      notes: payload.notes || null,
      status: 'PENDING',
    });
    const res = reservationFromRow(data);
    setReservations(prev => [res, ...prev]);
    return res;
  }, []);

  const updateReservationStatusFn = useCallback(async (id, status) => {
    const data = await apiUpdateReservationStatus(id, status);
    const res = reservationFromRow(data);
    setReservations(prev => prev.map(r => (r.id === id ? res : r)));
    return res;
  }, []);

  return (
    <ReservationContext.Provider
      value={{ reservations, loading, fetchReservations, createReservation: createReservationFn, updateReservationStatus: updateReservationStatusFn }}
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
