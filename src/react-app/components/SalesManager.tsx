import { useState } from 'react';
import { Plus, Trash2, Check, X, ShoppingCart } from 'lucide-react';
import { useSales } from '@/react-app/hooks/useSales';
import { useCustomers } from '@/react-app/hooks/useCustomers';
import { useProducts } from '@/react-app/hooks/useProducts';
import { useExchangeRate, convertCopToVes } from '@/react-app/hooks/useExchangeRate';

export default function SalesManager() {
  const { sales, createSale, deleteSale } = useSales();
  const { customers, createCustomer } = useCustomers();
  const { products } = useProducts();
  const { rate } = useExchangeRate();
  const [showForm, setShowForm] = useState(false);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({ name: '', phone: '' });
  const [formData, setFormData] = useState({
    customer_id: 0,
    items: [] as { product_id: number; color_id: number; quantity: number }[],
    paid_cop: 0,
    paid_ves: 0,
    is_credit: false
  });

  const handleCreateCustomer = async () => {
    const customer = await createCustomer(newCustomerData.name, newCustomerData.phone);
    setFormData({ ...formData, customer_id: customer.id });
    setShowNewCustomer(false);
    setNewCustomerData({ name: '', phone: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rate) return;

    await createSale(
      formData.customer_id,
      formData.items,
      formData.paid_cop,
      formData.paid_ves,
      rate.cop_to_ves,
      formData.is_credit
    );
    setFormData({ customer_id: 0, items: [], paid_cop: 0, paid_ves: 0, is_credit: false });
    setShowForm(false);
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product_id: 0, color_id: 0, quantity: 1 }]
    });
  };

  const updateItem = (index: number, field: string, value: number) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const getProductVariants = (productId: number) => {
    const product = products.find(p => p.id === productId);
    return product?.variants || [];
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => {
      const product = products.find(p => p.id === item.product_id);
      return sum + (product?.price_cop || 0) * item.quantity;
    }, 0);
  };

  return (
    <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 shadow-soft border border-white/20 dark:border-gray-800">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">Ventas</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Registra y consulta las ventas realizadas</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl shadow-lg shadow-green-500/20 hover:shadow-green-500/30 hover:scale-[1.02] transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Nueva Venta</span>
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 animate-fade-in ring-1 ring-gray-900/5 dark:ring-white/10">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Cliente</label>
            <div className="flex gap-3">
              <select
                value={formData.customer_id}
                onChange={(e) => setFormData({ ...formData, customer_id: parseInt(e.target.value) })}
                className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                required
              >
                <option value={0}>Seleccionar cliente</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} {customer.phone && `- ${customer.phone}`}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowNewCustomer(!showNewCustomer)}
                className="px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-xl hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors font-medium border border-primary-200 dark:border-primary-800"
              >
                + Nuevo
              </button>
            </div>
          </div>

          {showNewCustomer && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3 animate-slide-in">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nombre del Cliente"
                  value={newCustomerData.name}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="Teléfono"
                  value={newCustomerData.phone}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleCreateCustomer}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition font-medium text-sm"
              >
                Guardar Cliente
              </button>
            </div>
          )}

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Productos</label>
              <button
                type="button"
                onClick={addItem}
                className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Agregar Producto
              </button>
            </div>
            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-3 animate-slide-in p-3 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-gray-100 dark:border-gray-800/50">
                  <select
                    value={item.product_id}
                    onChange={(e) => updateItem(index, 'product_id', parseInt(e.target.value))}
                    className="flex-[2] px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                    required
                  >
                    <option value={0}>Seleccionar producto</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>{product.name}</option>
                    ))}
                  </select>
                  <select
                    value={item.color_id}
                    onChange={(e) => updateItem(index, 'color_id', parseInt(e.target.value))}
                    className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                    required
                    disabled={!item.product_id}
                  >
                    <option value={0}>Color</option>
                    {getProductVariants(item.product_id).map((variant) => (
                      <option key={variant.id} value={variant.color_id}>
                        {variant.color_name} ({variant.stock})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-20 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                    min="1"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors self-end md:self-auto"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-primary-50 dark:bg-primary-900/10 rounded-xl p-5 border border-primary-100 dark:border-primary-800/30 mb-6">
            <div className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-primary-600 dark:text-primary-400">Total:</span>
              ${calculateTotal().toLocaleString()} <span className="text-sm font-normal text-gray-500">COP</span>
              {rate && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  / {convertCopToVes(calculateTotal(), rate.cop_to_ves).toLocaleString()} Bs
                </span>
              )}
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Pago en COP</label>
                <input
                  type="number"
                  value={formData.paid_cop}
                  onChange={(e) => setFormData({ ...formData, paid_cop: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Pago en VES</label>
                <input
                  type="number"
                  value={formData.paid_ves}
                  onChange={(e) => setFormData({ ...formData, paid_ves: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <label className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-white dark:hover:bg-gray-800 transition-colors">
              <input
                type="checkbox"
                checked={formData.is_credit}
                onChange={(e) => setFormData({ ...formData, is_credit: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="font-medium text-gray-700 dark:text-gray-200">Registrar como venta a crédito</span>
            </label>
          </div>

          <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl shadow-lg shadow-green-500/20 hover:shadow-green-500/30 hover:scale-[1.02] transition-all duration-200 font-medium ml-auto"
            >
              <Check className="w-5 h-5" />
              Confirmar Venta
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setFormData({ customer_id: 0, items: [], paid_cop: 0, paid_ves: 0, is_credit: false });
              }}
              className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              <X className="w-5 h-5" />
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {sales.map((sale) => (
          <div key={sale.id} className="group bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-600 dark:text-primary-400">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">{sale.customer_name}</h4>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {new Date(sale.created_at).toLocaleDateString('es-CO')} • {new Date(sale.created_at).toLocaleTimeString('es-CO')}
                    </div>
                  </div>
                  {sale.is_credit && (
                    <span className="ml-2 px-2.5 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-bold rounded-full border border-orange-200 dark:border-orange-800">
                      Crédito
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => deleteSale(sale.id)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 mb-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3">
              {sale.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full border border-gray-200 dark:border-gray-600"
                      style={{ backgroundColor: item.color_hex }}
                    />
                    <span className="font-medium text-gray-900 dark:text-white">{item.product_name}</span>
                    <span className="text-gray-500 dark:text-gray-400">({item.color_name})</span>
                    <span className="text-gray-400">×</span>
                    <span className="font-bold text-gray-700 dark:text-gray-300">{item.quantity}</span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">${item.price_cop.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
              <div className="text-sm">
                <p className="text-gray-500 dark:text-gray-400">Pagado</p>
                <p className="text-green-600 dark:text-green-400 font-medium">
                  ${sale.paid_cop.toLocaleString()} <span className="text-xs text-gray-400">COP</span> + {sale.paid_ves.toFixed(2)} <span className="text-xs text-gray-400">Bs</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Venta</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  ${sale.total_cop.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
        {sales.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500 bg-gray-50/50 dark:bg-gray-900/20 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
            <ShoppingCart className="w-12 h-12 mb-4 opacity-50" />
            <p className="font-medium">No hay ventas registradas</p>
          </div>
        )}
      </div>
    </div>
  );
}
