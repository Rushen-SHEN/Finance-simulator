'use client';

import React, { Component, ReactNode } from 'react';
import { clearModel } from '@/lib/storage';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global error boundary that catches rendering/calculator errors
 * and offers a "Reset to defaults" recovery action.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    clearModel();
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
      window.location.reload();
    }
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center p-8">
          <div className="max-w-lg w-full bg-slate-900 border border-red-500/30 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h1 className="text-xl font-bold text-red-400 mb-2">应用运行异常</h1>
            <p className="text-sm text-slate-400 mb-4">
              财务模拟器遇到意外错误。这可能是由于存储的参数数据损坏导致的。
            </p>
            {this.state.error && (
              <pre className="text-xs text-red-300/60 bg-red-500/5 rounded-lg p-3 mb-6 overflow-auto max-h-32 text-left">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                重试
              </button>
              <button
                onClick={this.handleReset}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
              >
                重置为默认参数
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-4">
              重置将清除所有自定义参数，恢复出厂设置。
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
