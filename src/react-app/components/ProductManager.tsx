import { useState } from 'react';
import { Plus, Edit2, Trash2, Check, Package } from 'lucide-react';
import { useProducts } from '@/react-app/hooks/useProducts';
import { useColors } from '@/react-app/hooks/useColors';
import { useExchangeRate, convertCopToVes } from '@/react-app/hooks/useExchangeRate';
import { ProductWithVariants } from '@/shared/types';

export default function ProductManager() {
  const { products, createProduct, updateProduct, deleteProduct } = useProducts();
  const { colors } = useColors();
  const { rate } = useExchangeRate();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price_cop: 0,
    variants: [] as { color_id: number; stock: number }[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateProduct(editingId, formData.name, formData.price_cop, formData.variants);
      setEditingId(null);
    } else {
      await createProduct(formData.name, formData.price_cop, formData.variants);
    }
    setFormData({ name: '', price_cop: 0, variants: [] });
    setShowForm(false);
  };

  const handleEdit = (product: ProductWithVariants) => {
    setFormData({
      name: product.name,
      price_cop: product.price_cop,
      variants: product.variants.map(v => ({ color_id: v.color_id, stock: v.stock }))
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', price_cop: 0, variants: [] });
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { color_id: 0, stock: 0 }]
    });
  };

  const updateVariant = (index: number, field: 'color_id' | 'stock', value: number) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData({ ...formData, variants: newVariants });
  };

  const removeVariant = (index: number) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <div className="hidden md:block">
          <h3 className="text-2xl font-black text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">Productos</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-1">Gestiona tu inventario y precios</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-lg shadow-brand-500/20 transition-all font-black text-xs md:text-sm"
          >
            <Plus size={16} />
            <span>Nuevo Producto</span>
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 md:mb-8 p-4 md:p-6 bg-white dark:bg-gray-700 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-600 animate-fade-in ring-1 ring-gray-900/5 dark:ring-white/10">
          <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
            <div className="space-y-1.5">
              <label className="block text-[10px] md:text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">Nombre</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 md:px-4 md:py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm"
                placeholder="Ej. Camiseta"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] md:text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">Precio (COP)</label>
              <input
                type="number"
                value={formData.price_cop}
                onChange={(e) => setFormData({ ...formData, price_cop: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 md:px-4 md:py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm"
                required
                min="0"
              />
            </div>
          </div>

          <div className="mb-4 md:mb-8">
            <div className="flex items-center justify-between mb-2 md:mb-4">
              <label className="block text-[10px] md:text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">Colores y Stock</label>
              <button
                type="button"
                onClick={addVariant}
                className="text-xs font-black text-brand-600 dark:text-brand-400 hover:scale-105 transition-transform flex items-center gap-1"
              >
                <Plus size={14} />
                Agregar
              </button>
            </div>
            <div className="space-y-2">
              {formData.variants.map((variant, index) => (
                <div key={index} className="flex items-center gap-2 animate-slide-in">
                  <select
                    value={variant.color_id}
                    onChange={(e) => updateVariant(index, 'color_id', parseInt(e.target.value))}
                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl outline-none text-xs md:text-sm"
                    required
                  >
                    <option value={0}>Color...</option>
                    {colors.map((color) => (
                      <option key={color.id} value={color.id}>{color.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={variant.stock}
                    onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                    placeholder="Stock"
                    className="w-20 md:w-32 px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl outline-none text-xs md:text-sm"
                    min="0"
                  />
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-600">
            <button
              type="submit"
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-brand-500 text-white rounded-xl shadow-lg shadow-brand-500/25 transition-all font-black text-xs md:text-sm ml-auto"
            >
              <Check size={16} />
              {editingId ? 'Actualizar' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 transition-colors font-black text-xs md:text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="group bg-white dark:bg-gray-800 rounded-2xl p-3 md:p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 relative"
          >
            <div className="flex items-start justify-between mb-2 md:mb-4">
              <div className="flex-1 min-w-0 pr-12 md:pr-4">
                <h4 className="text-sm md:text-lg font-black text-gray-900 dark:text-white mb-1 md:mb-2 truncate">{product.name}</h4>
                <div className="flex flex-col gap-0.5">
                  <span className="text-base md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                    ${product.price_cop.toLocaleString()}
                  </span>
                  <span className="text-[10px] md:text-sm font-bold text-brand-600 dark:text-brand-400">
                    {rate && convertCopToVes(product.price_cop, rate.cop_to_ves).toLocaleString()} Bs
                  </span>
                </div>
              </div>
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  onClick={() => handleEdit(product)}
                  className="p-1.5 md:p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => deleteProduct(product.id)}
                  className="p-1.5 md:p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="mb-2 md:mb-4 flex items-center gap-1.5 px-2 py-1 bg-gray-50 dark:bg-gray-900/50 rounded-lg w-fit border border-gray-100 dark:border-gray-700">
              <Package size={14} className="text-gray-500" />
              <span className="font-black text-xs md:text-base text-gray-900 dark:text-white">{product.total_stock}</span>
              <span className="text-[8px] md:text-[10px] text-gray-400 uppercase tracking-widest font-black">Stock</span>
            </div>

            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {product.variants.map((variant) => (
                <div
                  key={variant.id}
                  className="flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm"
                >
                  <div
                    className="w-2 md:w-3 h-2 md:h-3 rounded-full ring-1 ring-gray-200"
                    style={{ backgroundColor: variant.color_hex }}
                  />
                  <span className="text-[10px] md:text-xs font-bold text-gray-600 dark:text-gray-300">{variant.color_name}</span>
                  <span className={`text-[10px] md:text-xs font-black ${variant.stock > 0 ? 'text-brand-600' : 'text-red-500'}`}>
                    {variant.stock}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500 bg-gray-50/50 dark:bg-gray-900/20 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
            <Package className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No hay productos registrados</p>
            <p className="text-sm">Agrega tu primer producto usando el botón superior</p>
          </div>
        )}
      </div>
    </div>
  );
}
