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
    ArrowRightLeft
} from 'lucide-react';
import { useTheme } from '@/react-app/context/ThemeContext';
import { useAuth } from '@/react-app/context/AuthContext';

export default function MainLayout() {
    const location = useLocation();
    const { isDark, toggleTheme } = useTheme();
    const { user, logout } = useAuth();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: ShoppingCart, label: 'Venta', path: '/pos' },
        { icon: ArrowRightLeft, label: 'Transacciones', path: '/transactions' },
        { icon: Package, label: 'Inventario', path: '/inventory' },
        { icon: Users, label: 'Clientes', path: '/customers' },
        { icon: Settings, label: 'Ajustes', path: '/settings' },
    ];

    const currentPage = navItems.find(i => i.path === location.pathname);

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 font-sans overflow-hidden transition-colors duration-200">

            {/* Desktop Sidebar - Hidden on Mobile */}
            <aside className="hidden md:flex flex-col w-72 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 z-50">
                {/* Brand Header */}
                <div className="h-16 flex items-center px-6 border-b border-gray-100 dark:border-gray-800">
                    <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-brand-500/20">
                        <span className="text-lg">S</span>
                    </div>
                    <span className="ml-3 font-bold text-xl tracking-tight text-gray-900 dark:text-white">Sunbody</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                                relative group flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 font-medium
                                ${isActive
                                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-200'
                                }
                            `}
                        >
                            <item.icon size={20} className={`shrink-0 ${location.pathname === item.path ? 'text-brand-600 dark:text-brand-400' : 'text-gray-500 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300'}`} />
                            <span>{item.label}</span>

                            {location.pathname === item.path && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand-600 rounded-r-md" />
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* User Profile Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/50">
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white dark:hover:bg-gray-900 transition-colors group border border-transparent hover:border-gray-200 dark:hover:border-gray-800 hover:shadow-sm">
                        <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-700 dark:text-brand-300 font-semibold border border-brand-200 dark:border-brand-800 overflow-hidden">
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                            ) : (
                                <span>{user?.displayName?.substring(0, 2).toUpperCase() || 'AD'}</span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {user?.displayName || 'Administrator'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {user?.email || 'admin@sumbody.com'}
                            </div>
                        </div>
                        <button
                            onClick={() => logout()}
                            className="p-1.5 text-gray-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-md transition-all duration-200"
                            title="Cerrar Sesión"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-gray-900">
                {/* Desktop Header / Top Bar */}
                <header className="h-16 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 shrink-0 z-10 sticky top-0 shadow-sm md:flex hidden">
                    <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-sm">
                        <LayoutDashboard size={16} />
                        <span>/</span>
                        <span className="font-medium text-gray-900 dark:text-gray-200">{currentPage?.label || 'Dashboard'}</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center px-3 py-1.5 bg-gray-50 dark:bg-gray-900 rounded-full border border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-600 dark:text-gray-300">
                            <span className="w-2 h-2 rounded-full bg-success-500 mr-2 shadow-sm animate-pulse"></span>
                            Sistema Operativo
                        </div>
                        <div className="h-6 w-px bg-gray-200 dark:bg-gray-800" />
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                        >
                            {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </div>
                </header>

                {/* Mobile Header (Simplified) */}
                <header className="md:hidden h-14 bg-white dark:bg-gray-950 flex items-center px-4 justify-between border-b border-gray-100 dark:border-gray-800 sticky top-0 z-20">
                    <span className="font-bold text-gray-900 dark:text-white text-lg">Sumbody</span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            {isDark ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-700 dark:text-brand-300 text-sm font-bold border border-brand-200 dark:border-brand-800">
                            {user?.displayName?.substring(0, 1).toUpperCase() || 'A'}
                        </div>
                    </div>
                </header>


                {/* Page Content */}
                <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 p-4 md:p-8 pb-24 md:pb-8">
                    <div className="max-w-7xl mx-auto h-full">
                        <Outlet />
                    </div>
                </main>

                {/* Mobile Bottom Navigation */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 pb-safe z-50 px-2 py-2 flex justify-around items-center">
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
                                    <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                                    <span className="text-[10px] font-medium mt-1 truncate max-w-[60px]">{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>
            </div>
        </div>
    );
}
