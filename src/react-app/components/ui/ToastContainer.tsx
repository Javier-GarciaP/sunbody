import { Toast, ToastProps } from './Toast';
import './ToastContainer.css';

interface ToastContainerProps {
    toasts: Omit<ToastProps, 'onClose'>[];
    onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <Toast key={toast.id} {...toast} onClose={onClose} />
            ))}
        </div>
    );
}
