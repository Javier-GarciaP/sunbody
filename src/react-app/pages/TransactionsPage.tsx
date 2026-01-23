import { useState, useMemo } from 'react';
import { useSales } from '@/react-app/hooks/useSales';
import { usePayments } from '@/react-app/hooks/usePayments';
import { usePackages } from '@/react-app/hooks/usePackages';
import { useExchangeRate, convertVesToCop } from '@/react-app/hooks/useExchangeRate';
import { Search, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { parseServerDate } from '@/react-app/utils/date';
import { useToastContext } from '@/react-app/context/ToastContext';
import { ConfirmModal } from '@/react-app/components/ui/ConfirmModal';
import { useConfirmModal } from '@/react-app/hooks/useConfirmModal';

type TimeRange = 'Diario' | 'Semanal' | 'Mensual';

export default function TransactionsPage() {
    const { sales, deleteSale, loading: loadingSales } = useSales();
    const { payments, deletePayment, loading: loadingPayments } = usePayments();
    const { packages, loading: loadingPackages } = usePackages();
    const { rate } = useExchangeRate();
    const toast = useToastContext();
    const confirmModal = useConfirmModal();

    const [timeRange, setTimeRange] = useState<TimeRange>('Diario');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [searchTerm, setSearchTerm] = useState('');

    const transactions = useMemo(() => {
        const unified = [
            ...sales.map((s: any) => ({
                id: `sale-${s.id}`,
                originalId: s.id,
                type: s.is_credit ? 'SALE_CREDIT' : 'SALE_CASH',
                date: parseServerDate(s.created_at),
                customer: s.customer_name || 'Cliente Casual',
                customerId: s.customer_id,
                total_value: s.total_cop,
                paid_cop: s.paid_cop,
                paid_ves: s.paid_ves,
                items_count: s.items.reduce((acc: number, i: any) => acc + i.quantity, 0),
                note: s.is_credit ? 'Venta a Crédito' : 'Venta de Contado'
            })),
            ...payments.filter((p: any) => !p.is_initial).map((p: any) => ({
                id: `payment-${p.id}`,
                originalId: p.id,
                type: 'PAYMENT',
                date: parseServerDate(p.created_at),
                customer: p.customer_name || 'Cliente',
                customerId: p.customer_id,
                total_value: 0,
                paid_cop: p.amount_cop,
                paid_ves: p.amount_ves,
                items_count: 0,
                note: p.note || 'Abono a Deuda'
            })),
            ...packages.filter((pkg: any) => pkg.total_ves > 0).map((pkg: any) => ({
                id: `pkg-${pkg.id}`,
                originalId: pkg.id,
                type: 'PACKAGE_EXPENSE',
                date: parseServerDate(pkg.created_at),
                customer: 'Inversión',
                customerId: 0,
                total_value: 0,
                paid_cop: 0,
                paid_ves: -pkg.total_ves,
                items_count: pkg.items.reduce((acc: number, i: any) => acc + i.quantity, 0),
                note: `Compra: ${pkg.name}`
            })),
        ];
        return unified.sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [sales, payments, packages]);

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const matchesSearch = t.customer.toLowerCase().includes(searchTerm.toLowerCase());

            let matchesDate = false;
            const tDate = t.date;
            const sDate = selectedDate;

            if (timeRange === 'Diario') {
                matchesDate = tDate.toDateString() === sDate.toDateString();
            } else if (timeRange === 'Semanal') {
                const day = sDate.getDay() || 7;
                const startOfWeek = new Date(sDate);
                startOfWeek.setHours(0, 0, 0, 0);
                startOfWeek.setDate(sDate.getDate() - day + 1);

                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                endOfWeek.setHours(23, 59, 59, 999);

                matchesDate = tDate >= startOfWeek && tDate <= endOfWeek;
            } else if (timeRange === 'Mensual') {
                matchesDate = tDate.getMonth() === sDate.getMonth() && tDate.getFullYear() === sDate.getFullYear();
            }

            return matchesSearch && matchesDate;
        });
    }, [transactions, searchTerm, timeRange, selectedDate]);

    const stats = useMemo(() => {
        return filteredTransactions.reduce((acc: any, t: any) => {
            const paidInCop = t.paid_cop + convertVesToCop(t.paid_ves, rate?.cop_to_ves || 1);

            acc.cashFlow += paidInCop;

            if (t.type === 'SALE_CASH' || t.type === 'SALE_CREDIT') {
                acc.totalSales += t.total_value;
            } else if (t.type === 'PACKAGE_EXPENSE') {
                acc.totalExpenses = (acc.totalExpenses || 0) + Math.abs(paidInCop);
            }

            return acc;
        }, { cashFlow: 0, totalSales: 0, totalExpenses: 0 });
    }, [filteredTransactions, rate]);

    const handleDateChange = (days: number) => {
        const newDate = new Date(selectedDate);
        if (timeRange === 'Mensual') {
            newDate.setMonth(newDate.getMonth() + days);
        } else if (timeRange === 'Semanal') {
            newDate.setDate(newDate.getDate() + (days * 7));
        } else {
            newDate.setDate(newDate.getDate() + days);
        }
        setSelectedDate(newDate);
    };

    const formatDateDisplay = () => {
        if (timeRange === 'Diario') {
            return selectedDate.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' });
        } else if (timeRange === 'Semanal') {
            const day = selectedDate.getDay() || 7;
            const start = new Date(selectedDate);
            start.setDate(selectedDate.getDate() - day + 1);
            const end = new Date(start);
            end.setDate(start.getDate() + 6);
            return `${start.getDate()} - ${end.getDate()} ${start.toLocaleDateString('es-CO', { month: 'long' })}`;
        } else {
            return selectedDate.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
        }
    };

    if (loadingSales || loadingPayments || loadingPackages) {
        return <div className="p-10 text-center text-slate-400">Cargando transacciones...</div>;
    }

    return (
        <div className="space-y-4 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Transacciones</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Movimientos y ventas</p>
                </div>

                {/* Time Range Selector */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-md">
                    {(['Diario', 'Semanal', 'Mensual'] as TimeRange[]).map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${timeRange === range
                                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                                }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* Date Navigation & Stats */}
            <div className="grid md:grid-cols-4 gap-4">
                {/* Date Navigator */}
                <div className="card p-4">
                    <div className="flex items-center justify-between mb-2">
                        <button
                            onClick={() => handleDateChange(-1)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{timeRange}</span>
                        <button
                            onClick={() => handleDateChange(1)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 text-center">
                        {formatDateDisplay()}
                    </div>
                </div>

                {/* Stats */}
                <div className="card p-4">
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Caja</div>
                    <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        ${stats.cashFlow.toLocaleString()}
                    </div>
                </div>

                <div className="card p-4">
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Ventas</div>
                    <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        ${stats.totalSales.toLocaleString()}
                    </div>
                </div>

                <div className="card p-4">
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Inversión</div>
                    <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                        -${stats.totalExpenses.toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="card">
                {/* Search */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
                    <Search className="text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por cliente..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none outline-none text-slate-900 dark:text-slate-100 font-medium w-full placeholder-slate-400"
                    />
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 dark:text-slate-400">
                            <tr>
                                <th className="p-3 text-left font-medium">Hora</th>
                                <th className="p-3 text-left font-medium">Tipo</th>
                                <th className="p-3 text-left font-medium">Cliente</th>
                                <th className="p-3 text-right font-medium">Recibido (COP)</th>
                                <th className="p-3 text-right font-medium">Valor Venta</th>
                                <th className="p-3 text-center font-medium">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredTransactions.map((t) => (
                                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="p-3 text-sm text-slate-500">
                                        {t.date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="p-3">
                                        <span className={`badge ${t.type === 'PAYMENT' ? 'badge-success' :
                                            t.type === 'SALE_CREDIT' ? 'badge-warning' :
                                                t.type === 'PACKAGE_EXPENSE' ? 'badge-error' :
                                                    'badge-neutral'
                                            }`}>
                                            {t.type === 'PAYMENT' ? 'Abono' :
                                                t.type === 'SALE_CREDIT' ? 'Crédito' :
                                                    t.type === 'PACKAGE_EXPENSE' ? 'Inversión' : 'Venta'}
                                        </span>
                                    </td>
                                    <td className="p-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                                        {t.customer}
                                    </td>
                                    <td className="p-3 text-sm text-right font-medium text-slate-700 dark:text-slate-300">
                                        {t.type === 'PACKAGE_EXPENSE' ? (
                                            <span className="text-red-600 dark:text-red-400 font-bold">
                                                {Math.abs(t.paid_ves).toLocaleString()} Bs
                                            </span>
                                        ) : (
                                            t.paid_cop !== 0 ? `$${t.paid_cop.toLocaleString()}` : '-'
                                        )}
                                    </td>
                                    <td className="p-3 text-right">
                                        {t.total_value > 0 ? (
                                            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                ${t.total_value.toLocaleString()}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-slate-400">N/A</span>
                                        )}
                                    </td>
                                    <td className="p-3 text-center">
                                        {(t.type === 'SALE_CASH' || t.type === 'SALE_CREDIT' || t.type === 'PAYMENT') && (
                                            <button
                                                onClick={() => {
                                                    const transactionType = t.type === 'PAYMENT' ? 'abono' : 'venta';
                                                    confirmModal.showConfirm({
                                                        title: `¿Eliminar ${transactionType}?`,
                                                        message: `¿Estás seguro de que deseas eliminar este ${transactionType}? Esta acción no se puede deshacer.`,
                                                        confirmText: 'Eliminar',
                                                        cancelText: 'Cancelar',
                                                        variant: 'danger',
                                                        onConfirm: async () => {
                                                            try {
                                                                if (t.type === 'PAYMENT') {
                                                                    await deletePayment(t.originalId);
                                                                    toast.remove('Abono eliminado');
                                                                } else {
                                                                    await deleteSale(t.originalId);
                                                                    toast.remove('Venta eliminada');
                                                                }
                                                            } catch (error) {
                                                                toast.error('Error al eliminar el registro');
                                                            }
                                                        }
                                                    });
                                                }}
                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredTransactions.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-slate-400">
                                        No se encontraron transacciones en este periodo
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.options.title}
                message={confirmModal.options.message}
                confirmText={confirmModal.options.confirmText}
                cancelText={confirmModal.options.cancelText}
                variant={confirmModal.options.variant}
                onConfirm={confirmModal.handleConfirm}
                onCancel={confirmModal.handleCancel}
            />
        </div>
    );
}
