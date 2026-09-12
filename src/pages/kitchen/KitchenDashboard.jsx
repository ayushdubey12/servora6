import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import { Icons } from '../../assets/icons';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import './KitchenDashboard.css';

function MiniOrderCard({ order }) {
  const statusColors = {
    PENDING: 'var(--primary)',
    ACCEPTED: 'var(--tertiary)',
    PREPARING: 'var(--secondary)',
    READY: 'var(--success)',
  };

  return (
    <div className={`kds-mini-card ${order.status === 'READY' ? 'kds-mini-card--ready' : ''}`}>
      <div className="kds-mini-bar" style={{ background: statusColors[order.status] || 'var(--primary)' }} />
      <div className="kds-mini-top">
        <span className="kds-mini-id">#{String(order.id).slice(0, 8)}</span>
        <Badge variant={order.status === 'PENDING' ? 'primary' : order.status === 'PREPARING' ? 'tertiary' : order.status === 'READY' ? 'secondary' : 'default'}>
          {order.status}
        </Badge>
      </div>
      <div className="kds-mini-table">Table {order.tableNumber}</div>
      <div className="kds-mini-items">
        {(order.items || []).slice(0, 3).map((it, i) => (
          <span key={i} className="kds-mini-item">{it.quantity}× {it.menuItem?.name || it.name}</span>
        ))}
        {(order.items?.length || 0) > 3 && <span className="kds-mini-more">+{order.items.length - 3} more</span>}
      </div>
      <div className="kds-mini-footer">
        <span className="kds-mini-total">₹{order.total?.toFixed(0)}</span>
        <span className="kds-mini-customer">{order.customerName || 'Guest'}</span>
      </div>
    </div>
  );
}

export default function KitchenDashboard() {
  const { newOrders, preparingOrders, readyOrders, activeOrders } = useOrders();
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = useMemo(() => [
    { label: 'New', value: newOrders.length, color: 'var(--primary)', icon: <Icons.Bell size={18} /> },
    { label: 'Cooking', value: preparingOrders.length, color: 'var(--tertiary)', icon: <Icons.Clock size={18} /> },
    { label: 'Ready', value: readyOrders.length, color: 'var(--success)', icon: <Icons.CheckCircle size={18} /> },
  ], [newOrders.length, preparingOrders.length, readyOrders.length]);

  return (
    <div className="kds-dash">
      <div className="kds-dash-container">
        {/* Header */}
        <div className="kds-dash-header">
          <div className="kds-dash-header-left">
            <h1 className="kds-dash-title">Kitchen</h1>
            <p className="kds-dash-time">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <Button variant="primary" size="sm" icon={<Icons.Activity size={14} />} onClick={() => navigate('/kitchen/orders')}>
            View All Orders
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="kds-dash-stats">
          {stats.map(s => (
            <div key={s.label} className="kds-dash-stat" style={{ borderColor: s.color }}>
              <div className="kds-dash-stat-icon" style={{ background: `${s.color}15`, color: s.color }}>{s.icon}</div>
              <div className="kds-dash-stat-info">
                <span className="kds-dash-stat-value">{s.value}</span>
                <span className="kds-dash-stat-label">{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* New Orders Alert */}
        {newOrders.length > 0 && (
          <div className="kds-dash-alert">
            <div className="kds-dash-alert-header">
              <Icons.Bell size={16} />
              <span>{newOrders.length} new order{newOrders.length > 1 ? 's' : ''} — tap to manage</span>
            </div>
          </div>
        )}

        {/* Active Orders Grid */}
        {activeOrders.length > 0 ? (
          <div className="kds-dash-grid">
            {activeOrders.map(order => (
              <MiniOrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <div className="kds-dash-empty">
            <Icons.CheckCircle size={40} />
            <h3>All caught up!</h3>
            <p>No active orders right now.</p>
          </div>
        )}
      </div>
    </div>
  );
}
