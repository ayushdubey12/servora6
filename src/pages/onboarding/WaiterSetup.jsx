import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Icons } from '../../assets/icons';
import Input, { Select } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card, { CardBody } from '../../components/ui/Card';
import './RestaurantSetup.css';

const ROLE_OPTIONS = [
  { value: 'waiter', label: 'Waiter — takes and serves orders' },
  { value: 'chef', label: 'Chef — works the kitchen display' },
];

export default function WaiterSetup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', role: 'waiter', password: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadStaff = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['waiter', 'chef'])
        .order('created_at', { ascending: true });
      if (data) setStaff(data);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadStaff(); }, [loadStaff]);

  const addStaff = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email) { setError('Name and email are required'); return; }
    setSaving(true);
    try {
      const password = form.password || 'password123';

      // Create auth user via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password,
        options: {
          data: {
            full_name: form.name,
            role: form.role,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      // The trigger auto-creates a profile. Update it with restaurant_id.
      if (authData.user) {
        await supabase
          .from('profiles')
          .update({
            name: form.name,
            role: form.role,
            restaurant_id: user?.restaurantId || null,
          })
          .eq('id', authData.user.id);
      }

      setStaff(prev => [...prev, {
        id: authData.user?.id || Date.now().toString(),
        name: form.name,
        email: form.email,
        role: form.role,
        restaurant_id: user?.restaurantId,
      }]);
      setForm({ name: '', email: '', role: 'waiter', password: '' });
    } catch (err) {
      setError(err.message || 'Failed to add staff');
    } finally {
      setSaving(false);
    }
  };

  const removeStaff = async (id) => {
    setStaff(prev => prev.filter(s => s.id !== id));
    // Note: Cannot delete auth users from client-side in Supabase.
    // The profile will be orphaned but harmless.
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
