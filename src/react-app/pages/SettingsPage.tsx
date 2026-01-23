import { useTheme } from '@/react-app/context/ThemeContext';
import { Moon, Sun, Palette, Info } from 'lucide-react';

export default function SettingsPage() {
    const { isDark, toggleTheme } = useTheme();

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Configuración</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Personaliza tu experiencia</p>
            </div>

            {/* Settings Section */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* Appearance */}
                <div className="card p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-md">
                            <Palette size={20} className="text-slate-600 dark:text-slate-400" />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Apariencia</h2>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-md">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white dark:bg-slate-700 rounded-md text-slate-500 dark:text-slate-400">
                                    {isDark ? <Moon size={18} /> : <Sun size={18} />}
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Modo Oscuro</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">Tema claro u oscuro</div>
                                </div>
                            </div>

                            <button
                                onClick={toggleTheme}
                                className={`relative w-11 h-6 rounded-full transition-colors ${isDark ? 'bg-slate-900' : 'bg-slate-300'
                                    }`}
                            >
                                <span
                                    className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${isDark ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* System Info */}
                <div className="card p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-md">
                            <Info size={20} className="text-slate-600 dark:text-slate-400" />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Información</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Aplicación</div>
                            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">sunbody POS</div>
                        </div>
                        <div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Versión</div>
                            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">1.1.0</div>
                        </div>
                        <div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Estado</div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Operativo</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* About */}
            <div className="card p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Sistema de Gestión
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                    Sistema integral para la gestión de ventas, inventario y relaciones con clientes.
                    Diseñado para ser rápido, eficiente y fácil de usar.
                </p>
            </div>
        </div>
    );
}
