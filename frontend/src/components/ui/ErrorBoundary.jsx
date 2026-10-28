import { Component } from 'react';

/**
 * ErrorBoundary — catches unhandled React render errors anywhere in the
 * component tree beneath it and shows a safe fallback instead of a blank page.
 *
 * Usage (global, in main.jsx):
 *   <ErrorBoundary><App /></ErrorBoundary>
 *
 * Usage (per-section, for isolated recovery):
 *   <ErrorBoundary fallbackTitle="Widget failed to load" compact>
 *     <SomeWidget />
 *   </ErrorBoundary>
 *
 * Props:
 *   fallbackTitle  — override the heading shown in the error state
 *   compact        — renders a smaller inline fallback instead of full-screen
 *   onError        — optional callback(error, info) for logging / analytics
 *
 * Note: ErrorBoundary only catches errors during render, in lifecycle methods,
 * and in constructors of child components. It does NOT catch errors in:
 *   - event handlers (use try/catch there)
 *   - async code (use .catch() or try/catch)
 *   - server-side rendering
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.handleReset = this.handleReset.bind(this);
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to console in development; call optional onError prop for analytics.
    console.error('[ErrorBoundary] Caught render error:', error, info.componentStack);
    if (typeof this.props.onError === 'function') {
      this.props.onError(error, info);
    }
  }

  handleReset() {
    // Allow the user to retry after a transient error without a full page reload.
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const title = this.props.fallbackTitle || 'Something went wrong';

    // Compact variant — for wrapping small isolated sections
    if (this.props.compact) {
      return (
        <div
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm"
          role="alert"
        >
          <p className="font-semibold text-red-700 mb-1">⚠️ {title}</p>
          <button
            onClick={this.handleReset}
            className="text-xs text-red-500 underline hover:text-red-700 transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }

    // Full-screen variant — used at the app root level
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          {this.state.error?.message && (
            <p className="text-gray-500 mb-2 text-sm font-mono bg-gray-100 rounded-lg px-3 py-2">
              {this.state.error.message}
            </p>
          )}
          <p className="text-gray-400 text-xs mb-6">
            If this keeps happening, try refreshing the page.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={this.handleReset}
              className="btn-secondary px-5 py-2 text-sm"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary px-5 py-2 text-sm"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }
}
