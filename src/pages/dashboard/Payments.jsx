import { useMemo } from 'react';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Stat from '../../components/ui/Stat';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import { Icons } from '../../assets/icons';
import { payments, analyticsData } from '../../data/mockData';

export default function Payments() {
  const totalCompleted = useMemo(() => payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0), []);
  const totalRefunded = useMemo(() => payments.filter(p => p.status === 'refunded').reduce((s, p) => s + p.amount, 0), []);
  const avgOrder = useMemo(() => totalCompleted / Math.max(payments.filter(p => p.status === 'completed').length, 1), []);

  const columns = [
    { header: 'Payment ID', field: 'id', align: 'left', render: (row) => <span className="text-sm font-mono">{row.id}</span> },
    { header: 'Order', field: 'orderId', align: 'left', render: (row) => <span className="text-sm font-mono text-muted">{row.orderId}</span> },
    { header: 'Amount', field: 'amount', align: 'right', render: (row) => <span className="text-sm font-mono font-medium text-primary">${row.amount.toFixed(2)}</span> },
    { header: 'Method', field: 'method', align: 'left', render: (row) => (
      <div className="flex items-center gap-2">
        {row.method === 'card' ? <Icons.CreditCard size={14} /> : <Icons.DollarSign size={14} />}
        <span className="text-sm capitalize">{row.method}</span>
        {row.cardLast4 && <span className="text-xs text-muted font-mono">****{row.cardLast4}</span>}
      </div>
    )},
    { header: 'Status', field: 'status', align: 'center', render: (row) => <Badge variant={row.status === 'completed' ? 'success' : 'error'} size="sm" dot>{row.status}</Badge> },
    { header: 'Date', field: 'date', align: 'left', render: (row) => <span className="text-sm text-muted">{new Date(row.date).toLocaleDateString()}</span> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="headline-lg">Payments</h1>
        <p className="text-muted text-sm mt-1">{payments.length} transactions recorded</p>
      </div>

      <div className="grid grid-3 gap-4">
        <Stat title="Total Revenue" value={`$${totalCompleted.toLocaleString()}`} trend="up" trendValue={`${payments.filter(p => p.status === 'completed').length} payments`} icon={<Icons.DollarSign size={22} />} />
        <Stat title="Avg Order Value" value={`$${avgOrder.toFixed(2)}`} trend="up" trendValue="per transaction" icon={<Icons.Receipt size={22} />} />
        <Stat title="Refunded" value={`$${totalRefunded.toFixed(2)}`} trend="down" trendValue={`${payments.filter(p => p.status === 'refunded').length} refunds`} icon={<Icons.RefreshCw size={22} />} />
      </div>

      <Card>
        <CardHeader><CardTitle subtitle="Recent payment transactions">Payment History</CardTitle></CardHeader>
        <CardBody className="p-0">
          <Table columns={columns} data={payments} keyField="id" />
        </CardBody>
      </Card>
    </div>
  );
}
