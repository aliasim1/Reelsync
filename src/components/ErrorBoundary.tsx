import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'An unexpected application error occurred.',
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#EAF2FF] dark:bg-[#040B1A] text-blue-950 dark:text-blue-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white dark:bg-[#07132A] border border-blue-200 dark:border-blue-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-display text-base font-semibold">
                  Something went wrong
                </h1>
                <p className="text-xs text-blue-800/75 dark:text-blue-300/75">
                  ReelSync encountered an unexpected error.
                </p>
              </div>
            </div>
            <p className="text-xs font-mono bg-[#F2F7FF] dark:bg-[#051024] border border-blue-200 dark:border-blue-900 rounded-lg p-3 break-words text-blue-900 dark:text-blue-200">
              {this.state.message}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:text-slate-950 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reload Workspace</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
