/**
 * ErrorBoundary.jsx
 * 
 * React error boundary that catches render-time crashes anywhere
 * in the component tree. Prevents the entire app from white-screening
 * if a component throws during render.
 */

import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[FanMate] Uncaught render error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <span className="error-boundary-icon">⚠️</span>
            <h2>Something went wrong</h2>
            <p>The app encountered an unexpected error. This won't affect your stadium experience.</p>
            <button onClick={this.handleReset} className="btn btn-primary">
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
