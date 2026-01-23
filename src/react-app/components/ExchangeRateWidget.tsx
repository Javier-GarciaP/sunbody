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
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-md">
            <DollarSign size={20} className="text-slate-600 dark:text-slate-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Tasa de Cambio</h3>
        </div>
        {!editing && (
          <button
            onClick={handleEdit}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
            title="Editar Tasa"
          >
            <Edit2 size={16} />
          </button>
        )}
      </div>

      {editing ? (
        <div className="flex items-center gap-2">
          <input
            type="number"
            step="0.0001"
            value={newRate}
            onChange={(e) => setNewRate(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSave();
              } else if (e.key === 'Escape') {
                handleCancel();
              }
            }}
            className="input flex-1"
            autoFocus
          />
          <button
            onClick={handleSave}
            className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
          >
            <Check size={18} />
          </button>
          <button
            onClick={handleCancel}
            className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
            {rate.cop_to_ves.toFixed(4)} <span className="text-base font-normal text-slate-500 dark:text-slate-400">Bs/COP</span>
          </div>
          <div className="space-y-1.5 text-sm bg-slate-50 dark:bg-slate-700/50 p-3 rounded-md">
            <div className="flex justify-between text-slate-700 dark:text-slate-300">
              <span>1.000 COP</span>
              <span>= {(rate.cop_to_ves * 1000).toFixed(2)} Bs</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>1 COP</span>
              <span>= {rate.cop_to_ves.toFixed(4)} Bs</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
