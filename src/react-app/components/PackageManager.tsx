import { useState } from 'react';
import { Plus, Trash2, Check, Package as PackageIcon, Pencil, Copy } from 'lucide-react';
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
    <div className="space-y-4 md:space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="hidden md:block">
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
            className="flex items-center gap-1.5 px-3 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl shadow-lg shadow-brand-500/20 transition-all font-black text-xs md:text-sm"
          >
            <Plus size={16} />
            <span>Nuevo Paquete</span>
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 md:mb-8 p-4 md:p-6 bg-white dark:bg-gray-700 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-600 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h4 className="text-sm md:text-lg font-black text-gray-900 dark:text-white uppercase tracking-wider">
              {editingId ? 'Editar Paquete' : 'Nuevo Paquete'}
            </h4>
            <button type="button" onClick={resetForm} className="text-gray-400">
              <Trash2 size={18} />
            </button>
          </div>

          <div className="space-y-4 md:space-y-6">
            <div>
              <label className="block text-[10px] md:text-sm font-black text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">Referencia</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 md:px-4 md:py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm font-bold"
                placeholder="Nombre del paquete"
                required
              />
            </div>

            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] md:text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">Contenido</label>
                <button
                  type="button"
                  onClick={addItem}
                  className="text-[10px] md:text-sm font-black text-brand-500 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-brand-50 transition-colors uppercase"
                >
                  <Plus size={14} />
                  Añadir
                </button>
              </div>

              {formData.items.length === 0 && (
                <div className="text-center py-6 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl text-gray-400">
                  <p className="text-xs font-bold uppercase tracking-widest">Paquete vacío</p>
                </div>
              )}

              <div className="space-y-2">
                {formData.items.map((item, index) => (
                  <div key={index} className="flex flex-col md:flex-row gap-2 p-2 md:p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-600 items-start md:items-center">
                    <div className="flex-1 w-full">
                      <select
                        value={item.product_id}
                        onChange={(e) => updateItem(index, 'product_id', parseInt(e.target.value))}
                        className="w-full px-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg outline-none text-[10px] md:text-sm font-bold"
                        required
                      >
                        <option value={0}>Producto...</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>{product.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                      <select
                        value={item.color_id}
                        onChange={(e) => updateItem(index, 'color_id', parseInt(e.target.value))}
                        className="flex-1 md:w-32 px-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg outline-none text-[10px] md:text-sm font-bold disabled:opacity-50"
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

                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-16 px-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg outline-none text-[10px] md:text-sm font-black text-center"
                        min="1"
                      />

                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100 dark:border-gray-600">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 font-black text-gray-500 text-xs md:text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2 bg-brand-500 text-white rounded-xl shadow-lg shadow-brand-500/20 font-black text-xs md:text-sm transition-all transform active:scale-95"
            >
              <Check size={16} />
              {editingId ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        {packages.map((pkg) => (
          <div key={pkg.id} className="group bg-white dark:bg-gray-800 rounded-2xl p-3 md:p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col relative">

            <div className="flex items-start justify-between mb-3 md:mb-4">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className={`p-1.5 md:p-2.5 rounded-lg md:rounded-xl ${statusColors[pkg.status as keyof typeof statusColors]} bg-opacity-20`}>
                  <PackageIcon size={18} className="md:w-5 md:h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm md:text-lg font-black text-gray-900 dark:text-white truncate" title={pkg.name}>{pkg.name}</h4>
                  <span className="text-[9px] md:text-xs text-gray-400 font-bold uppercase tracking-tighter">
                    {new Date(pkg.created_at).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="absolute top-2 right-2 flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleCopy(pkg)}
                  className={`p-1.5 rounded-lg transition-colors ${copiedId === pkg.id ? 'text-emerald-500 bg-emerald-50' : 'text-gray-400 hover:text-brand-500'}`}
                >
                  {copiedId === pkg.id ? <Check size={14} /> : <Copy size={14} />}
                </button>
                <button
                  onClick={() => handleEdit(pkg)}
                  className="p-1.5 text-gray-400 hover:text-brand-500"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => deletePackage(pkg.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="flex-1 mb-3 md:mb-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-2 md:p-3 space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
              <p className="text-[8px] md:text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Contenido ({pkg.items.length})</p>
              {pkg.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-[10px] md:text-sm group/item">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div
                      className="w-2 md:w-3 h-2 md:h-3 rounded-full ring-1 ring-black/5 flex-shrink-0"
                      style={{ backgroundColor: item.color_hex }}
                    />
                    <span className="text-gray-600 dark:text-gray-300 truncate font-black">{item.product_name}</span>
                  </div>
                  <span className="font-black text-gray-900 dark:text-white bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded-md text-[9px] md:text-xs shadow-sm border border-gray-100 dark:border-gray-700">
                    x{item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-3 md:pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="relative">
                <select
                  value={pkg.status}
                  onChange={(e) => updatePackage(pkg.id, { status: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl text-[10px] md:text-sm font-black border-2 cursor-pointer appearance-none transition-all outline-none ${pkg.status === 'Entregado'
                    ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
                    : pkg.status === 'Enviado'
                      ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400'
                      : 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400'
                    }`}
                >
                  <option value="Armado">📦 Armado</option>
                  <option value="Enviado">✈️ Enviado</option>
                  <option value="Entregado">✅ Entregado</option>
                </select>
              </div>
              {pkg.status === 'Entregado' && (
                <p className="text-[8px] md:text-[10px] text-green-600 dark:text-green-400 text-center mt-1 font-black bg-green-50 dark:bg-green-900/20 py-0.5 rounded-lg uppercase tracking-wider">
                  Inventario Cargado
                </p>
              )}
            </div>
          </div>
        ))}

        {packages.length === 0 && !showForm && (
          <div className="col-span-full py-16 bg-gray-50/50 dark:bg-gray-800/20 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
              <PackageIcon size={24} className="text-gray-400" />
            </div>
            <h4 className="text-sm font-black text-gray-900 dark:text-white mb-1 uppercase tracking-widest">Nada por aquí</h4>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
              Crea tu primer paquete para gestionar inventario.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
