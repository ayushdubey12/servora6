import { useState, useMemo } from 'react';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { Icons } from '../../assets/icons';
import { useRestaurant } from '../../context/RestaurantContext';

export default function Tables() {
  const { tables, updateTableStatus, branches } = useRestaurant();
  const [search, setSearch] = useState('');
  const [filterSection, setFilterSection] = useState('all');
  const [selectedTable, setSelectedTable] = useState(null);

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
    { header: 'Branch', field: 'branch', align: 'left', render: (row) => {
      const branch = branches.find(b => b.id === row.branch);
      return <span className="text-sm text-muted">{branch?.name || row.branch}</span>;
    }},
    { header: 'Status', field: 'status', align: 'center', render: (row) => <Badge variant={statusColor(row.status)} size="sm" dot>{row.status.charAt(0).toUpperCase() + row.status.slice(1)}</Badge> },
    { header: 'Actions', field: 'id', align: 'center', render: (row) => (
      <div className="flex items-center justify-center gap-2">
        {row.status !== 'available' && (
          <button onClick={(e) => { e.stopPropagation(); updateTableStatus(row.id, 'available'); }} className="p-1.5 rounded-md glass-hover text-success" title="Mark Available"><Icons.Check size={16} /></button>
        )}
        {row.status !== 'occupied' && (
          <button onClick={(e) => { e.stopPropagation(); updateTableStatus(row.id, 'occupied'); }} className="p-1.5 rounded-md glass-hover text-error" title="Mark Occupied"><Icons.X size={16} /></button>
        )}
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
      <div>
        <h1 className="headline-lg">Tables</h1>
        <p className="text-muted text-sm mt-1">{tables.length} tables across {sections.length} sections</p>
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

      <Modal isOpen={!!selectedTable} onClose={() => setSelectedTable(null)} title={`Table ${selectedTable?.number}`} maxWidth="400px" footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={() => setSelectedTable(null)}>Close</Button>
        </div>
      }>
        {selectedTable && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-2 gap-4">
              <div><p className="text-xs text-muted font-mono mb-1">Section</p><p className="text-sm">{selectedTable.section}</p></div>
              <div><p className="text-xs text-muted font-mono mb-1">Seats</p><p className="text-sm">{selectedTable.seats}</p></div>
              <div><p className="text-xs text-muted font-mono mb-1">Status</p><Badge variant={statusColor(selectedTable.status)} size="sm" dot>{selectedTable.status}</Badge></div>
              <div><p className="text-xs text-muted font-mono mb-1">Branch</p><p className="text-sm">{branches.find(b => b.id === selectedTable.branch)?.name}</p></div>
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
    </div>
  );
}


