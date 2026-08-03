import { Link } from 'react-router-dom';
import { Icons } from '../../assets/icons';
import Button from '../../components/ui/Button';
import ProgressBar from '../../components/ui/ProgressBar';
import './OnboardingStart.css';

const STEPS = [
  { icon: Icons.Store, label: 'Restaurant details' },
  { icon: Icons.MapPin, label: 'First branch' },
  { icon: Icons.Table, label: 'Table setup' },
  { icon: Icons.UtensilsCrossed, label: 'Menu import' },
  { icon: Icons.CreditCard, label: 'Payments' },
];

export default function OnboardingStart() {
  return (
    <div className="onboarding-start">
      <div className="onboarding-start-hero animate-fade-in-up">
        <div className="onboarding-start-icon">
          <Icons.Logo size={48} />
        </div>
        <h1 className="headline-lg">Let's get your restaurant ready</h1>
        <p className="body-lg text-muted" style={{ marginTop: 12 }}>
          We'll walk you through the essentials: restaurant details, your first branch, tables, menu, and payments.
        </p>
        <Link to="/onboarding/restaurant">
          <Button size="xl" iconRight={Icons.ArrowRight}>
            Start onboarding
          </Button>
        </Link>
      </div>

      <div className="onboarding-start-steps animate-fade-in-up delay-2">
        {STEPS.map((step, i) => (
          <div key={i} className="onboarding-step-item">
            <div className="onboarding-step-indicator">
              <span className="onboarding-step-number">{i + 1}</span>
            </div>
            <span className="label-sm text-muted">{step.label}</span>
          </div>
        ))}
      </div>

      <div className="onboarding-start-progress animate-fade-in-up delay-3">
        <ProgressBar progress={0} />
      </div>
    </div>
  );
}
