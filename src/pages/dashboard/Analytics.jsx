import { useMemo, useState, useEffect } from 'react';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Stat from '../../components/ui/Stat';
import ProgressBar from '../../components/ui/ProgressBar';
import { Icons } from '../../assets/icons';
import { getOrders, getCustomers } from '../../lib/api';

export default function Analytics() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getOrders(), getCustomers()]).then(([o, c]) => {
      setOrders(o);
      setCustomers(c);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const todayOrders = orders.filter(o => (o.createdAt || '').startsWith(today));
    const paidOrders = orders.filter(o => o.status === 'PAID' || o.status === 'COMPLETED');

    const todayRevenue = todayOrders.filter(o => o.status === 'PAID' || o.status === 'COMPLETED').reduce((s, o) => s + (o.total || 0), 0);
    const totalRevenue = paidOrders.reduce((s, o) => s + (o.total || 0), 0);
    const totalOrders = orders.length;

    // Revenue by day of week
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const revenueByDay = dayNames.map(day => {
      const dayOrders = paidOrders.filter(o => {
        const d = new Date(o.createdAt);
        return dayNames[d.getDay()] === day;
      });
      return { day, revenue: dayOrders.reduce((s, o) => s + (o.total || 0), 0) };
    });

    // Popular items
    const itemCounts = {};
    orders.forEach(o => {
      (o.items || []).forEach(item => {
        const name = item.menuItem?.name || item.name || 'Unknown';
        if (!itemCounts[name]) itemCounts[name] = { name, orders: 0, revenue: 0 };
        itemCounts[name].orders += item.quantity || 1;
        itemCounts[name].revenue += (item.price || 0) * (item.quantity || 1);
      });
    });
    const popularItems = Object.values(itemCounts).sort((a, b) => b.orders - a.orders).slice(0, 5);

    return {
      todayRevenue,
      totalRevenue,
      totalOrders,
      todayOrders: todayOrders.length,
      totalCustomers: customers.length,
      revenueByDay,
      popularItems,
    };
  }, [orders, customers]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="headline-lg">Analytics</h1>
        <div className="p-8 text-center text-muted text-sm font-mono">Loading analytics...</div>
      </div>
    );
  }

  const maxRevenue = Math.max(...stats.revenueByDay.map(d => d.revenue), 1);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="headline-lg">Analytics</h1>
        <p className="text-muted text-sm mt-1">Performance insights from real data</p>
      </div>

      <div className="grid grid-4 gap-4">
        <Stat title="Today's Revenue" value={`₹${(stats.todayRevenue / 100).toLocaleString()}`} trend="up" trendValue={`${stats.todayOrders} orders`} icon={<Icons.TrendingUp size={22} />} />
        <Stat title="Total Orders" value={String(stats.totalOrders)} trend="up" trendValue="all time" icon={<Icons.BarChart size={22} />} />
        <Stat title="Total Revenue" value={`₹${(stats.totalRevenue / 100).toLocaleString()}`} trend="up" trendValue="all time" icon={<Icons.DollarSign size={22} />} />
        <Stat title="Total Customers" value={String(stats.totalCustomers)} trend="up" trendValue="registered" icon={<Icons.Users size={22} />} />
      </div>

      <div className="grid grid-2 gap-6">
        <Card>
          <CardHeader><CardTitle subtitle="Revenue by day of week">Weekly Revenue</CardTitle></CardHeader>
          <CardBody>
            <div className="flex items-end justify-between gap-2" style={{ height: 180 }}>
              {stats.revenueByDay.map(day => (
                <div key={day.day} className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-full bg-surface-container-high rounded-t-md relative" style={{ height: '100%' }}>
                    <div className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-md transition-all" style={{ height: `${(day.revenue / maxRevenue) * 100}%` }} title={`₹${(day.revenue / 100).toFixed(0)}`}></div>
                  </div>
                  <span className="text-xs text-muted font-mono">{day.day}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle subtitle="Most ordered items">Popular Items</CardTitle></CardHeader>
          <CardBody>
            <div className="flex flex-col gap-3">
              {stats.popularItems.length > 0 ? stats.popularItems.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-xs font-mono text-muted w-6">#{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <span className="text-xs text-muted font-mono">{item.orders} orders</span>
                    </div>
                    <ProgressBar progress={(item.orders / stats.popularItems[0].orders) * 100} />
                  </div>
                  <span className="text-sm font-mono text-primary w-16 text-right">₹{(item.revenue / 100).toLocaleString()}</span>
                </div>
              )) : (
                <p className="text-center text-muted text-sm py-4">No order data yet</p>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
