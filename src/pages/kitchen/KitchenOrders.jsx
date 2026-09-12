import { useEffect, useState, useMemo } from 'react';
import { useOrders } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import { Icons } from '../../assets/icons';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import './KitchenOrders.css';

function usePrepTimer(createdAt, status) {
  const [elapsed, setElapsed] = useState(0);
  const isActive = !['READY', 'SERVED', 'PAID', 'COMPLETED', 'CANCELLED'].includes(status);

  useEffect(() => {
    if (!isActive) return; // Stop timer for terminal statuses
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [createdAt, isActive]);

  // Set final elapsed once when order reaches terminal status
  useEffect(() => {
    if (!isActive) {
      setElapsed(Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000));
    }
  }, [createdAt, isActive]);

  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  return { display: `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`, minutes: m, isActive };
}

// Chef workflow: PENDING → ACCEPTED → PREPARING → READY
const STATUS_FLOW = {
  PENDING: 'ACCEPTED',
  ACCEPTED: 'PREPARING',
  PREPARING: 'READY',
};

const STATUS_LABELS = {
  PENDING: 'Accept Order',
  ACCEPTED: 'Start Cooking',
  PREPARING: 'Mark Ready',
};

const STATUS_COLORS = {
  PENDING: 'var(--primary)',
  ACCEPTED: 'var(--tertiary)',
  PREPARING: 'var(--secondary)',
  READY: 'var(--success)',
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

function OrderCard({ order, updateOrderStatus }) {
  const { display: timer, minutes, isActive: timerActive } = usePrepTimer(order.createdAt, order.status);
  const next = STATUS_FLOW[order.status];
  const isReady = order.status === 'READY';
  const isPending = order.status === 'PENDING';
  const isUrgent = minutes >= 15 && !isReady;

  return (
    <div className={`kds-card ${isReady ? 'kds-card--ready' : ''} ${isUrgent ? 'kds-card--urgent' : ''}`}>
      {/* Status color bar */}
      <div className="kds-card-bar" style={{ background: STATUS_COLORS[order.status] || 'var(--primary)' }} />

      {/* Header */}
      <div className="kds-card-header">
        <div className="kds-card-header-left">
          <span className="kds-card-id">#{String(order.id).slice(0, 8)}</span>
          <span className="kds-card-table">T{order.tableNumber}</span>
        </div>
        <div className="kds-card-header-right">
          <div className={`kds-card-timer ${isUrgent ? 'kds-card-timer--urgent' : ''} ${!timerActive ? 'kds-card-timer--stopped' : ''}`}>
            <Icons.Clock size={13} />
            <span>{timer}</span>
          </div>
          <Badge variant={statusBadgeVariant(order.status)}>{order.status}</Badge>
        </div>
      </div>

      {/* Customer */}
      <div className="kds-card-customer">
        <Icons.User size={13} />
        <span>{order.customerName || 'Guest'}</span>
      </div>

      {/* Items — always visible, large and scannable */}
      <div className="kds-card-items">
        {(order.items || []).map((it, i) => (
          <div key={i} className="kds-card-item">
            <span className="kds-card-item-qty">{it.quantity}×</span>
            <span className="kds-card-item-name">{it.menuItem?.name || it.name || 'Item'}</span>
          </div>
        ))}
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="kds-card-notes">
          <Icons.MessageSquare size={12} />
          <span>{order.notes}</span>
        </div>
      )}

      {/* Footer */}
      <div className="kds-card-footer">
        <span className="kds-card-total">₹{order.total?.toFixed(0)}</span>
        <div className="kds-card-actions">
          {next && (
            <Button
              variant={isPending ? 'primary' : isReady ? 'secondary' : 'primary'}
              size="sm"
              onClick={() => updateOrderStatus(order.id, next)}
              className="kds-action-btn"
            >
              {STATUS_LABELS[order.status] || next}
            </Button>
          )}
          {isReady && (
            <span className="kds-ready-pulse">Ready</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function KitchenOrders() {
  const { orders, updateOrderStatus } = useOrders();
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();

  const filtered = useMemo(() => {
    if (filter === 'all') return orders.filter(o => !['COMPLETED', 'CANCELLED'].includes(o.status));
    return orders.filter(o => o.status === filter && !['COMPLETED', 'CANCELLED'].includes(o.status));
  }, [orders, filter]);

  const counts = useMemo(() => ({
    all: orders.filter(o => !['COMPLETED', 'CANCELLED'].includes(o.status)).length,
    PENDING: orders.filter(o => o.status === 'PENDING').length,
    ACCEPTED: orders.filter(o => o.status === 'ACCEPTED').length,
    PREPARING: orders.filter(o => o.status === 'PREPARING').length,
    READY: orders.filter(o => o.status === 'READY').length,
  }), [orders]);

  const tabs = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'PENDING', label: 'New', count: counts.PENDING },
    { key: 'ACCEPTED', label: 'Accepted', count: counts.ACCEPTED },
    { key: 'PREPARING', label: 'Cooking', count: counts.PREPARING },
    { key: 'READY', label: 'Ready', count: counts.READY },
  ];

  return (
    <div className="kds-page">
      <div className="kds-container">
        {/* Header */}
        <div className="kds-header">
          <div className="kds-header-left">
            <h1 className="kds-title">Kitchen Display</h1>
            <p className="kds-time">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <div className="kds-header-stats">
            <div className="kds-stat">
              <span className="kds-stat-value">{counts.PENDING}</span>
              <span className="kds-stat-label">New</span>
            </div>
            <div className="kds-stat-divider" />
            <div className="kds-stat">
              <span className="kds-stat-value">{counts.PREPARING}</span>
              <span className="kds-stat-label">Cooking</span>
            </div>
            <div className="kds-stat-divider" />
            <div className="kds-stat">
              <span className="kds-stat-value">{counts.READY}</span>
              <span className="kds-stat-label">Ready</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="kds-tabs">
          {tabs.map(t => (
            <button
              key={t.key}
              className={`kds-tab ${filter === t.key ? 'kds-tab--active' : ''}`}
              onClick={() => setFilter(t.key)}
            >
              <span>{t.label}</span>
              {t.count > 0 && <span className="kds-tab-count">{t.count}</span>}
            </button>
          ))}
        </div>

        {/* Order Grid */}
        {filtered.length === 0 ? (
          <div className="kds-empty">
            <Icons.CheckCircle size={48} />
            <h3>All caught up!</h3>
            <p>No orders match this filter.</p>
          </div>
        ) : (
          <div className="kds-grid">
            {filtered.map(o => (
              <OrderCard key={o.id} order={o} updateOrderStatus={updateOrderStatus} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
