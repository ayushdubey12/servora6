import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrders } from '../../context/OrderContext';
import { Icons } from '../../assets/icons';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import './OrderTracking.css';

// Backend order lifecycle mapped to a simple customer-facing timeline
const STATUS_STEPS = ['PENDING', 'PREPARING', 'READY', 'SERVED', 'PAID'];

const STATUS_CONFIG = {
  PENDING: { label: 'Order Received', color: 'var(--primary)', icon: Icons.Receipt },
  ACCEPTED: { label: 'Accepted', color: 'var(--primary)', icon: Icons.Check },
  PREPARING: { label: 'Preparing', color: 'var(--tertiary)', icon: Icons.Clock },
  READY: { label: 'Ready', color: 'var(--secondary)', icon: Icons.CheckCircle },
  SERVED: { label: 'Served', color: 'var(--success)', icon: Icons.CheckCircle },
  PAYMENT_PENDING: { label: 'Payment Due', color: 'var(--primary)', icon: Icons.CreditCard },
  PAID: { label: 'Paid', color: 'var(--success)', icon: Icons.CheckCircle },
  COMPLETED: { label: 'Completed', color: 'var(--success)', icon: Icons.CheckCircle },
};

// Map any backend status onto the nearest timeline step index
function stepIndexFor(status) {
  if (status === 'PENDING' || status === 'ACCEPTED') return 0;
  if (status === 'PREPARING') return 1;
  if (status === 'READY') return 2;
  if (status === 'SERVED' || status === 'PAYMENT_PENDING') return 3;
  if (status === 'PAID' || status === 'COMPLETED') return 4;
  return 0;
}

function isPayable(status) {
  return status === 'SERVED' || status === 'PAYMENT_PENDING';
}

function isTerminal(status) {
  return status === 'PAID' || status === 'COMPLETED' || status === 'CANCELLED';
}

export default function OrderTracking() {
  const { orderId } = useParams();
  const { orders, currentOrder, fetchAndTrackOrder } = useOrders();
  const [fetchedOrder, setFetchedOrder] = useState(null);
  const [prevStatus, setPrevStatus] = useState(null);
  const navigate = useNavigate();
  const pollRef = useRef(null);

  // Fetch order on mount
  useEffect(() => {
    if (!orderId || orderId === 'preview') return;
    fetchAndTrackOrder(orderId).then(order => {
      if (order) setFetchedOrder(order);
    });
  }, [orderId, fetchAndTrackOrder]);

  // Poll for status updates every 5 seconds until order is paid/completed
  useEffect(() => {
    if (!orderId || orderId === 'preview') return;

    pollRef.current = setInterval(async () => {
      const updated = await fetchAndTrackOrder(orderId);
      if (updated) {
        setFetchedOrder(updated);
        // Stop polling once order is terminal
        if (isTerminal(updated.status)) {
          clearInterval(pollRef.current);
        }
      }
    }, 5000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [orderId, fetchAndTrackOrder]);

  const order =
    orderId === 'preview'
      ? currentOrder
      : orders.find(o => o.id === orderId) || fetchedOrder || currentOrder;

  // Detect status changes for animation
  useEffect(() => {
    if (order && order.status !== prevStatus) {
      setPrevStatus(order.status);
    }
  }, [order?.status, prevStatus]);

  if (!order) {
    return (
      <div className="tracking-page">
        <div className="container">
          <div className="tracking-empty">
            <Icons.Receipt size={48} />
            <h2>Order not found</h2>
            <p>We couldn't find this order.</p>
            <Button variant="primary" onClick={() => navigate('/menu/hotel-siraj')}>Back to Menu</Button>
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

        {order.customerId && order.pointsEarned > 0 && (
          <div className="tracking-loyalty">
            <Icons.Gift size={16} />
            <span><strong>+{order.pointsEarned} loyalty points</strong> added to your account</span>
          </div>
        )}

        {/* Live status indicator */}
        {!isTerminal(order.status) && (
          <div className="tracking-live-indicator">
            <span className="tracking-live-dot" />
            <span className="tracking-live-text">Live — updating automatically</span>
          </div>
        )}

        <div className="tracking-timeline">
          {STATUS_STEPS.map((step, index) => {
            const isComplete = index <= currentStatusIndex;
            const isCurrent = index === currentStatusIndex;
            const stepConfig = STATUS_CONFIG[step];
            const justCompleted = isCurrent && prevStatus && stepIndexFor(prevStatus) < index;

            return (
              <div key={step} className={`timeline-step ${isComplete ? 'complete' : ''} ${isCurrent ? 'current' : ''}`}>
                <div className={`timeline-marker ${justCompleted ? 'pulse-wave' : ''}`} style={isComplete ? { background: stepConfig.color, borderColor: stepConfig.color } : {}}>
                  {isComplete ? <Icons.Check size={14} /> : <span className="timeline-marker-num">{index + 1}</span>}
                  {/* Wave animation rings */}
                  {isCurrent && !isTerminal(order.status) && (
                    <>
                      <span className="timeline-pulse-ring ring-1" style={{ borderColor: stepConfig.color }} />
                      <span className="timeline-pulse-ring ring-2" style={{ borderColor: stepConfig.color }} />
                      <span className="timeline-pulse-ring ring-3" style={{ borderColor: stepConfig.color }} />
                    </>
                  )}
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
                <span className="tracking-item-price">₹{((item.price || 0) * item.quantity).toFixed(0)}</span>
              </div>
            ))}
          </div>
          <div className="tracking-totals">
            <div className="tracking-total-row"><span>Subtotal</span><span>₹{order.subtotal?.toFixed(0)}</span></div>
            <div className="tracking-total-row"><span>Tax</span><span>₹{order.tax?.toFixed(0)}</span></div>
            <div className="tracking-total-row tracking-grand-total"><span>Total</span><span>₹{order.total?.toFixed(0)}</span></div>
          </div>
        </div>

        {/* Payment banner — enabled when order is served or payment pending */}
        {isPayable(order.status) && (
          <div className="tracking-pay-banner">
            <Icons.CreditCard size={20} />
            <div className="tracking-pay-info">
              <span className="tracking-pay-title">Payment Pending</span>
              <span className="tracking-pay-subtitle">Your order has been served. Complete payment to finish.</span>
            </div>
            <Button variant="primary" size="md" onClick={() => navigate(`/payment/${order.id}`)}>
              Pay ₹{order.total?.toFixed(0)}
            </Button>
          </div>
        )}

        <div className="tracking-actions">
          {order.status === 'COMPLETED' || order.status === 'PAID' ? (
            <Button variant="primary" fullWidth onClick={() => navigate('/feedback')}>Leave Feedback</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate('/feedback')}>Leave Feedback</Button>
              <Button variant="primary" onClick={() => navigate('/menu/hotel-siraj')}>Order More</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
