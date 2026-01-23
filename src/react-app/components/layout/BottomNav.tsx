import { NavLink } from 'react-router';
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Users,
    ArrowRightLeft,
    ClipboardList
} from 'lucide-react';

export default function BottomNav() {
    const navItems = [
        { icon: LayoutDashboard, label: 'Inicio', path: '/' },
        { icon: ShoppingCart, label: 'Venta', path: '/pos' },
        { icon: ClipboardList, label: 'Pedidos', path: '/orders' },
        { icon: ArrowRightLeft, label: 'Trans.', path: '/transactions' },
        { icon: Package, label: 'Stock', path: '/inventory' },
        { icon: Users, label: 'Clientes', path: '/customers' },
    ];

    return (
        <nav className="md:hidden bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
            <div className="flex justify-around items-center px-2 py-2 pb-safe">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className="flex-1 flex flex-col items-center justify-center gap-1 py-1.5 px-1 rounded-md transition-colors"
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon
                                    size={20}
                                    strokeWidth={isActive ? 2 : 1.5}
                                    className={`transition-colors ${isActive
                                            ? 'text-slate-900 dark:text-slate-100'
                                            : 'text-slate-400 dark:text-slate-500'
                                        }`}
                                />
                                <span className={`text-[10px] font-medium ${isActive
                                        ? 'text-slate-900 dark:text-slate-100'
                                        : 'text-slate-500 dark:text-slate-400'
                                    }`}>
                                    {item.label}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}
