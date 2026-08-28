import { useState, useEffect } from 'react';
import { Icons } from '../../assets/icons';
import { getAdminCustomers, exportAdminCustomers } from '../../lib/api';
import './AdminCustomers.css';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [restaurantFilter, setRestaurantFilter] = useState('all');

  useEffect(() => {
    getAdminCustomers()
      .then(setCustomers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const restaurants = [...new Set(customers.map(c => c.restaurant?.name).filter(Boolean))];

  const filtered = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone || '').includes(search);
    const matchesRestaurant = restaurantFilter === 'all' || c.restaurant?.name === restaurantFilter;
    return matchesSearch && matchesRestaurant;
  });

  const handleExport = async () => {
    try {
      const blob = await exportAdminCustomers();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'servora-customers.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="headline-lg">Customer Data</h1>
            <p className="body-md text-muted">{customers.length} customers across all restaurants</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={handleExport}>
            <Icons.Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
            <div className="search-input-wrapper" style={{ maxWidth: 320 }}>
              <Icons.Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                className="search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="input"
              style={{ width: 'auto', padding: '8px 12px', fontSize: 13 }}
              value={restaurantFilter}
              onChange={(e) => setRestaurantFilter(e.target.value)}
            >
              <option value="all">All Restaurants</option>
              {restaurants.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <span className="body-sm text-muted">{filtered.length} results</span>
        </div>
        <div className="admin-card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
              <p className="text-muted">Loading customers...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
              <Icons.Users size={40} style={{ color: 'var(--outline)', marginBottom: 'var(--space-3)' }} />
              <p className="text-muted">No customers found</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Restaurant</th>
                  <th>Orders</th>
                  <th>Total Spent</th>
                  <th>Points</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td className="font-medium">{c.name}</td>
                    <td className="text-muted">{c.email}</td>
                    <td>{c.phone || '—'}</td>
                    <td>{c.restaurant?.name || '—'}</td>
                    <td>{c._count?.orders || 0}</td>
                    <td className="font-medium">{formatCurrency(c.totalSpent || 0)}</td>
                    <td>{c.points || 0}</td>
                    <td className="text-muted">{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
