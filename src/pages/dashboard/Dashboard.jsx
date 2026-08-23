import { useMemo, useState, useEffect } from 'react';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import { Icons } from '../../assets/icons';
import { useOrders } from '../../context/OrderContext';
import { useRestaurant } from '../../context/RestaurantContext';
import { useAuth } from '../../context/AuthContext';
import { getDashboardStats } from '../../lib/api';

export default function Dashboard() {
  const { orders } = useOrders();
  const { tables, menu } = useRestaurant();
  const { user } = useAuth();
  const [waiterStats, setWaiterStats] = useState([]);

  useEffect(() => {
    async function loadStats() {
      try {
        const stats = await getDashboardStats();
        setWaiterStats(stats || []);
      } catch {
        setWaiterStats([]);
      }
    }
    loadStats();
  }, [orders]);

  const totalRevenue = useMemo(() => orders.reduce((sum, o) => sum + (o.total || 0), 0), [orders]);
  const activeCount = orders.filter(o => !['COMPLETED', 'CANCELLED'].includes(o.status)).length;
  const uniqueCustomers = new Set(orders.map(o => o.customerName)).size;
  const occupied = tables.filter(t => t.status === 'occupied').length;

  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
    [orders]
  );

  const orderColumns = [
    { header: 'Order', field: 'id', align: 'left', render: (row) => <span style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>#{String(row.id).slice(0, 8)}</span> },
    { header: 'Customer', field: 'customerName', align: 'left', render: (row) => <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--on-surface)' }}>{row.customerName}</span> },
    { header: 'Table', field: 'tableNumber', align: 'center', render: (row) => <span style={{ fontSize: '14px', color: 'var(--on-surface-variant)' }}>{row.tableNumber}</span> },
    { header: 'Total', field: 'total', align: 'right', render: (row) => <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--primary)' }}>₹{row.total?.toFixed(0)}</span> },
    { header: 'Status', field: 'status', align: 'center', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, color: 'var(--on-surface)', letterSpacing: '-0.02em' }}>Dashboard</h1>
        <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)', marginTop: '4px' }}>Here is your restaurant at a glance.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-4" style={{ gap: '20px' }}>
        <CompactStat label="Revenue" value={`₹${totalRevenue.toLocaleString()}`} icon={<Icons.DollarSign size={18} />} color="primary" />
        <CompactStat label="Orders" value={String(orders.length)} icon={<Icons.Receipt size={18} />} color="secondary" />
        <CompactStat label="Customers" value={String(uniqueCustomers)} icon={<Icons.Users size={18} />} color="tertiary" />
        <CompactStat label="Tables" value={`${occupied}/${tables.length}`} icon={<Icons.Monitor size={18} />} color="primary" sub={`${tables.filter(t => t.status === 'available').length} free`} />
      </div>

      {/* Main Content — 2-col: Orders + Sidebar */}
      <div className="grid" style={{ gridTemplateColumns: '1fr 340px', gap: '24px' }}>
        {/* Recent Orders */}
        <Card>
          <CardHeader action={<span className="text-xs text-muted font-mono">{orders.length} total</span>}>
            <CardTitle subtitle="Last 5 orders">Recent Orders</CardTitle>
          </CardHeader>
          <CardBody className="p-0">
            <Table columns={orderColumns} data={recentOrders} keyField="id" />
          </CardBody>
        </Card>

        {/* Right Column — stacked: Popular + Staff */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Popular Items */}
          <Card>
            <CardHeader>
              <CardTitle subtitle="Top items">Popular</CardTitle>
            </CardHeader>
            <CardBody>
              {menu.slice(0, 4).map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 3 ? '1px solid var(--outline-variant)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)', width: '20px', fontWeight: 600 }}>#{i + 1}</span>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--on-surface)' }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)' }}>₹{item.price?.toLocaleString()}</span>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Staff Performance */}
          <Card>
            <CardHeader>
              <CardTitle subtitle="Activity">Staff</CardTitle>
            </CardHeader>
            <CardBody>
              {waiterStats.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>No activity yet.</p>
              ) : (
                waiterStats.slice(0, 3).map((w) => (
                  <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid var(--outline-variant)' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--primary)', flexShrink: 0 }}>
                      {w.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--on-surface)' }}>{w.name}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>{w.claimed} claimed</span>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--secondary)' }}>{w.fulfilled}</span>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)' }}>₹{w.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

function CompactStat({ label, value, icon, color = 'primary', sub }) {
  const colorMap = {
    primary: { bg: 'var(--primary-fixed)', fg: 'var(--primary)' },
    secondary: { bg: 'var(--secondary-fixed)', fg: 'var(--secondary)' },
    tertiary: { bg: 'var(--tertiary-fixed)', fg: 'var(--tertiary)' },
  };
  const c = colorMap[color] || colorMap.primary;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px', background: '#ffffff', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', boxShadow: '0px 4px 16px rgba(0,0,0,0.03)' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: c.bg, color: c.fg }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--on-surface-variant)', letterSpacing: '0.02em', marginBottom: '2px' }}>{label}</p>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--on-surface)', lineHeight: 1.1 }}>{value}</p>
        {sub && <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', marginTop: '4px' }}>{sub}</p>}
      </div>
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
    COMPLETED: { variant: 'success', label: 'Done' },
    CANCELLED: { variant: 'error', label: 'Cancelled' },
  };
  const s = map[status] || { variant: 'default', label: status };
  return <Badge variant={s.variant} size="sm" dot>{s.label}</Badge>;
}
