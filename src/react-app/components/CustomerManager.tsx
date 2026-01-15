import { useState } from 'react';
import { Plus, Edit2, Trash2, Check, User } from 'lucide-react';
import { useCustomers } from '@/react-app/hooks/useCustomers';
import { Customer } from '@/shared/types';

export default function CustomerManager() {
  const { customers, createCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateCustomer(editingId, formData.name, formData.phone);
      setEditingId(null);
    } else {
      await createCustomer(formData.name, formData.phone);
    }
    setFormData({ name: '', phone: '' });
    setShowForm(false);
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
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <div className="hidden md:block">
          <h3 className="text-2xl font-black text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">Clientes</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-1">Administra tu base de clientes</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-lg shadow-brand-500/20 transition-all font-black text-xs md:text-sm"
          >
            <Plus size={16} />
            <span>Nuevo Cliente</span>
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
                placeholder="Juan Pérez"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] md:text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">Teléfono</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 md:px-4 md:py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm"
                placeholder="300 123 4567"
              />
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
        {customers.map((customer) => (
          <div
            key={customer.id}
            className="group bg-white dark:bg-gray-800 rounded-2xl p-3 md:p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-2 right-2 flex gap-1">
              <button
                onClick={() => handleEdit(customer)}
                className="p-1.5 md:p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg transition-colors"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => deleteCustomer(customer.id)}
                className="p-1.5 md:p-2 bg-red-50 dark:bg-red-900/30 text-red-600 rounded-lg transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-xl md:rounded-2xl flex items-center justify-center">
                <User size={20} className="md:w-7 md:h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0 pr-16 md:pr-0">
                <h4 className="font-black text-gray-900 dark:text-white truncate text-sm md:text-lg">{customer.name}</h4>
                {customer.phone && (
                  <p className="text-[10px] md:text-sm text-gray-500 dark:text-gray-400 font-bold">{customer.phone}</p>
                )}
              </div>
            </div>

            {customer.balance_cop !== 0 ? (
              <div className={`p-2 md:p-3 rounded-xl border ${customer.balance_cop > 0
                ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30'
                : 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/30'
                }`}>
                <div className="flex justify-between items-center text-[9px] md:text-sm font-black mb-0.5 uppercase tracking-tighter">
                  <span className={customer.balance_cop > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                    {customer.balance_cop > 0 ? 'Pendiente' : 'A Favor'}
                  </span>
                </div>
                <div className={`text-sm md:text-lg font-black ${customer.balance_cop > 0 ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'}`}>
                  ${Math.abs(customer.balance_cop).toLocaleString()}
                </div>
              </div>
            ) : (
              <div className="p-2 md:p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-dashed border-gray-200 dark:border-gray-700 text-center text-[10px] md:text-sm text-gray-400 font-bold">
                Al día ✨
              </div>
            )}
          </div>
        ))}
        {customers.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500 bg-gray-50/50 dark:bg-gray-900/20 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
            <User className="w-12 h-12 mb-4 opacity-50" />
            <p className="font-medium">No hay clientes registrados</p>
          </div>
        )}
      </div>
    </div>
  );
}
