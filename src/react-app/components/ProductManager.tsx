import { useState } from 'react';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';
import { useProducts } from '@/react-app/hooks/useProducts';
import { useExchangeRate, convertCopToVes } from '@/react-app/hooks/useExchangeRate';
import { ProductWithVariants } from '@/shared/types';
import ImageUpload from '@/react-app/components/ImageUpload';
import { useToastContext } from '@/react-app/context/ToastContext';
import { ConfirmModal } from '@/react-app/components/ui/ConfirmModal';
import { useConfirmModal } from '@/react-app/hooks/useConfirmModal';

export default function ProductManager() {
  const { products, createProduct, updateProduct, deleteProduct } = useProducts();
  const { rate } = useExchangeRate();
  const toast = useToastContext();
  const confirmModal = useConfirmModal();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price_cop: 0,
    image_url: null as string | null
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    confirmModal.showConfirm({
      title: editingId ? '¿Actualizar producto?' : '¿Crear producto?',
      message: `¿Deseas guardar los cambios para "${formData.name}"?`,
      confirmText: editingId ? 'Actualizar' : 'Guardar',
      cancelText: 'Cancelar',
      variant: 'info',
      onConfirm: async () => {
        try {
          if (editingId) {
            await updateProduct(editingId, formData.name, formData.price_cop, formData.image_url);
            toast.success("Producto actualizado");
            setEditingId(null);
          } else {
            await createProduct(formData.name, formData.price_cop, formData.image_url);
            toast.success("Producto creado con éxito");
          }
          setFormData({ name: '', price_cop: 0, image_url: null });
          setShowForm(false);
        } catch (error) {
          toast.error("Error al guardar el producto");
        }
      }
    });
  };

  const handleEdit = (product: ProductWithVariants) => {
    setFormData({
      name: product.name,
      price_cop: product.price_cop,
      image_url: product.image_url || null
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', price_cop: 0, image_url: null });
  };



  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Productos</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Gestiona tu inventario y precios</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary gap-2"
          >
            <Plus size={18} />
            <span>Nuevo Producto</span>
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 md:mb-8 p-4 md:p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 animate-fade-in">
          <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 px-1">Nombre</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                placeholder="Nombre del producto"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 px-1">Precio (COP)</label>
              <input
                type="number"
                value={formData.price_cop === 0 ? '' : formData.price_cop}
                onChange={(e) => setFormData({ ...formData, price_cop: parseInt(e.target.value) || 0 })}
                className="input"
                required
                min="0"
                placeholder="0"
              />
            </div>
            <div className="md:col-span-2">
              <ImageUpload
                currentImageUrl={formData.image_url}
                onImageUploaded={(url) => setFormData({ ...formData, image_url: url })}
                onImageRemoved={() => setFormData({ ...formData, image_url: null })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-ghost"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary px-8"
            >
              {editingId ? 'Actualizar' : 'Guardar Producto'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden"
          >
            {product.image_url && (
              <div className="w-full h-32 overflow-hidden border-b border-gray-100 dark:border-gray-700">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
            )}
            <div className="p-3 md:p-5">
              <div className="flex items-start justify-between mb-2 md:mb-4">
                <div className="flex-1 min-w-0 pr-8">
                  <h4 className="font-semibold text-slate-900 dark:text-white truncate">{product.name}</h4>
                  <div className="flex flex-col gap-0.5 mt-1">
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      ${product.price_cop.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
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
                    onClick={() => {
                      confirmModal.showConfirm({
                        title: '¿Eliminar producto?',
                        message: `¿Estás seguro de que deseas eliminar el producto "${product.name}"? Esta acción no se puede deshacer.`,
                        confirmText: 'Eliminar',
                        cancelText: 'Cancelar',
                        variant: 'danger',
                        onConfirm: async () => {
                          try {
                            await deleteProduct(product.id);
                            toast.remove("Producto eliminado");
                          } catch (error) {
                            toast.error("Error al eliminar el producto. Asegúrate de que no tenga pedidos vinculados.");
                          }
                        }
                      });
                    }}
                    className="p-1.5 md:p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="mb-4 flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-slate-900/50 rounded-lg w-fit border border-slate-100 dark:border-slate-700">
                <Package size={14} className="text-slate-400" />
                <span className="font-bold text-sm text-slate-900 dark:text-white">{product.total_stock}</span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Stock</span>
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
