import { useState } from 'react';
import { Plus, Trash2, CreditCard, Search, User } from 'lucide-react';
import { useCustomers } from '@/react-app/hooks/useCustomers';
import { usePayments } from '@/react-app/hooks/usePayments';
import { useExchangeRate, convertCopToVes, convertVesToCop } from '@/react-app/hooks/useExchangeRate';

export default function CreditsManager() {
  const { customers } = useCustomers();
  const { rate } = useExchangeRate();
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const { payments, createPayment, deletePayment } = usePayments(selectedCustomerId || undefined);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    amount_cop: 0,
    amount_ves: 0,
    note: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const customersWithDebt = customers.filter(c => c.balance_cop > 0);

  const filteredCustomers = customersWithDebt.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !rate) return;

    await createPayment(
      selectedCustomerId,
      formData.amount_cop,
      formData.amount_ves,
      rate.cop_to_ves,
      formData.note
    );
    setFormData({ amount_cop: 0, amount_ves: 0, note: '' });
    setShowForm(false);
  };

  const totalPayment = formData.amount_cop + (rate ? convertVesToCop(formData.amount_ves, rate.cop_to_ves) : 0);
  const totalDebt = customersWithDebt.reduce((sum, c) => sum + c.balance_cop, 0);

  return (
    <div className="space-y-6 h-full flex flex-col">
      {!selectedCustomer ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wide mb-1">Clientes con Deuda</div>
              <div className="text-2xl font-black text-gray-900 dark:text-gray-100">{customersWithDebt.length}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wide mb-1">Deuda Total</div>
              <div className="text-2xl font-black text-red-600 dark:text-red-400">
                ${totalDebt.toLocaleString()} <span className="text-sm font-medium text-gray-400 italic">COP</span>
              </div>
            </div>
          </div>

          {/* Search and List */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 flex-1 flex flex-col min-h-0 shadow-sm">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar deudor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 text-sm py-2 pl-9 pr-4 rounded-xl focus:ring-2 focus:ring-brand-500 placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-2 space-y-2">
              {filteredCustomers.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => setSelectedCustomerId(customer.id)}
                  className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl flex items-center justify-between group transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-gray-700 dark:text-gray-200 group-hover:text-brand-600 dark:group-hover:text-white transition-colors">{customer.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{customer.phone || 'Sin teléfono'}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-600 dark:text-red-400">${customer.balance_cop.toLocaleString()}</div>
                    {rate && (
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        ≈ {convertCopToVes(customer.balance_cop, rate.cop_to_ves).toLocaleString()} Bs
                      </div>
                    )}
                  </div>
                </button>
              ))}

              {filteredCustomers.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <User className="w-12 h-12 mb-2 opacity-20" />
                  <p className="text-sm font-medium">No se encontraron deudores</p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col h-full animate-fade-in shadow-sm">
          {/* Header Selected Customer */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setSelectedCustomerId(null);
                  setShowForm(false);
                }}
                className="text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-white transition-colors text-sm font-bold flex items-center gap-1"
              >
                ← VOLVER
              </button>
              <div className="h-8 w-px bg-gray-100 dark:bg-gray-700 hidden md:block"></div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">{selectedCustomer.name}</h2>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Deuda actual:</span>
                  <span className="text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-400/10 px-2 py-0.5 rounded">
                    ${selectedCustomer.balance_cop.toLocaleString()} COP
                  </span>
                </div>
              </div>
            </div>

            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-brand-500/20 hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" />
                Registrar Pago
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {showForm && (
              <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700/50 animate-slide-down">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-brand-500 dark:text-brand-400" />
                  Nuevo Pago
                </h3>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Monto en COP</label>
                    <input
                      type="number"
                      value={formData.amount_cop}
                      onChange={(e) => setFormData({ ...formData, amount_cop: parseInt(e.target.value) || 0 })}
                      className="w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-gray-900 dark:text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Monto en BS</label>
                    <input
                      type="number"
                      value={formData.amount_ves}
                      onChange={(e) => setFormData({ ...formData, amount_ves: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-gray-900 dark:text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Nota (Opcional)</label>
                  <input
                    type="text"
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    className="w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-gray-900 dark:text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                    placeholder="Detalles del pago..."
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 rounded-xl mb-6">
                  <span className="text-brand-700 dark:text-brand-300 font-bold">Total Abono</span>
                  <span className="text-xl font-black text-brand-600 dark:text-brand-400">${totalPayment.toLocaleString()} COP</span>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-sm font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-success-600 hover:bg-success-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-success-500/20 transition-all transform active:scale-95"
                  >
                    Confirmar Pago
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              <h4 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Historial de Pagos</h4>
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-brand-200 dark:hover:border-gray-700 transition-colors group">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-success-600 dark:text-success-400 font-black text-lg">
                        + ${(payment.amount_cop + convertVesToCop(payment.amount_ves, payment.exchange_rate)).toLocaleString()}
                      </span>
                      <span className="text-gray-300 dark:text-gray-600 text-xs">•</span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm font-semibold">
                        Total Abonado
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 flex gap-2 font-medium">
                      <span>{payment.amount_cop > 0 && `$${payment.amount_cop.toLocaleString()} COP`}</span>
                      {(payment.amount_cop > 0 && payment.amount_ves > 0) && <span>+</span>}
                      <span>{payment.amount_ves > 0 && `${payment.amount_ves} Bs`}</span>
                    </div>
                    {payment.note && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 bg-white dark:bg-gray-800/50 p-2 rounded-lg border border-gray-100 dark:border-gray-800">{payment.note}</p>
                    )}
                    <div className="text-[10px] text-gray-400 dark:text-gray-600 mt-2 font-bold uppercase tracking-tighter">
                      {new Date(payment.created_at).toLocaleString('es-CO')}
                    </div>
                  </div>
                  <button
                    onClick={() => deletePayment(payment.id)}
                    className="text-gray-400 hover:text-danger-500 p-2 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-all opacity-0 group-hover:opacity-100"
                    title="Eliminar pago"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {payments.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50/30 dark:bg-transparent">
                  <p className="text-gray-400 dark:text-gray-600 font-bold text-sm uppercase tracking-widest">No hay historial de pagos</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
