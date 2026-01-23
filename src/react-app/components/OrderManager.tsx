import { useState, useMemo, useRef } from 'react';
import {
    Plus, Check, X, User,
    CheckCircle2, Package as PackageIcon, Truck,
    DollarSign, Loader2, Trash2
} from 'lucide-react';
import { useOrders } from '@/react-app/hooks/useOrders';
import { useProducts } from '@/react-app/hooks/useProducts';
import { useCustomers } from '@/react-app/hooks/useCustomers';
import { useColors } from '@/react-app/hooks/useColors';
import { usePackages } from '@/react-app/hooks/usePackages';
import { useExchangeRate } from '@/react-app/hooks/useExchangeRate';
import { useToastContext } from '@/react-app/context/ToastContext';

export default function OrderManager() {
    const { orders, createOrder, updateItemStatus, closePackageFromOrders, deliverOrderItems, deleteOrder, deleteOrderItem } = useOrders();
    const { products } = useProducts();
    const { customers } = useCustomers();
    const { colors } = useColors();
    const { packages } = usePackages();
    const { rate } = useExchangeRate();
    const toast = useToastContext();

    const [activeTab, setActiveTab] = useState<'picking' | 'delivery'>('picking');
    const [showForm, setShowForm] = useState(false);
    const [colorSearch, setColorSearch] = useState<Record<number, string>>({});
    const [activeColorIdx, setActiveColorIdx] = useState<number | null>(null);
    const [showBatchModal, setShowBatchModal] = useState(false);
    const [isDelivering, setIsDelivering] = useState<number | null>(null);
    const [deliveryModal, setDeliveryModal] = useState<{
        visible: boolean;
        customerId: number | null;
        items: any[];
        isCredit: boolean;
        totalToPay: number;
        prepayment: number;
    } | null>(null);
    const [extraPayment, setExtraPayment] = useState(0);

    const [formData, setFormData] = useState({
        customer_id: 0 as number | null,
        note: '',
        prepayment_cop: 0,
        items: [] as { product_id: number; color_id: number; quantity: number }[]
    });

    const [batchData, setBatchData] = useState({ name: '', total_ves: 0 });
    const [customerSearch, setCustomerSearch] = useState('');
    const [showCustomerList, setShowCustomerList] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);

    const prepaymentRef = useRef<HTMLInputElement>(null);
    const noteRef = useRef<HTMLInputElement>(null);

    const filteredCustomers = useMemo(() => {
        return customers.filter((c: any) =>
            c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
            (c.phone && c.phone.includes(customerSearch))
        );
    }, [customers, customerSearch]);

    const handleCustomerKeyDown = (e: React.KeyboardEvent) => {
        if (!showCustomerList) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex(prev => Math.min(prev + 1, filteredCustomers.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex(prev => Math.max(prev - 1, -1)); // -1 for "STOCK"
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (highlightedIndex === -1) {
                setFormData({ ...formData, customer_id: null });
                setCustomerSearch('STOCK (TIENDA)');
                setShowCustomerList(false);
                prepaymentRef.current?.focus();
            } else if (filteredCustomers[highlightedIndex]) {
                const c = filteredCustomers[highlightedIndex];
                setFormData({ ...formData, customer_id: c.id });
                setCustomerSearch(c.name);
                setShowCustomerList(false);
                prepaymentRef.current?.focus();
            }
        } else if (e.key === 'Escape') {
            setShowCustomerList(false);
        }
    };

    const handleSubmitOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        const finalItems = formData.items.filter(i => i.quantity > 0 && i.product_id > 0);
        if (finalItems.length === 0) {
            toast.warning("Agregue productos antes de confirmar");
            return;
        }

        try {
            await createOrder(formData.customer_id === 0 ? null : formData.customer_id, finalItems, formData.note, formData.prepayment_cop);
            toast.success("¡Pedido creado con éxito!");
            resetForm();
        } catch (err) {
            console.error(err);
            toast.error("Error al crear el pedido");
        }
    };

    const resetForm = () => {
        setFormData({ customer_id: 0, note: '', prepayment_cop: 0, items: [] });
        setCustomerSearch('');
        setShowForm(false);
    };

    const handleClosePackage = async () => {
        const purchasedItems = flattenedOrderItems.filter(i => i.is_purchased && !i.package_id);
        if (purchasedItems.length === 0) {
            toast.warning("No hay items marcados como comprados");
            return;
        }
        if (!batchData.name) {
            toast.warning("Escribe un nombre para el paquete");
            return;
        }

        try {
            await closePackageFromOrders(batchData.name, batchData.total_ves, purchasedItems.map(i => i.id));
            setShowBatchModal(false);
            setBatchData({ name: '', total_ves: 0 });
            toast.success("¡Paquete consolidado con éxito!");
        } catch (err) {
            console.error(err);
            toast.error("Error al consolidar el paquete");
        }
    };

    const handleDeliver = (customerId: number | null, items: any[], isCredit: boolean, totalToPay: number, prepayment: number) => {
        if (!rate || isDelivering) return;
        setDeliveryModal({
            visible: true,
            customerId,
            items,
            isCredit,
            totalToPay,
            prepayment
        });
        setExtraPayment(0);
    };

    const confirmDelivery = async () => {
        if (!deliveryModal || !rate || isDelivering) return;

        setIsDelivering(deliveryModal.customerId as any);
        try {
            const orderIds = Array.from(new Set(deliveryModal.items.map((i: any) => i.order_id)));
            const itemIds = deliveryModal.items.map((i: any) => i.id);
            await deliverOrderItems(orderIds, itemIds, deliveryModal.isCredit, rate.cop_to_ves, extraPayment);
            setDeliveryModal(null);
            toast.success("¡Entrega procesada con éxito!");
        } catch (err) {
            console.error(err);
            toast.error("Error al procesar la entrega");
        } finally {
            setIsDelivering(null);
        }
    };

    const flattenedOrderItems = useMemo(() => {
        const list: any[] = [];
        orders.forEach(order => {
            order.items.forEach(item => {
                const pkg = item.package_id ? packages.find(p => p.id === item.package_id) : null;
                list.push({
                    ...item,
                    customer_name: order.customer_name,
                    customer_id: order.customer_id,
                    order_id: order.id,
                    order_note: order.note,
                    order_prepayment: order.prepayment_cop,
                    order_date: order.created_at,
                    package_name: pkg?.name,
                    package_status: pkg?.status
                });
            });
        });
        return list.sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());
    }, [orders, packages]);

    const pickingItems = useMemo(() => flattenedOrderItems.filter(i => !i.package_id), [flattenedOrderItems]);

    const deliveryItemsByCustomer = useMemo(() => {
        const deliverable = flattenedOrderItems.filter(i => i.package_id && i.package_status === 'Entregado');
        const groups: { [key: string]: any[] } = {};
        deliverable.forEach(item => {
            const groupKey = item.customer_id ? item.customer_id.toString() : 'stock';
            if (!groups[groupKey]) groups[groupKey] = [];
            groups[groupKey].push(item);
        });
        return groups;
    }, [flattenedOrderItems]);

    const purchasedCount = pickingItems.filter(i => i.is_purchased).length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1" />


                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
                    <button
                        onClick={() => setActiveTab('picking')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'picking' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        Picking ({pickingItems.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('delivery')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'delivery' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        Entregas ({Object.keys(deliveryItemsByCustomer).length})
                    </button>
                </div>

                {!showForm && activeTab === 'picking' && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="btn btn-primary gap-2 px-6"
                    >
                        <Plus size={18} />
                        <span>Nuevo Pedido</span>
                    </button>
                )}
            </div>

            {showForm && (
                <div className="card p-6 animate-fade-in shadow-lg">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <Plus size={20} className="text-slate-500" />
                            Registrar Pedido
                        </h4>
                        <button type="button" onClick={resetForm} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmitOrder}>
                        <div className="grid md:grid-cols-3 gap-6 mb-6">
                            <div className="relative">
                                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 px-1">Cliente</label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                    <input
                                        type="text"
                                        value={customerSearch}
                                        onChange={(e) => {
                                            setCustomerSearch(e.target.value);
                                            setShowCustomerList(true);
                                            setHighlightedIndex(0);
                                        }}
                                        onFocus={() => setShowCustomerList(true)}
                                        onKeyDown={handleCustomerKeyDown}
                                        className="input pl-11"
                                        placeholder="Buscar cliente..."
                                    />
                                </div>
                                {showCustomerList && (
                                    <div className="absolute z-[60] w-full mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 max-h-60 overflow-y-auto custom-scrollbar">
                                        <button
                                            type="button"
                                            onClick={() => { setFormData({ ...formData, customer_id: null }); setCustomerSearch('STOCK (TIENDA)'); setShowCustomerList(false); }}
                                            className={`w-full flex items-center gap-3 px-4 py-2.5 border-b border-slate-100 dark:border-slate-700 transition-colors ${highlightedIndex === -1 ? 'bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400'}`}
                                        >
                                            <PackageIcon size={14} />
                                            <span className="font-semibold text-sm">INVENTARIO DE TIENDA</span>
                                        </button>
                                        {filteredCustomers.map((c, idx) => (
                                            <button
                                                key={c.id}
                                                type="button"
                                                onClick={() => {
                                                    setFormData({ ...formData, customer_id: c.id });
                                                    setCustomerSearch(c.name);
                                                    setShowCustomerList(false);
                                                    prepaymentRef.current?.focus();
                                                }}
                                                className={`w-full flex items-center justify-between px-4 py-2.5 border-b border-slate-50 dark:border-slate-700/50 last:border-none transition-colors ${idx === highlightedIndex ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400'}`}
                                            >
                                                <span className="font-medium text-sm">{c.name}</span>
                                                <span className="text-[10px] opacity-70 font-medium">{c.phone}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 px-1">Abono Inicial (COP)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                    <input
                                        ref={prepaymentRef}
                                        type="number"
                                        value={formData.prepayment_cop || ''}
                                        onChange={(e) => setFormData({ ...formData, prepayment_cop: parseInt(e.target.value) || 0 })}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                noteRef.current?.focus();
                                            }
                                        }}
                                        className="input pl-11"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 px-1">Nota / Referencia</label>
                                <input
                                    ref={noteRef}
                                    type="text"
                                    value={formData.note}
                                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const firstSelect = e.currentTarget.closest('form')?.querySelector('select');
                                            if (firstSelect instanceof HTMLSelectElement) firstSelect.focus();
                                        }
                                    }}
                                    className="input w-full"
                                    placeholder="Ej. Talla M, etc."
                                />
                            </div>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="flex items-center justify-between">
                                <h5 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider px-1">Items del Pedido</h5>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, items: [...formData.items, { product_id: 0, color_id: -1, quantity: 1 }] })}
                                    className="btn btn-secondary py-1.5 text-xs h-auto"
                                >
                                    <Plus size={14} className="mr-1" /> Añadir Item
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {formData.items.map((item, idx) => (
                                    <div key={idx} className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl relative flex flex-col gap-3 group border border-slate-200 dark:border-slate-700">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, items: formData.items.filter((_, i) => i !== idx) })}
                                            className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 z-10"
                                        >
                                            <X size={14} />
                                        </button>

                                        <select
                                            className="select"
                                            value={item.product_id}
                                            onChange={(e) => {
                                                const newItems = [...formData.items];
                                                newItems[idx].product_id = parseInt(e.target.value);
                                                setFormData({ ...formData, items: newItems });
                                            }}
                                        >
                                            <option value="0">Seleccionar Producto...</option>
                                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>

                                        <div className="flex gap-2">
                                            <div className="relative min-w-60 flex-1">
                                                <div
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-slate-200"
                                                    style={{ backgroundColor: colors.find((c: any) => c.id === item.color_id)?.hex_code || 'transparent' }}
                                                />
                                                <input
                                                    type="text"
                                                    value={colorSearch[idx] !== undefined ? colorSearch[idx] : (colors.find((c: any) => c.id === item.color_id)?.name || '')}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setColorSearch({ ...colorSearch, [idx]: val });
                                                        setActiveColorIdx(idx);
                                                    }}
                                                    onFocus={() => setActiveColorIdx(idx)}
                                                    placeholder="Color..."
                                                    className="input pl-11"
                                                />
                                                {activeColorIdx === idx && colorSearch[idx] !== undefined && (
                                                    <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 max-h-40 overflow-y-auto z-[30]">
                                                        {colors
                                                            .filter((c: any) => c.name.toLowerCase().includes(colorSearch[idx].toLowerCase()))
                                                            .map((c: any) => (
                                                                <button
                                                                    key={c.id}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const newItems = [...formData.items];
                                                                        newItems[idx].color_id = c.id;
                                                                        setFormData({ ...formData, items: newItems });
                                                                        setColorSearch({ ...colorSearch, [idx]: c.name });
                                                                        setActiveColorIdx(null);
                                                                    }}
                                                                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                                                                >
                                                                    <div className="w-3 h-3 rounded-full border border-slate-200" style={{ backgroundColor: c.hex_code }} />
                                                                    {c.name}
                                                                </button>
                                                            ))}
                                                    </div>
                                                )}
                                            </div>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity || ''}
                                                onChange={(e) => {
                                                    const newItems = [...formData.items];
                                                    newItems[idx].quantity = parseInt(e.target.value) || 0;
                                                    setFormData({ ...formData, items: newItems });
                                                }}
                                                placeholder="Cant"
                                                className="input w-16 text-center px-1"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <button type="button" onClick={resetForm} className="btn btn-ghost">Cancelar</button>
                            <button type="submit" className="btn btn-primary px-10">
                                Confirmar Orden
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {activeTab === 'picking' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-semibold rounded-full uppercase tracking-wider">
                                {purchasedCount} / {pickingItems.length} Adquiridos
                            </span>
                        </div>
                        {purchasedCount > 0 && (
                            <button
                                onClick={() => setShowBatchModal(true)}
                                className="btn btn-primary py-1.5 text-xs h-auto gap-2"
                            >
                                <PackageIcon size={14} /> Consolidar Paquete
                            </button>
                        )}
                    </div>

                    <div className="card overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Prenda</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Color</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cant</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Abono</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {pickingItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                            No hay pedidos pendientes de recolección
                                        </td>
                                    </tr>
                                ) : pickingItems.map((item: any) => (
                                    <tr key={item.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => updateItemStatus(item.id, !item.is_purchased)}
                                                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${item.is_purchased
                                                    ? 'bg-emerald-500 text-white shadow-md'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                                    }`}
                                            >
                                                <Check size={18} />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className={`text-sm font-medium ${!item.customer_id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                                                    {item.customer_name || '📦 STOCK TIENDA'}
                                                </span>
                                                <span className="text-xs text-slate-500">
                                                    {new Date(item.order_date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-200">
                                            {item.product_name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full border border-slate-200 dark:border-slate-700" style={{ backgroundColor: item.color_hex }} />
                                                <span className="text-xs">{item.color_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">x{item.quantity}</td>
                                        <td className="px-6 py-4 text-right">
                                            {item.order_prepayment > 0 && (
                                                <span className="text-xs font-semibold px-2 py-1 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 rounded">
                                                    ${item.order_prepayment.toLocaleString()}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'delivery' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.keys(deliveryItemsByCustomer).length === 0 ? (
                        <div className="col-span-full py-20 text-center text-slate-400 card">
                            No hay entregas listas por procesar
                        </div>
                    ) : Object.keys(deliveryItemsByCustomer).map(customerKey => {
                        const items = deliveryItemsByCustomer[customerKey];
                        const customerName = items[0].customer_name || 'STOCK TIENDA';
                        const isStock = customerKey === 'stock';

                        const uniqueOrders = Array.from(new Set(items.map((i: any) => i.order_id)));
                        const totalPrepayment = uniqueOrders.reduce((sum: number, id: number) => {
                            const order = orders.find(o => o.id === id);
                            return sum + (order?.prepayment_cop || 0);
                        }, 0);

                        const totalToPay = items.reduce((acc: number, curr: any) => {
                            const product = products.find(p => p.id === curr.product_id);
                            return acc + (curr.quantity * (product?.price_cop || 0));
                        }, 0);

                        return (
                            <div key={customerKey} className="card flex flex-col shadow-sm">
                                <div className="p-5 flex-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isStock ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                {isStock ? <PackageIcon size={20} /> : <Truck size={20} />}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{customerName}</h4>
                                                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                                                    {items.length} prendas listas
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-6">
                                        {items.map((item: any, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between text-xs py-2 group">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-slate-400">{item.quantity}x</span>
                                                    <span className="text-slate-700 dark:text-slate-200">{item.product_name}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => {
                                                            deleteOrderItem(item.id);
                                                            toast.remove("Item eliminado del pedido");
                                                        }}
                                                        className="p-1 text-slate-400 hover:text-red-500 rounded"
                                                        title="Remover"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                    <div className="w-2.5 h-2.5 rounded-full border border-slate-200" style={{ backgroundColor: item.color_hex }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg space-y-1.5 border border-slate-100 dark:border-slate-800">
                                        <div className="flex justify-between text-[11px] text-slate-500">
                                            <span>Subtotal</span>
                                            <span>${totalToPay.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-[11px] text-emerald-600 font-medium">
                                            <span>Abonos</span>
                                            <span>-${totalPrepayment.toLocaleString()}</span>
                                        </div>
                                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center mt-1">
                                            <span className="text-xs font-semibold uppercase text-slate-900 dark:text-white">Saldo</span>
                                            <span className="text-base font-bold text-slate-900 dark:text-white">
                                                ${(totalToPay - totalPrepayment).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                                    {isStock ? (
                                        <button
                                            onClick={() => {
                                                uniqueOrders.forEach(id => deleteOrder(id));
                                                toast.success("Items ingresados al stock");
                                            }}
                                            className="btn btn-primary w-full text-xs py-2 shadow-none"
                                        >
                                            <CheckCircle2 size={14} className="mr-2" /> Ingresar a Stock
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleDeliver(parseInt(customerKey), items, false, totalToPay, totalPrepayment)}
                                                className="btn btn-secondary flex-1 text-xs py-2"
                                            >
                                                Contado
                                            </button>
                                            <button
                                                onClick={() => handleDeliver(parseInt(customerKey), items, true, totalToPay, totalPrepayment)}
                                                className="btn btn-primary flex-1 text-xs py-2 shadow-none"
                                            >
                                                Apartado
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modals */}
            {showBatchModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="card w-full max-w-sm shadow-2xl p-6">
                        <h3 className="text-lg font-semibold mb-4">Consolidar Paquete</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase tracking-widest mb-1.5">Nombre del Paquete</label>
                                <input
                                    type="text"
                                    autoFocus
                                    value={batchData.name}
                                    onChange={(e) => setBatchData({ ...batchData, name: e.target.value })}
                                    className="input w-full"
                                    placeholder="Ej. Paquete Enero #1"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase tracking-widest mb-1.5">Total Costo (VES) Opcional</label>
                                <input
                                    type="number"
                                    value={batchData.total_ves || ''}
                                    onChange={(e) => setBatchData({ ...batchData, total_ves: parseInt(e.target.value) || 0 })}
                                    className="input w-full"
                                    placeholder="0"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button onClick={() => setShowBatchModal(false)} className="btn btn-ghost flex-1">Cancelar</button>
                                <button onClick={handleClosePackage} className="btn btn-primary flex-1">Crear</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {deliveryModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="card w-full max-w-sm shadow-2xl p-6">
                        <div className="text-center mb-6">
                            <h3 className="text-lg font-semibold">{deliveryModal.isCredit ? 'Confirmar Apartado' : 'Confirmar Entrega'}</h3>
                            <p className="text-sm text-slate-500 mt-1">Balance final para el cliente</p>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg space-y-3 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Monto Pendiente</span>
                                <span className="font-semibold">${(deliveryModal.totalToPay - deliveryModal.prepayment).toLocaleString()}</span>
                            </div>
                            {deliveryModal.isCredit && (
                                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                                    <label className="block text-xs font-medium text-slate-500 uppercase mb-1.5">Abono adicional hoy</label>
                                    <input
                                        type="number"
                                        autoFocus
                                        value={extraPayment || ''}
                                        onChange={(e) => setExtraPayment(parseInt(e.target.value) || 0)}
                                        className="input w-full text-lg font-semibold"
                                        placeholder="0"
                                    />
                                    <div className="flex justify-between text-sm mt-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                                        <span className="text-slate-500">Saldo Restante</span>
                                        <span className="font-bold text-blue-600">${(deliveryModal.totalToPay - deliveryModal.prepayment - extraPayment).toLocaleString()}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setDeliveryModal(null)} className="btn btn-ghost flex-1">Cancelar</button>
                            <button
                                onClick={confirmDelivery}
                                disabled={isDelivering !== null}
                                className="btn btn-primary flex-1"
                            >
                                {isDelivering !== null ? <Loader2 className="animate-spin inline mr-2" size={16} /> : 'Confirmar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
