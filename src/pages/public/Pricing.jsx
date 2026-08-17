import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icons } from '../../assets/icons';
import Button from '../../components/ui/Button';
import { pricingPlans } from '../../data/mockData';
import './Pricing.css';

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState('yearly');

  return (
    <div className="pricing-page">
      <div className="container py-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="headline-lg mb-6" style={{ color: 'var(--on-surface)' }}>Simple, transparent pricing</h1>
          <p className="body-lg mb-8" style={{ color: 'var(--on-surface-variant)' }}>
            Choose the perfect plan for your restaurant. No hidden fees, no surprises.
          </p>

          <div className="billing-toggle">
            <span className={billingCycle === 'monthly' ? 'body-md font-medium' : 'body-md text-muted'} style={{ color: billingCycle === 'monthly' ? 'var(--on-surface)' : 'var(--on-surface-variant)' }}>Monthly</span>
            <button
              className={`toggle-btn ${billingCycle === 'yearly' ? 'active' : ''}`}
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            >
              <div className="toggle-slider"></div>
            </button>
            <span className={billingCycle === 'yearly' ? 'body-md font-medium' : 'body-md text-muted'} style={{ color: billingCycle === 'yearly' ? 'var(--on-surface)' : 'var(--on-surface-variant)' }}>
              Yearly <span className="save-badge ml-2">Save 20%</span>
            </span>
          </div>
        </div>

        <div className="grid grid-3 gap-8">
          {pricingPlans.map((plan) => {
            const price = billingCycle === 'yearly' ? Math.floor(plan.price * 0.8) : plan.price;

            return (
              <div key={plan.name} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
                {plan.popular && <div className="popular-badge">Most Popular</div>}

                <div className="pricing-header">
                  <h3 className="headline-md mb-2" style={{ color: 'var(--on-surface)' }}>{plan.name}</h3>
                  <p className="body-md" style={{ color: 'var(--on-surface-variant)' }}>{plan.description}</p>
                </div>

                <div className="pricing-price">
                  <span className="currency">$</span>
                  <span className="amount">{price}</span>
                  <span className="period">/mo</span>
                </div>

                <p className="body-sm mb-8" style={{ color: 'var(--on-surface-variant)' }}>
                  {billingCycle === 'yearly' ? `Billed annually (₹{price * 12}/year)` : 'Billed monthly'}
                </p>

                <Link to="/register" className="w-full">
                  <Button
                    fullWidth
                    variant={plan.popular ? 'primary' : 'outline'}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Link>

                <div className="pricing-features">
                  <p className="headline-md mb-4 font-medium" style={{ color: 'var(--on-surface)' }}>What's included:</p>
                  <ul className="feature-list">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex gap-3">
                        <Icons.Check size={18} className="text-primary flex-shrink-0" />
                        <span className="body-md" style={{ color: 'var(--on-surface-variant)' }}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
