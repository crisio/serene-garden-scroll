import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("ErrorBoundary caught:", error, info);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-3">
            Algo salió mal
          </h1>
          <p className="text-slate-600 mb-6">
            Ocurrió un problema al mostrar esta página. Por favor recarga para intentarlo de nuevo.
          </p>
          <button
            onClick={this.handleReload}
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-white font-semibold hover:bg-primary/90 transition-colors"
          >
            Recargar página
          </button>
        </div>
      </div>
    );
  }
}
