import { useState, useEffect } from 'react';
import { Icons } from '../../assets/icons';
import { getAdminStats } from '../../lib/api';
import './AdminDashboard.css';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="admin-page"><div className="admin-stats-grid">{[1,2,3,4].map(i => <div key={i} className="admin-stat-card shimmer" style={{ height: 100 }} />)}</div></div>;

  if (error) return <div className="admin-page"><div className="admin-card"><div className="admin-card-body" style={{ textAlign: 'center', padding: 40 }}><Icons.Activity size={40} style={{ color: 'var(--error, #dc2626)', marginBottom: 12 }} /><p style={{ color: '#dc2626' }}>Failed to load stats: {error}</p></div></div></div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="headline-lg">Platform Overview</h1>
        <p className="body-md text-muted">Servora platform statistics and recent activity</p>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon primary"><Icons.Store size={22} /></div>
          <div className="admin-stat-content">
            <div className="admin-stat-label">Restaurants</div>
            <div className="admin-stat-value">{stats?.totalRestaurants || 0}</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon success"><Icons.DollarSign size={22} /></div>
          <div className="admin-stat-content">
            <div className="admin-stat-label">Total Revenue</div>
            <div className="admin-stat-value">{formatCurrency(stats?.totalRevenue || 0)}</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon warning"><Icons.ShoppingCart size={22} /></div>
          <div className="admin-stat-content">
            <div className="admin-stat-label">Total Orders</div>
            <div className="admin-stat-value">{(stats?.totalOrders || 0).toLocaleString()}</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon info"><Icons.Users size={22} /></div>
          <div className="admin-stat-content">
            <div className="admin-stat-label">Total Customers</div>
            <div className="admin-stat-value">{(stats?.totalCustomers || 0).toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="admin-dashboard-grid" style={{ marginTop: 'var(--space-5)' }}>
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Recent Orders</h3>
          </div>
          <div className="admin-card-body" style={{ padding: 0 }}>
            {(!stats?.recentOrders || stats.recentOrders.length === 0) ? (
              <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}><p className="body-md text-muted">No orders yet</p></div>
            ) : (
              <table className="admin-table">
                <thead><tr><th>Restaurant</th><th>Status</th><th>Total</th><th>Date</th></tr></thead>
                <tbody>
                  {stats.recentOrders.map(order => (
                    <tr key={order.id}>
                      <td className="font-medium">{order.restaurant?.name || '—'}</td>
                      <td><span className={`status-badge status-${order.status?.toLowerCase()}`}>{order.status}</span></td>
                      <td>{formatCurrency(order.total)}</td>
                      <td className="text-muted">{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Revenue by Restaurant</h3>
          </div>
          <div className="admin-card-body">
            {(!stats?.restaurantRevenue || Object.keys(stats.restaurantRevenue).length === 0) ? (
              <p className="body-md text-muted" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>No revenue data yet</p>
            ) : (
              <div className="revenue-list">
                {Object.entries(stats.restaurantRevenue).sort((a, b) => b[1] - a[1]).map(([name, amount]) => (
                  <div key={name} className="revenue-item">
                    <span className="revenue-name">{name}</span>
                    <span className="revenue-amount">{formatCurrency(amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
