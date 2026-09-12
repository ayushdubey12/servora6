import { useState, useMemo } from 'react';
import Card, { CardHeader, CardTitle, CardBody, CardFooter } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { Icons } from '../../assets/icons';
import { useRestaurant } from '../../context/RestaurantContext';
import { offers as initialOffers, categories } from '../../data/mockData';

export default function Offers() {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', discount: '', type: 'percentage', category: '', startDate: '', endDate: '', isActive: true });
  const [offerList, setOfferList] = useState(initialOffers);

  const filtered = useMemo(() => {
    let data = [...offerList];
    if (search) data = data.filter(o => o.name.toLowerCase().includes(search.toLowerCase()) || o.description.toLowerCase().includes(search.toLowerCase()));
    return data;
  }, [offerList, search]);

  const openCreate = () => {
    setEditingOffer(null);
    setForm({ name: '', description: '', discount: '', type: 'percentage', category: '', startDate: new Date().toISOString().split('T')[0], endDate: '', isActive: true });
    setShowModal(true);
  };

  const openEdit = (offer) => {
    setEditingOffer(offer);
    setForm({ name: offer.name, description: offer.description, discount: String(offer.discount), type: offer.type, category: offer.category || '', startDate: offer.startDate, endDate: offer.endDate, isActive: offer.isActive });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name || !form.discount) return;
    if (editingOffer) {
      setOfferList(prev => prev.map(o => o.id === editingOffer.id ? { ...o, ...form, discount: Number(form.discount) } : o));
    } else {
      setOfferList(prev => [...prev, { id: `off_${String(prev.length + 1).padStart(3, '0')}`, ...form, discount: Number(form.discount), usageCount: 0 }]);
    }
    setShowModal(false);
  };

  const toggleActive = (id) => {
    setOfferList(prev => prev.map(o => o.id === id ? { ...o, isActive: !o.isActive } : o));
  };

  const columns = [
    { header: 'Offer', field: 'name', align: 'left', render: (row) => (
      <div>
        <p className="text-sm font-medium">{row.name}</p>
        <p className="text-xs text-muted">{row.description}</p>
      </div>
    )},
    { header: 'Discount', field: 'discount', align: 'center', render: (row) => (
      <Badge variant={row.type === 'percentage' ? 'primary' : 'secondary'} size="sm">
        {row.type === 'percentage' ? `${row.discount}%` : `₹${row.discount}`} OFF
      </Badge>
    )},
    { header: 'Category', field: 'category', align: 'left', render: (row) => {
      const cat = categories.find(c => c.id === row.category);
      return <span className="text-sm text-muted">{cat?.name || 'All Items'}</span>;
    }},
    { header: 'Usage', field: 'usageCount', align: 'right', render: (row) => <span className="text-sm font-mono">{row.usageCount}</span> },
    { header: 'Status', field: 'isActive', align: 'center', render: (row) => (
      <button onClick={(e) => { e.stopPropagation(); toggleActive(row.id); }} className="cursor-pointer">
        <Badge variant={row.isActive ? 'success' : 'default'} size="sm" dot>{row.isActive ? 'Active' : 'Inactive'}</Badge>
      </button>
    )},
    { header: 'Validity', field: 'startDate', align: 'left', render: (row) => <span className="text-xs text-muted font-mono">{row.startDate} — {row.endDate}</span> },
    { header: 'Actions', field: 'id', align: 'center', render: (row) => (
      <div className="flex items-center justify-center gap-2">
        <button onClick={(e) => { e.stopPropagation(); openEdit(row); }} className="p-1.5 rounded-md glass-hover text-primary" title="Edit"><Icons.Edit size={16} /></button>
      </div>
    )},
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="headline-lg">Offers</h1>
          <p className="text-muted text-sm mt-1">{offerList.length} active promotions</p>
        </div>
        <Button variant="primary" icon={<Icons.Plus size={16} />} onClick={openCreate}>Add Offer</Button>
      </div>

      <div className="grid grid-3 gap-4">
        <Card>
          <CardBody>
            <p className="text-xs text-muted font-mono mb-1">Active Offers</p>
            <p className="text-2xl font-semibold text-success">{offerList.filter(o => o.isActive).length}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-muted font-mono mb-1">Total Usage</p>
            <p className="text-2xl font-semibold text-primary">{offerList.reduce((s, o) => s + o.usageCount, 0)}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-muted font-mono mb-1">Avg Discount</p>
            <p className="text-2xl font-semibold text-tertiary">{Math.round(offerList.reduce((s, o) => s + o.discount, 0) / offerList.length)}%</p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1 max-w-md">
              <div className="input-wrapper">
                <span className="input-icon"><Icons.Search size={16} /></span>
                <input type="search" className="input-field input-with-icon" placeholder="Search offers..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <Table columns={columns} data={filtered} keyField="id" />
        </CardBody>
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingOffer ? 'Edit Offer' : 'Add Offer'} maxWidth="500px" footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>Save</Button>
        </div>
      }>
        <div className="flex flex-col gap-4">
          <Input label="Offer Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Happy Hour" required />
          <Input label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Short description" />
          <div className="grid grid-2 gap-4">
            <div>
              <label className="input-label">Discount Type</label>
              <div className="input-wrapper">
                <select className="input-field input-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
                <span className="input-select-arrow"><Icons.ChevronDown size={16} /></span>
              </div>
            </div>
            <Input label="Discount Value" type="number" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} placeholder="25" required />
          </div>
          <div>
            <label className="input-label">Category (optional)</label>
            <div className="input-wrapper">
              <select className="input-field input-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <span className="input-select-arrow"><Icons.ChevronDown size={16} /></span>
            </div>
          </div>
          <div className="grid grid-2 gap-4">
            <Input label="Start Date" type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
            <Input label="End Date" type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 accent-[var(--primary)]" />
            <span className="text-sm">Active</span>
          </label>
        </div>
      </Modal>
    </div>
  );
}
