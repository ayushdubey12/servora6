import { useState, useEffect } from 'react';
import { Icons } from '../../assets/icons';
import { getAdminHealth, getAdminProfile, updateAdminProfile } from '../../lib/api';
import './AdminSettings.css';

export default function AdminSettings() {
  const [health, setHealth] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getAdminHealth(), getAdminProfile()])
      .then(([h, p]) => {
        setHealth(h);
        setProfile(p);
        setName(p.name || '');
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await updateAdminProfile({ name });
      setProfile({ ...profile, name });
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="admin-page"><p className="text-muted">Loading...</p></div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="headline-lg">System Health</h1>
        <p className="body-md text-muted">Platform status and admin profile</p>
      </div>

      {/* Health Stats */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon success"><Icons.Activity size={22} /></div>
          <div className="admin-stat-content">
            <div className="admin-stat-label">Status</div>
            <div className="admin-stat-value" style={{ fontSize: 20, color: '#228b22' }}>
              {health?.status || 'Unknown'}
            </div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon primary"><Icons.Clock size={22} /></div>
          <div className="admin-stat-content">
            <div className="admin-stat-label">Uptime</div>
            <div className="admin-stat-value" style={{ fontSize: 20 }}>
              {health?.uptime ? `${Math.floor(health.uptime / 3600)}h ${Math.floor((health.uptime % 3600) / 60)}m` : '—'}
            </div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon info"><Icons.Database size={22} /></div>
          <div className="admin-stat-content">
            <div className="admin-stat-label">Memory Used</div>
            <div className="admin-stat-value" style={{ fontSize: 20 }}>
              {health?.memoryUsage?.rss ? `${Math.round(health.memoryUsage.rss / 1024 / 1024)} MB` : '—'}
            </div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon warning"><Icons.Table size={22} /></div>
          <div className="admin-stat-content">
            <div className="admin-stat-label">Total Records</div>
            <div className="admin-stat-value" style={{ fontSize: 20 }}>
              {health?.tableCounts ? Object.values(health.tableCounts).reduce((a, b) => a + b, 0).toLocaleString() : '—'}
            </div>
          </div>
        </div>
      </div>

      <div className="admin-dashboard-grid">
        {/* Table Counts */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Database Records</h3>
          </div>
          <div className="admin-card-body">
            {health?.tableCounts && (
              <div className="record-list">
                {Object.entries(health.tableCounts).map(([table, count]) => (
                  <div key={table} className="record-item">
                    <span className="record-name">{table}</span>
                    <span className="record-count">{count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Admin Profile */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Admin Profile</h3>
          </div>
          <div className="admin-card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="field">
                <label className="label">Name</label>
                <input className="input" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="field">
                <label className="label">Email</label>
                <input className="input" value={profile?.email || ''} disabled style={{ opacity: 0.6 }} />
              </div>
              <div className="field">
                <label className="label">Role</label>
                <input className="input" value={profile?.role || 'admin'} disabled style={{ opacity: 0.6 }} />
              </div>
              <div className="field">
                <label className="label">Joined</label>
                <input className="input" value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : ''} disabled style={{ opacity: 0.6 }} />
              </div>
              <button className="btn btn-primary btn-sm" onClick={handleSaveProfile} disabled={saving}>
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
