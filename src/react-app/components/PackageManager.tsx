import { useState } from 'react';
import { Plus, Trash2, Check, X, Package as PackageIcon, Pencil, Info, Copy } from 'lucide-react';
import { usePackages } from '@/react-app/hooks/usePackages';
import { useProducts } from '@/react-app/hooks/useProducts';

export default function PackageManager() {
  const { packages, createPackage, updatePackage, deletePackage } = usePackages();
  const { products } = useProducts();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    items: [] as { product_id: number; color_id: number; quantity: number }[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updatePackage(editingId, { name: formData.name, items: formData.items });
      } else {
        await createPackage(formData.name, formData.items);
      }
      resetForm();
    } catch (error) {
      console.error("Error saving package", error);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', items: [] });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (pkg: any) => {
    setEditingId(pkg.id);
    setFormData({
      name: pkg.name,
      items: pkg.items.map((i: any) => ({
        product_id: i.product_id,
        color_id: i.color_id,
        quantity: i.quantity
      }))
    });
    setShowForm(true);
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

  const handleCopy = (pkg: any) => {
    let cont = 1;
    const itemsText = pkg.items.map((item: any) => {
      return `${cont++}. ${item.product_name} - Color ${item.color_name} - ${item.quantity} ${item.quantity === 1 ? 'unidad' : 'unidades'}`

    }).join('\n');

    const text = `${pkg.name}\nHola, quisiera realizar el siguiente pedido\n${itemsText}`;

    navigator.clipboard.writeText(text);
    setCopiedId(pkg.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getProductVariants = (productId: number) => {
    const product = products.find(p => p.id === productId);
    return product?.variants || [];
  };

  const statusColors = {
    Armado: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800',
    Enviado: 'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 border-sky-100 dark:border-sky-800',
    Entregado: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800'
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <PackageIcon className="w-8 h-8 text-brand-500" />
            Gestión de Paquetes
          </h3>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
            Control de envíos y recepción de mercancía
          </p>
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 transform hover:scale-[1.02] transition-all duration-200 font-bold"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Paquete</span>
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white dark:bg-gray-700 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-600 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">
              {editingId ? 'Editar Paquete' : 'Crear Nuevo Paquete'}
            </h4>
            <button type="button" onClick={resetForm} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nombre / Referencia</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium"
                placeholder="Ej. Pedido #123 - Agosto"
                required
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Contenido del Paquete</label>
                <button
                  type="button"
                  onClick={addItem}
                  className="text-sm font-bold text-brand-500 hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Item
                </button>
              </div>

              {formData.items.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl text-gray-400">
                  <p className="text-sm">Agrega productos al paquete</p>
                </div>
              )}

              {formData.items.map((item, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-600 animate-in fade-in slide-in-from-left-2 items-start md:items-center">
                  <div className="flex-1 w-full md:w-auto">
                    <select
                      value={item.product_id}
                      onChange={(e) => updateItem(index, 'product_id', parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm font-medium"
                      required
                    >
                      <option value={0}>Seleccionar producto...</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>{product.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1 w-full md:w-auto">
                    <select
                      value={item.color_id}
                      onChange={(e) => updateItem(index, 'color_id', parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm font-medium disabled:opacity-50"
                      required
                      disabled={!item.product_id}
                    >
                      <option value={0}>Color</option>
                      {getProductVariants(item.product_id).map((variant) => (
                        <option key={variant.id} value={variant.color_id}>
                          {variant.color_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-24">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm font-medium text-center"
                      min="1"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100 dark:border-gray-600">
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2.5 font-bold text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl shadow-lg shadow-brand-500/20 font-bold transition-all transform active:scale-95"
            >
              <Check className="w-5 h-5" />
              {editingId ? 'Guardar Cambios' : 'Crear Paquete'}
            </button>
          </div>
        </form>
      )}

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div key={pkg.id} className="group bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl hover:border-brand-500/30 transition-all duration-300 flex flex-col">

            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`p-2.5 rounded-xl ${statusColors[pkg.status as keyof typeof statusColors]} bg-opacity-20`}>
                  <PackageIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white truncate" title={pkg.name}>{pkg.name}</h4>
                  <span className="text-xs text-gray-400 font-medium">
                    {new Date(pkg.created_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleCopy(pkg)}
                  className={`p-2 rounded-lg transition-colors ${copiedId === pkg.id ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20'}`}
                  title="Copiar pedido"
                >
                  {copiedId === pkg.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleEdit(pkg)}
                  className="p-2 text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors"
                  title="Editar paquete"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deletePackage(pkg.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Eliminar paquete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 mb-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3 space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Contenido ({pkg.items.length})</p>
              {pkg.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm group/item">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-3 h-3 rounded-full ring-1 ring-black/5 dark:ring-white/10 flex-shrink-0"
                      style={{ backgroundColor: item.color_hex }}
                      title={item.color_name}
                    />
                    <span className="text-gray-600 dark:text-gray-300 truncate font-medium">{item.product_name}</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-800 px-2 py-0.5 rounded-md text-xs shadow-sm border border-gray-100 dark:border-gray-700">
                    x{item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="relative">
                <select
                  value={pkg.status}
                  onChange={(e) => updatePackage(pkg.id, { status: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm font-bold border-2 cursor-pointer appearance-none transition-all outline-none focus:ring-2 focus:ring-offset-1 focus:ring-brand-500 dark:focus:ring-offset-gray-800 ${pkg.status === 'Entregado'
                    ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
                    : pkg.status === 'Enviado'
                      ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400'
                      : 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400'
                    }`}
                >
                  <option value="Armado">📦 Armado</option>
                  <option value="Enviado">✈️ Enviado</option>
                  <option value="Entregado">✅ Entregado (Inventario)</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Info className="w-4 h-4 opacity-50" />
                </div>
              </div>
              {pkg.status === 'Entregado' && (
                <p className="text-[10px] text-green-600 dark:text-green-400 text-center mt-2 font-medium bg-green-50 dark:bg-green-900/20 py-1 rounded-lg">
                  Los productos han sido cargados al inventario
                </p>
              )}
            </div>
          </div>
        ))}

        {packages.length === 0 && !showForm && (
          <div className="col-span-full py-20 bg-gray-50/50 dark:bg-gray-800/20 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <PackageIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No hay paquetes registrados</h4>
            <p className="text-gray-500 max-w-sm">
              Crea tu primer paquete para comenzar a gestionar tus envíos y recepciones.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
