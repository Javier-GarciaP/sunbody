import { useState } from 'react';
import { Plus, Edit2, Trash2, Check, ChevronDown } from 'lucide-react';
import { useColors } from '@/react-app/hooks/useColors';
import { Color } from '@/shared/types';

export default function ColorManager() {
  const { colors, createColor, updateColor, deleteColor } = useColors();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', hex_code: '#000000' });

  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateColor(editingId, formData.name, formData.hex_code);
      setEditingId(null);
    } else {
      await createColor(formData.name, formData.hex_code);
    }
    setFormData({ name: '', hex_code: '#000000' });
    setShowForm(false);
  };

  const handleEdit = (color: Color) => {
    setFormData({ name: color.name, hex_code: color.hex_code });
    setEditingId(color.id);
    setShowForm(true);
    setIsExpanded(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', hex_code: '#000000' });
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-soft border border-gray-200 dark:border-gray-700 transition-all duration-300 overflow-hidden">
      <div
        className="flex items-center justify-between p-6 cursor-pointer hover:bg-white/40 dark:hover:bg-gray-600/40 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            Paleta de Colores
            <span className="text-[10px] font-bold px-2 py-0.5 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded-full border border-brand-100 dark:border-brand-800 uppercase tracking-wide">
              {colors.length} colores
            </span>
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-1">
            Gestiona los colores disponibles para tus productos
          </p>
        </div>

        <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-6 pt-0 border-t border-gray-100 dark:border-gray-600/50">
          {!showForm && (
            <div className="flex justify-end mb-6 pt-6">
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Color</span>
              </button>
            </div>
          )}

          {showForm && (
            <form onSubmit={handleSubmit} className="mb-8 mt-6 p-6 bg-white dark:bg-gray-800/50 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600 animate-fade-in ring-1 ring-gray-900/5 dark:ring-white/10">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Nombre del Color</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm"
                    placeholder="Ej. Rojo Pasión"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Código Hexadecimal</label>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <input
                        type="color"
                        value={formData.hex_code}
                        onChange={(e) => setFormData({ ...formData, hex_code: e.target.value })}
                        className="w-10 h-10 rounded-lg cursor-pointer border-2 border-gray-200 dark:border-gray-600 p-1"
                      />
                    </div>
                    <input
                      type="text"
                      value={formData.hex_code}
                      onChange={(e) => setFormData({ ...formData, hex_code: e.target.value })}
                      className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all uppercase font-mono text-sm"
                      pattern="^#[0-9A-Fa-f]{6}$"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-600 justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-lg shadow-blue-500/20"
                >
                  <Check className="w-4 h-4" />
                  {editingId ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {colors.map((color) => (
              <div
                key={color.id}
                className="group relative flex items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200"
              >
                <div
                  className="w-8 h-8 rounded-full shadow-sm ring-2 ring-gray-100 dark:ring-gray-700 flex-shrink-0"
                  style={{ backgroundColor: color.hex_code }}
                />

                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-gray-200 truncate text-xs">{color.name}</div>
                  <div className="text-[10px] font-mono text-gray-400">{color.hex_code}</div>
                </div>

                <div className="absolute right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-opacity dark:bg-opacity pl-2">
                  <button
                    onClick={() => handleEdit(color)}
                    className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteColor(color.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {colors.length === 0 && (
              <div className="col-span-full py-8 text-center text-gray-400 dark:text-gray-500 text-sm">
                No hay colores registrados
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

