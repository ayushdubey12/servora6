import { useMemo, useState, useEffect } from 'react';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Stat from '../../components/ui/Stat';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import { Icons } from '../../assets/icons';
import { getOrders } from '../../lib/api';

export default function Payments() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders().then(data => {
      setOrders(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const paidOrders = useMemo(() => orders.filter(o => o.status === 'PAID' || o.status === 'COMPLETED' || o.paymentStatus === 'PAID'), [orders]);
  const totalRevenue = useMemo(() => paidOrders.reduce((s, o) => s + (o.total || 0), 0), [paidOrders]);
  const avgOrder = useMemo(() => paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0, [paidOrders, totalRevenue]);
  const pendingAmount = useMemo(() => orders.filter(o => o.status !== 'PAID' && o.status !== 'COMPLETED' && o.status !== 'CANCELLED').reduce((s, o) => s + (o.total || 0), 0), [orders]);

  const columns = [
    { header: 'Order ID', field: 'id', align: 'left', render: (row) => <span className="text-sm font-mono">#{String(row.id).slice(0, 8)}</span> },
    { header: 'Customer', field: 'customerName', align: 'left', render: (row) => <span className="text-sm">{row.customerName || 'Guest'}</span> },
    { header: 'Table', field: 'tableNumber', align: 'center', render: (row) => <span className="text-sm font-mono">{row.tableNumber}</span> },
    { header: 'Amount', field: 'total', align: 'right', render: (row) => <span className="text-sm font-mono font-medium text-primary">₹{((row.total || 0) / 100).toFixed(0)}</span> },
    { header: 'Payment', field: 'paymentStatus', align: 'center', render: (row) => (
      <Badge variant={row.paymentStatus === 'PAID' ? 'success' : row.paymentStatus === 'REFUNDED' ? 'error' : 'warning'} size="sm" dot>
        {row.paymentStatus || 'Pending'}
      </Badge>
    )},
    { header: 'Status', field: 'status', align: 'center', render: (row) => (
      <Badge variant={row.status === 'PAID' || row.status === 'COMPLETED' ? 'success' : row.status === 'CANCELLED' ? 'error' : 'warning'} size="sm">
        {row.status}
      </Badge>
    )},
    { header: 'Date', field: 'createdAt', align: 'left', render: (row) => <span className="text-sm text-muted">{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}</span> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="headline-lg">Payments</h1>
        <p className="text-muted text-sm mt-1">{paidOrders.length} completed payments</p>
      </div>

      <div className="grid grid-3 gap-4">
        <Stat title="Total Revenue" value={`₹${(totalRevenue / 100).toLocaleString()}`} trend="up" trendValue={`${paidOrders.length} payments`} icon={<Icons.DollarSign size={22} />} />
        <Stat title="Avg Order Value" value={`₹${(avgOrder / 100).toFixed(0)}`} trend="up" trendValue="per transaction" icon={<Icons.Receipt size={22} />} />
        <Stat title="Pending" value={`₹${(pendingAmount / 100).toLocaleString()}`} trend="down" trendValue={`${orders.length - paidOrders.length} unpaid`} icon={<Icons.Clock size={22} />} />
      </div>

      <Card>
        <CardHeader><CardTitle subtitle="All payment transactions">Payment History</CardTitle></CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted text-sm font-mono">Loading payments...</div>
          ) : (
            <Table columns={columns} data={paidOrders} keyField="id" />
          )}
        </CardBody>
      </Card>
    </div>
  );
}
