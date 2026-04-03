import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = "Kutilmagan xatolik yuz berdi.";
      try {
        const parsed = JSON.parse(this.state.error?.message || "");
        if (parsed.error) errorMessage = parsed.error;
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-red-500/50 p-8 rounded-2xl max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Xatolik!</h2>
            <p className="text-zinc-400 mb-6">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-amber-500 text-black font-bold px-6 py-2 rounded-xl"
            >
              Qayta yuklash
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
