import { useMemo } from 'react';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import ProgressBar from '../../components/ui/ProgressBar';
import { Icons } from '../../assets/icons';
import { useOrders } from '../../context/OrderContext';

export default function KitchenView() {
  const { newOrders, preparingOrders, readyOrders, orders } = useOrders();

  const columns = [
    { header: 'Order', field: 'id', align: 'left', render: (row) => (
      <div>
        <p className="text-sm font-medium font-mono">{row.id}</p>
        <p className="text-xs text-muted">Table {row.tableNumber} · {row.customerName}</p>
      </div>
    )},
    { header: 'Items', field: 'items', align: 'left', render: (row) => (
      <div className="flex flex-col gap-1">
        {row.items?.slice(0, 3).map((item, i) => (
          <p key={i} className="text-sm text-on-surface">x{item.quantity} {item.name}</p>
        ))}
        {row.items?.length > 3 && <p className="text-xs text-muted">+{row.items.length - 3} more</p>}
      </div>
    )},
    { header: 'Since', field: 'createdAt', align: 'center', render: (row) => {
      const mins = Math.floor((Date.now() - new Date(row.createdAt).getTime()) / 60000);
      return <span className="text-sm font-mono text-muted">{mins}m</span>;
    }},
  ];

  const prepTimes = useMemo(() => orders.filter(o => o.status === 'preparing').map(o => {
    const elapsed = Math.floor((Date.now() - new Date(o.createdAt).getTime()) / 60000);
    return { id: o.id, elapsed, est: o.items?.reduce((s, i) => s + (i.prepTime || 10), 0) || 20 };
  }), [orders]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="headline-lg">Kitchen Display</h1>
        <p className="text-muted text-sm mt-1">Real-time order overview for kitchen staff</p>
      </div>

      <div className="grid grid-3 gap-4">
        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center text-warning"><Icons.Bell size={20} /></div>
              <div>
                <p className="text-xs text-muted font-mono">New Orders</p>
                <p className="text-2xl font-semibold text-warning">{newOrders.length}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary"><Icons.ChefHat size={20} /></div>
              <div>
                <p className="text-xs text-muted font-mono">Preparing</p>
                <p className="text-2xl font-semibold text-primary">{preparingOrders.length}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center text-success"><Icons.Check size={20} /></div>
              <div>
                <p className="text-xs text-muted font-mono">Ready</p>
                <p className="text-2xl font-semibold text-success">{readyOrders.length}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {prepTimes.length > 0 && (
        <Card>
          <CardHeader><CardTitle subtitle="Estimated prep time tracking">Prep Progress</CardTitle></CardHeader>
          <CardBody>
            <div className="flex flex-col gap-3">
              {prepTimes.map(pt => {
                const progress = Math.min(100, Math.round((pt.elapsed / Math.max(pt.est, 1)) * 100));
                return (
                  <div key={pt.id} className="glass rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium font-mono">{pt.id}</span>
                      <span className="text-xs text-muted font-mono">{pt.elapsed}m / {pt.est}m est</span>
                    </div>
                    <ProgressBar progress={progress} />
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      )}

      <div className="grid grid-2 gap-6">
        <Card>
          <CardHeader><CardTitle subtitle="Orders awaiting preparation">New Orders</CardTitle></CardHeader>
          <CardBody className="p-0">
            {newOrders.length === 0 ? (
              <div className="p-8 text-center text-muted text-sm">No new orders</div>
            ) : (
              <div className="flex flex-col">
                {newOrders.map(order => (
                  <div key={order.id} className="border-b border-glass px-4 py-3 last:border-b-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium font-mono">{order.id}</p>
                      <Badge variant="warning" size="sm" dot>New</Badge>
                    </div>
                    <p className="text-xs text-muted mt-1">Table {order.tableNumber} · {order.customerName}</p>
                    <div className="flex flex-col gap-0.5 mt-2">
                      {order.items?.slice(0, 2).map((item, i) => (
                        <p key={i} className="text-sm text-on-surface">x{item.quantity} {item.name}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle subtitle="Orders ready for pickup">Ready Orders</CardTitle></CardHeader>
          <CardBody className="p-0">
            {readyOrders.length === 0 ? (
              <div className="p-8 text-center text-muted text-sm">No ready orders</div>
            ) : (
              <div className="flex flex-col">
                {readyOrders.map(order => (
                  <div key={order.id} className="border-b border-glass px-4 py-3 last:border-b-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium font-mono">{order.id}</p>
                      <Badge variant="success" size="sm" dot>Ready</Badge>
                    </div>
                    <p className="text-xs text-muted mt-1">Table {order.tableNumber} · {order.customerName}</p>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle subtitle="Currently being prepared">Preparing Orders</CardTitle></CardHeader>
        <CardBody className="p-0">
          {preparingOrders.length === 0 ? (
            <div className="p-8 text-center text-muted text-sm">No orders in preparation</div>
          ) : (
            <div className="grid grid-2 gap-4 p-4">
              {preparingOrders.map(order => (
                <div key={order.id} className="glass rounded-lg p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium font-mono">{order.id}</p>
                    <Badge variant="primary" size="sm" dot>Preparing</Badge>
                  </div>
                  <p className="text-xs text-muted">Table {order.tableNumber} · {order.customerName}</p>
                  <div className="flex flex-col gap-1 mt-1">
                    {order.items?.map((item, i) => (
                      <p key={i} className="text-sm text-on-surface">x{item.quantity} {item.name}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
