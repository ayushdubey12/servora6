import { useState, useEffect } from 'react';
import { Icons } from '../../assets/icons';
import { getAdminUsers, createAdminUser, deleteAdminUser } from '../../lib/api';
import './AdminUsers.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'owner', restaurantId: '' });

  useEffect(() => {
    getAdminUsers()
      .then(setUsers)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = (users || []).filter(u =>
    (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.password) return alert('Please fill all required fields');
    try {
      await createAdminUser(form);
      const updated = await getAdminUsers().catch(() => users);
      setUsers(updated);
      setShowAdd(false);
      setForm({ name: '', email: '', password: '', role: 'owner', restaurantId: '' });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await deleteAdminUser(id);
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  if (error) return (
    <div className="admin-page">
      <div className="admin-page-header"><h1 className="headline-lg">Users</h1></div>
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
            <h1 className="headline-lg">Users</h1>
            <p className="body-md text-muted">{users.length} users on the platform</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(!showAdd)}>
            <Icons.Plus size={16} /> Add User
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Create User</h3>
          </div>
          <div className="admin-card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: 'var(--space-3)', alignItems: 'end' }}>
              <div className="field">
                <label className="label">Name</label>
                <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="field">
                <label className="label">Email</label>
                <input className="input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="field">
                <label className="label">Password</label>
                <input className="input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>
              <div className="field">
                <label className="label">Role</label>
                <select className="input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="owner">Owner</option>
                  <option value="waiter">Waiter</option>
                  <option value="chef">Chef</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button className="btn btn-primary btn-sm" onClick={handleAdd}>Create</button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card-header">
          <div className="search-input-wrapper" style={{ maxWidth: 320 }}>
            <Icons.Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search users..."
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="admin-card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
              <p className="text-muted">Loading users...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
              <Icons.Users size={40} style={{ color: 'var(--outline)', marginBottom: 'var(--space-3)' }} />
              <p className="text-muted">No users found</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Restaurant</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id}>
                    <td className="font-medium">{u.name}</td>
                    <td className="text-muted">{u.email}</td>
                    <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
                    <td>{u.restaurant?.name || '—'}</td>
                    <td className="text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      {u.role !== 'admin' && (
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ color: '#dc2626' }}
                          onClick={() => handleDelete(u.id, u.name)}
                        >
                          <Icons.Trash size={14} />
                        </button>
                      )}
                    </td>
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
