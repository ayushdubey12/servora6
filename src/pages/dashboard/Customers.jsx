import { useState, useMemo, useEffect } from 'react';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import { Icons } from '../../assets/icons';
import { getCustomers } from '../../lib/api';

const TIER_CONFIG = {
  bronze: { label: 'Bronze', variant: 'secondary' },
  silver: { label: 'Silver', variant: 'primary' },
  gold: { label: 'Gold', variant: 'tertiary' },
  platinum: { label: 'Platinum', variant: 'success' },
};

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    getCustomers().then(data => {
      setCustomers(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let data = [...customers];
    if (search) data = data.filter(c =>
      (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(search.toLowerCase())
    );
    return data.sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0));
  }, [customers, search]);

  const totalSpent = useMemo(() => customers.reduce((s, c) => s + (c.totalSpent || 0), 0), [customers]);
  const avgRating = useMemo(() => {
    if (customers.length === 0) return '0.0';
    return (customers.reduce((s, c) => s + (c.tier === 'gold' ? 5 : c.tier === 'silver' ? 4 : 3), 0) / customers.length).toFixed(1);
  }, [customers]);

  const columns = [
    { header: 'Customer', field: 'name', align: 'left', render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-xs font-medium text-primary">{(row.name || 'U').split(' ').map(n => n[0]).join('')}</div>
        <div>
          <p className="text-sm font-medium">{row.name || 'Unknown'}</p>
          <p className="text-xs text-muted">{row.email}</p>
        </div>
      </div>
    )},
    { header: 'Visits', field: 'orderCount', align: 'center', render: (row) => <span className="text-sm font-mono">{row.orderCount || 0}</span> },
    { header: 'Total Spent', field: 'totalSpent', align: 'right', render: (row) => <span className="text-sm font-mono text-primary">₹{((row.totalSpent || 0) / 100).toFixed(0)}</span> },
    { header: 'Points', field: 'points', align: 'center', render: (row) => <span className="text-sm font-mono">{row.points || 0}</span> },
    { header: 'Tier', field: 'tier', align: 'center', render: (row) => {
      const tc = TIER_CONFIG[row.tier] || TIER_CONFIG.bronze;
      return <Badge variant={tc.variant} size="sm">{tc.label}</Badge>;
    }},
    { header: 'Actions', field: 'id', align: 'center', render: (row) => (
      <button onClick={(e) => { e.stopPropagation(); setSelectedCustomer(row); }} className="p-1.5 rounded-md glass-hover text-primary" title="View"><Icons.Eye size={16} /></button>
    )},
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="headline-lg">Customers</h1>
        <p className="text-muted text-sm mt-1">{customers.length} registered customers</p>
      </div>

      <div className="grid grid-3 gap-4">
        <Card>
          <CardBody>
            <p className="text-xs text-muted font-mono mb-1">Total Customers</p>
            <p className="text-2xl font-semibold text-primary">{customers.length}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-muted font-mono mb-1">Total Revenue</p>
            <p className="text-2xl font-semibold text-primary">₹{(totalSpent / 100).toLocaleString()}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-muted font-mono mb-1">Avg Points</p>
            <p className="text-2xl font-semibold text-tertiary">{customers.length > 0 ? Math.round(customers.reduce((s, c) => s + (c.points || 0), 0) / customers.length) : 0}</p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1 max-w-md">
              <div className="input-wrapper">
                <span className="input-icon"><Icons.Search size={16} /></span>
                <input type="search" className="input-field input-with-icon" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted text-sm font-mono">Loading customers...</div>
          ) : (
            <Table columns={columns} data={filtered} keyField="id" onRowClick={setSelectedCustomer} />
          )}
        </CardBody>
      </Card>

      <Modal isOpen={!!selectedCustomer} onClose={() => setSelectedCustomer(null)} title={selectedCustomer?.name || 'Customer'} maxWidth="500px" footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={() => setSelectedCustomer(null)}>Close</Button>
        </div>
      }>
        {selectedCustomer && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-2 gap-4">
              <div><p className="text-xs text-muted font-mono mb-1">Email</p><p className="text-sm">{selectedCustomer.email}</p></div>
              <div><p className="text-xs text-muted font-mono mb-1">Phone</p><p className="text-sm font-mono">{selectedCustomer.phone || '—'}</p></div>
              <div><p className="text-xs text-muted font-mono mb-1">Total Orders</p><p className="text-sm font-mono">{selectedCustomer.orderCount || 0}</p></div>
              <div><p className="text-xs text-muted font-mono mb-1">Total Spent</p><p className="text-sm font-mono text-primary">₹{((selectedCustomer.totalSpent || 0) / 100).toFixed(0)}</p></div>
              <div><p className="text-xs text-muted font-mono mb-1">Points</p><p className="text-sm font-mono">{selectedCustomer.points || 0}</p></div>
              <div><p className="text-xs text-muted font-mono mb-1">Tier</p><Badge variant={(TIER_CONFIG[selectedCustomer.tier] || TIER_CONFIG.bronze).variant} size="sm">{(TIER_CONFIG[selectedCustomer.tier] || TIER_CONFIG.bronze).label}</Badge></div>
              <div><p className="text-xs text-muted font-mono mb-1">Member Since</p><p className="text-sm">{selectedCustomer.createdAt ? new Date(selectedCustomer.createdAt).toLocaleDateString() : '—'}</p></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
