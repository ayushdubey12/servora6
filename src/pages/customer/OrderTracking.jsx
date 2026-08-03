import { useParams, useNavigate } from 'react-router-dom';
import { useOrders } from '../../context/OrderContext';
import { Icons } from '../../assets/icons';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import './OrderTracking.css';

// Backend order lifecycle mapped to a simple customer-facing timeline
const STATUS_STEPS = ['PENDING', 'PREPARING', 'READY', 'SERVED'];

const STATUS_CONFIG = {
  PENDING: { label: 'Order Received', color: 'var(--primary)', icon: Icons.Receipt },
  ACCEPTED: { label: 'Accepted', color: 'var(--primary)', icon: Icons.Check },
  PREPARING: { label: 'Preparing', color: 'var(--tertiary)', icon: Icons.Clock },
  READY: { label: 'Ready', color: 'var(--secondary)', icon: Icons.CheckCircle },
  SERVED: { label: 'Served', color: 'var(--success)', icon: Icons.CheckCircle },
  PAID: { label: 'Paid', color: 'var(--success)', icon: Icons.CheckCircle },
  COMPLETED: { label: 'Completed', color: 'var(--success)', icon: Icons.CheckCircle },
};

// Map any backend status onto the nearest timeline step index
function stepIndexFor(status) {
  if (status === 'PENDING' || status === 'ACCEPTED') return 0;
  if (status === 'PREPARING') return 1;
  if (status === 'READY') return 2;
  if (status === 'SERVED' || status === 'PAYMENT_PENDING' || status === 'PAID' || status === 'COMPLETED') return 3;
  return 0;
}

export default function OrderTracking() {
  const { orderId } = useParams();
  const { orders, currentOrder } = useOrders();
  const navigate = useNavigate();

  const order = orderId === 'preview' ? currentOrder : orders.find(o => o.id === orderId) || currentOrder;

  if (!order) {
    return (
      <div className="tracking-page">
        <div className="container">
          <div className="tracking-empty">
            <Icons.Receipt size={48} />
            <h2>Order not found</h2>
            <p>We couldn't find this order.</p>
            <Button variant="primary" onClick={() => navigate('/menu/the-green-table')}>Back to Menu</Button>
          </div>
        </div>
      </div>
    );
  }

  const currentStatusIndex = stepIndexFor(order.status);
  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;

  return (
    <div className="tracking-page">
      <div className="container">
        <div className="tracking-header">
          <div>
            <h1 className="tracking-title">Order #{String(order.id).slice(0, 8)}</h1>
            <p className="tracking-table">Table {order.tableNumber}</p>
          </div>
          <Badge variant={config.color === 'var(--primary)' ? 'primary' : config.color === 'var(--tertiary)' ? 'tertiary' : config.color === 'var(--secondary)' ? 'secondary' : 'success'}>
            {order.status}
          </Badge>
        </div>

        {order.claimedBy && (
          <div className="tracking-waiter">
            <Icons.User size={16} />
            <span>Your server: <strong>{order.claimedBy.name}</strong></span>
          </div>
        )}

        <div className="tracking-timeline">
          {STATUS_STEPS.map((step, index) => {
            const isComplete = index <= currentStatusIndex;
            const isCurrent = index === currentStatusIndex;
            const stepConfig = STATUS_CONFIG[step];

            return (
              <div key={step} className={`timeline-step ${isComplete ? 'complete' : ''} ${isCurrent ? 'current' : ''}`}>
                <div className="timeline-marker" style={isComplete ? { background: stepConfig.color, borderColor: stepConfig.color } : {}}>
                  {isComplete ? <Icons.Check size={14} /> : <span className="timeline-marker-num">{index + 1}</span>}
                </div>
                <div className="timeline-content">
                  <span className="timeline-label" style={isCurrent ? { color: stepConfig.color } : {}}>{stepConfig.label}</span>
                  {isCurrent && <span className="timeline-active-label">In Progress</span>}
                </div>
                {index < STATUS_STEPS.length - 1 && (
                  <div className={`timeline-line ${index < currentStatusIndex ? 'complete' : ''}`} style={index < currentStatusIndex ? { background: stepConfig.color } : {}} />
                )}
              </div>
            );
          })}
        </div>

        <div className="tracking-details">
          <h3 className="tracking-details-title">Order Details</h3>
          <div className="tracking-items">
            {(order.items || []).map((item, i) => (
              <div key={i} className="tracking-item">
                <span className="tracking-item-qty">{item.quantity}×</span>
                <span className="tracking-item-name">{item.menuItem?.name || item.name || 'Item'}</span>
                <span className="tracking-item-price">${((item.price || 0) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="tracking-totals">
            <div className="tracking-total-row"><span>Subtotal</span><span>${order.subtotal?.toFixed(2)}</span></div>
            <div className="tracking-total-row"><span>Tax</span><span>${order.tax?.toFixed(2)}</span></div>
            <div className="tracking-total-row tracking-grand-total"><span>Total</span><span>${order.total?.toFixed(2)}</span></div>
          </div>
        </div>

        <div className="tracking-actions">
          <Button variant="ghost" onClick={() => navigate('/feedback')}>Leave Feedback</Button>
          <Button variant="primary" onClick={() => navigate('/menu/the-green-table')}>Order More</Button>
        </div>
      </div>
    </div>
  );
}
