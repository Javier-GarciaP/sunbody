import { useState } from 'react';
import { DollarSign, Edit2, Check, X } from 'lucide-react';
import { useExchangeRate } from '@/react-app/hooks/useExchangeRate';

export default function ExchangeRateWidget() {
  const { rate, updateRate } = useExchangeRate();
  const [editing, setEditing] = useState(false);
  const [newRate, setNewRate] = useState('');

  const handleEdit = () => {
    setNewRate(rate?.cop_to_ves.toString() || '');
    setEditing(true);
  };

  const handleSave = async () => {
    if (newRate && parseFloat(newRate) > 0) {
      await updateRate(parseFloat(newRate));
      setEditing(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setNewRate('');
  };

  if (!rate) return null;

  return (
    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 rounded-2xl p-4 md:p-6 text-white shadow-lg relative overflow-hidden group md:hover:scale-[1.02] transition-transform duration-300">
      <div className="absolute top-0 right-0 p-8 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-white/20 transition-colors"></div>

      <div className="relative z-10 flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <DollarSign className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold">Tasa de Cambio</h3>
        </div>
        {!editing && (
          <button
            onClick={handleEdit}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            title="Editar Tasa"
          >
            <Edit2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {editing ? (
        <div className="relative z-10 flex items-center gap-2 bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/20">
          <div className="flex-1">
            <input
              type="number"
              step="0.0001"
              value={newRate}
              onChange={(e) => setNewRate(e.target.value)}
              className="w-full px-3 py-1 bg-transparent border-none text-white placeholder-white/50 focus:outline-none text-lg font-bold"
              placeholder="0.0000"
              autoFocus
            />
          </div>
          <button
            onClick={handleSave}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition shadow-sm text-emerald-100"
          >
            <Check className="w-5 h-5" />
          </button>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-white/10 rounded-lg transition text-red-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div className="relative z-10 space-y-3">
          <div className="text-4xl font-bold tracking-tight">{rate.cop_to_ves.toFixed(4)} <span className="text-lg opacity-70 font-medium">Bs/COP</span></div>
          <div className="flex flex-col gap-1 text-sm font-medium text-emerald-100/90 bg-black/10 p-3 rounded-lg backdrop-blur-sm">
            <div className="flex justify-between">
              <span>1.000 COP</span>
              <span>= {(rate.cop_to_ves * 1000).toFixed(2)} Bs</span>
            </div>
            <div className="flex justify-between opacity-80 text-xs">
              <span>1 COP</span>
              <span>= {rate.cop_to_ves.toFixed(4)} Bs</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
