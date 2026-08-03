import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Icons } from '../../assets/icons';
import Input, { Select } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card, { CardBody } from '../../components/ui/Card';
import './RestaurantSetup.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const ROLE_OPTIONS = [
  { value: 'waiter', label: 'Waiter — takes and serves orders' },
  { value: 'chef', label: 'Chef — works the kitchen display' },
];

function authHeaders() {
  let token = null;
  try { token = JSON.parse(localStorage.getItem('servora-auth') || '{}').token; } catch { /* ignore */ }
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

export default function WaiterSetup() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', role: 'waiter', password: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadStaff = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/waiters`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setStaff(data.data);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadStaff(); }, [loadStaff]);

  const addStaff = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email) { setError('Name and email are required'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/waiters`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ ...form, password: form.password || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Unable to add staff'); return; }
      setStaff(prev => [...prev, data.data]);
      setForm({ name: '', email: '', role: 'waiter', password: '' });
    } finally {
      setSaving(false);
    }
  };

  const removeStaff = async (id) => {
    setStaff(prev => prev.filter(s => s.id !== id));
    await fetch(`${API_BASE_URL}/api/waiters/${id}`, { method: 'DELETE', headers: authHeaders() }).catch(() => {});
  };

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="onboarding-page">
      <div className="onboarding-page-header animate-fade-in-up">
        <div className="onboarding-page-icon">
          <Icons.Users size={24} />
        </div>
        <h1 className="headline-md">Add your team</h1>
        <p className="body-md text-muted">Invite waiters and kitchen staff. They can log in with their email and the password you set (default: password123).</p>
      </div>

      <Card className="onboarding-card animate-fade-in-up delay-1">
        <CardBody>
          <form onSubmit={addStaff} className="onboarding-form">
            <div className="grid grid-2 gap-4">
              <Input label="Full name" placeholder="Jane Doe" value={form.name} onChange={(e) => update('name', e.target.value)} />
              <Select label="Role" options={ROLE_OPTIONS} value={form.role} onChange={(e) => update('role', e.target.value)} />
            </div>
            <div className="grid grid-2 gap-4">
              <Input label="Email" type="email" placeholder="jane@restaurant.com" value={form.email} onChange={(e) => update('email', e.target.value)} />
              <Input label="Password (optional)" type="password" placeholder="Default: password123" value={form.password} onChange={(e) => update('password', e.target.value)} />
            </div>
            {error && (
              <div className="onboarding-error">
                <Icons.AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
            <Button type="submit" variant="outline" loading={saving} iconLeft={Icons.Plus}>
              Add team member
            </Button>
          </form>

          {staff.length > 0 && (
            <div className="onboarding-waiter-list" style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {staff.map(member => (
                <div key={member.id} className="flex items-center justify-between glass rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-container-high text-primary text-xs font-medium">
                      {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-on-surface">{member.name}</p>
                      <p className="text-xs text-muted font-mono">{member.email} · {member.role}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => removeStaff(member.id)} className="p-1.5 rounded-md glass-hover text-error" title="Remove">
                    <Icons.Trash size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="onboarding-form-actions" style={{ marginTop: '1.5rem' }}>
            <Button variant="outline" iconLeft={Icons.ArrowLeft} as={Link} to="/onboarding/payments">
              Back
            </Button>
            <Button iconRight={Icons.ArrowRight} size="lg" onClick={() => navigate('/onboarding/complete')}>
              {staff.length > 0 ? 'Continue' : 'Skip for now'}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
