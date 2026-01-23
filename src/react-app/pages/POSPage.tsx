import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, User, X, Zap } from 'lucide-react';
import { useState, useMemo, useRef } from 'react';
import { useProducts } from '@/react-app/hooks/useProducts';
import { useCustomers } from '@/react-app/hooks/useCustomers';
import { useSales } from '@/react-app/hooks/useSales';
import { useExchangeRate, convertVesToCop, convertCopToVes } from '@/react-app/hooks/useExchangeRate';
import { usePackageStock } from '@/react-app/hooks/usePackageStock';
import { useToastContext } from '@/react-app/context/ToastContext';
import { ConfirmModal } from '@/react-app/components/ui/ConfirmModal';
import { useConfirmModal } from '@/react-app/hooks/useConfirmModal';

type ViewMode = 'grid' | 'list';

interface CartItem {
    product_id: number;
    name: string;
    price: number;
    quantity: number;
    color_id: number;
    color_name: string;
    color_hex: string;
    stock_available: number;
    package_id?: number;
    image_url?: string | null;
}

export default function POSPage() {
    const { products } = useProducts();
    const { customers } = useCustomers();
    const { createSale } = useSales();
    const { rate } = useExchangeRate();
    const { stock: packageStock, refresh: refreshStock } = usePackageStock();
    const toast = useToastContext();
    const confirmModal = useConfirmModal();

    const [selectedPackageId, setSelectedPackageId] = useState<number | 'all'>('all');

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [activeView, setActiveView] = useState<'sales' | 'shortages'>('sales');
    const [_viewMode] = useState<ViewMode>('grid');
    const [cart, setCart] = useState<CartItem[]>([]);

    const [selectedCustomerId, setSelectedCustomerId] = useState<number>(0);
    const [customerSearch, setCustomerSearch] = useState('');
    const [showCustomerList, setShowCustomerList] = useState(false);
    const customerInputRef = useRef<HTMLInputElement>(null);
    const paidCopRef = useRef<HTMLInputElement>(null);
    const paidVesRef = useRef<HTMLInputElement>(null);
    const productSearchRef = useRef<HTMLInputElement>(null);

    const [isCredit, setIsCredit] = useState(false);
    const [paidCop, setPaidCop] = useState<number | ''>(0);
    const [paidVes, setPaidVes] = useState<number | ''>(0);

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    useMemo(() => {
        if (!isCredit) {
            setPaidCop(total);
            setPaidVes(0);
        }
    }, [total, isCredit]);

    const [isCartOpen, setIsCartOpen] = useState(false);

    const categories = useMemo(() => {
        const cats = new Set(['Todos']);
        products.forEach(p => {
            if (p.name.toLowerCase().includes('franela') || p.name.toLowerCase().includes('shirt')) cats.add('Ropa');
            if (p.name.toLowerCase().includes('zapato')) cats.add('Calzado');
        });
        return Array.from(cats);
    }, [products]);

    const filteredProducts = useMemo(() => {
        const availableItems = selectedPackageId === 'all'
            ? packageStock
            : packageStock.filter(s => s.package_id === selectedPackageId);

        const uniqueProductIds = Array.from(new Set(availableItems.map(s => s.product_id)));

        return products.filter(p => {
            const isInAvailable = uniqueProductIds.includes(p.id);
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'Todos' ||
                (selectedCategory === 'Ropa' && (p.name.toLowerCase().includes('franela') || p.name.toLowerCase().includes('shirt'))) ||
                (selectedCategory === 'Calzado' && p.name.toLowerCase().includes('zapato'));
            return isInAvailable && matchesSearch && matchesCategory;
        }).map(p => {
            const pStock = availableItems.filter(s => s.product_id === p.id);
            return {
                ...p,
                variants: pStock.map(s => ({
                    id: `${s.package_id}-${s.color_id}`,
                    color_id: s.color_id,
                    color_name: s.color_name,
                    color_hex: s.color_hex,
                    stock: s.available_quantity,
                    package_id: s.package_id,
                    package_name: s.package_name
                }))
            };
        });
    }, [products, searchTerm, selectedCategory, packageStock, selectedPackageId]);

    const addToCart = (product: any, variant: any) => {
        if (variant.stock <= 0) {
            toast.warning("No hay stock disponible para este color");
            return;
        }

        setCart(prev => {
            const existing = prev.find(item =>
                item.product_id === product.id &&
                item.color_id === variant.color_id &&
                item.package_id === variant.package_id
            );
            if (existing) {
                if (existing.quantity >= variant.stock) {
                    toast.warning("No puedes agregar más de lo que hay en stock");
                    return prev;
                }
                return prev.map(item =>
                    (item.product_id === product.id && item.color_id === variant.color_id && item.package_id === variant.package_id)
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, {
                product_id: product.id,
                name: product.name,
                price: product.price_cop,
                quantity: 1,
                color_id: variant.color_id,
                color_name: variant.color_name,
                color_hex: variant.color_hex,
                stock_available: variant.stock,
                package_id: variant.package_id,
                image_url: product.image_url
            }];
        });
    };

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    const handleQuickSale = () => {
        if (customers.length > 0) {
            const lastCustomer = [...customers].sort((a, b) => b.id - a.id)[0];
            setSelectedCustomerId(lastCustomer.id);
            setCustomerSearch(lastCustomer.name);
            toast.info("Cliente seleccionado para venta rápida");
        } else {
            toast.error("No hay clientes registrados");
        }
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        if (!selectedCustomerId) {
            toast.warning("Por favor selecciona un cliente o usa Venta Rápida");
            return;
        }
        if (!rate) {
            toast.error("No se pudo obtener la tasa de cambio");
            return;
        }

        const pCop = paidCop === '' ? 0 : paidCop;
        const pVes = paidVes === '' ? 0 : paidVes;
        const pVesInCop = convertVesToCop(pVes, rate.cop_to_ves);
        const totalPaidReal = pCop + pVesInCop;

        if (!isCredit) {
            if (Math.abs(totalPaidReal - total) > 500) {
                toast.error(`El pago total (${totalPaidReal.toLocaleString()}) no coincide con el total de la venta (${total.toLocaleString()})`);
                return;
            }
        }

        const customerName = customers.find(c => c.id === selectedCustomerId)?.name || 'Cliente';
        const saleType = isCredit ? 'Crédito' : 'Contado';

        confirmModal.showConfirm({
            title: '¿Confirmar venta?',
            message: `¿Procesar venta de $${total.toLocaleString()} a ${customerName}? Tipo: ${saleType}`,
            confirmText: 'Procesar Venta',
            cancelText: 'Cancelar',
            variant: 'info',
            onConfirm: async () => {
                const items = cart.map(item => ({
                    product_id: item.product_id,
                    color_id: item.color_id,
                    quantity: item.quantity,
                    package_id: item.package_id
                }));

                try {
                    await createSale(selectedCustomerId, items, pCop, pVes, rate.cop_to_ves, isCredit);
                    refreshStock();
                    setCart([]);
                    setSelectedCustomerId(0);
                    setCustomerSearch('');
                    setIsCredit(false);
                    setPaidCop(0);
                    setPaidVes(0);
                    setIsCartOpen(false);
                    toast.success("¡Venta realizada con éxito!");
                } catch (error) {
                    console.error(error);
                    toast.error("Error al realizar la venta");
                }
            }
        });
    };

    return (
        <div className="relative w-full h-full flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 isolate">
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
                <div className="flex-1 flex flex-col min-w-0 min-h-0">
                    <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm z-10 space-y-4">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                <input
                                    ref={productSearchRef}
                                    type="text"
                                    placeholder="Buscar productos..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="input pl-11 shadow-sm"
                                />
                            </div>
                            <button
                                onClick={handleQuickSale}
                                className="btn btn-secondary gap-2 whitespace-nowrap"
                            >
                                <Zap size={16} className="text-amber-500 fill-amber-500" />
                                <span className="hidden sm:inline">Venta Rápida</span>
                            </button>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-fit">
                                <button
                                    onClick={() => setActiveView('sales')}
                                    className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${activeView === 'sales' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'}`}
                                >
                                    Ventas
                                </button>
                                <button
                                    onClick={() => setActiveView('shortages')}
                                    className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${activeView === 'shortages' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'}`}
                                >
                                    Faltante
                                </button>
                            </div>

                            {activeView === 'sales' && (
                                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                                    <select
                                        value={selectedPackageId}
                                        onChange={(e) => setSelectedPackageId(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                                        className="select text-xs py-1.5"
                                    >
                                        <option value="all">Todos los Paquetes</option>
                                        {Array.from(new Set(packageStock.map(s => s.package_id))).map(pkgId => {
                                            const pkg = packageStock.find(s => s.package_id === pkgId);
                                            return <option key={pkgId} value={pkgId}>{pkg?.package_name || 'Paquete'}</option>;
                                        })}
                                    </select>

                                    <div className="flex gap-1">
                                        {categories.map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => setSelectedCategory(cat)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${selectedCategory === cat
                                                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                                                    }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar pb-[140px] md:pb-6">
                        {activeView === 'shortages' ? (
                            <div className="grid gap-6">
                                {Array.from(new Set(packageStock.map(s => s.package_id))).map(pkgId => {
                                    const pkgItems = packageStock.filter(s => s.package_id === pkgId);
                                    return (
                                        <div key={pkgId} className="card overflow-hidden">
                                            <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                                <h3 className="font-semibold text-slate-700 dark:text-slate-200 text-sm">
                                                    Paquete: {pkgItems[0].package_name}
                                                </h3>
                                                <span className="text-xs text-slate-500">{pkgItems.length} items</span>
                                            </div>
                                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {pkgItems.map((item, idx) => (
                                                    <div key={idx} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                                                <ShoppingCart size={20} />
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-sm text-slate-900 dark:text-white">{item.product_name}</div>
                                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                                    <div className="w-2.5 h-2.5 rounded-full border border-slate-200" style={{ backgroundColor: item.color_hex }} />
                                                                    <span className="text-xs text-slate-500">{item.color_name}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className={`text-sm font-bold ${item.available_quantity < 3 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                                                                {item.available_quantity} / {item.initial_quantity}
                                                            </div>
                                                            <div className="text-[10px] text-slate-400 uppercase font-semibold">Disponible</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                <Search size={48} className="mb-4 opacity-20" />
                                <p className="font-medium">No se encontraron productos disponibles</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                                {filteredProducts.map(product => (
                                    <div
                                        key={product.id}
                                        className="card group flex flex-col p-3 hover:border-slate-400 dark:hover:border-slate-500 transition-all text-left shadow-sm"
                                    >
                                        <div className="w-full aspect-square bg-slate-50 dark:bg-slate-800/50 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                                            {product.image_url ? (
                                                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                            ) : (
                                                <span className="text-4xl opacity-50">{product.name.toLowerCase().includes('zapato') ? '👟' : '👕'}</span>
                                            )}
                                        </div>
                                        <h3 className="font-medium text-slate-900 dark:text-white text-sm mb-1 line-clamp-2 min-h-[2.5rem]" title={product.name}>
                                            {product.name}
                                        </h3>
                                        <div className="mb-3 font-bold text-slate-900 dark:text-white text-base">
                                            ${product.price_cop.toLocaleString()}
                                        </div>

                                        <div className="mt-auto flex flex-wrap gap-1.5">
                                            {product.variants.map((variant: any) => (
                                                <button
                                                    key={variant.id}
                                                    onClick={() => addToCart(product, variant)}
                                                    disabled={variant.stock <= 0}
                                                    className={`w-7 h-7 rounded-full border-2 border-white dark:border-slate-800 shadow-sm flex items-center justify-center transition-transform active:scale-110 ${variant.stock <= 0 ? 'opacity-30 grayscale cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
                                                    style={{ backgroundColor: variant.color_hex }}
                                                    title={`${variant.color_name} (${variant.stock})`}
                                                >
                                                    {variant.stock <= 0 && <span className="w-full h-0.5 bg-red-500/50 -rotate-45" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar: Cart (Desktop) */}
                <div className="hidden md:flex w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex-col shadow-xl z-20">
                    <CartContent
                        cart={cart}
                        setCart={setCart}
                        total={total}
                        isCredit={isCredit}
                        setIsCredit={setIsCredit}
                        selectedCustomerId={selectedCustomerId}
                        setSelectedCustomerId={setSelectedCustomerId}
                        customerSearch={customerSearch}
                        setCustomerSearch={setCustomerSearch}
                        showCustomerList={showCustomerList}
                        setShowCustomerList={setShowCustomerList}
                        customers={customers}
                        handleCheckout={handleCheckout}
                        rate={rate}
                        paidCop={paidCop}
                        setPaidCop={setPaidCop}
                        paidVes={paidVes}
                        setPaidVes={setPaidVes}
                        customerInputRef={customerInputRef}
                        paidCopRef={paidCopRef}
                        paidVesRef={paidVesRef}
                        toast={toast}
                    />
                </div>
            </div>

            {/* Mobile Bottom Bar */}
            <div className="md:hidden fixed bottom-[60px] left-0 right-0 p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3 z-[45] shadow-lg">
                <button
                    onClick={() => setIsCartOpen(true)}
                    className="flex-1 btn btn-primary h-12 flex items-center justify-between px-6 shadow-md"
                >
                    <div className="flex items-center gap-2">
                        <ShoppingCart size={18} />
                        <span className="text-sm font-semibold">Ver Ticket ({cartCount})</span>
                    </div>
                    <span className="text-base font-bold">${total.toLocaleString()}</span>
                </button>
            </div>

            {/* Mobile Bottom Sheet */}
            {isCartOpen && (
                <>
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]" onClick={() => setIsCartOpen(false)} />
                    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-3xl z-[101] h-[85dvh] flex flex-col shadow-2xl animate-slide-up">
                        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto my-3" />
                        <div className="px-6 py-2 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Detalle de Venta</h2>
                            <button onClick={() => setIsCartOpen(false)} className="p-2 text-slate-400"><X size={20} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto px-4">
                            <CartContent
                                cart={cart}
                                setCart={setCart}
                                total={total}
                                isCredit={isCredit}
                                setIsCredit={setIsCredit}
                                selectedCustomerId={selectedCustomerId}
                                setSelectedCustomerId={setSelectedCustomerId}
                                customerSearch={customerSearch}
                                setCustomerSearch={setCustomerSearch}
                                showCustomerList={showCustomerList}
                                setShowCustomerList={setShowCustomerList}
                                customers={customers}
                                handleCheckout={handleCheckout}
                                rate={rate}
                                isMobile
                                paidCop={paidCop}
                                setPaidCop={setPaidCop}
                                paidVes={paidVes}
                                setPaidVes={setPaidVes}
                                paidCopRef={paidCopRef}
                                paidVesRef={paidVesRef}
                                toast={toast}
                            />
                        </div>
                    </div>
                </>
            )}

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.options.title}
                message={confirmModal.options.message}
                confirmText={confirmModal.options.confirmText}
                cancelText={confirmModal.options.cancelText}
                variant={confirmModal.options.variant}
                onConfirm={confirmModal.handleConfirm}
                onCancel={confirmModal.handleCancel}
            />
        </div>
    );
}

function CartContent({
    cart, setCart, total, isCredit, setIsCredit,
    selectedCustomerId, setSelectedCustomerId,
    customerSearch, setCustomerSearch,
    showCustomerList, setShowCustomerList,
    customers, handleCheckout, rate, isMobile = false,
    paidCop, setPaidCop, paidVes, setPaidVes, customerInputRef, paidCopRef, paidVesRef, toast
}: any) {
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const handleCopChange = (val: string) => {
        const num = parseInt(val) || 0;
        setPaidCop(val === '' ? '' : num);
        if (!isCredit && rate && val !== '') {
            const remaining = total - num;
            if (remaining > 0) {
                const vesNeeded = convertCopToVes(remaining, rate.cop_to_ves);
                setPaidVes(parseFloat(vesNeeded.toFixed(2)));
            } else {
                setPaidVes(0);
            }
        }
    };

    const handleVesChange = (val: string) => {
        const num = parseFloat(val) || 0;
        setPaidVes(val === '' ? '' : num);
        if (!isCredit && rate && val !== '') {
            const vesInCop = convertVesToCop(num, rate.cop_to_ves);
            const remaining = total - vesInCop;
            setPaidCop(Math.max(0, Math.round(remaining)));
        }
    };

    const filteredCustomers = useMemo(() => {
        if (!customerSearch) return [];
        return customers.filter((c: any) => c.name.toLowerCase().includes(customerSearch.toLowerCase()));
    }, [customers, customerSearch]);

    useMemo(() => setHighlightedIndex(-1), [customerSearch]);

    const handleCustomerKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex(prev => (prev < filteredCustomers.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
        } else if (e.key === 'Enter') {
            if (highlightedIndex >= 0) {
                const c = filteredCustomers[highlightedIndex];
                setSelectedCustomerId(c.id);
                setCustomerSearch(c.name);
                setShowCustomerList(false);
                paidCopRef.current?.focus();
            } else if (selectedCustomerId) {
                paidCopRef.current?.focus();
            }
        } else if (e.key === 'Escape') {
            setShowCustomerList(false);
        }
    };

    const currentTotalPaid = (paidCop === '' ? 0 : paidCop) + convertVesToCop((paidVes === '' ? 0 : paidVes), rate?.cop_to_ves || 1);
    const balance = total - currentTotalPaid;

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900">
            {!isMobile && (
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                    <h2 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <ShoppingCart size={18} className="text-slate-500" />
                        Ticket de Venta
                    </h2>
                    <button onClick={() => setCart([])} className="text-slate-400 hover:text-red-500 p-1 rounded-md" title="Limpiar"><Trash2 size={16} /></button>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10 opacity-50">
                        <ShoppingCart size={32} className="mb-2" />
                        <p className="text-xs font-medium">Carrito vacío</p>
                    </div>
                ) : (
                    cart.map((item: any, idx: number) => (
                        <div key={idx} className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                            <div className="flex gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate">{item.name}</div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <div className="w-2.5 h-2.5 rounded-full border border-black/10" style={{ backgroundColor: item.color_hex }} />
                                        <span className="text-[10px] text-slate-500">{item.color_name}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-sm text-slate-900 dark:text-white">${(item.price * item.quantity).toLocaleString()}</div>
                                    <div className="text-[10px] text-slate-400">${item.price.toLocaleString()} c/u</div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5">
                                    <button
                                        onClick={() => setCart((c: any) => {
                                            const nc = [...c];
                                            if (nc[idx].quantity > 1) nc[idx].quantity -= 1; else nc.splice(idx, 1);
                                            return nc;
                                        })}
                                        className="w-6 h-6 flex items-center justify-center rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    ><Minus size={12} /></button>
                                    <span className="w-6 text-center text-xs font-semibold">{item.quantity}</span>
                                    <button
                                        onClick={() => setCart((c: any) => {
                                            const nc = [...c];
                                            if (nc[idx].quantity < nc[idx].stock_available) {
                                                nc[idx].quantity += 1;
                                            } else {
                                                toast.warning("Stock máximo alcanzado");
                                            }
                                            return nc;
                                        })}
                                        className="w-6 h-6 flex items-center justify-center rounded text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                                    ><Plus size={12} /></button>
                                </div>
                                <span className="text-[10px] font-medium text-slate-400">Stock: {item.stock_available}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <div className="space-y-4">
                    <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                        <input
                            ref={customerInputRef}
                            type="text"
                            placeholder="Buscar Cliente..."
                            value={customerSearch}
                            onChange={(e) => {
                                setCustomerSearch(e.target.value);
                                setShowCustomerList(true);
                                if (!e.target.value) setSelectedCustomerId(0);
                            }}
                            onFocus={() => setShowCustomerList(true)}
                            onKeyDown={handleCustomerKeyDown}
                            className={`input pl-11 ${!selectedCustomerId ? 'border-amber-300 dark:border-amber-700/50' : ''}`}
                        />
                        {showCustomerList && customerSearch && (
                            <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 max-h-48 overflow-y-auto z-[60]">
                                {filteredCustomers.map((c: any, idx: number) => (
                                    <button
                                        key={c.id}
                                        onClick={() => { setSelectedCustomerId(c.id); setCustomerSearch(c.name); setShowCustomerList(false); paidCopRef.current?.focus(); }}
                                        className={`w-full text-left px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-800 last:border-0 ${idx === highlightedIndex ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'hover:bg-slate-50 dark:text-slate-600 dark:hover:text-slate-300'}`}
                                    >
                                        <div className="font-semibold">{c.name}</div>
                                        <div className="text-xs opacity-60">{c.phone || 'Sin tlf'}</div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        <button onClick={() => setIsCredit(false)} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${!isCredit ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Contado</button>
                        <button onClick={() => setIsCredit(true)} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${isCredit ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Crédito</button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase pointer-events-none">Cop</span>
                            <input ref={paidCopRef} type="number" value={paidCop || ''} onChange={e => handleCopChange(e.target.value)} className="input pl-11 text-right" placeholder="0" />
                        </div>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase pointer-events-none">Ves</span>
                            <input ref={paidVesRef} type="number" value={paidVes || ''} onChange={e => handleVesChange(e.target.value)} className="input pl-11 text-right" placeholder="0" />
                        </div>
                    </div>

                    <div className="flex justify-between items-center py-2 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase">Total Venta</span>
                            <span className="text-xl font-bold text-slate-900 dark:text-white">${total.toLocaleString()}</span>
                        </div>
                        {isCredit && (
                            <div className="text-right">
                                <span className="text-[10px] font-semibold text-red-500 uppercase">Por Cobrar</span>
                                <div className="text-sm font-bold text-red-500">${Math.max(0, balance).toLocaleString()}</div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || !selectedCustomerId}
                        className="btn btn-primary w-full py-4 text-sm shadow-lg gap-2"
                    >
                        <CreditCard size={20} />
                        Confirmar Venta
                    </button>
                </div>
            </div>
        </div>
    );
}
