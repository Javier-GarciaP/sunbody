import { useState } from 'react';
import ProductManager from '@/react-app/components/ProductManager';
import ColorManager from '@/react-app/components/ColorManager';
import PackageManager from '@/react-app/components/PackageManager';
import { Package, Palette, Box } from 'lucide-react';

export default function InventoryPage() {
    const [activeTab, setActiveTab] = useState<'products' | 'colors' | 'packages'>('products');

    return (
        <div className="p-2 md:p-6 space-y-2 md:space-y-6 animate-fade-in">
            <div className="flex flex-col gap-2">
                <div>
                    <h1 className="text-lg md:text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-0.5 md:mb-2">
                        Inventario
                    </h1>
                    <p className="text-[10px] md:text-base text-gray-500 dark:text-gray-400 font-medium">
                        Modelos y existencias
                    </p>
                </div>

                {/* Tabs */}
                <div className="grid grid-cols-3 md:flex items-center gap-1 p-0.5 bg-gray-200/50 dark:bg-gray-900/50 rounded-lg md:w-fit border border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`
                            flex items-center justify-center gap-1 px-2 md:px-4 py-1.5 md:py-2 rounded-md text-[10px] md:text-sm font-black transition-all
                            ${activeTab === 'products'
                                ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-300/50 dark:hover:bg-gray-800'
                            }
                        `}
                    >
                        <Box size={14} />
                        <span>Items</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('colors')}
                        className={`
                            flex items-center justify-center gap-1 px-2 md:px-4 py-1.5 md:py-2 rounded-md text-[10px] md:text-sm font-black transition-all
                            ${activeTab === 'colors'
                                ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-300/50 dark:hover:bg-gray-800'
                            }
                        `}
                    >
                        <Palette size={14} />
                        <span>Color</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('packages')}
                        className={`
                            flex items-center justify-center gap-1 px-2 md:px-4 py-1.5 md:py-2 rounded-md text-[10px] md:text-sm font-black transition-all
                            ${activeTab === 'packages'
                                ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-300/50 dark:hover:bg-gray-800'
                            }
                        `}
                    >
                        <Package size={14} />
                        <span>Packs</span>
                    </button>
                </div>
            </div>

            <div className="mt-2 md:mt-6">
                {activeTab === 'products' && <ProductManager />}
                {activeTab === 'colors' && <ColorManager />}
                {activeTab === 'packages' && <PackageManager />}
            </div>
        </div>
    );
}
