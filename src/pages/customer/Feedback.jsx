import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icons } from '../../assets/icons';
import Button from '../../components/ui/Button';
import './Feedback.css';

export default function Feedback() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="feedback-page">
        <div className="container">
          <div className="feedback-success">
            <div className="success-icon">
              <Icons.CheckCircle size={48} />
            </div>
            <h2>Thank you for your feedback!</h2>
            <p>We appreciate your input. It helps us improve.</p>
            <Button variant="primary" onClick={() => navigate('/menu/the-green-table')}>Back to Menu</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-page">
      <div className="container">
        <div className="feedback-card">
          <div className="feedback-header">
            <h1 className="feedback-title">How was your experience?</h1>
            <p className="feedback-subtitle">We'd love to hear your thoughts about your order.</p>
          </div>

          <form className="feedback-form" onSubmit={handleSubmit}>
            <div className="feedback-section">
              <label className="feedback-label">Rate your experience</label>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    className={`star-btn ${rating >= star ? 'active' : ''}`}
                    onClick={() => setRating(star)}
                  >
                    <Icons.Star size={32} filled={rating >= star} />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="rating-text">
                  {rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Very Good' : 'Excellent'}
                </p>
              )}
            </div>

            <div className="feedback-section">
              <label className="feedback-label">Comments</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us what you liked or what we can improve..."
                className="feedback-textarea"
                rows={5}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              disabled={rating === 0}
            >
              Submit Feedback
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
