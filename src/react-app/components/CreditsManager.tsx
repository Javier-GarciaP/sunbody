import { Trash2, CreditCard, Search, User, Plus, History } from 'lucide-react';
import { useCustomers } from '@/react-app/hooks/useCustomers';
import { usePayments } from '@/react-app/hooks/usePayments';
import { useSales } from '@/react-app/hooks/useSales';
import { useExchangeRate, convertVesToCop } from '@/react-app/hooks/useExchangeRate';
import { useState } from 'react';

export default function CreditsManager() {
  const { customers } = useCustomers();
  const { sales } = useSales();
  const { rate } = useExchangeRate();
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const { payments, createPayment, deletePayment } = usePayments(selectedCustomerId || undefined);
  const [showForm, setShowForm] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);
  const [paymentType, setPaymentType] = useState<'payin' | 'payout'>('payin');
  const [formData, setFormData] = useState({
    amount_cop: 0,
    amount_ves: 0,
    note: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const customersWithActivity = customers.filter(c => Math.abs(c.balance_cop) > 0.1); // Small epsilon for float safety if any

  const filteredCustomers = customersWithActivity.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !rate) return;

    const multiplier = paymentType === 'payout' ? -1 : 1;
    const finalNote = formData.note || (paymentType === 'payout'
      ? 'Devolución de Saldo a Favor'
      : (selectedSaleId ? `Abono a Venta #${selectedSaleId}` : 'Abono General a Deuda'));

    await createPayment(
      selectedCustomerId,
      formData.amount_cop * multiplier,
      formData.amount_ves * multiplier,
      rate.cop_to_ves,
      finalNote,
      selectedSaleId || undefined
    );
    setFormData({ amount_cop: 0, amount_ves: 0, note: '' });
    setShowForm(false);
    setSelectedSaleId(null);
  };

  const totalPayment = formData.amount_cop + (rate ? convertVesToCop(formData.amount_ves, rate.cop_to_ves) : 0);
  const totalDebt = customersWithActivity.filter(c => c.balance_cop > 0).reduce((sum, c) => sum + c.balance_cop, 0);
  const totalCredits = Math.abs(customersWithActivity.filter(c => c.balance_cop < 0).reduce((sum, c) => sum + c.balance_cop, 0));

  return (
    <div className="space-y-6 h-full flex flex-col">
      {!selectedCustomer ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card p-5">
              <div className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1 px-1">Clientes con Saldo</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{customersWithActivity.length}</div>
            </div>
            <div className="card p-5">
              <div className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1 px-1">Cuentas por Cobrar</div>
              <div className="text-2xl font-bold text-red-500 dark:text-red-400">
                ${totalDebt.toLocaleString()}
              </div>
            </div>
            <div className="card p-5 sm:col-span-2">
              <div className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1 px-1">Saldo a Favor (Total Clientes)</div>
              <div className="text-2xl font-bold text-emerald-500 dark:text-emerald-400">
                ${totalCredits.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="card flex-1 flex flex-col min-h-0 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar deudor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 h-10"
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
                    <div className={`font-bold ${customer.balance_cop > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {customer.balance_cop > 0 ? `$${customer.balance_cop.toLocaleString()}` : `- $${Math.abs(customer.balance_cop).toLocaleString()}`}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {customer.balance_cop > 0 ? 'Debe' : 'A Favor'}
                    </div>
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
                className="btn btn-ghost text-xs font-bold flex items-center gap-1"
              >
                ← VOLVER
              </button>
              <div className="h-8 w-px bg-slate-100 dark:bg-slate-700 hidden md:block"></div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedCustomer.name}</h2>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500 dark:text-slate-400">{selectedCustomer.balance_cop > 0 ? 'Deuda actual:' : 'Saldo a favor:'}</span>
                  <span className={`${selectedCustomer.balance_cop > 0 ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10' : 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10'} font-bold px-2 py-0.5 rounded text-xs`}>
                    ${Math.abs(selectedCustomer.balance_cop).toLocaleString()} COP
                  </span>
                </div>
              </div>
            </div>

            {!showForm && (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setPaymentType('payin');
                    setSelectedSaleId(null);
                    setShowForm(true);
                  }}
                  className="btn btn-primary gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Abono General
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {!showForm && (
              <div className="mb-8">
                <h4 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Ventas con Saldo Pendiente
                </h4>
                <div className="grid gap-3">
                  {(() => {
                    const pendingSales = sales.filter(s =>
                      s.customer_id === selectedCustomerId &&
                      s.is_credit &&
                      (s.total_cop - (s.paid_cop || 0) - Math.round((s.paid_ves || 0) / s.exchange_rate)) > 0.5
                    );

                    if (pendingSales.length === 0) {
                      return (
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 text-center">
                          <p className="text-gray-400 text-sm">No hay ventas a crédito pendientes</p>
                        </div>
                      );
                    }

                    return pendingSales.map(sale => {
                      const debt = sale.total_cop - (sale.paid_cop || 0) - Math.round((sale.paid_ves || 0) / sale.exchange_rate);
                      return (
                        <div key={sale.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm hover:border-brand-300 dark:hover:border-brand-500/50 transition-colors">
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                              Venta #{sale.id}
                              <span className="text-xs font-normal text-gray-500">{new Date(sale.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="text-sm text-gray-500">
                              Total: ${sale.total_cop.toLocaleString()} • Debe: <span className="font-bold text-red-500">${debt.toLocaleString()}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedSaleId(sale.id);
                              setFormData({ ...formData, amount_cop: debt, amount_ves: 0 });
                              setShowForm(true);
                              setPaymentType('payin');
                            }}
                            className="btn btn-secondary py-1 text-xs px-3 h-auto"
                          >
                            Pagar de Lote
                          </button>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
            {showForm && (
              <form onSubmit={handleSubmit} className={`mb-8 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 animate-slide-down ${paymentType === 'payout' ? 'bg-amber-50/50 dark:bg-amber-900/10' : 'bg-slate-50 dark:bg-slate-900/50'}`}>
                <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <CreditCard className="w-5 h-5" />
                  {selectedSaleId ? `Abonar a Venta #${selectedSaleId}` : 'Nuevo Pago / Abono General'}
                </h3>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Monto en COP</label>
                    <input
                      type="number"
                      value={formData.amount_cop === 0 ? '' : formData.amount_cop}
                      onChange={(e) => setFormData({ ...formData, amount_cop: parseInt(e.target.value) || 0 })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const next = e.currentTarget.parentElement?.nextElementSibling?.querySelector('input');
                          if (next instanceof HTMLInputElement) next.focus();
                        }
                      }}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:border-slate-400 outline-none transition-all placeholder:opacity-0"
                      placeholder=""
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Monto en BS</label>
                    <input
                      type="number"
                      value={formData.amount_ves === 0 ? '' : formData.amount_ves}
                      onChange={(e) => setFormData({ ...formData, amount_ves: parseFloat(e.target.value) || 0 })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const next = e.currentTarget.closest('form')?.querySelector('input[name="note"]');
                          if (next instanceof HTMLInputElement) next.focus();
                        }
                      }}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:border-slate-400 outline-none transition-all placeholder:opacity-0"
                      step="0.01"
                      placeholder=""
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Nota (Opcional)</label>
                  <input
                    name="note"
                    type="text"
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:border-slate-400 outline-none transition-all placeholder:opacity-0"
                    placeholder=""
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-xl mb-6 bg-brand-50 dark:bg-brand-500/10 border-brand-100 dark:border-brand-500/20">
                  <span className="text-brand-700 dark:text-brand-300 font-bold">
                    Total Abono
                  </span>
                  <span className="text-xl font-black text-brand-600 dark:text-brand-400">
                    ${totalPayment.toLocaleString()} COP
                  </span>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setSelectedSaleId(null);
                    }}
                    className="btn btn-ghost"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary px-8"
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
                      <span className={`font-black text-lg ${payment.amount_cop < 0 || payment.amount_ves < 0 ? 'text-amber-600 dark:text-amber-400' : 'text-success-600 dark:text-success-400'}`}>
                        {payment.amount_cop < 0 || payment.amount_ves < 0 ? '-' : '+'} ${(Math.abs(payment.amount_cop) + convertVesToCop(Math.abs(payment.amount_ves), payment.exchange_rate)).toLocaleString()}
                      </span>
                      <span className="text-gray-300 dark:text-gray-600 text-xs">•</span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm font-semibold">
                        {payment.amount_cop < 0 || payment.amount_ves < 0 ? 'Retiro / Devolución' : 'Total Abonado'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 flex gap-2 font-medium">
                      <span>{payment.amount_cop !== 0 && `${payment.amount_cop < 0 ? '-' : ''}$${Math.abs(payment.amount_cop).toLocaleString()} COP`}</span>
                      {(payment.amount_cop !== 0 && payment.amount_ves !== 0) && <span>+</span>}
                      <span>{payment.amount_ves !== 0 && `${payment.amount_ves < 0 ? '-' : ''}${Math.abs(payment.amount_ves)} Bs`}</span>
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
