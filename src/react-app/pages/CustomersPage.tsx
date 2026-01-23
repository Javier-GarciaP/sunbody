import { useState } from 'react';
import CustomerManager from '@/react-app/components/CustomerManager';
import CreditsManager from '@/react-app/components/CreditsManager';

export default function CustomersPage() {
    const [activeTab, setActiveTab] = useState('directory');

    return (
        <div className="space-y-4 animate-fade-in h-full flex flex-col">
            {/* Header */}
            <div className="shrink-0">
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Clientes</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Directorio y gestión de créditos</p>
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit shrink-0">
                {[
                    { value: 'directory', label: 'Directorio' },
                    { value: 'credits', label: 'Créditos' }
                ].map(tab => (
                    <button
                        key={tab.value}
                        onClick={() => setActiveTab(tab.value)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === tab.value
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="mt-2 flex-1 overflow-y-auto">
                {activeTab === 'directory' && <CustomerManager />}
                {activeTab === 'credits' && <CreditsManager />}
            </div>
        </div>
    );
}
