import { useState, useMemo, useEffect, useCallback } from 'react';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { Icons } from '../../assets/icons';
import { useRestaurant } from '../../context/RestaurantContext';
import { createTable, deleteTable } from '../../lib/api';

export default function Tables() {
  const { tables, updateTableStatus, restaurant, refresh } = useRestaurant();
  const [search, setSearch] = useState('');
  const [filterSection, setFilterSection] = useState('all');
  const [selectedTable, setSelectedTable] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ number: '', seats: '4', section: 'Main Hall', status: 'available' });

  const sections = useMemo(() => [...new Set(tables.map(t => t.section))], [tables]);
  const filtered = useMemo(() => {
    let data = [...tables];
    if (filterSection !== 'all') data = data.filter(t => t.section === filterSection);
    if (search) data = data.filter(t => String(t.number).includes(search) || t.section.toLowerCase().includes(search.toLowerCase()));
    return data;
  }, [tables, filterSection, search]);

  const statusColor = (status) => {
    const map = { available: 'success', occupied: 'error', reserved: 'warning', cleaning: 'default' };
    return map[status] || 'default';
  };

  const openAdd = () => {
    const nextNum = tables.length > 0 ? Math.max(...tables.map(t => t.number)) + 1 : 1;
    setForm({ number: String(nextNum), seats: '4', section: sections[0] || 'Main Hall', status: 'available' });
    setError('');
    setShowAddModal(true);
  };

  const handleAdd = async () => {
    if (!form.number) { setError('Table number is required'); return; }
    const num = Number(form.number);
    if (tables.some(t => t.number === num)) {
      setError(`Table #${num} already exists. Pick a different number.`);
      return;
    }
    setSaving(true);
    setError('');
    try {
      await createTable({
        number: Number(form.number),
        seats: Number(form.seats) || 4,
        section: form.section || 'Main Hall',
        status: form.status || 'available',
        restaurantId: restaurant?.id,
      });
      setShowAddModal(false);
      await refresh();
    } catch (err) {
      setError(err.message || 'Failed to add table');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (tableId) => {
    if (!window.confirm('Delete this table? This cannot be undone.')) return;
    try {
      await deleteTable(tableId);
      await refresh();
    } catch (err) {
      console.error('Failed to delete table:', err);
    }
  };

  const columns = [
    { header: 'Table', field: 'number', align: 'left', render: (row) => (
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-mono font-medium ${row.status === 'available' ? 'bg-success text-black' : row.status === 'occupied' ? 'bg-error text-black' : row.status === 'reserved' ? 'bg-warning text-black' : 'bg-surface-container-high text-muted'}`}>
          {row.number}
        </div>
        <div>
          <p className="text-sm font-medium">Table {row.number}</p>
          <p className="text-xs text-muted">{row.section}</p>
        </div>
      </div>
    )},
    { header: 'Seats', field: 'seats', align: 'center', render: (row) => <span className="text-sm font-mono">{row.seats}</span> },
    { header: 'Status', field: 'status', align: 'center', render: (row) => <Badge variant={statusColor(row.status)} size="sm" dot>{row.status.charAt(0).toUpperCase() + row.status.slice(1)}</Badge> },
    { header: 'Actions', field: 'id', align: 'center', render: (row) => (
      <div className="flex items-center justify-center gap-2">
        {row.status !== 'available' && (
          <button onClick={(e) => { e.stopPropagation(); updateTableStatus(row.id, 'available'); }} className="p-1.5 rounded-md glass-hover text-success" title="Mark Available"><Icons.Check size={16} /></button>
        )}
        {row.status !== 'occupied' && (
          <button onClick={(e) => { e.stopPropagation(); updateTableStatus(row.id, 'occupied'); }} className="p-1.5 rounded-md glass-hover text-error" title="Mark Occupied"><Icons.X size={16} /></button>
        )}
        <button onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }} className="p-1.5 rounded-md glass-hover text-error" title="Delete Table"><Icons.Trash size={16} /></button>
      </div>
    )},
  ];

  const sectionCounts = useMemo(() => {
    const counts = {};
    tables.forEach(t => { counts[t.section] = (counts[t.section] || 0) + 1; });
    return counts;
  }, [tables]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="headline-lg">Tables</h1>
          <p className="text-muted text-sm mt-1">{tables.length} tables across {sections.length} sections</p>
        </div>
        <Button variant="primary" icon={<Icons.Plus size={16} />} onClick={openAdd}>Add Table</Button>
      </div>

      <div className="grid grid-4 gap-4">
        {sections.map(section => (
          <Card key={section} className="cursor-pointer" onClick={() => setFilterSection(filterSection === section ? 'all' : section)}>
            <CardBody>
              <p className="text-sm font-medium text-on-surface">{section}</p>
              <p className="text-2xl font-semibold text-primary mt-1">{sectionCounts[section]}</p>
              <p className="text-xs text-muted font-mono mt-1">tables</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1 max-w-md">
              <div className="input-wrapper">
                <span className="input-icon"><Icons.Search size={16} /></span>
                <input type="search" className="input-field input-with-icon" placeholder="Search tables..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setFilterSection('all')}>{filterSection !== 'all' ? 'Clear Filter' : 'All Sections'}</Button>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <Table columns={columns} data={filtered} keyField="id" onRowClick={setSelectedTable} />
        </CardBody>
      </Card>

      {/* Table Detail Modal */}
      <Modal isOpen={!!selectedTable} onClose={() => setSelectedTable(null)} title={`Table ${selectedTable?.number}`} maxWidth="400px" footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="danger" size="sm" onClick={() => { handleDelete(selectedTable?.id); setSelectedTable(null); }}>Delete Table</Button>
          <Button variant="secondary" onClick={() => setSelectedTable(null)}>Close</Button>
        </div>
      }>
        {selectedTable && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-2 gap-4">
              <div><p className="text-xs text-muted font-mono mb-1">Section</p><p className="text-sm">{selectedTable.section}</p></div>
              <div><p className="text-xs text-muted font-mono mb-1">Seats</p><p className="text-sm">{selectedTable.seats}</p></div>
              <div><p className="text-xs text-muted font-mono mb-1">Status</p><Badge variant={statusColor(selectedTable.status)} size="sm" dot>{selectedTable.status}</Badge></div>
              <div><p className="text-xs text-muted font-mono mb-1">Table #</p><p className="text-sm font-mono">{selectedTable.number}</p></div>
            </div>
            <div>
              <p className="text-xs text-muted font-mono mb-2">Set Status</p>
              <div className="flex flex-wrap gap-2">
                {['available', 'occupied', 'reserved', 'cleaning'].map(s => (
                  <button key={s} onClick={() => { updateTableStatus(selectedTable.id, s); setSelectedTable(prev => ({ ...prev, status: s })); }} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${selectedTable.status === s ? 'bg-primary text-on-primary' : 'glass glass-hover'}`}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Table Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Table" maxWidth="400px" footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAdd} loading={saving}>Add Table</Button>
        </div>
      }>
        <div className="flex flex-col gap-4">
          {error && <div className="text-sm text-error">{error}</div>}
          <div className="grid grid-2 gap-4">
            <Input label="Table Number" type="number" value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} placeholder="1" required />
            <Input label="Seats" type="number" value={form.seats} onChange={e => setForm({ ...form, seats: e.target.value })} placeholder="4" />
          </div>
          <div>
            <label className="input-label">Section</label>
            <div className="input-wrapper">
              <input className="input-field" value={form.section} onChange={e => setForm({ ...form, section: e.target.value })} placeholder="e.g. Main Hall, Patio" />
            </div>
          </div>
          <div>
            <label className="input-label">Status</label>
            <div className="input-wrapper">
              <select className="input-field input-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
