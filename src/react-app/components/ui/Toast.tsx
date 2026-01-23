import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, Trash2, X } from 'lucide-react';
import './Toast.css';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'delete';

export interface ToastProps {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
    onClose: (id: string) => void;
}

const iconMap = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
    delete: Trash2,
};

const colorMap = {
    success: 'toast-success',
    error: 'toast-error',
    warning: 'toast-warning',
    info: 'toast-info',
    delete: 'toast-delete',
};

export function Toast({ id, type, message, duration = 3000, onClose }: ToastProps) {
    const Icon = iconMap[type];

    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, duration);

        return () => clearTimeout(timer);
    }, [id, duration, onClose]);

    return (
        <div className={`toast ${colorMap[type]}`}>
            <Icon className="toast-icon" size={20} />
            <span className="toast-message">{message}</span>
            <button onClick={() => onClose(id)} className="toast-close" aria-label="Cerrar">
                <X size={16} />
            </button>
        </div>
    );
}
