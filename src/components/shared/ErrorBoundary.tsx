import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary — wraps sections to prevent one broken tab from crashing the app.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <SomeSection />
 *   </ErrorBoundary>
 *
 * Or with custom fallback:
 *   <ErrorBoundary fallback={<div>Something went wrong</div>}>
 *     <SomeSection />
 *   </ErrorBoundary>
 */
class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: '100%', padding: 40, textAlign: 'center',
        }}>
          <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.3 }}>⚠</div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>
            Something went wrong
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, opacity: 0.6, maxWidth: 400, lineHeight: 1.6 }}>
            This section encountered an error. Your data in other tabs is safe.
          </p>
          <pre style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 11, opacity: 0.4,
            maxWidth: 500, overflow: 'auto', padding: 12, marginTop: 12,
            background: 'rgba(0,0,0,0.1)', borderRadius: 8,
          }}>
            {this.state.error?.message}
          </pre>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              marginTop: 16, padding: '10px 24px', borderRadius: 8,
              border: '1px solid rgba(56,189,248,0.3)', background: 'rgba(56,189,248,0.08)',
              color: '#38bdf8', fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
