import { useState, useMemo } from 'react';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import { Icons } from '../../assets/icons';
import { useOrders } from '../../context/OrderContext';

export default function Orders() {
  const { orders, updateOrderStatus } = useOrders();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filtered = useMemo(() => {
    let data = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (filterStatus !== 'all') data = data.filter(o => o.status === filterStatus.toUpperCase() || o.status === filterStatus);
    if (search) data = data.filter(o =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      String(o.tableNumber).includes(search) ||
      (o.claimedBy?.name || '').toLowerCase().includes(search.toLowerCase())
    );
    return data;
  }, [orders, filterStatus, search]);

  const columns = [
    { header: 'Order ID', field: 'id', align: 'left', render: (row) => <span className="text-xs font-mono">#{String(row.id).slice(0, 8)}</span> },
    { header: 'Customer', field: 'customerName', align: 'left' },
    { header: 'Table', field: 'tableNumber', align: 'left', render: (row) => `Table ${row.tableNumber}` },
    { header: 'Items', field: 'items', align: 'center', render: (row) => row.items?.reduce((s, i) => s + i.quantity, 0) || 0 },
    { header: 'Total', field: 'total', align: 'right', render: (row) => <span className="text-sm font-mono font-medium text-primary">₹{row.total?.toFixed(0)}</span> },
    { header: 'Waiter', field: 'claimedBy', align: 'left', render: (row) => row.claimedBy ? (
      <div className="flex items-center gap-1.5">
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary-container text-on-primary-container text-xs font-medium">
          {row.claimedBy.name?.charAt(0)}
        </span>
        <span className="text-xs">{row.claimedBy.name}</span>
      </div>
    ) : <span className="text-xs text-muted">Unassigned</span> },
    { header: 'Status', field: 'status', align: 'center', render: (row) => <StatusBadge status={row.status} /> },
    { header: 'Time', field: 'createdAt', align: 'left', render: (row) => new Date(row.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    { header: '', field: 'id', align: 'center', render: (row) => (
      <button onClick={(e) => { e.stopPropagation(); setSelectedOrder(row); }} className="p-1.5 rounded-md text-primary hover:bg-surface-container" title="View"><Icons.Eye size={16} /></button>
    )},
  ];

  const statuses = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];

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
          <div className="flex items-center gap-2 flex-wrap">
            {['pending', 'preparing', 'ready', 'completed'].map(s => (
              <button key={s} onClick={() => setFilterStatus(filterStatus === s ? 'all' : s)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterStatus === s ? 'bg-primary text-on-primary' : 'text-muted hover:bg-surface-container'}`}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        }>
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1 max-w-md">
              <div className="input-wrapper">
                <span className="input-icon"><Icons.Search size={16} /></span>
                <input type="search" className="input-field input-with-icon" placeholder="Search orders, customers, waiters..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <Table columns={columns} data={filtered} keyField="id" onRowClick={setSelectedOrder} />
        </CardBody>
      </Card>

      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Order #${selectedOrder?.id?.slice(0, 8)}`} maxWidth="600px" footer={
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
              <div><p className="text-xs text-muted font-mono mb-1">Waiter</p><p className="text-sm">{selectedOrder.claimedBy?.name || <span className="text-muted">Unassigned</span>}</p></div>
              <div><p className="text-xs text-muted font-mono mb-1">Total</p><p className="text-sm font-medium text-primary">₹{selectedOrder.total?.toFixed(0)}</p></div>
            </div>
            {selectedOrder.notes && <div><p className="text-xs text-muted font-mono mb-1">Notes</p><p className="text-sm">{selectedOrder.notes}</p></div>}
            <div>
              <p className="text-xs text-muted font-mono mb-2">Items</p>
              <div className="flex flex-col gap-2">
                {selectedOrder.items?.map((item, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg p-2" style={{ background: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)' }}>
                    <span className="text-sm">{item.menuItem?.name || item.name}</span>
                    <span className="text-xs text-muted font-mono">x{item.quantity} — ₹{(item.price * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted font-mono mb-2">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {statuses.map(s => (
                  <button key={s} onClick={() => { updateOrderStatus(selectedOrder.id, s); setSelectedOrder(prev => ({ ...prev, status: s })); }} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${selectedOrder.status === s ? 'bg-primary text-on-primary' : 'text-muted hover:bg-surface-container'}`}>
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
    PENDING: { variant: 'primary', label: 'Pending' },
    ACCEPTED: { variant: 'tertiary', label: 'Accepted' },
    PREPARING: { variant: 'tertiary', label: 'Preparing' },
    READY: { variant: 'secondary', label: 'Ready' },
    SERVED: { variant: 'success', label: 'Served' },
    PAID: { variant: 'success', label: 'Paid' },
    COMPLETED: { variant: 'success', label: 'Completed' },
    CANCELLED: { variant: 'error', label: 'Cancelled' },
  };
  const s = map[status] || { variant: 'default', label: status };
  return <Badge variant={s.variant} size="sm" dot>{s.label}</Badge>;
}
