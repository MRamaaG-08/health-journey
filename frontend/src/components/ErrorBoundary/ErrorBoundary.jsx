import React, { Component } from 'react';
import './ErrorBoundary.css';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Health Journey UI Error Captured:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <div className="error-card">
            <div className="error-icon">🛡️</div>
            <h2>IBM Bob Safeguard</h2>
            <p>A minor rendering exception was safely intercepted to keep your medical records secure.</p>
            <button 
              className="error-reload-btn"
              onClick={() => window.location.reload()}
            >
              Refresh Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}