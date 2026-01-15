import { useState } from 'react';
import CustomerManager from '@/react-app/components/CustomerManager';
import CreditsManager from '@/react-app/components/CreditsManager';
import { Users, TrendingUp } from 'lucide-react';

export default function CustomersPage() {
    const [activeTab, setActiveTab] = useState<'directory' | 'credits'>('directory');

    return (
        <div className="p-2 md:p-6 space-y-2 md:space-y-6 animate-fade-in">
            <div className="flex flex-col gap-2 md:gap-4">
                <div>
                    <h1 className="text-lg md:text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-0.5 md:mb-2">
                        Clientes
                    </h1>
                    <p className="text-[10px] md:text-base text-gray-500 dark:text-gray-400 font-medium">
                        Usuarios y estados de cuenta
                    </p>
                </div>

                {/* Tabs - Full width on mobile, fit content on desktop */}
                <div className="grid grid-cols-2 md:flex md:items-center gap-1 p-0.5 bg-gray-200/50 dark:bg-gray-900/50 rounded-lg md:w-fit border border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('directory')}
                        className={`
                            flex items-center justify-center gap-1 px-2 md:px-4 py-1.5 md:py-2 rounded-md text-[10px] md:text-sm font-black transition-all
                            ${activeTab === 'directory'
                                ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-300/50 dark:hover:bg-gray-800'
                            } 
                        `}
                    >
                        <Users size={14} className="md:w-[18px] md:h-[18px]" />
                        <span>Directorio</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('credits')}
                        className={`
                            flex items-center justify-center gap-1 px-2 md:px-4 py-1.5 md:py-2 rounded-md text-[10px] md:text-sm font-black transition-all
                            ${activeTab === 'credits'
                                ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-300/50 dark:hover:bg-gray-800'
                            }
                        `}
                    >
                        <TrendingUp size={14} className="md:w-[18px] md:h-[18px]" />
                        <span>Créditos</span>
                    </button>
                </div>
            </div>

            <div className="mt-2 md:mt-6">
                {activeTab === 'directory' ? (
                    <CustomerManager />
                ) : (
                    <CreditsManager />
                )}
            </div>
        </div>
    );
}
