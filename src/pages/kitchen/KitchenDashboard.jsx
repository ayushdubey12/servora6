import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../../context/OrderContext';
import { Icons } from '../../assets/icons';
import Stat from '../../components/ui/Stat';
import Badge from '../../components/ui/Badge';
import './KitchenDashboard.css';

export default function KitchenDashboard() {
  const { newOrders, preparingOrders, readyOrders, activeOrders, completedOrders } = useOrders();

  const stats = useMemo(() => [
    { title: 'Active Orders', value: activeOrders.length, trend: 'up', trendValue: `${activeOrders.length} now`, icon: <Icons.Activity size={20} /> },
    { title: 'New', value: newOrders.length, trend: 'up', trendValue: 'needs action', icon: <Icons.Bell size={20} />, variant: 'new' },
    { title: 'Preparing', value: preparingOrders.length, trend: 'up', trendValue: 'in progress', icon: <Icons.Clock size={20} />, variant: 'preparing' },
    { title: 'Ready', value: readyOrders.length, trend: 'up', trendValue: 'to serve', icon: <Icons.CheckCircle size={20} />, variant: 'ready' },
  ], [newOrders.length, preparingOrders.length, readyOrders.length, activeOrders.length]);

  const navigate = useNavigate();

  return (
    <div className="kitchen-dashboard">
      <div className="container">
        <div className="kitchen-dash-header">
          <div>
            <h1 className="kitchen-dash-title">Kitchen Overview</h1>
            <p className="kitchen-dash-time">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>

        <div className="kitchen-stats-grid">
          {stats.map(stat => (
            <div key={stat.title} className={`kitchen-stat-card ${stat.variant ? `variant-${stat.variant}` : ''}`} onClick={() => stat.variant === 'new' ? navigate('/kitchen/orders') : null}>
              <div className="kitchen-stat-content">
                <span className="kitchen-stat-label">{stat.title}</span>
                <span className="kitchen-stat-value">{stat.value}</span>
                <span className="kitchen-stat-trend">{stat.trendValue}</span>
              </div>
              <div className="kitchen-stat-icon">{stat.icon}</div>
            </div>
          ))}
        </div>

        {newOrders.length > 0 && (
          <div className="kitchen-alerts">
            <h2 className="kitchen-alerts-title">
              <Icons.Bell size={18} />
              Needs Attention
            </h2>
            <div className="kitchen-alerts-list">
              {newOrders.map(order => (
                <div key={order.id} className="alert-item" onClick={() => navigate('/kitchen/orders')}>
                  <span className="alert-table">Table {order.tableNumber}</span>
                  <span className="alert-desc">{order.items?.length || 0} items</span>
                  <Icons.ChevronRight size={16} />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeOrders.length > 0 && (
          <div className="kitchen-recent">
            <h2 className="kitchen-recent-title">Active Orders</h2>
            <div className="kitchen-recent-list">
              {activeOrders.slice(0, 5).map(order => (
                <div key={order.id} className="recent-item">
                  <div className="recent-item-left">
                    <span className="recent-order-id">#{String(order.id).slice(0, 8)}</span>
                    <span className="recent-table">Table {order.tableNumber}</span>
                  </div>
                  <Badge variant={order.status === 'PENDING' ? 'primary' : order.status === 'PREPARING' ? 'tertiary' : order.status === 'READY' ? 'secondary' : 'default'}>
                    {order.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeOrders.length === 0 && (
          <div className="kitchen-empty">
            <Icons.CheckCircle size={40} />
            <h3>All caught up!</h3>
            <p>No active orders right now.</p>
          </div>
        )}
      </div>
    </div>
  );
}
