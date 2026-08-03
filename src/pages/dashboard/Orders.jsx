import { useState, useMemo } from 'react';
import Card, { CardHeader, CardTitle, CardBody, CardFooter } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import { Icons } from '../../assets/icons';
import { useOrders } from '../../context/OrderContext';
import { orders as initialOrders } from '../../data/mockData';

export default function Orders() {
  const { orders, updateOrderStatus } = useOrders();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filtered = useMemo(() => {
    let data = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (filterStatus !== 'all') data = data.filter(o => o.status === filterStatus);
    if (search) data = data.filter(o => o.id.toLowerCase().includes(search.toLowerCase()) || o.customerName.toLowerCase().includes(search.toLowerCase()) || String(o.tableNumber).includes(search));
    return data;
  }, [orders, filterStatus, search]);

  const columns = [
    { header: 'Order ID', field: 'id', align: 'left' },
    { header: 'Customer', field: 'customerName', align: 'left' },
    { header: 'Table', field: 'tableNumber', align: 'left' },
    { header: 'Items', field: 'items', align: 'center', render: (row) => row.items?.reduce((s, i) => s + i.quantity, 0) || 0 },
    { header: 'Total', field: 'total', align: 'right', render: (row) => `$${row.total?.toFixed(2)}` },
    { header: 'Status', field: 'status', align: 'center', render: (row) => <StatusBadge status={row.status} /> },
    { header: 'Time', field: 'createdAt', align: 'left', render: (row) => new Date(row.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    { header: 'Actions', field: 'id', align: 'center', render: (row) => (
      <div className="flex items-center justify-center gap-2">
        <button onClick={(e) => { e.stopPropagation(); setSelectedOrder(row); }} className="p-1.5 rounded-md glass-hover text-primary" title="View"><Icons.Eye size={16} /></button>
      </div>
    )},
  ];

  const statuses = ['new', 'preparing', 'ready', 'delivered', 'completed', 'cancelled'];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="headline-lg">Orders</h1>
          <p className="text-muted text-sm mt-1">{orders.length} total orders</p>
        </div>
      </div>

      <Card>
        <CardHeader action={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {['new', 'preparing', 'ready', 'completed'].map(s => (
                <button key={s} onClick={() => setFilterStatus(filterStatus === s ? 'all' : s)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filterStatus === s ? 'bg-primary text-on-primary' : 'glass glass-hover text-muted'}`}>
                  {s === 'new' ? 'New' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        }>
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1 max-w-md">
              <div className="input-wrapper">
                <span className="input-icon"><Icons.Search size={16} /></span>
                <input type="search" className="input-field input-with-icon" placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <Table columns={columns} data={filtered} keyField="id" onRowClick={setSelectedOrder} />
        </CardBody>
      </Card>

      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Order ${selectedOrder?.id}`} maxWidth="600px" footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={() => setSelectedOrder(null)}>Close</Button>
        </div>
      }>
        {selectedOrder && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-2 gap-4">
              <div><p className="text-xs text-muted font-mono mb-1">Customer</p><p className="text-sm">{selectedOrder.customerName}</p></div>
              <div><p className="text-xs text-muted font-mono mb-1">Table</p><p className="text-sm">Table {selectedOrder.tableNumber}</p></div>
              <div><p className="text-xs text-muted font-mono mb-1">Status</p><StatusBadge status={selectedOrder.status} /></div>
              <div><p className="text-xs text-muted font-mono mb-1">Payment</p><p className="text-sm capitalize">{selectedOrder.paymentStatus}</p></div>
              <div><p className="text-xs text-muted font-mono mb-1">Subtotal</p><p className="text-sm">${selectedOrder.subtotal?.toFixed(2)}</p></div>
              <div><p className="text-xs text-muted font-mono mb-1">Total</p><p className="text-sm font-medium text-primary">${selectedOrder.total?.toFixed(2)}</p></div>
            </div>
            {selectedOrder.notes && <div><p className="text-xs text-muted font-mono mb-1">Notes</p><p className="text-sm text-on-surface">{selectedOrder.notes}</p></div>}
            <div>
              <p className="text-xs text-muted font-mono mb-2">Items</p>
              <div className="flex flex-col gap-2">
                {selectedOrder.items?.map((item, i) => (
                  <div key={i} className="flex items-center justify-between glass rounded-md p-2">
                    <span className="text-sm">{item.name}</span>
                    <span className="text-xs text-muted font-mono">x{item.quantity} — ${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted font-mono mb-2">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {statuses.map(s => (
                  <button key={s} onClick={() => { updateOrderStatus(selectedOrder.id, s); setSelectedOrder(prev => ({ ...prev, status: s })); }} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${selectedOrder.status === s ? 'bg-primary text-on-primary' : 'glass glass-hover'}`}>
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

function StatusBadge({ status }) {
  const map = {
    new: { variant: 'warning', label: 'New' },
    preparing: { variant: 'primary', label: 'Preparing' },
    ready: { variant: 'secondary', label: 'Ready' },
    delivered: { variant: 'success', label: 'Delivered' },
    completed: { variant: 'success', label: 'Completed' },
    cancelled: { variant: 'error', label: 'Cancelled' },
  };
  const s = map[status] || { variant: 'default', label: status };
  return <Badge variant={s.variant} size="sm" dot>{s.label}</Badge>;
}
