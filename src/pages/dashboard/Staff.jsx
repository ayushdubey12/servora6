import { useState, useMemo, useEffect, useCallback } from 'react';
import Card, { CardHeader, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { Icons } from '../../assets/icons';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export default function Staff() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', role: 'waiter', email: '', password: '' });
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadStaff = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['waiter', 'chef'])
        .order('created_at', { ascending: true });
      if (data) setStaffList(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStaff(); }, [loadStaff]);

  const roles = useMemo(() => [...new Set(staffList.map(s => s.role))], [staffList]);

  const filtered = useMemo(() => {
    let data = [...staffList];
    if (filterRole !== 'all') data = data.filter(s => s.role === filterRole);
    if (search) data = data.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
    );
    return data;
  }, [staffList, filterRole, search]);

  const openCreate = () => {
    setForm({ name: '', role: 'waiter', email: '', password: '' });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email) { setError('Name and email are required'); return; }
    setSaving(true);
    setError('');
    try {
      const password = form.password || 'password123';

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

      // Update profile with restaurant_id and correct role
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

      setStaffList(prev => [...prev, {
        id: authData.user?.id || Date.now().toString(),
        name: form.name,
        email: form.email,
        role: form.role,
        restaurant_id: user?.restaurantId,
      }]);
      setShowModal(false);
    } catch (err) {
      setError(err.message || 'Failed to add staff');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setStaffList(list => list.filter(s => s.id !== id));
  };

  const roleIcon = (role) => {
    const map = { waiter: Icons.Users, chef: Icons.ChefHat };
    const Comp = map[role] || Icons.Users;
    return <Comp size={14} />;
  };

  const roleVariant = (role) => ({ waiter: 'secondary', chef: 'warning' }[role] || 'default');

  const columns = [
    { header: 'Staff', field: 'name', align: 'left', render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-xs font-medium text-primary">{row.name.split(' ').map(n => n[0]).join('')}</div>
        <div>
          <p className="text-sm font-medium">{row.name}</p>
          <p className="text-xs text-muted font-mono">{row.email}</p>
        </div>
      </div>
    )},
    { header: 'Role', field: 'role', align: 'left', render: (row) => <Badge variant={roleVariant(row.role)} size="sm" icon={roleIcon(row.role)}>{row.role}</Badge> },
    { header: 'Joined', field: 'created_at', align: 'left', render: (row) => <span className="text-sm text-muted">{row.created_at ? new Date(row.created_at).toLocaleDateString() : '—'}</span> },
    { header: 'Actions', field: 'id', align: 'center', render: (row) => (
      <div className="flex items-center justify-center gap-2">
        <button onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }} className="p-1.5 rounded-md glass-hover text-error" title="Remove"><Icons.Trash size={16} /></button>
      </div>
    )},
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="headline-lg">Staff</h1>
          <p className="text-muted text-sm mt-1">{staffList.length} team members (waiters & chefs)</p>
        </div>
        <Button variant="primary" icon={<Icons.Plus size={16} />} onClick={openCreate}>Add Staff</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 w-full flex-wrap">
            <div className="flex-1 max-w-md">
              <div className="input-wrapper">
                <span className="input-icon"><Icons.Search size={16} /></span>
                <input type="search" className="input-field input-with-icon" placeholder="Search staff..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {['all', ...roles].map(role => (
                <button key={role} onClick={() => setFilterRole(role)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filterRole === role ? 'bg-primary text-on-primary' : 'glass glass-hover text-muted'}`}>
                  {role === 'all' ? 'All' : role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="p-6 text-center text-muted text-sm">Loading staff…</div>
          ) : (
            <Table columns={columns} data={filtered} keyField="id" />
          )}
        </CardBody>
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Staff" maxWidth="450px" footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} loading={saving}>Save</Button>
        </div>
      }>
        <div className="flex flex-col gap-4">
          {error && <div className="text-sm text-error">{error}</div>}
          <Input label="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Doe" required />
          <div>
            <label className="input-label">Role</label>
            <div className="input-wrapper">
              <select className="input-field input-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="waiter">Waiter</option>
                <option value="chef">Chef</option>
              </select>
              <span className="input-select-arrow"><Icons.ChevronDown size={16} /></span>
            </div>
          </div>
          <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" required />
          <Input label="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min 8 chars (default: password123)" />
        </div>
      </Modal>
    </div>
  );
}
