import { useState, useMemo } from 'react';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { Icons } from '../../assets/icons';
import { reviews } from '../../data/mockData';

export default function Reviews() {
  const [filterRating, setFilterRating] = useState('all');
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const filtered = useMemo(() => {
    let data = [...reviews].sort((a, b) => new Date(b.date) - new Date(a.date));
    if (filterRating !== 'all') data = data.filter(r => r.rating === Number(filterRating));
    return data;
  }, [filterRating]);

  const avgRating = useMemo(() => (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1), []);
  const replyRate = useMemo(() => Math.round((reviews.filter(r => r.reply).length / reviews.length) * 100), []);

  const openReply = (review) => {
    setReplyTo(review);
    setReplyText(review.reply || '');
  };

  const submitReply = () => {
    setReplyTo(null);
    setReplyText('');
  };

  const StarRating = ({ rating }) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Icons.Star key={star} size={14} className={star <= rating ? 'text-tertiary' : 'text-surface-container-high'} fill={star <= rating ? 'var(--tertiary)' : 'none'} />
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="headline-lg">Reviews</h1>
        <p className="text-muted text-sm mt-1">{reviews.length} customer reviews</p>
      </div>

      <div className="grid grid-3 gap-4">
        <Card>
          <CardBody>
            <p className="text-xs text-muted font-mono mb-1">Average Rating</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-semibold text-tertiary">{avgRating}</p>
              <StarRating rating={Math.round(Number(avgRating))} />
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-muted font-mono mb-1">Total Reviews</p>
            <p className="text-2xl font-semibold text-primary">{reviews.length}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-muted font-mono mb-1">Reply Rate</p>
            <p className="text-2xl font-semibold text-secondary">{replyRate}%</p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {[5, 4, 3, 'all'].map(r => (
                  <button key={r} onClick={() => setFilterRating(String(r))} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filterRating === String(r) ? 'bg-primary text-on-primary' : 'glass glass-hover text-muted'}`}>
                    {r === 'all' ? 'All' : `${r} ★`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col gap-4">
            {filtered.map(review => (
              <div key={review.id} className="glass rounded-lg p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-xs font-medium text-primary">{review.customerName.split(' ').map(n => n[0]).join('')}</div>
                    <div>
                      <p className="text-sm font-medium">{review.customerName}</p>
                      <p className="text-xs text-muted">{review.date}</p>
                    </div>
                  </div>
                  <StarRating rating={review.rating} />
                </div>
                <p className="text-sm text-on-surface leading-relaxed">{review.comment}</p>
                {review.reply && (
                  <div className="glass-subtle rounded-md p-3 mt-1">
                    <p className="text-xs text-primary font-mono mb-1">Your Reply</p>
                    <p className="text-sm text-on-surface">{review.reply}</p>
                  </div>
                )}
                <div className="flex items-center justify-end">
                  <Button variant="secondary" size="sm" onClick={() => openReply(review)} icon={<Icons.MessageSquare size={14} />}>{review.reply ? 'Edit Reply' : 'Reply'}</Button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="text-center text-muted text-sm py-8">No reviews match your filter</div>}
          </div>
        </CardBody>
      </Card>

      <Modal isOpen={!!replyTo} onClose={() => setReplyTo(null)} title={`Reply to ${replyTo?.customerName}`} maxWidth="500px" footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={() => setReplyTo(null)}>Cancel</Button>
          <Button variant="primary" onClick={submitReply}>Submit Reply</Button>
        </div>
      }>
        <div className="flex flex-col gap-4">
          <div className="glass rounded-md p-3">
            <p className="text-sm text-muted">{replyTo?.comment}</p>
          </div>
          <Input label="Your Reply" value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write your response..." />
        </div>
      </Modal>
    </div>
  );
}
