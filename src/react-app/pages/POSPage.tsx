import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, User, X, Zap, Grid, List, Check } from 'lucide-react';
import { useState, useMemo, useRef } from 'react';
import { useProducts } from '@/react-app/hooks/useProducts';
import { useCustomers } from '@/react-app/hooks/useCustomers';
import { useSales } from '@/react-app/hooks/useSales';
import { useExchangeRate, convertVesToCop, convertCopToVes } from '@/react-app/hooks/useExchangeRate';

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
}

export default function POSPage() {
    const { products } = useProducts();
    const { customers } = useCustomers();
    const { createSale } = useSales();
    const { rate } = useExchangeRate();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [cart, setCart] = useState<CartItem[]>([]);

    // Customer Selection State
    const [selectedCustomerId, setSelectedCustomerId] = useState<number>(0);
    const [customerSearch, setCustomerSearch] = useState('');
    const [showCustomerList, setShowCustomerList] = useState(false);
    const customerInputRef = useRef<HTMLInputElement>(null);

    const [isCredit, setIsCredit] = useState(false);
    // Payment split state
    const [paidCop, setPaidCop] = useState<number | ''>(0);
    const [paidVes, setPaidVes] = useState<number | ''>(0);

    // Update paid amount when total changes (if in Contado mode)
    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    useMemo(() => {
        if (!isCredit) {
            setPaidCop(total);
            setPaidVes(0);
        }
    }, [total, isCredit]);

    const [isCartOpen, setIsCartOpen] = useState(false); // For mobile bottom sheet

    // Memoized filters for speed
    const categories = useMemo(() => {
        const cats = new Set(['Todos']);
        // Assuming products might have a category property in the future, 
        // for now we'll mock some based on product names or just use placeholders
        products.forEach(p => {
            if (p.name.toLowerCase().includes('franela') || p.name.toLowerCase().includes('shirt')) cats.add('Ropa');
            if (p.name.toLowerCase().includes('zapato')) cats.add('Calzado');
        });
        return Array.from(cats);
    }, [products]);

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'Todos' ||
                (selectedCategory === 'Ropa' && (p.name.toLowerCase().includes('franela') || p.name.toLowerCase().includes('shirt'))) ||
                (selectedCategory === 'Calzado' && p.name.toLowerCase().includes('zapato'));
            return matchesSearch && matchesCategory;
        });
    }, [products, searchTerm, selectedCategory]);

    const addToCart = (product: any, variant: any) => {
        if (variant.stock <= 0) {
            alert("No hay stock disponible para este color");
            return;
        }

        setCart(prev => {
            const existing = prev.find(item => item.product_id === product.id && item.color_id === variant.color_id);
            if (existing) {
                if (existing.quantity >= variant.stock) {
                    alert("No puedes agregar más de lo que hay en stock");
                    return prev;
                }
                return prev.map(item =>
                    (item.product_id === product.id && item.color_id === variant.color_id)
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
                stock_available: variant.stock
            }];
        });
    };

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    const handleQuickSale = () => {
        // Find a generic "Venta Rápida" or "Mostrador" customer
        const genericCustomer = customers.find(c => c.name.toLowerCase().includes('mostrador') || c.name.toLowerCase().includes('rápida')) || customers[0];
        if (genericCustomer) {
            setSelectedCustomerId(genericCustomer.id);
            setCustomerSearch(genericCustomer.name); // Sync search input
        } else {
            alert("No hay clientes registrados para venta rápida");
        }
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        if (!selectedCustomerId) {
            alert("Por favor selecciona un cliente o usa Venta Rápida");
            return;
        }
        if (!rate) {
            alert("No se pudo obtener la tasa de cambio");
            return;
        }

        const pCop = paidCop === '' ? 0 : paidCop;
        const pVes = paidVes === '' ? 0 : paidVes;
        const pVesInCop = convertVesToCop(pVes, rate.cop_to_ves);
        const totalPaidReal = pCop + pVesInCop;

        // Validation
        if (!isCredit) {
            // Contado: Must pay full amount (tolerance of 100 pesos maybe? usually exact)
            if (Math.abs(totalPaidReal - total) > 500) { // Small tolerance for rounding
                alert(`El pago total (${totalPaidReal.toLocaleString()}) no coincide con el total de la venta (${total.toLocaleString()})`);
                return;
            }
        } else {
            // Credit: Must pay less than total (otherwise it's cash sale) - allowing 0 down payment
            if (totalPaidReal >= total) {
                if (!confirm("El monto ingresado cubre el total de la venta. ¿Desea registrarla como Contado?")) return;
            }
        }

        const items = cart.map(item => ({
            product_id: item.product_id,
            color_id: item.color_id,
            quantity: item.quantity
        }));

        try {
            await createSale(
                selectedCustomerId,
                items,
                pCop,
                pVes,
                rate.cop_to_ves,
                isCredit
            );
            setCart([]);
            setSelectedCustomerId(0);
            setCustomerSearch(''); // Reset search
            // Reset to defaults
            setIsCredit(false);
            setPaidCop(0);
            setPaidVes(0);
            setIsCartOpen(false);
            alert("¡Venta realizada con éxito!");
        } catch (error) {
            console.error(error);
            alert("Error al realizar la venta");
        }
    };

    return (
        <div className="relative w-full h-full flex flex-col overflow-hidden bg-slate-50 dark:bg-[#0f111a] isolate">

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">

                {/* Product Search & Grid */}
                <div className="flex-1 flex flex-col min-w-0 min-h-0">

                    {/* Header: Search & Categories */}
                    <div className="p-4 bg-white dark:bg-[#1a1c2c] border-b border-slate-200 dark:border-slate-800 shadow-sm z-10 space-y-4">
                        <div className="flex gap-3">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={20} />
                                <input
                                    type="text"
                                    placeholder="Buscar producto..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-2.5 md:py-3.5 bg-slate-100 dark:bg-slate-900 border-none rounded-2xl text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-500 outline-none font-semibold transition-all text-base"
                                />
                            </div>

                            {/* View Mode Toggle */}
                            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 text-brand-500 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                                >
                                    <Grid size={20} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-800 text-brand-500 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                                >
                                    <List size={20} />
                                </button>
                            </div>

                            <button
                                onClick={handleQuickSale}
                                className="px-4 bg-brand-500/10 text-brand-500 rounded-2xl font-bold flex items-center gap-2 hover:bg-brand-500 hover:text-white transition-all active:scale-95"
                                title="Venta Rápida"
                            >
                                <Zap size={20} fill="currentColor" />
                                <span className="hidden sm:inline">Rápida</span>
                            </button>
                        </div>

                        {/* Category Tabs */}
                        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1 snap-x">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-1.5 rounded-xl text-sm font-black whitespace-nowrap transition-all ${selectedCategory === cat
                                        ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div
                        className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 custom-scrollbar pb-[140px] md:pb-6"
                        style={{ WebkitOverflowScrolling: 'touch' }}
                    >
                        {filteredProducts.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                    <Search size={40} />
                                </div>
                                <p className="font-bold text-lg">No se encontraron productos</p>
                            </div>
                        ) : viewMode === 'grid' ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
                                {filteredProducts.map(product => (
                                    <div
                                        key={product.id}
                                        className="group flex flex-col bg-white dark:bg-[#1a1c2c] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 hover:shadow-xl hover:shadow-brand-500/5 transition-all text-left relative overflow-hidden"
                                    >
                                        <div className="w-full aspect-square bg-slate-100 dark:bg-slate-800 rounded-xl mb-3 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform duration-300">
                                            {product.name.toLowerCase().includes('zapato') ? '👟' : '👕'}
                                        </div>
                                        <h3 className="font-bold text-slate-900 dark:text-white leading-tight text-sm mb-1 truncate" title={product.name}>
                                            {product.name}
                                        </h3>
                                        <div className="mb-2 font-black text-brand-500 text-lg">
                                            ${(product.price_cop / 1000).toLocaleString()}k
                                        </div>

                                        {/* Color Variants */}
                                        <div className="mt-auto flex flex-wrap gap-1.5 grayscale group-hover:grayscale-0 transition-all duration-300">
                                            {product.variants.map((variant: any) => (
                                                <button
                                                    key={variant.id}
                                                    onClick={() => addToCart(product, variant)}
                                                    disabled={variant.stock <= 0}
                                                    className={`w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center transition-transform hover:scale-110 active:scale-95 hover:z-10 ${variant.stock <= 0 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                                                    style={{ backgroundColor: variant.color_hex }}
                                                    title={`${variant.color_name} (${variant.stock})`}
                                                >
                                                    {variant.stock <= 0 && <span className="w-full h-0.5 bg-red-500 -rotate-45" />}
                                                </button>
                                            ))}
                                            {product.variants.length === 0 && (
                                                <span className="text-xs text-slate-400 italic">Sin variantes</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {filteredProducts.map(product => (
                                    <div key={product.id} className="bg-white dark:bg-[#1a1c2c] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 hover:border-brand-500 transition-colors">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">{product.name}</h3>
                                            <div className="text-brand-500 font-black text-xl">${product.price_cop.toLocaleString()}</div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 items-center sm:justify-end sm:max-w-[60%]">
                                            {product.variants.map((variant: any) => (
                                                <button
                                                    key={variant.id}
                                                    onClick={() => addToCart(product, variant)}
                                                    disabled={variant.stock <= 0}
                                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:border-brand-500 transition-all ${variant.stock <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                                                >
                                                    <span
                                                        className="w-4 h-4 rounded-full border border-black/10 shadow-sm"
                                                        style={{ backgroundColor: variant.color_hex }}
                                                    />
                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                        {variant.color_name}
                                                    </span>
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${variant.stock > 0 ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400' : 'bg-red-100 text-red-500'}`}>
                                                        {variant.stock}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar: Cart (Desktop only, hidden on mobile) */}
                <div className="hidden md:flex w-[320px] bg-white dark:bg-[#161826] border-l border-slate-200 dark:border-slate-800 flex-col shadow-2xl relative z-20">
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
                    />
                </div>
            </div>

            {/* Mobile Bottom Bar & Sheet */}
            <div className="md:hidden">
                {/* Floating Action Button / Summary Bar - Fixed Position above BottomNav */}
                <div className="fixed bottom-[60px] left-0 right-0 p-3 bg-white dark:bg-[#1a1c2c] border-t border-slate-200 dark:border-slate-800 flex items-center gap-3 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="flex-1 h-12 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 active:scale-95 transition-all"
                    >
                        <div className="relative">
                            <ShoppingCart size={20} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full border border-brand-500">
                                    {cartCount}
                                </span>
                            )}
                        </div>
                        <span>Pagar</span>
                        <span className="opacity-60 mx-0.5">·</span>
                        <span className="text-lg">${(total / 1000).toLocaleString()}k</span>
                    </button>
                    <button
                        onClick={() => setCart([])}
                        disabled={cart.length === 0}
                        className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl flex items-center justify-center active:scale-95 transition-all disabled:opacity-50"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>

                {/* Mobile Bottom Sheet Backdrop */}
                {isCartOpen && (
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] transition-opacity duration-300"
                        onClick={() => setIsCartOpen(false)}
                    />
                )}

                {/* Mobile Bottom Sheet Content */}
                <div className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-[#161826] rounded-t-[32px] z-[9999] transition-transform duration-500 ease-out transform ${isCartOpen ? 'translate-y-0' : 'translate-y-full'} h-[85dvh] flex flex-col shadow-2xl-top`}>
                    <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-4 shrink-0" />

                    <div className="px-6 pb-2 flex justify-between items-center shrink-0">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                            Ticket Actual
                        </h2>
                        <button
                            onClick={() => setIsCartOpen(false)}
                            className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:bg-slate-200"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar overscroll-contain">
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
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function CartContent({
    cart, setCart, total, isCredit, setIsCredit,
    selectedCustomerId, setSelectedCustomerId,
    customerSearch, setCustomerSearch,
    showCustomerList, setShowCustomerList,
    customers, handleCheckout, rate, isMobile = false,
    paidCop, setPaidCop, paidVes, setPaidVes, customerInputRef
}: any) {
    const handleCopChange = (val: string) => {
        const num = parseInt(val) || 0;
        setPaidCop(val === '' ? '' : num);

        // Auto-calc VES if in Contado mode to match total
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

        // Auto-calc COP if in Contado mode
        if (!isCredit && rate && val !== '') {
            const vesInCop = convertVesToCop(num, rate.cop_to_ves);
            const remaining = total - vesInCop;
            setPaidCop(Math.max(0, Math.round(remaining)));
        }
    };

    // Filter customers for autocomplete
    const filteredCustomers = useMemo(() => {
        if (!customerSearch) return [];
        return customers.filter((c: any) => c.name.toLowerCase().includes(customerSearch.toLowerCase()));
    }, [customers, customerSearch]);

    const currentTotalPaid = (paidCop === '' ? 0 : paidCop) + convertVesToCop((paidVes === '' ? 0 : paidVes), rate?.cop_to_ves || 1);
    const balance = total - currentTotalPaid;

    // Group items for display? Actually no, we want to split by variant as stored in cart
    // But we might want to sort them

    return (
        <div className="flex flex-col h-full">
            {!isMobile && (
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-[#1a1c2c]/50">
                    <h2 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                        <ShoppingCart className="text-brand-500" size={20} />
                        Ticket
                    </h2>
                    <button
                        onClick={() => setCart([])}
                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-2 rounded-xl transition-all active:scale-90"
                        disabled={cart.length === 0}
                        title="Limpiar Carrito"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 custom-scrollbar">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 py-10">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center">
                            <ShoppingCart size={32} className="opacity-20" />
                        </div>
                        <p className="font-bold text-center text-sm">Vacío</p>
                    </div>
                ) : (
                    cart.map((item: any, idx: number) => (
                        <div key={`${item.product_id}-${item.color_id}-${idx}`} className="flex flex-col gap-2 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all group">
                            <div className="flex justify-between items-start">
                                <div className="flex-1 min-w-0">
                                    <div className="font-black text-slate-800 dark:text-slate-100 text-sm truncate">{item.name}</div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <div
                                            className="w-3 h-3 rounded-full border border-black/10"
                                            style={{ backgroundColor: item.color_hex }}
                                        />
                                        <span className="text-xs text-slate-500">{item.color_name}</span>
                                    </div>
                                    <div className="text-xs font-bold text-slate-500 mt-1">${item.price.toLocaleString()}</div>
                                </div>

                                <div className="flex flex-col items-end gap-1">
                                    <div className="font-black text-slate-900 dark:text-white tx-sm">
                                        ${(item.price * item.quantity).toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-dashed border-slate-200 dark:border-slate-800">
                                <div className="text-[10px] font-bold text-slate-400">
                                    Stock: {item.stock_available}
                                </div>
                                <div className="flex items-center gap-1 bg-white dark:bg-slate-800 update-counter rounded-lg p-0.5 shadow-sm border border-slate-100 dark:border-slate-700">
                                    <button
                                        onClick={() => setCart((c: any) => {
                                            const newCart = [...c];
                                            if (newCart[idx].quantity > 1) {
                                                newCart[idx].quantity -= 1;
                                            } else {
                                                newCart.splice(idx, 1);
                                            }
                                            return newCart;
                                        })}
                                        className="w-7 h-7 flex items-center justify-center rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-90 transition-all"
                                    >
                                        <Minus size={14} strokeWidth={3} />
                                    </button>
                                    <span className="font-black w-6 text-center text-sm text-slate-900 dark:text-white">{item.quantity}</span>
                                    <button
                                        onClick={() => setCart((c: any) => {
                                            const newCart = [...c];
                                            if (newCart[idx].quantity < newCart[idx].stock_available) {
                                                newCart[idx].quantity += 1;
                                            } else {
                                                alert("Stock máximo alcanzado");
                                            }
                                            return newCart;
                                        })}
                                        className="w-7 h-7 flex items-center justify-center rounded-md text-brand-500 hover:bg-brand-500/10 active:scale-90 transition-all"
                                    >
                                        <Plus size={14} strokeWidth={3} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer/Checkout */}
            <div className={`p-4 bg-slate-50 dark:bg-[#1a1c2c] border-t border-slate-200 dark:border-slate-800 space-y-3 ${isMobile ? 'rounded-b-none safe-bottom' : ''}`}>

                {/* Client Autocomplete */}
                <div className="relative z-50">
                    <div className={`flex items-center bg-white dark:bg-slate-900 border-2 ${!selectedCustomerId ? 'border-amber-400/30' : 'border-slate-100 dark:border-slate-800'} rounded-xl transition-all focus-within:border-brand-500 group overflow-hidden`}>
                        <div className="pl-3 text-slate-400 group-focus-within:text-brand-500">
                            <User size={18} />
                        </div>
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
                            className="w-full bg-transparent border-none py-3 px-3 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 outline-none"
                        />
                        {selectedCustomerId !== 0 && (
                            <div className="pr-3 text-success-500">
                                <Check size={18} strokeWidth={3} />
                            </div>
                        )}
                    </div>

                    {showCustomerList && customerSearch && (
                        <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 max-h-48 overflow-y-auto custom-scrollbar animate-in slide-in-from-bottom-2 duration-200">
                            {filteredCustomers.length > 0 ? (
                                filteredCustomers.map((c: any) => (
                                    <button
                                        key={c.id}
                                        onClick={() => {
                                            setSelectedCustomerId(c.id);
                                            setCustomerSearch(c.name);
                                            setShowCustomerList(false);
                                        }}
                                        className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0"
                                    >
                                        <div className="font-bold text-sm text-slate-900 dark:text-white">{c.name}</div>
                                        <div className="text-xs text-slate-500">{c.phone || 'Sin teléfono'}</div>
                                    </button>
                                ))
                            ) : (
                                <div className="p-3 text-center text-sm text-slate-400">
                                    No se encontraron clientes
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Payment Method Toggle */}
                <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-100 dark:border-slate-800">
                    <button
                        onClick={() => setIsCredit(false)}
                        className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${!isCredit
                            ? 'bg-success-500 text-white shadow-md shadow-success-500/25'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                            }`}
                    >
                        Contado
                    </button>
                    <button
                        onClick={() => setIsCredit(true)}
                        className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${isCredit
                            ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                            }`}
                    >
                        Crédito
                    </button>
                </div>

                {/* Subtotals & Total */}
                <div className="space-y-1 px-1">
                    {/* Compact Payment Inputs */}
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">COP</span>
                            <input
                                type="number"
                                value={paidCop === 0 ? '' : paidCop}
                                onChange={e => handleCopChange(e.target.value)}
                                className="w-full pl-8 pr-2 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-right font-bold text-sm outline-none focus:border-brand-500 transition-colors"
                                placeholder="0"
                            />
                        </div>
                        <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">Bs</span>
                            <input
                                type="number"
                                value={paidVes === 0 ? '' : paidVes}
                                onChange={e => handleVesChange(e.target.value)}
                                className="w-full pl-8 pr-2 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-right font-bold text-sm outline-none focus:border-brand-500 transition-colors"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="flex justify-between items-end border-t border-slate-200 dark:border-slate-800 pt-2">
                        <div className="text-left">
                            <div className="text-[10px] font-black text-slate-400 uppercase">Total</div>
                            <div className="text-2xl font-black text-brand-500 tracking-tighter leading-none">
                                ${(total / 1000).toLocaleString()}k
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] font-bold text-slate-400 mb-0.5">
                                {cart.reduce((acc: number, item: any) => acc + item.quantity, 0)} Items
                            </div>
                            {isCredit && (
                                <div className="text-xs font-black text-red-500">
                                    Bal: ${Math.max(0, balance).toLocaleString()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleCheckout}
                    disabled={cart.length === 0 || !selectedCustomerId}
                    className={`w-full py-3.5 rounded-xl font-black text-lg shadow-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${cart.length === 0 || !selectedCustomerId
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
                        : isCredit
                            ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-amber-500/25'
                            : 'bg-brand-500 hover:bg-brand-400 text-white shadow-brand-500/25'
                        }`}
                >
                    <CreditCard size={20} strokeWidth={2.5} />
                    {isMobile ? 'Cobrar' : (isCredit ? 'Crédito' : 'Cobrar')}
                </button>
            </div>
        </div>
    );
}
