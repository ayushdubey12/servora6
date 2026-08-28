import { Component } from 'react';
import { Icons } from '../assets/icons';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: 'var(--space-8)', minHeight: '60vh', textAlign: 'center',
        }}>
          <Icons.AlertTriangle size={48} style={{ color: '#dc2626', marginBottom: 'var(--space-4)' }} />
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 'var(--space-2)' }}>Something went wrong</h2>
          <p style={{ color: '#6b7280', marginBottom: 'var(--space-4)', maxWidth: 400 }}>
            {this.state.error.message || 'An unexpected error occurred'}
          </p>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => { this.setState({ error: null, errorInfo: null }); window.location.reload(); }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
