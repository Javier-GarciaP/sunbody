import { createContext, useContext, ReactNode } from 'react';
import { useToast } from '@/react-app/hooks/useToast';
import { ToastContainer } from '@/react-app/components/ui/ToastContainer';

interface ToastContextType {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
    remove: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const { toasts, success, error, warning, info, remove, closeToast } = useToast();

    return (
        <ToastContext.Provider value={{ success, error, warning, info, remove }}>
            {children}
            <ToastContainer toasts={toasts} onClose={closeToast} />
        </ToastContext.Provider>
    );
}

export function useToastContext() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToastContext must be used within ToastProvider');
    }
    return context;
}
