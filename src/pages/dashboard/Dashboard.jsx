import { useMemo, useState, useEffect } from 'react';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Stat from '../../components/ui/Stat';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import { Icons } from '../../assets/icons';
import { useOrders } from '../../context/OrderContext';
import { useRestaurant } from '../../context/RestaurantContext';
import { useAuth } from '../../context/AuthContext';
import { analyticsData, notifications, orders as allOrders } from '../../data/mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function Dashboard() {
  const { orders } = useOrders();
  const { tables, menu } = useRestaurant();
  const { token } = useAuth();
  const [waiterStats, setWaiterStats] = useState([]);

  // Load waiter performance stats and refresh whenever orders change (realtime)
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/stats/waiters`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(r => r.json())
      .then(d => { if (d.success) setWaiterStats(d.data); })
      .catch(() => {});
  }, [token, orders]);

  const totalRevenue = useMemo(() => orders.reduce((sum, o) => sum + (o.total || 0), 0), [orders]);
  const activeCount = orders.filter(o => !['COMPLETED', 'CANCELLED'].includes(o.status)).length;
  const uniqueCustomers = new Set(orders.map(o => o.customerName)).size;

  const recentOrders = useMemo(() => [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5), [orders]);
  const recentNotifications = notifications.slice(0, 5);

  const orderColumns = [
    { header: 'Order ID', field: 'id', align: 'left', render: (row) => `#${String(row.id).slice(0, 8)}` },
    { header: 'Customer', field: 'customerName', align: 'left' },
    { header: 'Total', field: 'total', align: 'right', render: (row) => `$${row.total?.toFixed(2)}` },
    { header: 'Status', field: 'status', align: 'center', render: (row) => <StatusBadge status={row.status} /> },
    { header: 'Time', field: 'createdAt', align: 'left', render: (row) => new Date(row.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  ];

  const notifIcon = (type) => {
    const map = { new_order: Icons.ShoppingCart, call_waiter: Icons.Bell, bill_request: Icons.Receipt, order_ready: Icons.Check, new_review: Icons.Star, low_stock: Icons.Package };
    const Comp = map[type] || Icons.Bell;
    return <Comp size={14} />;
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="headline-lg">Dashboard</h1>
        <p className="text-muted text-sm mt-1">Welcome back. Here is your restaurant at a glance.</p>
      </div>

      <div className="grid grid-4 gap-4">
        <Stat title="Revenue" value={`$${analyticsData.revenue.today.toLocaleString()}`} trend="up" trendValue={`${((analyticsData.revenue.today - analyticsData.revenue.yesterday) / analyticsData.revenue.yesterday * 100).toFixed(1)}%`} icon={<Icons.DollarSign size={22} />} />
        <Stat title="Orders" value={String(analyticsData.orders.today)} trend="up" trendValue={`${analyticsData.orders.today - analyticsData.orders.yesterday} vs yesterday`} icon={<Icons.Receipt size={22} />} />
        <Stat title="Customers" value={String(analyticsData.customers.today)} trend="up" trendValue={`${analyticsData.customers.new} new`} icon={<Icons.Users size={22} />} />
        <Stat title="Active Tables" value={`${tables.filter(t => t.status === 'occupied').length}/${tables.length}`} trend="up" trendValue={`${tables.filter(t => t.status === 'available').length} free`} icon={<Icons.Monitor size={22} />} />
      </div>

      <div className="grid grid-2 gap-4">
        <Card>
          <CardHeader action={<button className="glass glass-hover rounded-md px-3 py-1.5 text-sm text-primary font-medium">View All</button>}>
            <CardTitle subtitle="Last 5 orders">Recent Orders</CardTitle>
          </CardHeader>
          <CardBody className="p-0">
            <Table columns={orderColumns} data={recentOrders} keyField="id" />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle subtitle="Real-time updates">Activity</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="flex flex-col gap-3">
              {recentNotifications.map(n => (
                <div key={n.id} className="flex items-start gap-3 glass-hover rounded-lg p-3 cursor-pointer">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-container-high text-primary shrink-0">
                    {notifIcon(n.type)}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm text-on-surface">{n.message}</p>
                    <p className="text-xs text-muted font-mono">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle subtitle="Orders claimed and fulfilled by each waiter">Waiter Performance</CardTitle>
        </CardHeader>
        <CardBody>
          {waiterStats.length === 0 ? (
            <p className="text-sm text-muted">No waiter activity yet. Add waiters in the Staff page and they'll appear here once they claim orders.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {waiterStats.map((w, i) => (
                <div key={w.id} className="flex items-center gap-4 glass rounded-lg p-4">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-surface-container-high text-primary text-sm font-medium shrink-0">
                    {w.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-on-surface truncate">{w.name}</p>
                    <p className="text-xs text-muted font-mono">{w.email}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-on-surface">{w.claimed}</p>
                      <p className="text-xs text-muted font-mono">claimed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-success">{w.fulfilled}</p>
                      <p className="text-xs text-muted font-mono">fulfilled</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-primary">${w.revenue.toLocaleString()}</p>
                      <p className="text-xs text-muted font-mono">revenue</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle subtitle="Top performing items today">Popular Items</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-4 gap-4">
            {analyticsData.popularItems.slice(0, 4).map((item, i) => (
              <div key={i} className="glass glass-hover rounded-lg p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-muted">#{i + 1}</span>
                  <Badge variant="primary" size="sm">{item.orders} orders</Badge>
                </div>
                <p className="text-sm font-medium text-on-surface truncate">{item.name}</p>
                <p className="text-xs text-primary font-mono">${item.revenue.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    PENDING: { variant: 'warning', label: 'Pending' },
    ACCEPTED: { variant: 'primary', label: 'Accepted' },
    PREPARING: { variant: 'primary', label: 'Preparing' },
    READY: { variant: 'secondary', label: 'Ready' },
    SERVED: { variant: 'success', label: 'Served' },
    PAID: { variant: 'success', label: 'Paid' },
    COMPLETED: { variant: 'success', label: 'Completed' },
    CANCELLED: { variant: 'error', label: 'Cancelled' },
  };
  const s = map[status] || { variant: 'default', label: status };
  return <Badge variant={s.variant} size="sm" dot>{s.label}</Badge>;
}
