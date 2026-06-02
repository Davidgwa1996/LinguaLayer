import React, { ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-[100svh] w-full flex-col items-center justify-center p-4 bg-slate-50">
           <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-sm border border-red-100 text-center">
              <div className="text-red-500 mb-2 text-3xl">⚠️</div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong.</h2>
              <p className="text-slate-600 mb-6 font-medium">Your chat did not close. You can recover below.</p>
              
              <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => {
                        this.setState({ hasError: false, error: null });
                        if (this.props.onReset) this.props.onReset();
                    }} 
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition"
                  >
                    Try again
                  </button>
                  <button 
                    onClick={() => {
                        this.setState({ hasError: false, error: null });
                        if (this.props.onReset) this.props.onReset();
                    }} 
                    className="bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 transition"
                  >
                    Choose language again
                  </button>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-medium hover:bg-slate-200 transition"
                  >
                    Reload app
                  </button>
              </div>
           </div>
        </div>
      );
    }

    return this.props.children;
  }
}
