import { useState, useMemo, useCallback } from 'react';
import { useOrders } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import { Icons } from '../../assets/icons';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import './StaffOrders.css';

// Waiter actions: claim (PENDING→ACCEPTED), then pick up READY → SERVED
const WAITER_STATUS_FLOW = {
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

function OrderCard({ order, user, claiming, claim, release, updateOrderStatus }) {
  const isMine = order.claimedById === user?.id;
  const isClaimed = !!order.claimedBy;
  const next = WAITER_STATUS_FLOW[order.status];
  const isReady = order.status === 'READY';

  return (
    <div className={`staff-order-card ${isReady ? 'staff-order-card--ready' : ''}`}>
      {/* Top row: ID, table, status */}
      <div className="staff-card-top">
        <div className="staff-card-top-left">
          <span className="staff-card-id">#{String(order.id).slice(0, 8)}</span>
          <span className="staff-card-table">Table {order.tableNumber}</span>
        </div>
        <div className="staff-card-top-right">
          <span className="staff-card-time">
            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <Badge variant={statusBadgeVariant(order.status)}>{order.status}</Badge>
        </div>
      </div>

      {/* Items — compact inline view */}
      <div className="staff-card-items">
        {(order.items || []).map((it, i) => (
          <span key={i} className="staff-card-item">
            <strong>{it.quantity}×</strong> {it.menuItem?.name || it.name || 'Item'}
          </span>
        ))}
      </div>

      {/* Bottom row: customer, total, actions */}
      <div className="staff-card-bottom">
        <div className="staff-card-bottom-left">
          <span className="staff-card-customer">
            <Icons.User size={12} />
            {order.customerName || 'Guest'}
          </span>
          <span className="staff-card-total">₹{order.total?.toFixed(0)}</span>
          {isClaimed && (
            <span className={`staff-card-claim ${isMine ? 'staff-card-claim--mine' : ''}`}>
              <Icons.User size={11} />
              {isMine ? 'You' : order.claimedBy?.name}
            </span>
          )}
        </div>
        <div className="staff-card-actions">
          {!isClaimed && order.status === 'PENDING' && (
            <Button size="sm" variant="primary" loading={claiming[order.id]} onClick={() => claim(order.id)}>
              Accept
            </Button>
          )}
          {isClaimed && !isMine && (
            <span className="staff-card-taken">Taken</span>
          )}
          {isClaimed && isMine && next && (
            <Button size="sm" variant="primary" onClick={() => updateOrderStatus(order.id, next)}>
              {next === 'SERVED' ? 'Mark Served' : 'Request Payment'}
            </Button>
          )}
          {isClaimed && isMine && isReady && (
            <span className="staff-card-ready-badge">Ready</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StaffOrders() {
  const { orders, updateOrderStatus, claimOrder, releaseOrder } = useOrders();
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [claiming, setClaiming] = useState({});

  const readyOrders = useMemo(() =>
    orders.filter(o => o.status === 'READY' && !['COMPLETED', 'CANCELLED'].includes(o.status)),
    [orders]
  );

  const filtered = useMemo(() => {
    if (filter === 'unclaimed') return orders.filter(o => !o.claimedById && !['COMPLETED', 'CANCELLED'].includes(o.status));
    if (filter === 'mine') return orders.filter(o => o.claimedById === user?.id && !['COMPLETED', 'CANCELLED'].includes(o.status));
    if (filter === 'all') return orders.filter(o => !['COMPLETED', 'CANCELLED'].includes(o.status));
    return orders.filter(o => o.status === filter && !['COMPLETED', 'CANCELLED'].includes(o.status));
  }, [orders, filter, user]);

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'unclaimed', label: 'Available' },
    { key: 'mine', label: 'My Orders' },
    { key: 'READY', label: 'Ready' },
  ];

  const claim = useCallback(async (orderId) => {
    setClaiming(c => ({ ...c, [orderId]: true }));
    try {
      await claimOrder(orderId, user?.id);
    } catch (err) {
      console.error('[Staff Claim]', err);
      alert(err.message || 'Failed to accept order. Please try again.');
    } finally {
      setClaiming(c => ({ ...c, [orderId]: false }));
    }
  }, [claimOrder, user]);

  const release = useCallback(async (orderId) => {
    setClaiming(c => ({ ...c, [orderId]: true }));
    try { await releaseOrder(orderId); }
    finally { setClaiming(c => ({ ...c, [orderId]: false })); }
  }, [releaseOrder]);

  return (
    <div className="staff-orders-page">
      <div className="staff-orders-container">
        {/* Header */}
        <div className="staff-orders-header">
          <h1 className="staff-orders-title">Orders</h1>
          <p className="staff-orders-subtitle">
            {filtered.length} order{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Ready for pickup alert */}
        {readyOrders.length > 0 && (
          <div className="staff-ready-alert">
            <div className="staff-ready-alert-header">
              <Icons.Bell size={18} />
              <span>{readyOrders.length} order{readyOrders.length > 1 ? 's' : ''} ready for pickup</span>
            </div>
            <div className="staff-ready-alert-list">
              {readyOrders.map(order => (
                <div key={order.id} className="staff-ready-alert-item">
                  <div className="staff-ready-alert-info">
                    <span className="staff-ready-alert-table">Table {order.tableNumber}</span>
                    <span className="staff-ready-alert-detail">
                      {order.items?.length} items · ₹{order.total?.toFixed(0)}
                    </span>
                  </div>
                  <Button size="sm" variant="primary" onClick={() => updateOrderStatus(order.id, 'SERVED')}>
                    Serve
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="staff-orders-tabs">
          {tabs.map(t => (
            <button
              key={t.key}
              className={`staff-orders-tab ${filter === t.key ? 'staff-orders-tab--active' : ''}`}
              onClick={() => setFilter(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Order List */}
        {filtered.length === 0 ? (
          <div className="staff-orders-empty">
            <Icons.Package size={40} />
            <p>No orders here yet.</p>
          </div>
        ) : (
          <div className="staff-orders-list">
            {filtered.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                user={user}
                claiming={claiming}
                claim={claim}
                release={release}
                updateOrderStatus={updateOrderStatus}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
