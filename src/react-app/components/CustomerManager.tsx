import { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, User } from 'lucide-react';
import { useCustomers } from '@/react-app/hooks/useCustomers';
import { useExchangeRate, convertCopToVes } from '@/react-app/hooks/useExchangeRate';
import { Customer } from '@/shared/types';

export default function CustomerManager() {
  const { customers, createCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const { rate } = useExchangeRate();
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">Clientes</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-1">Administra tu base de clientes</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 hover:scale-[1.02] transition-all duration-200 font-bold"
          >
            <Plus className="w-5 h-5" />
            <span>Agregar Cliente</span>
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white dark:bg-gray-700 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-600 animate-fade-in ring-1 ring-gray-900/5 dark:ring-white/10">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Nombre Completo</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                placeholder="Ej. Juan Pérez"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Teléfono</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                placeholder="Ej. +57 300 123 4567"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-600">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-400 shadow-brand-500/25 text-white rounded-xl shadow-lg shadow-secondary-500/20 hover:shadow-secondary-500/30 hover:scale-[1.02] transition-all duration-200 font-medium ml-auto"
            >
              <Check className="w-5 h-5" />
              {editingId ? 'Actualizar Cliente' : 'Guardar Cliente'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              <X className="w-5 h-5" />
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map((customer) => (
          <div
            key={customer.id}
            className="group bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl hover:shadow-brand-500/5 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <button
                onClick={() => handleEdit(customer)}
                className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                title="Editar"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => deleteCustomer(customer.id)}
                className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-2xl flex items-center justify-center shadow-inner">
                <User className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-900 dark:text-white truncate text-lg">{customer.name}</h4>
                {customer.phone && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{customer.phone}</p>
                )}
              </div>
            </div>

            {customer.balance_cop !== 0 && (
              <div className={`mt-2 p-3 rounded-xl border ${customer.balance_cop > 0
                ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30'
                : 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/30'
                }`}>
                <div className="flex justify-between items-center text-sm font-medium mb-1">
                  <span className={customer.balance_cop > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                    {customer.balance_cop > 0 ? 'Saldo Pendiente' : 'Saldo a Favor'}
                  </span>
                </div>
                <div className={`text-lg font-bold ${customer.balance_cop > 0 ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'}`}>
                  ${Math.abs(customer.balance_cop).toLocaleString()}
                  <span className="text-xs font-normal ml-1">COP</span>
                </div>
                {rate && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    ≈ {Math.abs(convertCopToVes(customer.balance_cop, rate.cop_to_ves)).toLocaleString()} Bs
                  </div>
                )}
              </div>
            )}
            {customer.balance_cop === 0 && (
              <div className="mt-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-dashed border-gray-200 dark:border-gray-700 text-center text-sm text-gray-400">
                Sin deudas pendientes
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
