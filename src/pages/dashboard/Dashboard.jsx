import { useMemo, useState, useEffect } from 'react';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Stat from '../../components/ui/Stat';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import { Icons } from '../../assets/icons';
import { useOrders } from '../../context/OrderContext';
import { useRestaurant } from '../../context/RestaurantContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export default function Dashboard() {
  const { orders } = useOrders();
  const { tables, menu } = useRestaurant();
  const { user } = useAuth();
  const [waiterStats, setWaiterStats] = useState([]);

  // Load waiter performance stats from Supabase
  useEffect(() => {
    async function loadStats() {
      try {
        // Fetch all profiles with waiter/chef role
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name, email, role')
          .in('role', ['waiter', 'chef']);

        if (!profiles?.length) { setWaiterStats([]); return; }

        // Fetch all orders that have been claimed
        const { data: claimedOrders } = await supabase
          .from('orders')
          .select('id, claimed_by_id, status, total');

        if (!claimedOrders) { setWaiterStats([]); return; }

        // Compute stats per waiter
        const stats = profiles.map(p => {
          const myOrders = claimedOrders.filter(o => o.claimed_by_id === p.id);
          const claimed = myOrders.length;
          const fulfilled = myOrders.filter(o => o.status === 'COMPLETED' || o.status === 'PAID').length;
          const revenue = myOrders
            .filter(o => o.status === 'COMPLETED' || o.status === 'PAID')
            .reduce((sum, o) => sum + (o.total || 0), 0);
          return { ...p, claimed, fulfilled, revenue };
        });

        setWaiterStats(stats.filter(s => s.claimed > 0));
      } catch {
        setWaiterStats([]);
      }
    }
    loadStats();
  }, [orders]);

  const totalRevenue = useMemo(() => orders.reduce((sum, o) => sum + (o.total || 0), 0), [orders]);
  const activeCount = orders.filter(o => !['COMPLETED', 'CANCELLED'].includes(o.status)).length;
  const uniqueCustomers = new Set(orders.map(o => o.customerName)).size;

  const recentOrders = useMemo(() => [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5), [orders]);

  const orderColumns = [
    { header: 'Order ID', field: 'id', align: 'left', render: (row) => `#${String(row.id).slice(0, 8)}` },
    { header: 'Customer', field: 'customerName', align: 'left' },
    { header: 'Total', field: 'total', align: 'right', render: (row) => `$${row.total?.toFixed(2)}` },
    { header: 'Status', field: 'status', align: 'center', render: (row) => <StatusBadge status={row.status} /> },
    { header: 'Time', field: 'createdAt', align: 'left', render: (row) => new Date(row.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="headline-lg">Dashboard</h1>
        <p className="text-muted text-sm mt-1">Welcome back. Here is your restaurant at a glance.</p>
      </div>

      <div className="grid grid-4 gap-4">
        <Stat title="Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={<Icons.DollarSign size={22} />} />
        <Stat title="Orders" value={String(orders.length)} icon={<Icons.Receipt size={22} />} />
        <Stat title="Customers" value={String(uniqueCustomers)} icon={<Icons.Users size={22} />} />
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
            <CardTitle subtitle="Staff activity">Waiter Performance</CardTitle>
          </CardHeader>
          <CardBody>
            {waiterStats.length === 0 ? (
              <p className="text-sm text-muted">No waiter activity yet. Add waiters in the Staff page and they'll appear here once they claim orders.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {waiterStats.map((w) => (
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle subtitle="Top performing items today">Popular Items</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-4 gap-4">
            {menu.slice(0, 4).map((item, i) => (
              <div key={i} className="glass glass-hover rounded-lg p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-muted">#{i + 1}</span>
                </div>
                <p className="text-sm font-medium text-on-surface truncate">{item.name}</p>
                <p className="text-xs text-primary font-mono">${item.price?.toLocaleString()}</p>
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
