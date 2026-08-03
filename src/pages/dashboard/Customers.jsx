import { useState, useMemo } from 'react';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { Icons } from '../../assets/icons';
import { customers } from '../../data/mockData';

export default function Customers() {
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const filtered = useMemo(() => {
    let data = [...customers];
    if (search) data = data.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));
    return data.sort((a, b) => b.totalSpent - a.totalSpent);
  }, [search]);

  const totalSpent = useMemo(() => customers.reduce((s, c) => s + c.totalSpent, 0), []);
  const avgRating = useMemo(() => (customers.reduce((s, c) => s + c.rating, 0) / customers.length).toFixed(1), []);

  const columns = [
    { header: 'Customer', field: 'name', align: 'left', render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-xs font-medium text-primary">{row.name.split(' ').map(n => n[0]).join('')}</div>
        <div>
          <p className="text-sm font-medium">{row.name}</p>
          <p className="text-xs text-muted">{row.email}</p>
        </div>
      </div>
    )},
    { header: 'Visits', field: 'visits', align: 'center', render: (row) => <span className="text-sm font-mono">{row.visits}</span> },
    { header: 'Total Spent', field: 'totalSpent', align: 'right', render: (row) => <span className="text-sm font-mono text-primary">${row.totalSpent.toFixed(2)}</span> },
    { header: 'Rating', field: 'rating', align: 'center', render: (row) => (
      <div className="flex items-center justify-center gap-1">
        <Icons.Star size={14} className="text-tertiary" fill="var(--tertiary)" />
        <span className="text-sm font-mono">{row.rating}</span>
      </div>
    )},
    { header: 'Last Visit', field: 'lastVisit', align: 'left', render: (row) => <span className="text-sm text-muted">{row.lastVisit}</span> },
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
            <p className="text-2xl font-semibold text-primary">${totalSpent.toLocaleString()}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-muted font-mono mb-1">Avg Rating</p>
            <p className="text-2xl font-semibold text-tertiary">{avgRating}</p>
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
          <Table columns={columns} data={filtered} keyField="id" onRowClick={setSelectedCustomer} />
        </CardBody>
      </Card>

      <Modal isOpen={!!selectedCustomer} onClose={() => setSelectedCustomer(null)} title={selectedCustomer?.name} maxWidth="500px" footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={() => setSelectedCustomer(null)}>Close</Button>
        </div>
      }>
        {selectedCustomer && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-2 gap-4">
              <div><p className="text-xs text-muted font-mono mb-1">Email</p><p className="text-sm">{selectedCustomer.email}</p></div>
              <div><p className="text-xs text-muted font-mono mb-1">Phone</p><p className="text-sm font-mono">{selectedCustomer.phone}</p></div>
              <div><p className="text-xs text-muted font-mono mb-1">Total Visits</p><p className="text-sm font-mono">{selectedCustomer.visits}</p></div>
              <div><p className="text-xs text-muted font-mono mb-1">Total Spent</p><p className="text-sm font-mono text-primary">${selectedCustomer.totalSpent.toFixed(2)}</p></div>
              <div><p className="text-xs text-muted font-mono mb-1">Rating</p><div className="flex items-center gap-1"><Icons.Star size={16} className="text-tertiary" fill="var(--tertiary)" /><span className="text-sm">{selectedCustomer.rating}</span></div></div>
              <div><p className="text-xs text-muted font-mono mb-1">Last Visit</p><p className="text-sm">{selectedCustomer.lastVisit}</p></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
