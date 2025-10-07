/**
 * Component-level Error Boundaries
 * Provides graceful error handling with fallback UIs for React components
 */

import React, { Component, ReactNode, ErrorInfo } from "react";
import {
  AlertTriangle,
  RefreshCw,
  WifiOff,
  Phone,
  FileText,
} from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  level: "page" | "section" | "component";
  context: string;
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void;
  maxRetries?: number;
  showErrorDetails?: boolean;
}

/**
 * Enhanced Error Boundary with different fallback UI levels
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private retryTimeouts: NodeJS.Timeout[] = [];

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: "",
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `ERR_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, context } = this.props;
    const { errorId } = this.state;

    this.setState({ errorInfo });

    // Log error for monitoring
    console.error(`[${context}] Error caught by boundary:`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId,
      timestamp: new Date().toISOString(),
    });

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo, errorId);
    }

    // Report to error tracking service (implement as needed)
    this.reportError(error, errorInfo, errorId, context);
  }

  componentWillUnmount() {
    // Clear any pending retry timeouts
    this.retryTimeouts.forEach((timeout) => clearTimeout(timeout));
  }

  private reportError(
    error: Error,
    errorInfo: ErrorInfo,
    errorId: string,
    context: string
  ) {
    // In a real application, send to error tracking service like Sentry
    const errorReport = {
      errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // For demo purposes, just log to console
    console.warn("Error Report:", errorReport);

    // In production, you would send this to your error tracking service:
    // errorTrackingService.captureException(errorReport);
  }

  protected handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount < maxRetries) {
      this.setState((prevState) => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
      }));
    }
  };

  private handleAutoRetry = () => {
    const timeout = setTimeout(() => {
      this.handleRetry();
    }, 3000 + Math.random() * 2000); // 3-5 seconds delay

    this.retryTimeouts.push(timeout);
  };

  protected renderFallbackUI() {
    const {
      level,
      context,
      fallback,
      showErrorDetails = false,
      maxRetries = 3,
    } = this.props;
    const { error, errorInfo, errorId, retryCount } = this.state;

    // Use custom fallback if provided
    if (fallback) {
      return fallback;
    }

    const canRetry = retryCount < maxRetries;

    switch (level) {
      case "page":
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                Hospital System Temporarily Unavailable
              </h1>
              <p className="text-gray-600 mb-6">
                We're experiencing technical difficulties with the {context}{" "}
                module. Our team is working to resolve this issue.
              </p>

              {canRetry && (
                <div className="space-y-3">
                  <button
                    onClick={this.handleRetry}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>
                      Try Again ({maxRetries - retryCount} attempts left)
                    </span>
                  </button>
                  <button
                    onClick={this.handleAutoRetry}
                    className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Auto-retry in 3-5 seconds
                  </button>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Phone className="w-4 h-4" />
                    <span>IT Support: Ext. 2255</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FileText className="w-4 h-4" />
                    <span>Error ID: {errorId}</span>
                  </div>
                </div>
              </div>

              {showErrorDetails && error && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    Technical Details
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                    {error.message}
                    {errorInfo?.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        );

      case "section":
        return (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-yellow-800 mb-1">
                  {context} Section Unavailable
                </h3>
                <p className="text-sm text-yellow-700 mb-3">
                  This section is temporarily experiencing issues. Data may be
                  outdated or unavailable.
                </p>

                {canRetry && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={this.handleRetry}
                      className="inline-flex items-center px-3 py-1 border border-yellow-300 text-xs font-medium rounded text-yellow-700 bg-yellow-100 hover:bg-yellow-200 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Retry
                    </button>
                    <span className="text-xs text-yellow-600">
                      ({maxRetries - retryCount} attempts remaining)
                    </span>
                  </div>
                )}

                <div className="mt-2 text-xs text-yellow-600">
                  Error ID: {errorId}
                </div>
              </div>
            </div>
          </div>
        );

      case "component":
      default:
        return (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-red-700">
                  {context} component failed to load
                </p>
                {canRetry && (
                  <button
                    onClick={this.handleRetry}
                    className="mt-1 text-xs text-red-600 hover:text-red-800 underline"
                  >
                    Try again ({maxRetries - retryCount} left)
                  </button>
                )}
              </div>
            </div>
          </div>
        );
    }
  }

  render() {
    if (this.state.hasError) {
      return this.renderFallbackUI();
    }

    return this.props.children;
  }
}

/**
 * HOC for wrapping components with error boundaries
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps: Omit<ErrorBoundaryProps, "children">
) {
  const WithErrorBoundaryComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${
    WrappedComponent.displayName || WrappedComponent.name
  })`;

  return WithErrorBoundaryComponent;
}

/**
 * Network-aware error boundary for API-dependent components
 */
interface NetworkErrorBoundaryProps extends ErrorBoundaryProps {
  onlineComponent: ReactNode;
  offlineComponent?: ReactNode;
}

export class NetworkErrorBoundary extends ErrorBoundary {
  private checkNetworkAndRetry = () => {
    if (navigator.onLine) {
      this.handleRetry();
    }
  };

  render() {
    const { onlineComponent, offlineComponent } = this
      .props as NetworkErrorBoundaryProps;

    if (this.state.hasError) {
      return this.renderFallbackUI();
    }

    // Show different content based on network status
    if (!navigator.onLine && offlineComponent) {
      return (
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <WifiOff className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              Offline Mode
            </span>
          </div>
          {offlineComponent}
          <button
            onClick={this.checkNetworkAndRetry}
            className="mt-3 text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Check connection and retry
          </button>
        </div>
      );
    }

    return onlineComponent;
  }
}

/**
 * Specialized error boundaries for different hospital modules
 */
export const DashboardErrorBoundary: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <ErrorBoundary level="section" context="Hospital Dashboard" maxRetries={3}>
    {children}
  </ErrorBoundary>
);

export const PatientErrorBoundary: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <ErrorBoundary level="section" context="Patient Management" maxRetries={3}>
    {children}
  </ErrorBoundary>
);

export const OxygenErrorBoundary: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <ErrorBoundary
    level="component"
    context="Oxygen Monitoring"
    maxRetries={5} // More retries for critical oxygen monitoring
  >
    {children}
  </ErrorBoundary>
);

export const WhatIfErrorBoundary: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <ErrorBoundary
    level="section"
    context="What-If Analysis"
    maxRetries={3}
    showErrorDetails={false}
  >
    {children}
  </ErrorBoundary>
);

export default ErrorBoundary;
