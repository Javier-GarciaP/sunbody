import { useState } from 'react';
import ProductManager from '@/react-app/components/ProductManager';
import PackageManager from '@/react-app/components/PackageManager';
import ColorManager from '@/react-app/components/ColorManager';

export default function InventoryPage() {
    const [activeTab, setActiveTab] = useState('products');

    return (
        <div className="space-y-4 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Inventario</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Gestiona productos, paquetes y colores</p>
            </div>

            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
                {[
                    { value: 'products', label: 'Productos' },
                    { value: 'packages', label: 'Paquetes' },
                    { value: 'colors', label: 'Colores' }
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

            <div className="mt-4">
                {activeTab === 'products' && <ProductManager />}
                {activeTab === 'packages' && <PackageManager />}
                {activeTab === 'colors' && <ColorManager />}
            </div>
        </div>
    );
}
