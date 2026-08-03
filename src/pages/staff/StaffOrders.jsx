import { useState, useMemo, useCallback } from 'react';
import { useOrders } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import { Icons } from '../../assets/icons';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import './StaffOrders.css';

const STATUS_FLOW = {
  ACCEPTED: 'PREPARING',
  PREPARING: 'READY',
  READY: 'SERVED',
  SERVED: 'PAYMENT_PENDING',
};

function statusBadgeVariant(s) {
  if (s === 'PENDING') return 'primary';
  if (s === 'ACCEPTED') return 'tertiary';
  if (s === 'PREPARING') return 'tertiary';
  if (s === 'READY') return 'secondary';
  if (s === 'SERVED') return 'success';
  if (s === 'COMPLETED') return 'success';
  if (s === 'CANCELLED') return 'error';
  return 'default';
}

export default function StaffOrders() {
  const { orders, updateOrderStatus, claimOrder, releaseOrder } = useOrders();
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [claiming, setClaiming] = useState({});

  const filtered = useMemo(() => {
    if (filter === 'unclaimed') return orders.filter(o => !o.claimedById && !['COMPLETED', 'CANCELLED'].includes(o.status));
    if (filter === 'mine') return orders.filter(o => o.claimedById === user?.id);
    if (filter === 'all') return orders;
    return orders.filter(o => o.status === filter);
  }, [orders, filter]);

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'unclaimed', label: 'Unclaimed' },
    { key: 'mine', label: 'Mine' },
    { key: 'PENDING', label: 'Pending' },
    { key: 'PREPARING', label: 'Preparing' },
    { key: 'READY', label: 'Ready' },
  ];

  const claim = useCallback(async (orderId) => {
    setClaiming(c => ({ ...c, [orderId]: true }));
    try { await claimOrder(orderId, user?.id); }
    finally { setClaiming(c => ({ ...c, [orderId]: false })); }
  }, [claimOrder, user]);

  const release = useCallback(async (orderId) => {
    setClaiming(c => ({ ...c, [orderId]: true }));
    try { await releaseOrder(orderId); }
    finally { setClaiming(c => ({ ...c, [orderId]: false })); }
  }, [releaseOrder]);

  return (
    <div className="staff-orders">
      <div className="container">
        <h1 className="staff-orders-title">Orders</h1>
        <div className="status-tabs">
          {tabs.map(t => (
            <button key={t.key} className={`status-tab ${filter === t.key ? 'active' : ''}`} onClick={() => setFilter(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="staff-orders-list">
          {filtered.length === 0 ? (
            <div className="orders-empty"><p>No orders here yet.</p></div>
          ) : filtered.map(order => {
            const isMine = order.claimedById === user?.id;
            const isClaimed = !!order.claimedBy;
            const next = STATUS_FLOW[order.status];
            return (
              <div key={order.id} className="staff-order-card staff-full">
                <div className="staff-order-row">
                  <div className="staff-order-main">
                    <div className="staff-order-header">
                      <span className="staff-order-id">#{String(order.id).slice(0, 8)}</span>
                      <span className="staff-order-table-badge">Table {order.tableNumber}</span>
                    </div>
                    <div className="staff-order-items-preview">
                      {order.items?.map((it, i) => (
                        <span key={i} className="staff-order-item-chip">{it.quantity}× {it.menuItem?.name || it.name || 'Item'}</span>
                      ))}
                    </div>
                    {isClaimed && (
                      <div className="staff-order-claims">
                        <Icons.User size={14} />
                        <span>{isMine ? 'Taken by you' : `Taken by ${order.claimedBy?.name}`}</span>
                      </div>
                    )}
                  </div>
                  <div className="staff-order-meta">
                    <Badge variant={statusBadgeVariant(order.status)}>{order.status}</Badge>
                    <span className="staff-order-total">${order.total?.toFixed(2)}</span>
                    <span className="staff-order-customer">{order.customerName}</span>
                  </div>
                </div>
                <div className="staff-order-footer">
                  <span className="staff-order-time">
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className="staff-order-actions">
                    {!isClaimed && order.status === 'PENDING' && (
                      <Button size="sm" variant="primary" loading={claiming[order.id]} onClick={() => claim(order.id)}>
                        Accept Order
                      </Button>
                    )}
                    {isClaimed && !isMine && (
                      <span className="staff-order-unavailable">Taken by another waiter</span>
                    )}
                    {isClaimed && isMine && next && (
                      <Button size="sm" variant="primary" onClick={() => updateOrderStatus(order.id, next)}>
                        {next === 'PREPARING' ? 'Start Preparing' : next === 'READY' ? 'Mark Ready' : next === 'SERVED' ? 'Mark Served' : ''}
                      </Button>
                    )}
                    {isClaimed && isMine && !next && order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                      <span className="staff-order-done">Order {order.status.toLowerCase()}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
