import { useState, useMemo, useCallback } from 'react';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { Icons } from '../../assets/icons';
import { useRestaurant } from '../../context/RestaurantContext';
import { useAuth } from '../../context/AuthContext';
import { createMenuItem, updateMenuItem } from '../../lib/api';

export default function Menu() {
  const { menu, categories, getMenuByCategory, getCategoryName } = useRestaurant();
  const { restaurant } = useAuth();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', description: '', price: '', category: categories[0]?.id || '', isVeg: true, isAvailable: true, prepTime: 10, calories: 0 });

  const filtered = useMemo(() => {
    let data = [...menu];
    if (activeCategory !== 'all') data = data.filter(i => i.categoryId === activeCategory);
    if (search) data = data.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || (i.description || '').toLowerCase().includes(search.toLowerCase()));
    return data;
  }, [menu, activeCategory, search]);

  const openCreate = () => {
    setEditingItem(null);
    setForm({ name: '', description: '', price: '', category: categories[0]?.id || '', isVeg: true, isAvailable: true, prepTime: 10, calories: 0 });
    setError('');
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      description: item.description || '',
      price: String(item.price),
      category: item.categoryId,
      isVeg: item.isVeg,
      isAvailable: item.isAvailable,
      prepTime: item.prepTime,
      calories: item.calories,
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) {
      setError('Name and price are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        categoryId: form.category,
        isVeg: form.isVeg,
        isAvailable: form.isAvailable,
        prepTime: Number(form.prepTime),
        calories: Number(form.calories),
        restaurantId: restaurant?.id,
      };

      if (editingItem) {
        await updateMenuItem(editingItem.id, payload);
      } else {
        await createMenuItem(payload);
      }

      // Refresh menu by reloading the page data
      window.location.reload();
      setShowModal(false);
    } catch (err) {
      setError(err.message || 'Failed to save item');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { header: 'Item', field: 'name', align: 'left', render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-md bg-surface-container-high flex items-center justify-center text-xs font-mono text-muted">
          {row.isVeg ? 'VEG' : 'NON'}
        </div>
        <div>
          <p className="text-sm font-medium">{row.name}</p>
          <p className="text-xs text-muted truncate" style={{ maxWidth: 200 }}>{row.description}</p>
        </div>
      </div>
    )},
    { header: 'Category', field: 'categoryId', align: 'left', render: (row) => <span className="text-sm text-muted">{getCategoryName(row.categoryId)}</span> },
    { header: 'Price', field: 'price', align: 'right', render: (row) => <span className="text-sm font-mono">₹{row.price.toFixed(0)}</span> },
    { header: 'Prep', field: 'prepTime', align: 'center', render: (row) => `${row.prepTime}m` },
    { header: 'Calories', field: 'calories', align: 'right', render: (row) => `${row.calories} kcal` },
    { header: 'Status', field: 'isAvailable', align: 'center', render: (row) => <Badge variant={row.isAvailable ? 'success' : 'error'} size="sm" dot>{row.isAvailable ? 'Available' : 'Unavailable'}</Badge> },
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
          <h1 className="headline-lg">Menu</h1>
          <p className="text-muted text-sm mt-1">{menu.length} items across {categories.length} categories</p>
        </div>
        <Button variant="primary" icon={<Icons.Plus size={16} />} onClick={openCreate}>Add Item</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 w-full flex-wrap">
            <div className="flex-1 max-w-md">
              <div className="input-wrapper">
                <span className="input-icon"><Icons.Search size={16} /></span>
                <input type="search" className="input-field input-with-icon" placeholder="Search menu items..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="flex border-b border-glass px-4 overflow-x-auto">
            <button onClick={() => setActiveCategory('all')} className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${activeCategory === 'all' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-on-surface'}`}>All</button>
            {categories.map(c => (
              <button key={c.id} onClick={() => setActiveCategory(c.id)} className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${activeCategory === c.id ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-on-surface'}`}>
                {c.name}
              </button>
            ))}
          </div>
          <Table columns={columns} data={filtered} keyField="id" />
        </CardBody>
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingItem ? 'Edit Item' : 'Add Menu Item'} maxWidth="500px" footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} loading={saving}>Save</Button>
        </div>
      }>
        <div className="flex flex-col gap-4">
          {error && <div className="text-sm text-error">{error}</div>}
          <Input label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Item name" required />
          <Input label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Short description" />
          <div className="grid grid-2 gap-4">
            <Input label="Price (₹)" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0" required />
            <Input label="Prep Time (min)" type="number" value={form.prepTime} onChange={e => setForm({ ...form, prepTime: Number(e.target.value) })} placeholder="10" />
          </div>
          <div className="grid grid-2 gap-4">
            <div>
              <label className="input-label">Category</label>
              <div className="input-wrapper">
                <select className="input-field input-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <span className="input-select-arrow"><Icons.ChevronDown size={16} /></span>
              </div>
            </div>
            <Input label="Calories" type="number" value={form.calories} onChange={e => setForm({ ...form, calories: Number(e.target.value) })} placeholder="0" />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isVeg} onChange={e => setForm({ ...form, isVeg: e.target.checked })} className="w-4 h-4 accent-[var(--primary)]" />
              <span className="text-sm">Vegetarian</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isAvailable} onChange={e => setForm({ ...form, isAvailable: e.target.checked })} className="w-4 h-4 accent-[var(--primary)]" />
              <span className="text-sm">Available</span>
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
}
