import { NavLink } from 'react-router';
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Users,
} from 'lucide-react';

export default function BottomNav() {
    const navItems = [
        { icon: LayoutDashboard, label: 'Inicio', path: '/' },
        { icon: ShoppingCart, label: 'Venta', path: '/pos' },
        { icon: Package, label: 'Inventario', path: '/inventory' },
        { icon: Users, label: 'Clientes', path: '/customers' },
    ];

    return (
        <nav className="md:hidden bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 mt-auto shrink-0">
            <div className="flex justify-around items-center px-2 py-2 safe-area-inset-bottom">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className="relative flex-1 flex flex-col items-center justify-center gap-1.5 py-2.5 px-1 rounded-xl transition-all duration-200 group active:scale-95"
                    >
                        {({ isActive }) => (
                            <>
                                {/* Active Background */}
                                {isActive && (
                                    <div className="absolute inset-0 bg-brand-50 dark:bg-brand-900/20 rounded-xl scale-100 transition-transform" />
                                )}

                                {/* Icon */}
                                <div className="relative z-10">
                                    <item.icon
                                        size={24}
                                        strokeWidth={isActive ? 2.5 : 2}
                                        className={`transition-colors duration-200 ${isActive
                                                ? 'text-brand-600 dark:text-brand-400'
                                                : 'text-gray-500 dark:text-gray-400'
                                            }`}
                                    />
                                </div>

                                {/* Label */}
                                <span className={`relative z-10 text-[10px] font-bold leading-none transition-colors duration-200 ${isActive
                                        ? 'text-brand-600 dark:text-brand-400'
                                        : 'text-gray-500 dark:text-gray-400'
                                    }`}>
                                    {item.label}
                                </span>

                                {/* Active Indicator Dot */}
                                {isActive && (
                                    <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-600 dark:bg-brand-400" />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}
