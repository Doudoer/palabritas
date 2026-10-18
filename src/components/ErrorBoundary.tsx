import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ASSETS } from '../data/appData';

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message || 'Error inesperado' };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Palabritas ErrorBoundary atrapó un error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border-4 border-[#ffd0bb] shadow-[0_8px_24px_rgba(133,83,0,0.12)] flex flex-col items-center">
            {/* Chispita Icon */}
            <div className="w-20 h-20 rounded-full bg-amber-100 border-4 border-amber-300 flex items-center justify-center mb-4 shadow-inner">
              <img
                src={ASSETS.chispitaAvatar}
                alt="Chispita"
                className="w-16 h-16 rounded-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-[#451a03] mb-2">
              ¡Chispita tropezó con una estrella! 🐾
            </h2>

            <p className="text-sm font-bold text-[#855300] mb-6 leading-relaxed">
              No te preocupes, tu progreso y estrellas están seguros. Pulsa el botón de abajo para volver al mapa mágico de mundos.
            </p>

            <button
              onClick={this.handleReset}
              type="button"
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] hover:from-amber-500 hover:to-amber-400 text-[#451a03] font-black text-base shadow-[0_5px_0_0_#d97706] active:translate-y-1 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                explore
              </span>
              <span>Volver al Mapa de Mundos</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
