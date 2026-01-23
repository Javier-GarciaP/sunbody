import { useState } from 'react';
import { Plus, Trash2, Check, Package as PackageIcon, Pencil, Copy } from 'lucide-react';
import { usePackages } from '@/react-app/hooks/usePackages';
import { useProducts } from '@/react-app/hooks/useProducts';
import { useColors } from '@/react-app/hooks/useColors';
import { useToastContext } from '@/react-app/context/ToastContext';
import { ConfirmModal } from '@/react-app/components/ui/ConfirmModal';
import { useConfirmModal } from '@/react-app/hooks/useConfirmModal';

export default function PackageManager() {
  const { packages, createPackage, updatePackage, deletePackage } = usePackages();
  const { products } = useProducts();
  const { colors } = useColors();
  const toast = useToastContext();
  const confirmModal = useConfirmModal();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    totalVes: 0,
    items: [] as { product_id: number; color_id: number; quantity: number }[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const action = editingId ? 'actualizar' : 'crear';

    confirmModal.showConfirm({
      title: editingId ? '¿Guardar cambios?' : '¿Crear paquete?',
      message: `¿Estás seguro de que deseas ${action} este paquete?`,
      confirmText: editingId ? 'Guardar' : 'Crear',
      cancelText: 'Cancelar',
      variant: 'info',
      onConfirm: async () => {
        try {
          const finalItems = formData.items.filter(i => i.quantity > 0 && i.product_id > 0 && i.color_id > 0);

          if (editingId) {
            await updatePackage(editingId, {
              name: formData.name,
              items: finalItems,
              total_ves: formData.totalVes
            });
            toast.success('Paquete actualizado correctamente');
          } else {
            await createPackage(formData.name, finalItems, formData.totalVes);
            toast.success('¡Paquete creado con éxito!');
          }
          resetForm();
        } catch (error) {
          console.error("Error saving package", error);
          toast.error('Error al guardar el paquete');
        }
      }
    });
  };

  const resetForm = () => {
    setFormData({ name: '', totalVes: 0, items: [] });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (pkg: any) => {
    setEditingId(pkg.id);

    // Get unique product IDs in the package
    const productIds = Array.from(new Set(pkg.items.map((i: any) => i.product_id)));

    // For each product, we want to show ALL system colors
    const items: { product_id: number; color_id: number; quantity: number }[] = [];

    productIds.forEach(prodId => {
      colors.forEach(color => {
        const existing = pkg.items.find((i: any) => i.product_id === prodId && i.color_id === color.id);
        items.push({
          product_id: prodId as number,
          color_id: color.id,
          quantity: existing ? existing.quantity : 0
        });
      });
    });

    setFormData({
      name: pkg.name,
      totalVes: pkg.total_ves || 0,
      items: items
    });
    setShowForm(true);
  };

  const addProductGroup = () => {
    // Just a placeholder to show the product selector
    setFormData({
      ...formData,
      items: [...formData.items, { product_id: 0, color_id: -1, quantity: 0 }]
    });
  };

  const handleProductSelect = (index: number, productId: number) => {
    const newItems = [...formData.items];
    const product = products.find(p => p.id === productId);

    if (!product) return;

    // Remove the placeholder
    newItems.splice(index, 1);

    // Add ALL available colors in the system for this product with quantity 0
    const colorItems = colors.map(c => ({
      product_id: productId,
      color_id: c.id,
      quantity: 0
    }));

    setFormData({
      ...formData,
      items: [...newItems, ...colorItems]
    });
  };

  const updateQuantity = (productId: number, colorId: number, quantity: number) => {
    const newItems = formData.items.map(item => {
      if (item.product_id === productId && item.color_id === colorId) {
        return { ...item, quantity };
      }
      return item;
    });
    setFormData({ ...formData, items: newItems });
  };

  const removeProduct = (productId: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter(i => i.product_id !== productId)
    });
  };

  const groupedItems = formData.items.reduce((acc, item) => {
    if (!acc[item.product_id]) {
      acc[item.product_id] = [];
    }
    acc[item.product_id].push(item);
    return acc;
  }, {} as Record<number, typeof formData.items>);

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

  const statusColors = {
    Armado: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800',
    Enviado: 'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 border-sky-100 dark:border-sky-800',
    Entregado: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800'
  };

  return (
    <div className="space-y-4 md:space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Gestión de Paquetes
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
            Control de envíos y recepción de mercancía
          </p>
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary gap-2"
          >
            <Plus size={18} />
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

          <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-6">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 px-1">Referencia</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                placeholder="Nombre del paquete"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 px-1">Monto Total (Bs)</label>
              <input
                type="number"
                value={formData.totalVes}
                onChange={(e) => setFormData({ ...formData, totalVes: parseFloat(e.target.value) || 0 })}
                className="input"
                placeholder="0.00"
                step="0.01"
              />
            </div>
          </div>

          <div className="space-y-4 md:space-y-6">
            <div className="space-y-2 md:space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">Productos y Colores</label>
                <button
                  type="button"
                  onClick={addProductGroup}
                  className="btn btn-secondary py-1 text-xs h-auto px-3"
                >
                  <Plus size={14} className="mr-1" />
                  Añadir Producto
                </button>
              </div>

              {Object.keys(groupedItems).length === 0 && (
                <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-2xl text-gray-400">
                  <PackageIcon size={32} className="mx-auto mb-2 opacity-20" />
                  <p className="text-xs font-bold uppercase tracking-widest">Añade productos para ver sus colores</p>
                </div>
              )}

              <div className="space-y-4">
                {Object.entries(groupedItems).map(([prodIdRaw, items]) => {
                  const productId = parseInt(prodIdRaw);
                  const product = products.find(p => p.id === productId);

                  // Special case for placeholder selector
                  if (productId === 0) {
                    return items.map((_, idx) => (
                      <div key={`selector-${idx}`} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-600 animate-in fade-in zoom-in duration-200">
                        <select
                          onChange={(e) => handleProductSelect(idx, parseInt(e.target.value))}
                          className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl outline-none text-sm font-bold shadow-sm"
                        >
                          <option value={0}>Selecciona un producto...</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                    ));
                  }

                  return (
                    <div key={productId} className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="bg-gray-50/80 dark:bg-gray-900/50 p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-brand-500/10 rounded-lg flex items-center justify-center">
                            <PackageIcon size={16} className="text-brand-500" />
                          </div>
                          <h5 className="font-black text-gray-900 dark:text-white text-sm md:text-base uppercase tracking-tight">
                            {product?.name || 'Producto Desconocido'}
                          </h5>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeProduct(productId)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="p-4 bg-white dark:bg-transparent">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                          {items.map((item) => {
                            const colorInfo = colors.find(c => c.id === item.color_id);
                            return (
                              <div key={item.color_id} className={`flex flex-col gap-2 p-2.5 rounded-xl border transition-all ${item.quantity > 0 ? 'bg-brand-50/30 border-brand-200 dark:bg-brand-500/5 dark:border-brand-500/30' : 'bg-gray-50/50 border-gray-100 dark:border-gray-800'}`}>
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-4 h-4 rounded-full border border-black/10 shadow-sm flex-shrink-0"
                                    style={{ backgroundColor: colorInfo?.hex_code }}
                                  />
                                  <span className="text-[10px] md:text-xs font-black text-gray-700 dark:text-gray-300 truncate">
                                    {colorInfo?.name || 'Color'}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between gap-2 mt-auto">
                                  <span className="text-[8px] font-black text-gray-400 uppercase">Cant:</span>
                                  <input
                                    type="number"
                                    min="0"
                                    value={item.quantity}
                                    onChange={(e) => updateQuantity(productId, item.color_id, parseInt(e.target.value) || 0)}
                                    className={`w-14 px-1.5 py-1 rounded-lg text-center text-xs font-black outline-none border transition-all ${item.quantity > 0 ? 'bg-white dark:bg-gray-900 border-brand-300 dark:border-brand-700' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'}`}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={resetForm}
              className="btn btn-ghost"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary px-8"
            >
              {editingId ? 'Guardar Cambios' : 'Confirmar Paquete'}
            </button>
          </div>
        </form>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        {packages.map((pkg) => (
          <div key={pkg.id} className="group bg-white dark:bg-gray-800 rounded-3xl p-4 md:p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col relative overflow-hidden">

            {/* Background Decoration */}
            <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 opacity-10 rounded-full blur-3xl transition-colors ${pkg.status === 'Entregado' ? 'bg-emerald-500' : pkg.status === 'Enviado' ? 'bg-blue-500' : 'bg-amber-500'}`} />

            <div className="flex items-start justify-between mb-4 relative">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`p-3 rounded-2xl ${statusColors[pkg.status as keyof typeof statusColors]} bg-opacity-20 flex-shrink-0 animate-pulse-slow`}>
                  <PackageIcon size={20} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-base md:text-xl font-black text-gray-900 dark:text-white truncate" title={pkg.name}>{pkg.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                      {new Date(pkg.created_at).toLocaleDateString('es-CO', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    {pkg.total_ves > 0 && (
                      <>
                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase">{pkg.total_ves.toLocaleString()} Bs</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="absolute top-0 right-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                <button
                  onClick={() => handleCopy(pkg)}
                  className={`p-2 rounded-xl border border-transparent transition-all ${copiedId === pkg.id ? 'text-emerald-500 bg-emerald-50 border-emerald-100' : 'text-gray-400 hover:text-brand-500 hover:bg-brand-50'}`}
                >
                  {copiedId === pkg.id ? <Check size={16} /> : <Copy size={16} />}
                </button>
                <button
                  onClick={() => handleEdit(pkg)}
                  className="p-2 text-gray-400 hover:text-brand-500 hover:bg-brand-50 rounded-xl transition-all"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => {
                    if (pkg.status === 'Entregado') {
                      toast.warning('No se pueden eliminar paquetes ya recibidos');
                      return;
                    }
                    confirmModal.showConfirm({
                      title: '¿Eliminar paquete?',
                      message: `¿Estás seguro de que deseas eliminar el paquete "${pkg.name}"? Esta acción no se puede deshacer.`,
                      confirmText: 'Eliminar',
                      cancelText: 'Cancelar',
                      variant: 'danger',
                      onConfirm: async () => {
                        await deletePackage(pkg.id);
                        toast.remove('Paquete eliminado');
                      }
                    });
                  }}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 mb-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 space-y-2 max-h-48 overflow-y-auto custom-scrollbar border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contenido Detallado</p>
                <span className="text-[10px] font-black bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                  {pkg.items.reduce((acc, i) => acc + i.quantity, 0)} uds
                </span>
              </div>
              {pkg.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-[11px] md:text-sm group/item hover:bg-white dark:hover:bg-gray-800 p-1 rounded-lg transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-2.5 h-2.5 rounded-sm ring-1 ring-black/5 flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: item.color_hex }}
                    />
                    <span className="text-gray-600 dark:text-gray-300 truncate font-black">{item.product_name}</span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase opacity-60">• {item.color_name}</span>
                  </div>
                  <span className="font-black text-gray-900 dark:text-white px-2 py-0.5 rounded-lg text-[10px] md:text-xs">
                    x{item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-auto relative z-10">
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <select
                    value={pkg.status}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      if (newStatus === 'Entregado') {
                        confirmModal.showConfirm({
                          title: '¿Marcar como recibido?',
                          message: `¿Confirmas que el paquete "${pkg.name}" ha sido recibido? Esta acción agregará el inventario al stock y no se podrá revertir.`,
                          confirmText: 'Confirmar Recepción',
                          cancelText: 'Cancelar',
                          variant: 'warning',
                          onConfirm: async () => {
                            await updatePackage(pkg.id, { status: newStatus });
                            toast.success('Paquete marcado como recibido e inventario actualizado');
                          }
                        });
                      } else {
                        updatePackage(pkg.id, { status: newStatus });
                        toast.info(`Estado cambiado a ${newStatus}`);
                      }
                    }}
                    disabled={pkg.status === 'Entregado'}
                    className={`w-full px-4 py-3 rounded-2xl text-[11px] md:text-sm font-black border-2 cursor-pointer appearance-none transition-all outline-none shadow-sm ${pkg.status === 'Entregado'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400 cursor-not-allowed'
                      : pkg.status === 'Enviado'
                        ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400'
                        : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400'
                      }`}
                  >
                    <option value="Armado">Armado</option>
                    <option value="Enviado">Enviado</option>
                    <option value="Entregado">Entregado</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                    <Plus size={14} className="rotate-45" />
                  </div>
                </div>
                {pkg.status === 'Entregado' && (
                  <div className="flex items-center justify-center gap-1.5 py-1 px-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <Check size={12} className="text-emerald-500" />
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-tighter">Inventario Conciliado</span>
                  </div>
                )}
              </div>
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
