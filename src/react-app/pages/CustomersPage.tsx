import { useState } from 'react';
import CustomerManager from '@/react-app/components/CustomerManager';
import CreditsManager from '@/react-app/components/CreditsManager';
import { Users, TrendingUp } from 'lucide-react';

export default function CustomersPage() {
    const [activeTab, setActiveTab] = useState<'directory' | 'credits'>('directory');

    return (
        <div className="p-3 md:p-6 space-y-3 md:space-y-6 animate-fade-in">
            <div className="flex flex-col gap-2 md:gap-4">
                <div>
                    <h1 className="text-xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-1 md:mb-2">
                        Gestión de Clientes
                    </h1>
                    <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium">
                        Administración de usuarios y estados de cuenta
                    </p>
                </div>

                {/* Tabs - Full width on mobile, fit content on desktop */}
                <div className="grid grid-cols-2 md:flex md:items-center gap-1 md:gap-2 p-1 bg-gray-200/50 dark:bg-gray-900/50 rounded-lg md:w-fit border border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('directory')}
                        className={`
                            flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 py-2.5 md:py-2 rounded-md text-xs md:text-sm font-bold transition-all
                            ${activeTab === 'directory'
                                ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-300/50 dark:hover:bg-gray-800'
                            } 
                        `}
                    >
                        <Users size={16} className="md:w-[18px] md:h-[18px]" />
                        <span className="hidden sm:inline">Directorio</span>
                        <span className="sm:hidden">Clientes</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('credits')}
                        className={`
                            flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 py-2.5 md:py-2 rounded-md text-xs md:text-sm font-bold transition-all
                            ${activeTab === 'credits'
                                ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-300/50 dark:hover:bg-gray-800'
                            }
                        `}
                    >
                        <TrendingUp size={16} className="md:w-[18px] md:h-[18px]" />
                        <span className="hidden sm:inline">Deudas y Créditos</span>
                        <span className="sm:hidden">Créditos</span>
                    </button>
                </div>
            </div>

            <div className="mt-3 md:mt-6">
                {activeTab === 'directory' ? (
                    <CustomerManager />
                ) : (
                    <CreditsManager />
                )}
            </div>
        </div>
    );
}
