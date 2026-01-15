import { useTheme } from '@/react-app/context/ThemeContext';
import { Moon, Sun, Palette, Globe, Shield, User, Info, LogOut } from 'lucide-react';

export default function SettingsPage() {
    const { isDark, toggleTheme } = useTheme();

    return (
        <div className="p-6 space-y-8 animate-fade-in bg-gray-50 dark:bg-gray-950 min-h-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Configuración</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Personaliza tu experiencia y gestiona el sistema</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Apariencia Section */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2.5 bg-brand-500/10 rounded-2xl text-brand-500">
                            <Palette size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Apariencia</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-gray-400 group-hover:text-brand-500 transition-colors">
                                    {isDark ? <Moon size={22} /> : <Sun size={22} />}
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900 dark:text-white">Modo Oscuro</div>
                                    <div className="text-sm text-gray-500">Cambiar entre tema claro y oscuro</div>
                                </div>
                            </div>

                            <button
                                onClick={toggleTheme}
                                className={`
                                    relative w-14 h-8 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 dark:focus:ring-offset-gray-900
                                    ${isDark ? 'bg-brand-500' : 'bg-gray-300'}
                                `}
                            >
                                <span
                                    className={`
                                        absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 shadow-md
                                        ${isDark ? 'translate-x-6' : 'translate-x-0'}
                                    `}
                                />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-transparent opacity-50 cursor-not-allowed">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-gray-400">
                                    <Globe size={22} />
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900 dark:text-white">Idioma</div>
                                    <div className="text-sm text-gray-500">Español (Colombia)</div>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase">Próximamente</span>
                        </div>
                    </div>
                </div>

                {/* Sistema Section */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2.5 bg-secondary-500/10 rounded-2xl text-secondary-500">
                            <Shield size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Seguridad</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-gray-400 group-hover:text-secondary-500 transition-colors">
                                    <User size={22} />
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900 dark:text-white">Perfil de Administrador</div>
                                    <div className="text-sm text-gray-500">Gestionar accesos y permisos</div>
                                </div>
                            </div>
                            <Info size={18} className="text-gray-400" />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-gray-400 group-hover:text-danger-500 transition-colors">
                                    <LogOut size={22} />
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900 dark:text-white">Cerrar Sesión</div>
                                    <div className="text-sm text-gray-500">Salir de la cuenta actual</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* About Section */}
            <div className="bg-gradient-to-br from-brand-500 to-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-brand-500/10 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-12 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="relative z-10">
                    <h3 className="text-2xl font-black mb-2 flex items-center gap-3">
                        Sumbody POS
                    </h3>
                    <p className="text-brand-100 max-w-lg mb-6 font-medium">
                        Sistema integral para la gestión de ventas, inventario y relaciones con clientes. Diseñado para ser rápido y eficiente.
                    </p>
                    <div className="flex items-center gap-6 text-sm font-bold">
                        <div className="flex flex-col">
                            <span className="text-brand-200 uppercase text-[10px] tracking-widest">Versión</span>
                            <span>1.1.0</span>
                        </div>
                        <div className="h-8 w-px bg-white/20"></div>
                        <div className="flex flex-col">
                            <span className="text-brand-200 uppercase text-[10px] tracking-widest">Estado</span>
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-success-400 animate-pulse"></span>
                                Producción
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
