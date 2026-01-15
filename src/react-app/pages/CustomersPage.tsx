import { useState } from 'react';
import CustomerManager from '@/react-app/components/CustomerManager';
import CreditsManager from '@/react-app/components/CreditsManager';
import { Users, TrendingUp } from 'lucide-react';

export default function CustomersPage() {
    const [activeTab, setActiveTab] = useState<'directory' | 'credits'>('directory');

    return (
        <div className="p-6 space-y-6 animate-fade-in">
            <div className="flex flex-col gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
                        Gestión de Clientes
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                        Administración de usuarios y estados de cuenta
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 p-1 bg-gray-200/50 dark:bg-gray-900/50 rounded-lg w-fit border border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('directory')}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all
                            ${activeTab === 'directory'
                                ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-300/50 dark:hover:bg-gray-800'
                            } 
                        `}
                    >
                        <Users size={18} />
                        Directorio
                    </button>
                    <button
                        onClick={() => setActiveTab('credits')}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all
                            ${activeTab === 'credits'
                                ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-300/50 dark:hover:bg-gray-800'
                            }
                        `}
                    >
                        <TrendingUp size={18} />
                        Deudas y Créditos
                    </button>
                </div>
            </div>

            <div className="mt-6">
                {activeTab === 'directory' ? (
                    <CustomerManager />
                ) : (
                    <CreditsManager />
                )}
            </div>
        </div>
    );
}
