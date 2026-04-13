"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, MonitorX, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-[400px] p-8">
          <Card className="max-w-md w-full">
            <CardContent className="flex flex-col items-center text-center p-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold">
                {this.props.fallbackTitle || "Something went wrong"}
              </h2>
              <p className="text-muted-foreground text-sm">
                An unexpected error occurred while loading this section. Please try again.
              </p>
              {this.state.error && process.env.NODE_ENV !== 'production' && (
                <pre className="text-xs text-muted-foreground bg-muted p-3 rounded-md w-full overflow-auto max-h-24">
                  {this.state.error.message}
                </pre>
              )}
              <Button onClick={this.handleRetry} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

interface CanvasErrorFallbackProps {
  toolName?: string;
  onRetry: () => void;
}

function CanvasErrorFallback({ toolName, onRetry }: CanvasErrorFallbackProps) {
  return (
    <div className="flex items-center justify-center min-h-[500px] p-8">
      <Card className="max-w-lg w-full">
        <CardContent className="flex flex-col items-center text-center p-8 space-y-5">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
            <MonitorX className="w-8 h-8 text-amber-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">
              {toolName ? `${toolName} couldn't load` : "Canvas couldn't load"}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              This tool requires graphics features that your browser or device may not support.
              Try refreshing the page, updating your browser, or enabling hardware acceleration in your browser settings.
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={onRetry} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
            <Button variant="outline" className="gap-2" asChild>
              <Link href="/planners">
                <Home className="w-4 h-4" />
                Back to Planners
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface CanvasErrorBoundaryProps {
  children: ReactNode;
  toolName?: string;
}

interface CanvasErrorBoundaryState {
  hasError: boolean;
}

export class CanvasErrorBoundary extends Component<CanvasErrorBoundaryProps, CanvasErrorBoundaryState> {
  constructor(props: CanvasErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): CanvasErrorBoundaryState {
    return { hasError: true };
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <CanvasErrorFallback
          toolName={this.props.toolName}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}
