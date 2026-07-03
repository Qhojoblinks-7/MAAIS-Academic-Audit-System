import React from 'react';
import { AlertTriangle } from 'lucide-react';

export class AcademicArchitectErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('AcademicArchitect Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-12 shadow-lg max-w-2xl w-full">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center">
                <AlertTriangle size={24} />
              </div>
              <h2 className="text-xl font-black text-slate-900 italic font-display">Structural Integrity Error</h2>
            </div>
            <p className="text-slate-600 mb-4">
              An unexpected error occurred in the Academic Architect module. The system has entered safe mode.
            </p>
            <details className="bg-slate-50 p-4 rounded-xl mb-4">
              <summary className="text-[10px] font-black uppercase text-slate-400 cursor-pointer">Error Details</summary>
              <pre className="text-[9px] text-rose-600 mt-2 overflow-auto max-h-40">
                {this.state.error?.toString()}
              </pre>
            </details>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
            >
              Reload Institutional Engine
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}