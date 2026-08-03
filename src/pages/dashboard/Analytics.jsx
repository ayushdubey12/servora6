import { useMemo } from 'react';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Stat from '../../components/ui/Stat';
import Badge from '../../components/ui/Badge';
import ProgressBar from '../../components/ui/ProgressBar';
import { Icons } from '../../assets/icons';
import { analyticsData } from '../../data/mockData';

export default function Analytics() {
  const revenueData = analyticsData.revenue;
  const ordersData = analyticsData.orders;
  const peakHours = analyticsData.peakHours;
  const revenueByDay = analyticsData.revenueByDay;
  const popularItems = analyticsData.popularItems;

  const maxRevenue = Math.max(...revenueByDay.map(d => d.revenue));
  const maxOrders = Math.max(...peakHours.map(h => h.orders));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="headline-lg">Analytics</h1>
        <p className="text-muted text-sm mt-1">Performance insights and trends</p>
      </div>

      <div className="grid grid-4 gap-4">
        <Stat title="Today's Revenue" value={`$${revenueData.today.toLocaleString()}`} trend={revenueData.today >= revenueData.yesterday ? 'up' : 'down'} trendValue={`${((revenueData.today - revenueData.yesterday) / Math.max(revenueData.yesterday, 1) * 100).toFixed(1)}%`} icon={<Icons.DollarSign size={22} />} />
        <Stat title="Weekly Orders" value={String(ordersData.thisWeek)} trend="up" trendValue={`${ordersData.thisWeek - ordersData.lastWeek} vs last`} icon={<Icons.BarChart size={22} />} />
        <Stat title="This Month" value={`$${revenueData.thisMonth.toLocaleString()}`} trend="up" trendValue={`${((revenueData.thisMonth - revenueData.lastMonth) / Math.max(revenueData.lastMonth, 1) * 100).toFixed(1)}%`} icon={<Icons.TrendingUp size={22} />} />
        <Stat title="Total Customers" value={String(analyticsData.customers.total)} trend="up" trendValue={`${analyticsData.customers.new} new today`} icon={<Icons.Users size={22} />} />
      </div>

      <div className="grid grid-2 gap-6">
        <Card>
          <CardHeader><CardTitle subtitle="Revenue by day of week">Weekly Revenue</CardTitle></CardHeader>
          <CardBody>
            <div className="flex items-end justify-between gap-2" style={{ height: 180 }}>
              {revenueByDay.map(day => (
                <div key={day.day} className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-full bg-surface-container-high rounded-t-md relative" style={{ height: '100%' }}>
                    <div className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-md transition-all" style={{ height: `${(day.revenue / maxRevenue) * 100}%` }} title={`$${day.revenue}`}></div>
                  </div>
                  <span className="text-xs text-muted font-mono">{day.day}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle subtitle="Orders per hour today">Peak Hours</CardTitle></CardHeader>
          <CardBody>
            <div className="flex items-end justify-between gap-1" style={{ height: 180 }}>
              {peakHours.map(hour => (
                <div key={hour.hour} className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-full bg-surface-container-high rounded-t-md relative" style={{ height: '100%' }}>
                    <div className="absolute bottom-0 left-0 right-0 bg-secondary rounded-t-md transition-all" style={{ height: `${(hour.orders / maxOrders) * 100}%` }} title={`${hour.orders} orders`}></div>
                  </div>
                  <span className="text-[10px] text-muted font-mono">{hour.hour}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-2 gap-6">
        <Card>
          <CardHeader><CardTitle subtitle="Most ordered items">Popular Items</CardTitle></CardHeader>
          <CardBody>
            <div className="flex flex-col gap-3">
              {popularItems.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-xs font-mono text-muted w-6">#{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <span className="text-xs text-muted font-mono">{item.orders} orders</span>
                    </div>
                    <ProgressBar progress={(item.orders / popularItems[0].orders) * 100} />
                  </div>
                  <span className="text-sm font-mono text-primary w-16 text-right">${item.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle subtitle="Customer breakdown">Customer Insights</CardTitle></CardHeader>
          <CardBody>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted font-mono mb-1">New Customers Today</p>
                  <p className="text-xl font-semibold text-primary">{analyticsData.customers.new}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center"><Icons.Users size={24} className="text-primary" /></div>
              </div>
              <div className="border-b border-glass" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted font-mono mb-1">Returning Customers</p>
                  <p className="text-xl font-semibold text-secondary">{analyticsData.customers.returning}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center"><Icons.Users size={24} className="text-secondary" /></div>
              </div>
              <div className="border-b border-glass" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted font-mono mb-1">Retention Rate</p>
                  <p className="text-xl font-semibold text-success">{((analyticsData.customers.returning / Math.max(analyticsData.customers.total, 1)) * 100).toFixed(1)}%</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center"><Icons.Activity size={24} className="text-success" /></div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
