import { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import { Icons } from '../../assets/icons';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import './StaffDashboard.css';

export default function StaffDashboard() {
  const { user } = useAuth();
  const { orders, preparingOrders, readyOrders, claimOrder } = useOrders();
  const navigate = useNavigate();
  const [claiming, setClaiming] = useState({});

  const unclaimedOrders = useMemo(
    () => orders.filter(o => !o.claimedById && !['COMPLETED', 'CANCELLED'].includes(o.status)),
    [orders]
  );
  const myOrders = useMemo(
    () => orders.filter(o => o.claimedById === user?.id && !['COMPLETED', 'CANCELLED'].includes(o.status)),
    [orders, user]
  );

  const stats = useMemo(() => [
    { title: 'Available Orders', value: unclaimedOrders.length, trend: 'up', trendValue: 'to pick up', icon: <Icons.Bell size={20} /> },
    { title: 'My Orders', value: myOrders.length, trend: 'up', trendValue: 'assigned to me', icon: <Icons.Activity size={20} /> },
    { title: 'Preparing', value: preparingOrders.length, trend: 'up', trendValue: 'in kitchen', icon: <Icons.Clock size={20} /> },
    { title: 'Ready', value: readyOrders.length, trend: null, trendValue: 'to serve', icon: <Icons.CheckCircle size={20} /> },
  ], [unclaimedOrders.length, myOrders.length, preparingOrders.length, readyOrders.length]);

  const claim = useCallback(async (orderId) => {
    setClaiming(c => ({ ...c, [orderId]: true }));
    try { await claimOrder(orderId, user?.id); }
    catch { /* another waiter already took it — realtime update will refresh */ }
    finally { setClaiming(c => ({ ...c, [orderId]: false })); }
  }, [claimOrder, user]);

  return (
    <div className="staff-dashboard">
      <div className="container">
        <div className="staff-dash-header">
          <div>
            <h1 className="staff-dash-title">Hello, {user?.name?.split(' ')[0] || 'Staff'}</h1>
            <p className="staff-dash-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
          </div>
        </div>

        <div className="staff-stats-grid">
          {stats.map(stat => (
            <div key={stat.title} className="staff-stat-card">
              <div className="staff-stat-content">
                <p className="staff-stat-label">{stat.title}</p>
                <h3 className="staff-stat-value">{stat.value}</h3>
                {stat.trend && (
                  <div className={`staff-stat-trend ${stat.trend === 'up' ? 'trend-up' : ''}`}>
                    <span>{stat.trendValue}</span>
                  </div>
                )}
              </div>
              <div className="staff-stat-icon">{stat.icon}</div>
            </div>
          ))}
        </div>

        {/* Available orders — waiters choose which to take */}
        <div className="staff-section">
          <div className="staff-section-header">
            <h2 className="staff-section-title">
              <span className="staff-section-dot pulse-dot" />
              Available Orders
            </h2>
            <button className="staff-section-action" onClick={() => navigate('/staff/orders')}>View all →</button>
          </div>
          {unclaimedOrders.length === 0 ? (
            <div className="staff-empty-inline">No unclaimed orders right now.</div>
          ) : (
            <div className="staff-section-list">
              {unclaimedOrders.slice(0, 4).map(order => (
                <div key={order.id} className="staff-order-card">
                  <div className="staff-order-card-header">
                    <span className="staff-order-id">#{String(order.id).slice(0, 8)}</span>
                    <span className="staff-order-table">Table {order.tableNumber}</span>
                  </div>
                  <div className="staff-order-items-preview">
                    {(order.items || []).slice(0, 2).map((item, i) => (
                      <span key={i} className="staff-order-item-chip">{item.quantity}× {item.menuItem?.name || item.name || 'Item'}</span>
                    ))}
                    {(order.items?.length || 0) > 2 && <span className="staff-more">+{order.items.length - 2} more</span>}
                  </div>
                  <div className="staff-order-card-footer">
                    <span className="staff-order-total">₹{order.total?.toFixed(0)}</span>
                    <Button size="sm" variant="primary" loading={claiming[order.id]} onClick={() => claim(order.id)}>
                      Accept
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My claimed orders */}
        {myOrders.length > 0 && (
          <div className="staff-section">
            <div className="staff-section-header">
              <h2 className="staff-section-title">My Orders</h2>
              <button className="staff-section-action" onClick={() => navigate('/staff/orders')}>Manage →</button>
            </div>
            <div className="staff-section-list">
              {myOrders.slice(0, 4).map(order => (
                <div key={order.id} className="staff-order-card" onClick={() => navigate('/staff/orders')}>
                  <div className="staff-order-card-header">
                    <span className="staff-order-id">#{String(order.id).slice(0, 8)}</span>
                    <Badge variant={order.status === 'READY' ? 'secondary' : 'tertiary'}>{order.status}</Badge>
                  </div>
                  <span className="staff-order-table">Table {order.tableNumber}</span>
                  <span className="staff-order-total">₹{order.total?.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
