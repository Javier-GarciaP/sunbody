import { NavLink } from 'react-router';
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Users,
    ArrowRightLeft
} from 'lucide-react';

export default function BottomNav() {
    const navItems = [
        { icon: LayoutDashboard, label: 'Inicio', path: '/' },
        { icon: ShoppingCart, label: 'Venta', path: '/pos' },
        { icon: ArrowRightLeft, label: 'Transac.', path: '/transactions' },
        { icon: Package, label: 'Invent.', path: '/inventory' },
        { icon: Users, label: 'Clientes', path: '/customers' },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 pb-safe z-50 px-2 py-2 flex justify-around items-center h-[60px] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            {navItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `
                        flex flex-col items-center justify-center w-full py-1 rounded-lg transition-colors
                        ${isActive
                            ? 'text-brand-600 dark:text-brand-400'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }
                    `}
                >
                    {({ isActive }) => (
                        <>
                            <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} className="mb-0.5" />
                            <span className="text-[10px] font-medium leading-none truncate max-w-[60px]">{item.label}</span>
                        </>
                    )}
                </NavLink>
            ))}
        </nav>
    );
}
