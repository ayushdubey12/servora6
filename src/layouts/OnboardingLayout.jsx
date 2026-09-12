import { Outlet, useLocation } from 'react-router-dom';
import { Icons } from '../assets/icons';
import ProgressBar from '../components/ui/ProgressBar';
import './OnboardingLayout.css';

const steps = [
  { path: '/onboarding', label: 'Welcome' },
  { path: '/onboarding/restaurant', label: 'Restaurant details' },
  { path: '/onboarding/branch', label: 'First branch' },
  { path: '/onboarding/tables', label: 'Table setup' },
  { path: '/onboarding/menu', label: 'Menu import' },
  { path: '/onboarding/payments', label: 'Payments' },
  { path: '/onboarding/waiters', label: 'Team' },
  { path: '/onboarding/complete', label: 'Done' }
];

export default function OnboardingLayout() {
  const location = useLocation();
  
  // Calculate progress
  const currentStepIndex = steps.findIndex(step => 
    location.pathname === step.path || 
    (step.path !== '/onboarding' && location.pathname.startsWith(step.path))
  );
  
  const progress = currentStepIndex >= 0 
    ? Math.max(5, (currentStepIndex / (steps.length - 1)) * 100) 
    : 0;

  return (
    <div className="onboarding-layout">
      <header className="onboarding-header">
        <div className="onboarding-brand">
          <Icons.Logo size={24} />
          <span className="onboarding-brand-name">Servora</span>
        </div>
      </header>
      
      {currentStepIndex >= 0 && currentStepIndex < steps.length - 1 && (
        <div className="onboarding-progress-bar">
          <ProgressBar progress={progress} />
        </div>
      )}
      
      <main className="onboarding-main">
        <div className="onboarding-container animate-fade-in-up">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
