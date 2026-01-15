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
        <nav className="md:hidden bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 mt-auto shrink-0 shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.1)]">
            <div className="flex justify-around items-center px-1 py-1 safe-area-inset-bottom">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className="relative flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 rounded-lg transition-all duration-200 group active:scale-95"
                    >
                        {({ isActive }) => (
                            <>
                                {/* Active Background */}
                                {isActive && (
                                    <div className="absolute inset-x-1 inset-y-0.5 bg-brand-50 dark:bg-brand-900/20 rounded-lg scale-100 transition-transform" />
                                )}

                                {/* Icon */}
                                <div className="relative z-10 transition-transform duration-200 group-active:scale-90">
                                    <item.icon
                                        size={20}
                                        strokeWidth={isActive ? 2.5 : 2}
                                        className={`transition-colors duration-200 ${isActive
                                            ? 'text-brand-600 dark:text-brand-400'
                                            : 'text-gray-500 dark:text-gray-400'
                                            }`}
                                    />
                                </div>

                                {/* Label */}
                                <span className={`relative z-10 text-[9px] font-black leading-none transition-colors duration-200 ${isActive
                                    ? 'text-brand-600 dark:text-brand-400'
                                    : 'text-gray-500 dark:text-gray-400'
                                    }`}>
                                    {item.label}
                                </span>

                                {/* Active Indicator Dot */}
                                {isActive && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-0.5 rounded-full bg-brand-600 dark:bg-brand-400" />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}
