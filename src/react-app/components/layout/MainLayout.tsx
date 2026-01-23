import { Outlet, NavLink, useLocation } from 'react-router';
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Settings,
    LogOut,
    Users,
    Moon,
    Sun,
    ArrowRightLeft,
    ClipboardList
} from 'lucide-react';
import { useTheme } from '@/react-app/context/ThemeContext';
import { useAuth } from '@/react-app/context/AuthContext';
import BottomNav from './BottomNav';

export default function MainLayout() {
    const location = useLocation();
    const { isDark, toggleTheme } = useTheme();
    const { user, logout } = useAuth();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: ShoppingCart, label: 'Venta', path: '/pos' },
        { icon: ClipboardList, label: 'Pedidos', path: '/orders' },
        { icon: ArrowRightLeft, label: 'Transacciones', path: '/transactions' },
        { icon: Package, label: 'Inventario', path: '/inventory' },
        { icon: Users, label: 'Clientes', path: '/customers' },
        { icon: Settings, label: 'Ajustes', path: '/settings' },
    ];

    const currentPage = navItems.find(i => i.path === location.pathname);

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">

            {/* Desktop Sidebar - Minimal Design */}
            <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
                {/* Brand */}
                <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center">
                            <img src="/favicon.svg" alt="sunbody" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">sunbody</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 overflow-y-auto">
                    <div className="space-y-0.5">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => `
                                    flex items-center gap-3 px-3 py-2 rounded-md transition-colors
                                    ${isActive
                                        ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-100'
                                    }
                                `}
                            >
                                <item.icon size={18} strokeWidth={2} />
                                <span className="text-sm font-medium">{item.label}</span>
                            </NavLink>
                        ))}
                    </div>
                </nav>

                {/* User Profile */}
                <div className="p-3 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 p-2 rounded-md">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 text-xs font-medium overflow-hidden">
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                            ) : (
                                <span>{user?.displayName?.substring(0, 2).toUpperCase() || 'AD'}</span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">
                                {user?.displayName || 'Administrator'}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {user?.email || 'admin@sumbody.com'}
                            </div>
                        </div>
                        <button
                            onClick={() => logout()}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Cerrar Sesión"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Desktop Header - Minimal */}
                <header className="hidden md:flex h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 items-center justify-between px-6">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-400 dark:text-slate-500">{currentPage?.label || 'Dashboard'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                        >
                            {isDark ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                    </div>
                </header>

                {/* Mobile Header - Minimal */}
                <header className="md:hidden h-14 flex items-center px-4 justify-between bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-slate-900 dark:bg-slate-100 rounded-md flex items-center justify-center">
                            <span className="text-white dark:text-slate-900 font-semibold text-xs">S</span>
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Sunbody</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            className="p-1.5 text-slate-500 dark:text-slate-400 rounded-md"
                        >
                            {isDark ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <button
                            onClick={() => logout()}
                            className="p-1.5 text-slate-400 hover:text-red-500"
                            title="Cerrar Sesión"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className={`flex-1 ${location.pathname === '/pos'
                    ? 'overflow-hidden p-0'
                    : 'overflow-y-auto p-4 md:p-6'
                    }`}>
                    <div className={`mx-auto w-full ${location.pathname === '/pos' ? 'max-w-none h-full' : 'max-w-7xl'}`}>
                        <Outlet />
                    </div>
                </main>

                {/* Mobile Bottom Navigation */}
                <BottomNav />
            </div>
        </div>
    );
}