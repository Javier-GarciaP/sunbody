import { useState, useCallback } from 'react';

interface ConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
}

export function useConfirmModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<ConfirmOptions>({
        title: '',
        message: '',
        onConfirm: () => { },
    });

    const showConfirm = useCallback((opts: ConfirmOptions) => {
        setOptions(opts);
        setIsOpen(true);
    }, []);

    const handleConfirm = useCallback(() => {
        options.onConfirm();
        setIsOpen(false);
    }, [options]);

    const handleCancel = useCallback(() => {
        setIsOpen(false);
    }, []);

    return {
        isOpen,
        showConfirm,
        handleConfirm,
        handleCancel,
        options,
    };
}
