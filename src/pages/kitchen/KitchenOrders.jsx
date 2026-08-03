import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import { Icons } from '../../assets/icons';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import './KitchenOrders.css';

function usePrepTimer(createdAt) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const STATUS_FLOW = {
  ACCEPTED: 'PREPARING',
  PREPARING: 'READY',
  READY: 'SERVED',
};
const REV_FLOW = { PREPARING: 'ACCEPTED', READY: 'PREPARING', SERVED: 'READY' };

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

function OrderCard({ order, updateOrderStatus, currentUserId }) {
  const timer = usePrepTimer(order.createdAt);
  const isClaimed = !!order.claimedBy;
  const isMine = order.claimedBy?.id === currentUserId;

  const next = STATUS_FLOW[order.status];
  const prev = REV_FLOW[order.status];

  return (
    <div className="order-card">
      <div className="order-card-header">
        <div className="order-card-title-group">
          <span className="order-card-id">#{String(order.id).slice(0, 8)}</span>
          <span className="order-card-table">Table {order.tableNumber}</span>
          <span className="order-card-customer">{order.customerName}</span>
        </div>
        <div className="order-card-header-right">
          <span className="order-timer"><Icons.Clock size={14} />{timer}</span>
          <Badge variant={statusBadgeVariant(order.status)}>{order.status}</Badge>
        </div>
      </div>

      <div className="order-card-items">
        {order.items?.map((it, i) => (
          <div key={i} className="order-item">
            <span className="order-item-qty">{it.quantity}×</span>
            <span className="order-item-name">{it.menuItem?.name || it.name || 'Item'}</span>
          </div>
        ))}
      </div>

      {isClaimed && (
        <div className="order-claimed-info">
          <Icons.User size={14} />
          <span>{isMine ? 'Taken by you' : `Taken by ${order.claimedBy?.name}`}</span>
        </div>
      )}

      <div className="order-card-footer">
        <span>${order.total?.toFixed(2)}</span>
        <div className="order-card-actions">
          {prev && (
            <Button variant="ghost" size="sm" onClick={() => updateOrderStatus(order.id, prev)}>← Back</Button>
          )}
          {next && (
            <Button variant="primary" size="sm" onClick={() => updateOrderStatus(order.id, next)}>
              {next === 'PREPARING' ? 'Start Preparing' : next === 'READY' ? 'Mark Ready' : 'Mark Served'}
            </Button>
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

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'PENDING', label: 'Pending' },
    { key: 'ACCEPTED', label: 'Accepted' },
    { key: 'PREPARING', label: 'Preparing' },
    { key: 'READY', label: 'Ready' },
  ];

  return (
    <div className="kitchen-orders">
      <div className="container">
        <h1 className="kitchen-orders-title">Orders</h1>
        <div className="status-tabs">
          {tabs.map(t => (
            <button key={t.key} className={`status-tab ${filter === t.key ? 'active' : ''}`} onClick={() => setFilter(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="orders-list">
          {filtered.length === 0 ? (
            <div className="orders-empty"><p>No orders match this filter.</p></div>
          ) : filtered.map(o => (
            <OrderCard key={o.id} order={o} updateOrderStatus={updateOrderStatus} currentUserId={user?.id} />
          ))}
        </div>
      </div>
    </div>
  );
}
