import { useState, useCallback } from 'react';
import { ToastType } from '@/react-app/components/ui/Toast';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((type: ToastType, message: string, duration?: number) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, type, message, duration }]);
    }, []);

    const success = useCallback((message: string, duration?: number) => {
        showToast('success', message, duration);
    }, [showToast]);

    const error = useCallback((message: string, duration?: number) => {
        showToast('error', message, duration);
    }, [showToast]);

    const warning = useCallback((message: string, duration?: number) => {
        showToast('warning', message, duration);
    }, [showToast]);

    const info = useCallback((message: string, duration?: number) => {
        showToast('info', message, duration);
    }, [showToast]);

    const remove = useCallback((message: string, duration?: number) => {
        showToast('delete', message, duration);
    }, [showToast]);

    const closeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return {
        toasts,
        success,
        error,
        warning,
        info,
        remove,
        closeToast,
    };
}
