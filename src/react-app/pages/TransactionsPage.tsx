import { useState, useMemo } from 'react';
import { useSales } from '@/react-app/hooks/useSales';
import { usePayments } from '@/react-app/hooks/usePayments';
import { useExchangeRate, convertVesToCop } from '@/react-app/hooks/useExchangeRate';
import { Search } from 'lucide-react';
import { parseServerDate } from '@/react-app/utils/date';

type TimeRange = 'Diario' | 'Semanal' | 'Mensual';

export default function TransactionsPage() {
    const { sales, loading: loadingSales } = useSales();
    const { payments, loading: loadingPayments } = usePayments();
    const { rate } = useExchangeRate();

    const [timeRange, setTimeRange] = useState<TimeRange>('Diario');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [searchTerm, setSearchTerm] = useState('');

    const transactions = useMemo(() => {
        const unified = [
            ...sales.map(s => ({
                id: `sale-${s.id}`,
                originalId: s.id,
                type: s.is_credit ? 'SALE_CREDIT' : 'SALE_CASH',
                date: parseServerDate(s.created_at),
                customer: s.customer_name || 'Cliente Casual',
                customerId: s.customer_id,
                total_value: s.total_cop,
                paid_cop: s.paid_cop,
                paid_ves: s.paid_ves,
                items_count: s.items.reduce((acc, i) => acc + i.quantity, 0),
                note: s.is_credit ? 'Venta a Crédito' : 'Venta de Contado'
            })),
            ...payments.map(p => ({
                id: `payment-${p.id}`,
                originalId: p.id,
                type: 'PAYMENT',
                date: parseServerDate(p.created_at),
                customer: p.customer_name || 'Cliente',
                customerId: p.customer_id,
                total_value: 0, // Payment doesn't increase sales value, strictly
                paid_cop: p.amount_cop,
                paid_ves: p.amount_ves,
                items_count: 0,
                note: p.note || 'Abono a Deuda'
            }))
        ];
        return unified.sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [sales, payments]);

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const matchesSearch = t.customer.toLowerCase().includes(searchTerm.toLowerCase());

            let matchesDate = false;
            const tDate = t.date;
            const sDate = selectedDate;

            if (timeRange === 'Diario') {
                matchesDate = tDate.toDateString() === sDate.toDateString();
            } else if (timeRange === 'Semanal') {
                // Logic for week: match ISO week or simple 7 days range around sDate? 
                // Let's do Calendar Week (Sunday to Saturday or Monday to Sunday). 
                // Assuming Monday start.
                const day = sDate.getDay() || 7; // 1 (Mon) - 7 (Sun)
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

    // Stats Calculation
    const stats = useMemo(() => {
        return filteredTransactions.reduce((acc, t) => {
            const paidInCop = t.paid_cop + convertVesToCop(t.paid_ves, rate?.cop_to_ves || 1);

            acc.cashFlow += paidInCop;

            if (t.type === 'SALE_CASH' || t.type === 'SALE_CREDIT') {
                acc.totalSales += t.total_value;
                acc.receivables += (t.total_value - paidInCop);
            }

            return acc;
        }, { cashFlow: 0, totalSales: 0, receivables: 0 });
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
            return selectedDate.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
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

    if (loadingSales || loadingPayments) return <div className="p-10 text-center font-bold text-slate-400">Cargando transacciones...</div>;

    return (
        <div className="p-2 md:p-6 space-y-3 md:space-y-6 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-lg md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Transacciones</h1>
                    <p className="text-[10px] md:text-sm text-slate-500 font-medium">Movimientos y ventas</p>
                </div>

                <div className="flex items-center bg-white dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    {(['Diario', 'Semanal', 'Mensual'] as TimeRange[]).map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] md:text-sm font-black transition-all ${timeRange === range
                                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700'
                                }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* Date Navigation & Stats */}
            <div className="grid lg:grid-cols-4 gap-3 md:gap-6">
                {/* Navigation Card */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-2xl p-3 md:p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-center items-center text-center">
                    <div className="flex items-center justify-between w-full mb-1">
                        <button onClick={() => handleDateChange(-1)} className="p-1 px-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 font-bold">←</button>
                        <span className="text-brand-500 font-black text-[9px] md:text-sm uppercase tracking-widest">{timeRange}</span>
                        <button onClick={() => handleDateChange(1)} className="p-1 px-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 font-bold">→</button>
                    </div>
                    <div className="text-sm md:text-xl font-bold text-slate-800 dark:text-slate-200 capitalize">
                        {formatDateDisplay()}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="lg:col-span-3 grid grid-cols-3 gap-2 md:gap-4">
                    <div className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl p-3 md:p-5 text-white shadow-xl shadow-brand-500/20 relative overflow-hidden group">
                        <div className="text-brand-100 text-[8px] md:text-xs font-bold uppercase tracking-wider mb-0.5">Caja</div>
                        <div className="text-sm md:text-3xl font-black tracking-tight">${stats.cashFlow.toLocaleString()}</div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-3 md:p-5 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                        <div className="text-slate-400 text-[8px] md:text-xs font-bold uppercase tracking-wider mb-0.5">Ventas</div>
                        <div className="text-sm md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">${stats.totalSales.toLocaleString()}</div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-3 md:p-5 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                        <div className="text-slate-400 text-[8px] md:text-xs font-bold uppercase tracking-wider mb-0.5">Cuentas</div>
                        <div className="text-sm md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">${stats.receivables.toLocaleString()}</div>
                    </div>
                </div>
            </div>

            {/* Transactions List */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
                    <Search className="text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por cliente..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none outline-none text-slate-900 dark:text-white font-bold w-full placeholder-slate-400 py-2"
                    />
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-wider">
                            <tr>
                                <th className="p-4 rounded-tl-2xl">Hora</th>
                                <th className="p-4">Tipo</th>
                                <th className="p-4">Cliente</th>
                                <th className="p-4 text-right">Recibido (COP)</th>
                                <th className="p-4 text-right">Recibido (BS)</th>
                                <th className="p-4 text-right rounded-tr-2xl">Valor Venta</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredTransactions.map((t) => (
                                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                    <td className="p-4 font-bold text-slate-500 text-sm">
                                        {t.date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold capitalize
                                            ${t.type === 'PAYMENT' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                                                t.type === 'SALE_CREDIT' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                                                    'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                                            }
                                        `}>
                                            {t.type === 'PAYMENT' ? 'Abono / Pago' : t.type === 'SALE_CREDIT' ? 'Venta Cré.' : 'Venta'}
                                        </span>
                                    </td>
                                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                                        {t.customer}
                                        <div className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">{t.note}</div>
                                    </td>
                                    <td className="p-4 text-right font-bold text-slate-700 dark:text-slate-300">
                                        {t.paid_cop > 0 ? `$${t.paid_cop.toLocaleString()}` : '-'}
                                    </td>
                                    <td className="p-4 text-right font-bold text-slate-700 dark:text-slate-300">
                                        {t.paid_ves > 0 ? `${t.paid_ves.toLocaleString()} Bs` : '-'}
                                    </td>
                                    <td className="p-4 text-right">
                                        {t.total_value > 0 ? (
                                            <span className="font-black text-slate-900 dark:text-white">${t.total_value.toLocaleString()}</span>
                                        ) : (
                                            <span className="text-slate-400 text-xs font-bold italic">N/A</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredTransactions.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-slate-400 font-bold">
                                        No se encontraron transacciones en este periodo
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden">
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredTransactions.map((t) => (
                            <div key={t.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-900 dark:text-white text-base">{t.customer}</span>
                                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                                            <span>{t.date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</span>
                                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                            <span className="uppercase tracking-tight">{t.note}</span>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide
                                        ${t.type === 'PAYMENT' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                                            t.type === 'SALE_CREDIT' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                                                'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                                        }
                                    `}>
                                        {t.type === 'PAYMENT' ? 'Abono' : t.type === 'SALE_CREDIT' ? 'Crédito' : 'Contado'}
                                    </span>
                                </div>

                                <div className="flex justify-between items-end mt-3">
                                    <div className="text-xs text-slate-500 font-medium">
                                        {t.items_count > 0 && <span>{t.items_count} productos</span>}
                                    </div>
                                    <div className="text-right">
                                        {t.paid_cop > 0 && (
                                            <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                Rec: ${t.paid_cop.toLocaleString()}
                                            </div>
                                        )}
                                        {t.total_value > 0 ? (
                                            <div className="text-lg font-black text-slate-900 dark:text-white leading-none mt-1">
                                                ${t.total_value.toLocaleString()}
                                            </div>
                                        ) : (
                                            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 leading-none mt-1">
                                                + ${t.paid_cop.toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {filteredTransactions.length === 0 && (
                            <div className="p-12 text-center text-slate-400 font-bold">
                                No se encontraron transacciones
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
