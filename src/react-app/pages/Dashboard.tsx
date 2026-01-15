import { Package, Palette, ArrowRight, Activity, TrendingUp, Users, ShoppingBag, Clock } from 'lucide-react';
import ExchangeRateWidget from '@/react-app/components/ExchangeRateWidget';
import { useSales } from '@/react-app/hooks/useSales';
import { useProducts } from '@/react-app/hooks/useProducts';
import { useCustomers } from '@/react-app/hooks/useCustomers';
import { useMemo } from 'react';
import { parseServerDate } from '@/react-app/utils/date';
import LovableBear3D from '@/react-app/components/LovableBear3D';

export default function Dashboard() {
    const { sales, loading: loadingSales } = useSales();
    const { products, loading: loadingProducts } = useProducts();
    const { customers, loading: loadingCustomers } = useCustomers();

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
            <div className="p-6 space-y-8 animate-pulse">
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-2xl w-1/3"></div>
                <div className="grid lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-4 h-40 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                    <div className="lg:col-span-8 grid sm:grid-cols-2 gap-6">
                        <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                        <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 md:space-y-8 animate-fade-in min-h-full">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight mb-1">
                        Dashboard 🎅
                    </h1>
                    <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium">
                        Resumen de actividad y estado del sistema
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="px-2 md:px-3 py-1 bg-green-500/10 text-green-500 text-[10px] md:text-xs font-bold rounded-full uppercase tracking-wider border border-green-500/20">
                        Online
                    </span>
                    <span className="px-2 md:px-3 py-1 bg-brand-500/10 text-brand-500 text-[10px] md:text-xs font-bold rounded-full uppercase tracking-wider border border-brand-500/20">
                        v1.1.0
                    </span>
                </div>
            </div>

            {/* Lovable Bear Animation (3D) */}
            <LovableBear3D />

            {/* Top Stats Grid */}
            <div className="grid lg:grid-cols-12 gap-4 md:gap-6">
                <div className="lg:col-span-4">
                    <ExchangeRateWidget />
                </div>

                <div className="lg:col-span-8 grid grid-cols-2 gap-3 md:gap-6">
                    {/* Today's Sales Count */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:border-brand-500/30 transition-all duration-300 group">
                        <div className="flex justify-between items-start mb-2 md:mb-4">
                            <div className="p-2 md:p-4 bg-brand-500/10 rounded-2xl group-hover:bg-brand-500/20 transition-colors">
                                <Activity className="w-5 h-5 md:w-6 md:h-6 text-brand-500" />
                            </div>
                            <span className="px-1.5 md:px-2 py-0.5 md:py-1 bg-gray-100 dark:bg-gray-700 text-[9px] md:text-[10px] font-black text-gray-500 dark:text-gray-400 rounded uppercase tracking-tighter">Hoy</span>
                        </div>
                        <div className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white mb-1">
                            {stats.todaySalesCount}
                        </div>
                        <div className="text-xs md:text-sm font-bold text-gray-500 dark:text-gray-400">Ventas</div>
                    </div>

                    {/* Today's Income */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:border-emerald-500/30 transition-all duration-300 group">
                        <div className="flex justify-between items-start mb-2 md:mb-4">
                            <div className="p-2 md:p-4 bg-emerald-500/10 rounded-2xl group-hover:bg-emerald-500/20 transition-colors">
                                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />
                            </div>
                            <span className="px-1.5 md:px-2 py-0.5 md:py-1 bg-gray-100 dark:bg-gray-700 text-[9px] md:text-[10px] font-black text-gray-500 dark:text-gray-400 rounded uppercase tracking-tighter">Hoy</span>
                        </div>
                        <div className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white mb-1 truncate">
                            {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(stats.todayIncome)}
                        </div>
                        <div className="text-xs md:text-sm font-bold text-gray-500 dark:text-gray-400 truncate">Ingresos (COP)</div>
                    </div>
                </div>
            </div>

            {/* Detailed Stats & Recent Activity */}
            <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
                {/* Secondary Stats */}
                <div className="space-y-4 md:space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 md:p-6 border border-gray-100 dark:border-gray-700">
                        <h3 className="text-xs md:text-sm font-black text-gray-400 uppercase tracking-widest mb-4 md:mb-6 px-1">Resumen General</h3>

                        <div className="grid grid-cols-1 gap-3 md:space-y-4">
                            <div className="flex items-center justify-between p-3 md:p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl group">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                                        <Package className="w-4 h-4 md:w-5 md:h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-900 dark:text-white">Stock Total</div>
                                        <div className="text-[10px] md:text-xs text-gray-500 hidden md:block">{stats.totalProducts} productos</div>
                                    </div>
                                </div>
                                <div className="text-lg md:text-xl font-black text-gray-900 dark:text-white">{stats.totalStock}</div>
                            </div>

                            <div className="flex items-center justify-between p-3 md:p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl group">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <div className="p-2 bg-purple-500/10 rounded-xl text-purple-500">
                                        <Users className="w-4 h-4 md:w-5 md:h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-900 dark:text-white">Clientes</div>
                                        <div className="text-[10px] md:text-xs text-gray-500 hidden md:block">Registrados</div>
                                    </div>
                                </div>
                                <div className="text-lg md:text-xl font-black text-gray-900 dark:text-white">{stats.totalCustomers}</div>
                            </div>

                            <div className="flex items-center justify-between p-3 md:p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl group">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500">
                                        <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-900 dark:text-white">Ventas</div>
                                        <div className="text-[10px] md:text-xs text-gray-500 hidden md:block">Histórico</div>
                                    </div>
                                </div>
                                <div className="text-lg md:text-xl font-black text-gray-900 dark:text-white">{sales.length}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Sales List */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 md:p-6 border border-gray-100 dark:border-gray-700 h-full">
                        <div className="flex items-center justify-between mb-4 md:mb-6 px-1">
                            <h3 className="text-xs md:text-sm font-black text-gray-400 uppercase tracking-widest">Últimas Ventas</h3>
                            <button className="text-xs font-bold text-brand-500 hover:text-brand-600 transition-colors flex items-center gap-1">
                                Ver todas <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>

                        <div className="overflow-hidden">
                            {stats.recentSales.length > 0 ? (
                                <div className="space-y-2">
                                    {stats.recentSales.map((sale) => (
                                        <div key={sale.id} className="flex items-center justify-between p-3 md:p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-2xl transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-600">
                                            <div className="flex items-center gap-3 md:gap-4">
                                                <div className="p-2 md:p-3 bg-gray-100 dark:bg-gray-700 rounded-xl">
                                                    <Clock className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1 max-w-[120px] md:max-w-none">{sale.customer_name}</div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-2">
                                                        <span>{parseServerDate(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        <span className="w-1 h-1 bg-gray-300 rounded-full hidden md:block"></span>
                                                        <span className="hidden md:inline">{sale.items.length} productos</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-black text-gray-900 dark:text-white">
                                                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(sale.total_cop)}
                                                </div>
                                                <div className={`text-[10px] font-bold uppercase ${sale.is_credit ? 'text-orange-500' : 'text-emerald-500'}`}>
                                                    {sale.is_credit ? 'Crédito' : 'Contado'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                    <ShoppingBag className="w-10 h-10 md:w-12 md:h-12 mb-4 opacity-20" />
                                    <p className="font-medium text-sm md:text-base">No hay ventas registradas hoy</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modules Quick Access */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 pb-4">
                <div className="group bg-white dark:bg-gray-800 p-3 md:p-4 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-brand-500 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-brand-500/10 transition-colors">
                            <Package className="w-5 h-5 text-gray-500 group-hover:text-brand-500" />
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white text-sm md:text-base">Inventario</span>
                    </div>
                </div>
                <div className="group bg-white dark:bg-gray-800 p-3 md:p-4 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-brand-500 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-brand-500/10 transition-colors">
                            <Palette className="w-5 h-5 text-gray-500 group-hover:text-brand-500" />
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white text-sm md:text-base">Colores</span>
                    </div>
                </div>
                <div className="group bg-white dark:bg-gray-800 p-3 md:p-4 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-brand-500 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-brand-500/10 transition-colors">
                            <Users className="w-5 h-5 text-gray-500 group-hover:text-brand-500" />
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white text-sm md:text-base">Clientes</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
