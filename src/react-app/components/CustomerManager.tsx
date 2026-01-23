import { useState } from 'react';
import { Plus, Edit2, Trash2, User, History, X, Calendar, DollarSign } from 'lucide-react';
import { useCustomers } from '@/react-app/hooks/useCustomers';
import { useSales } from '@/react-app/hooks/useSales';
import { Customer } from '@/shared/types';
import { useToastContext } from '@/react-app/context/ToastContext';
import { ConfirmModal } from '@/react-app/components/ui/ConfirmModal';
import { useConfirmModal } from '@/react-app/hooks/useConfirmModal';

export default function CustomerManager() {
  const { customers, createCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const { sales } = useSales();
  const toast = useToastContext();
  const confirmModal = useConfirmModal();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [viewingHistory, setViewingHistory] = useState<Customer | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    confirmModal.showConfirm({
      title: editingId ? '¿Actualizar cliente?' : '¿Registrar cliente?',
      message: `¿Desear guardar los cambios para "${formData.name}"?`,
      confirmText: editingId ? 'Actualizar' : 'Guardar',
      cancelText: 'Cancelar',
      variant: 'info',
      onConfirm: async () => {
        try {
          if (editingId) {
            await updateCustomer(editingId, formData.name, formData.phone);
            toast.success("Cliente actualizado");
            setEditingId(null);
          } else {
            await createCustomer(formData.name, formData.phone);
            toast.success("Cliente registrado con éxito");
          }
          setFormData({ name: '', phone: '' });
          setShowForm(false);
        } catch (error) {
          toast.error("Error al guardar cliente");
        }
      }
    });
  };

  const handleEdit = (customer: Customer) => {
    setFormData({ name: customer.name, phone: customer.phone || '' });
    setEditingId(customer.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', phone: '' });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Clientes</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Gestiona tu base de clientes</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary gap-2"
          >
            <Plus size={18} />
            <span>Nuevo Cliente</span>
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-4 animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 px-1">Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="Apellidos y Nombres"
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 px-1">Teléfono</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input"
                  placeholder="Opcional"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-ghost"
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary px-8">
                {editingId ? 'Actualizar' : 'Guardar Cliente'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {customers.map((customer) => (
          <div
            key={customer.id}
            className="card p-4 hover:shadow-minimal-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
                <User size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-slate-900 dark:text-slate-100 truncate">{customer.name}</h4>
                {customer.phone && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{customer.phone}</p>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setViewingHistory(customer)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                  title="Historial"
                >
                  <History size={16} />
                </button>
                <button
                  onClick={() => handleEdit(customer)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                  title="Editar"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => {
                    confirmModal.showConfirm({
                      title: '¿Eliminar cliente?',
                      message: `¿Estás seguro de que deseas eliminar a "${customer.name}"? Esta acción no se puede deshacer.`,
                      confirmText: 'Eliminar',
                      cancelText: 'Cancelar',
                      variant: 'danger',
                      onConfirm: async () => {
                        try {
                          await deleteCustomer(customer.id);
                          toast.remove("Cliente eliminado");
                        } catch (error: any) {
                          if (error.message.includes('FOREIGN KEY') || error.message.includes('constraint')) {
                            toast.error("No se puede eliminar el cliente porque tiene historial de ventas.");
                          } else {
                            toast.error("Error al eliminar cliente");
                          }
                        }
                      }
                    });
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  title="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Balance */}
            {customer.balance_cop !== 0 && (
              <div className={`mt-3 p-2 rounded-md text-sm font-medium ${customer.balance_cop > 0
                ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs">{customer.balance_cop > 0 ? 'Debe' : 'A Favor'}</span>
                  <span className="font-semibold">${Math.abs(customer.balance_cop).toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        ))}

        {customers.length === 0 && (
          <div className="col-span-full card p-12 text-center text-slate-400">
            <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No hay clientes registrados</p>
          </div>
        )}
      </div>

      {/* History Modal */}
      {viewingHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Estado de Cuenta</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{viewingHistory.name}</p>
              </div>
              <button
                onClick={() => setViewingHistory(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {(() => {
                const customerSales = sales.filter(s => s.customer_id === viewingHistory.id);

                if (customerSales.length === 0) {
                  return (
                    <div className="text-center py-12 text-slate-400">
                      <p className="text-sm font-medium">No hay historial de compras</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {customerSales
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .map((sale) => (
                        <div key={sale.id} className="card-minimal p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                              <Calendar size={12} />
                              {new Date(sale.created_at).toLocaleDateString('es-ES')}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="badge badge-neutral">
                                <DollarSign size={10} />
                                ${sale.total_cop.toLocaleString()}
                              </div>
                              {sale.is_credit && (sale.total_cop - (sale.paid_cop || 0) - Math.round((sale.paid_ves || 0) / sale.exchange_rate)) > 0 && (
                                <div className="badge badge-warning">
                                  Debe: ${(sale.total_cop - (sale.paid_cop || 0) - Math.round((sale.paid_ves || 0) / sale.exchange_rate)).toLocaleString()}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            {sale.items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-3 h-3 rounded-full border border-slate-200 dark:border-slate-600"
                                    style={{ backgroundColor: item.color_hex }}
                                  />
                                  <span className="text-slate-700 dark:text-slate-300">{item.product_name}</span>
                                  <span className="text-slate-400">×{item.quantity}</span>
                                </div>
                                <span className="text-slate-600 dark:text-slate-400 text-xs">
                                  ${(item.price_cop * item.quantity).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
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
