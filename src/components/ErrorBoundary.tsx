import React, { Component, ErrorInfo, ReactNode, useCallback, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface ErrorBoundaryConfig {
  resetKeys?: unknown[];
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

/**
 * Error Boundary component to catch React errors gracefully.
 * Prevents the entire app from crashing due to component errors.
 */
class ErrorBoundary extends Component<Props, State> {
  private config: ErrorBoundaryConfig;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
    this.config = {};
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    this.config.onError?.(error, errorInfo);
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.config.fallback) {
        return this.config.fallback(
          this.state.error!,
          this.handleReset
        );
      }

      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-6 bg-destructive/5 border border-destructive/20 rounded-lg m-4">
          <AlertTriangle className="w-10 h-10 text-destructive mb-4" />
          <h2 className="text-lg font-semibold text-destructive mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-4">
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={this.handleReset}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={this.handleReload}
            >
              Reload Page
            </Button>
          </div>
          {import.meta.env.DEV && this.state.errorInfo && (
            <details className="mt-4 w-full text-left">
              <summary className="text-xs cursor-pointer text-muted-foreground">
                Error Details
              </summary>
              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-40">
                {this.state.error?.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

/**
 * HOC to wrap a component with ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Props
): React.FC<P> {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

/**
 * Hook to use error boundary state in functional components
 */
export function useErrorHandler() {
  const [, setError] = useState<Error | null>(null);

  return useCallback((error: Error) => {
    setError(() => {
      throw error;
    });
  }, []);
}
