import { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { formatMoney, formatDate } from '../lib/utils';
import { Filter, Trash2, Loader2 } from 'lucide-react';
import { useCategories } from '../lib/categories';

export default function History() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState('Todas');
  const [loading, setLoading] = useState(true);
  const { categories } = useCategories();

  const loadHistory = async () => {
    try {
      const params = filter && filter !== 'Todas' ? `?category=${encodeURIComponent(filter)}` : '';
      const res = await apiFetch(`/expenses${params}`);
      if (res) setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [filter]);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este gasto?')) return;
    try {
      await apiFetch(`/expenses/${id}`, { method: 'DELETE' });
      setData(data.filter(exp => exp.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-full transition-colors">
      <header className="px-6 pt-12 pb-6 sticky top-0 z-10 bg-transparent">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Historial</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Todos tus movimientos</p>
      </header>

      <div className="px-6 pb-4">
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3 transition-colors">
          <div className="pl-3">
            <Filter className="w-5 h-5 text-slate-400" />
          </div>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="flex-1 bg-transparent border-none py-2 pr-4 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-0 appearance-none"
          >
            <option value="Todas" className="text-slate-900">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat.name} value={cat.name} className="text-slate-900">{cat.icon} {cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="px-6 pb-24 flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center mt-12"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>
        ) : data.length === 0 ? (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 text-center border border-slate-100 dark:border-slate-700 shadow-sm mt-4 transition-colors">
            <p className="text-slate-500 dark:text-slate-400 font-medium">No hay gastos en esta categoría</p>
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {data.map((exp) => (
              <div key={exp.id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4 group transition-all hover:shadow-md">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/20 flex items-center justify-center text-2xl border border-indigo-100/50 dark:border-indigo-500/20">
                  {exp.categoryIcon || '📦'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 dark:text-white truncate">{exp.description}</p>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">{exp.category} • {formatDate(exp.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 dark:text-white">-{formatMoney(exp.amount)}</p>
                </div>
                <button 
                  onClick={() => handleDelete(exp.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
