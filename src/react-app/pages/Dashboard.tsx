import { Package, Users, ShoppingBag, TrendingUp, Activity, Clock, Heart } from 'lucide-react';
import ExchangeRateWidget from '@/react-app/components/ExchangeRateWidget';
import { useSales } from '@/react-app/hooks/useSales';
import { useProducts } from '@/react-app/hooks/useProducts';
import { useCustomers } from '@/react-app/hooks/useCustomers';
import { useMemo, useState } from 'react';
import { parseServerDate } from '@/react-app/utils/date';
import SunBear3D from '@/react-app/components/SunBear3D';
import { X } from 'lucide-react';

export default function Dashboard() {
    const { sales, loading: loadingSales } = useSales();
    const { products, loading: loadingProducts } = useProducts();
    const { customers, loading: loadingCustomers } = useCustomers();
    const [showBear, setShowBear] = useState(false);

    const stats = useMemo(() => {
        const today = new Date().toLocaleDateString();

        const todaySales = sales.filter(sale =>
            parseServerDate(sale.created_at).toLocaleDateString() === today
        );

        const todayIncome = todaySales.reduce((sum, sale) => {
            const copFromVes = sale.paid_ves / (sale.exchange_rate || 1);
            return sum + sale.paid_cop + copFromVes;
        }, 0);

        const totalStock = products.reduce((sum, p) => sum + (p.total_stock || 0), 0);

        const recentSales = [...sales].sort((a, b) =>
            parseServerDate(b.created_at).getTime() - parseServerDate(a.created_at).getTime()
        ).slice(0, 5);

        return {
            todaySalesCount: todaySales.length,
            todayIncome,
            totalProducts: products.length,
            totalStock,
            totalCustomers: customers.length,
            recentSales
        };
    }, [sales, products, customers]);

    const isLoading = loadingSales || loadingProducts || loadingCustomers;

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/3"></div>
                <div className="grid lg:grid-cols-4 gap-4">
                    <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                    <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                    <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                    <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Dashboard</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Resumen de actividad</p>
                </div>
                <button
                    onClick={() => setShowBear(true)}
                    className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-2xl transition-all duration-300 hover:scale-110 active:scale-95 group shadow-sm hover:shadow-rose-100 dark:hover:shadow-none"
                    title="¡Algo especial!"
                >
                    <Heart size={24} className="group-hover:fill-rose-500 transition-colors" />
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Today's Sales */}
                <div className="card p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-slat-100 dark:bg-slate-700 rounded-md">
                            <Activity size={20} className="text-slate-600 dark:text-slate-400" />
                        </div>
                        <span className="badge badge-neutral text-[10px]">HOY</span>
                    </div>
                    <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{stats.todaySalesCount}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Ventas</div>
                </div>

                {/* Today's Income */}
                <div className="card p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-md">
                            <TrendingUp size={20} className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="badge badge-success text-[10px]">HOY</span>
                    </div>
                    <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                        ${Math.round(stats.todayIncome).toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Ingresos (COP)</div>
                </div>

                {/* Total Stock */}
                <div className="card p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-md">
                            <Package size={20} className="text-slate-600 dark:text-slate-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{stats.totalStock}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Stock Total</div>
                </div>

                {/* Total Customers */}
                <div className="card p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-md">
                            <Users size={20} className="text-slate-600 dark:text-slate-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{stats.totalCustomers}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Clientes</div>
                </div>
            </div>

            {/* Exchange Rate */}
            <ExchangeRateWidget />

            {/* Recent Sales */}
            <div className="card p-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">Últimas Ventas</h3>
                {stats.recentSales.length > 0 ? (
                    <div className="space-y-2">
                        {stats.recentSales.map((sale) => (
                            <div key={sale.id} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-md transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-md">
                                        <Clock size={16} className="text-slate-500" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{sale.customer_name}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                            {parseServerDate(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                        ${sale.total_cop.toLocaleString()}
                                    </div>
                                    <div className={`text-xs ${sale.is_credit ? 'text-amber-600' : 'text-emerald-600'}`}>
                                        {sale.is_credit ? 'Crédito' : 'Contado'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-slate-400">
                        <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p className="text-sm font-medium">No hay ventas registradas hoy</p>
                    </div>
                )}
            </div>

            {/* Adorable Bear Modal */}
            {showBear && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-rose-100/40 dark:bg-slate-950/80 backdrop-blur-md animate-fade-in"
                    onClick={() => setShowBear(false)}
                >
                    <div
                        className="relative w-full max-w-lg bg-white/90 dark:bg-slate-900/90 rounded-[32px] shadow-2xl overflow-hidden animate-scale-in border border-rose-100 dark:border-rose-900/30"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setShowBear(false)}
                            className="absolute top-6 right-6 z-30 p-2 text-rose-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                        >
                            <X size={20} />
                        </button>

                        {/* Adorable Header */}
                        <div className="pt-10 pb-2 text-center">
                            <h2 className="text-2xl font-black bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">
                                ¡Hola, Mariana! ✨
                            </h2>
                            <p className="text-sm font-medium text-rose-300 dark:text-rose-400/60 mt-1">
                                Un recordatorio de que eres especial
                            </p>
                        </div>

                        {/* Bear Environment */}
                        <div className="relative h-[400px]">
                            <div className="absolute inset-0 bg-gradient-to-b from-rose-50/50 to-orange-50/50 dark:from-rose-950/10 dark:to-orange-950/10 rounded-3xl mx-4 mb-4">
                                <SunBear3D />
                            </div>
                        </div>

                        {/* Footer Decorative Icons */}
                        <div className="flex justify-center gap-4 pb-8 opacity-20 pointer-events-none">
                            <Heart size={16} fill="currentColor" className="text-rose-400" />
                            <Heart size={20} fill="currentColor" className="text-orange-400" />
                            <Heart size={16} fill="currentColor" className="text-rose-400" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
