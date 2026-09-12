import { useState } from 'react';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { Icons } from '../../assets/icons';
import { useRestaurant } from '../../context/RestaurantContext';
import { categories as initialCategories } from '../../data/mockData';

export default function Categories() {
  const { categories, getMenuByCategory } = useRestaurant();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '' });

  const filtered = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.slug.toLowerCase().includes(search.toLowerCase()));

  const openCreate = () => {
    setEditingCat(null);
    setForm({ name: '', slug: '' });
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditingCat(cat);
    setForm({ name: cat.name, slug: cat.slug });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name) return;
    setShowModal(false);
  };

  const columns = [
    { header: 'Category', field: 'name', align: 'left', render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-md bg-surface-container-high flex items-center justify-center text-xs font-mono text-primary">{row.name.substring(0, 2).toUpperCase()}</div>
        <div>
          <p className="text-sm font-medium">{row.name}</p>
          <p className="text-xs text-muted font-mono">{row.slug}</p>
        </div>
      </div>
    )},
    { header: 'Items', field: 'itemCount', align: 'center', render: (row) => getMenuByCategory(row.id).length },
    { header: 'Order', field: 'order', align: 'center', render: (row) => <span className="text-sm font-mono text-muted">{row.order}</span> },
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
          <h1 className="headline-lg">Categories</h1>
          <p className="text-muted text-sm mt-1">{categories.length} menu categories</p>
        </div>
        <Button variant="primary" icon={<Icons.Plus size={16} />} onClick={openCreate}>Add Category</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1 max-w-md">
              <div className="input-wrapper">
                <span className="input-icon"><Icons.Search size={16} /></span>
                <input type="search" className="input-field input-with-icon" placeholder="Search categories..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <Table columns={columns} data={filtered} keyField="id" />
        </CardBody>
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingCat ? 'Edit Category' : 'Add Category'} maxWidth="400px" footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>Save</Button>
        </div>
      }>
        <div className="flex flex-col gap-4">
          <Input label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Category name" required />
          <Input label="Slug" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="category-slug" />
        </div>
      </Modal>
    </div>
  );
}
