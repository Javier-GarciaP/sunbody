import { AlertCircle, X } from 'lucide-react';
import './ConfirmModal.css';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmModal({
    isOpen,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    onConfirm,
    onCancel,
    variant = 'info',
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="confirm-modal-overlay" onClick={onCancel}>
            <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
                <button className="confirm-modal-close" onClick={onCancel}>
                    <X size={20} />
                </button>

                <div className={`confirm-modal-icon confirm-modal-icon-${variant}`}>
                    <AlertCircle size={32} />
                </div>

                <h3 className="confirm-modal-title">{title}</h3>
                <p className="confirm-modal-message">{message}</p>

                <div className="confirm-modal-actions">
                    <button className="confirm-modal-btn confirm-modal-btn-cancel" onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button
                        className={`confirm-modal-btn confirm-modal-btn-confirm confirm-modal-btn-${variant}`}
                        onClick={() => {
                            onConfirm();
                            onCancel();
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
