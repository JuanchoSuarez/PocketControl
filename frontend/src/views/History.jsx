import { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { formatMoney, formatDate } from '../lib/utils';
import { Filter, Trash2, Loader2 } from 'lucide-react';
import { useCategories } from '../lib/categories';

export default function History() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState('Todas');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
      <header className="px-6 pt-24 pb-6 sticky top-0 z-10 bg-transparent">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Historial</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Todos tus movimientos</p>
      </header>

      <div className="px-6 pb-4 relative z-20">
        <div 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between cursor-pointer transition-all hover:border-indigo-400 dark:hover:border-indigo-500"
        >
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            <span className="text-slate-700 dark:text-slate-300 font-bold">
              {filter === 'Todas' ? 'Todas las categorías' : `${categories.find(c => c.name === filter)?.icon || '📦'} ${filter}`}
            </span>
          </div>
          <div className={`transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}>
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>

        {isDropdownOpen && (
          <div className="absolute top-full left-6 right-6 mt-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="max-h-64 overflow-y-auto no-scrollbar py-2">
              <div 
                onClick={() => { setFilter('Todas'); setIsDropdownOpen(false); }}
                className={`px-4 py-3 cursor-pointer transition-colors flex items-center gap-3 ${filter === 'Todas' ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 font-medium'}`}
              >
                <div className="w-6 text-center">🌍</div>
                Todas las categorías
              </div>
              {categories.map(cat => (
                <div 
                  key={cat.name}
                  onClick={() => { setFilter(cat.name); setIsDropdownOpen(false); }}
                  className={`px-4 py-3 cursor-pointer transition-colors flex items-center gap-3 ${filter === cat.name ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 font-medium'}`}
                >
                  <div className="w-6 text-center">{cat.icon}</div>
                  {cat.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="px-6 pb-24 flex-1 overflow-y-auto relative z-10">
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
