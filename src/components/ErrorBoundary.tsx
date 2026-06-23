'use client'

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.props.onError?.(error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle size={32} className="text-red-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Something went wrong
                    </h3>
                    <p className="text-sm text-gray-500 mb-6 max-w-md">
                        This component encountered an unexpected error. You can try refreshing it.
                    </p>
                    <button
                        onClick={this.handleReset}
                        className="inline-flex items-center justify-center bg-[#5CB800] hover:bg-[#4A9900] text-white gap-2 px-4 py-2 rounded-lg font-medium"
                    >
                        <RefreshCw size={16} />
                        Retry
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
