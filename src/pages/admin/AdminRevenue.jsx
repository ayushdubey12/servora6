import { useState, useEffect } from 'react';
import { Icons } from '../../assets/icons';
import { getAdminRevenue, addAdminRevenue, getAdminRestaurants } from '../../lib/api';
import './AdminRevenue.css';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export default function AdminRevenue() {
  const [data, setData] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ restaurantId: '', amount: '', type: 'setup', description: '' });

  useEffect(() => {
    Promise.all([
      getAdminRevenue().catch(e => { console.error(e); return { entries: [], total: 0, byType: {}, byMonth: {} }; }),
      getAdminRestaurants().catch(e => { console.error(e); return []; }),
    ])
      .then(([rev, rest]) => { setData(rev); setRestaurants(rest); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    if (!form.restaurantId || !form.amount) return alert('Please fill all required fields');
    try {
      await addAdminRevenue({
        restaurantId: form.restaurantId,
        amount: Number(form.amount),
        type: form.type,
        description: form.description || undefined,
      });
      const updated = await getAdminRevenue().catch(() => data);
      setData(updated);
      setShowAdd(false);
      setForm({ restaurantId: '', amount: '', type: 'setup', description: '' });
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="admin-page"><p className="text-muted">Loading...</p></div>;

  if (error) return (
    <div className="admin-page">
      <div className="admin-page-header"><h1 className="headline-lg">Revenue</h1></div>
      <div className="admin-card"><div className="admin-card-body" style={{ textAlign: 'center', padding: 40 }}>
        <Icons.AlertTriangle size={40} style={{ color: '#dc2626', marginBottom: 12 }} />
        <p style={{ color: '#dc2626' }}>Failed to load: {error}</p>
      </div></div>
    </div>
  );

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="headline-lg">Revenue</h1>
            <p className="body-md text-muted">Track platform revenue and payments</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(!showAdd)}>
            <Icons.Plus size={16} /> Record Payment
          </button>
        </div>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon success"><Icons.DollarSign size={22} /></div>
          <div className="admin-stat-content">
            <div className="admin-stat-label">Total Revenue</div>
            <div className="admin-stat-value">{formatCurrency(data?.total || 0)}</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon primary"><Icons.Package size={22} /></div>
          <div className="admin-stat-content">
            <div className="admin-stat-label">Setup Fees</div>
            <div className="admin-stat-value">{formatCurrency(data?.byType?.setup || 0)}</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon warning"><Icons.Calendar size={22} /></div>
          <div className="admin-stat-content">
            <div className="admin-stat-label">Annual Fees</div>
            <div className="admin-stat-value">{formatCurrency(data?.byType?.annual || 0)}</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon info"><Icons.Database size={22} /></div>
          <div className="admin-stat-content">
            <div className="admin-stat-label">Data Add-ons</div>
            <div className="admin-stat-value">{formatCurrency(data?.byType?.data_addon || 0)}</div>
          </div>
        </div>
      </div>

      {showAdd && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Record Payment</h3>
          </div>
          <div className="admin-card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 2fr auto', gap: 'var(--space-3)', alignItems: 'end' }}>
              <div className="field">
                <label className="label">Restaurant</label>
                <select className="input" value={form.restaurantId} onChange={e => setForm({ ...form, restaurantId: e.target.value })}>
                  <option value="">Select restaurant</option>
                  {(restaurants || []).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="label">Amount (₹)</label>
                <input className="input" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div className="field">
                <label className="label">Type</label>
                <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="setup">Setup Fee</option>
                  <option value="annual">Annual Fee</option>
                  <option value="data_addon">Data Add-on</option>
                  <option value="hardware">Hardware</option>
                </select>
              </div>
              <div className="field">
                <label className="label">Description</label>
                <input className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional" />
              </div>
              <button className="btn btn-primary btn-sm" onClick={handleAdd}>Save</button>
            </div>
          </div>
        </div>
      )}

      {data?.byMonth && Object.keys(data.byMonth).length > 0 && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Revenue by Month</h3>
          </div>
          <div className="admin-card-body">
            <div className="revenue-bars">
              {Object.entries(data.byMonth).sort().map(([month, amount]) => {
                const maxAmount = Math.max(...Object.values(data.byMonth));
                const pct = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
                return (
                  <div key={month} className="revenue-bar-row">
                    <span className="revenue-bar-label">{month}</span>
                    <div className="revenue-bar-track">
                      <div className="revenue-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="revenue-bar-amount">{formatCurrency(amount)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">All Payments ({data?.entries?.length || 0})</h3>
        </div>
        <div className="admin-card-body" style={{ padding: 0 }}>
          {(!data?.entries || data.entries.length === 0) ? (
            <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
              <p className="text-muted">No revenue entries yet</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Restaurant</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.entries.map(e => (
                  <tr key={e.id}>
                    <td className="font-medium">{e.restaurant?.name || '—'}</td>
                    <td><span className={`type-badge type-${e.type}`}>{(e.type || '').replace('_', ' ')}</span></td>
                    <td className="font-medium">{formatCurrency(e.amount)}</td>
                    <td className="text-muted">{e.description || '—'}</td>
                    <td className="text-muted">{new Date(e.date).toLocaleDateString()}</td>
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
