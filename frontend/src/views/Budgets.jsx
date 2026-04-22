import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { ArrowLeft, Check, Loader2, Plus, Trash2, Wallet } from 'lucide-react';
import { useCategories } from '../lib/categories';

export default function Budgets() {
  const navigate = useNavigate();
  const { categories, addCategory, removeCategory } = useCategories();
  const [budgets, setBudgets] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('📁');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBudgets = async () => {
      try {
        const data = await apiFetch('/budgets');
        if (data) {
          const budgetMap = {};
          data.forEach(b => { budgetMap[b.category] = b.amount; });
          setBudgets(budgetMap);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadBudgets();
  }, []);

  const parseBudget = (val) => parseFloat((val || '').toString().replace(/\./g, '')) || 0;

  const formatBudgetInput = (value) => {
    const digits = value.replace(/[^\d]/g, '');
    return digits.length > 3
      ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
      : digits;
  };

  const totalBudget = parseBudget(budgets['Total']) || 500000;

  const handleSave = async (category) => {
    const amount = parseBudget(budgets[category]);
    if (!amount || amount <= 0) return;

    if (category !== 'Total') {
      let sumOther = 0;
      Object.entries(budgets).forEach(([k, v]) => {
        if (k !== 'Total' && k !== category && v) {
          sumOther += parseBudget(v);
        }
      });
      if ((sumOther + amount) > totalBudget) {
        setError(`¡Error! Al asignar $${amount.toLocaleString('es-CO')} excedes tu Presupuesto General de $${totalBudget.toLocaleString('es-CO')}.`);
        setTimeout(() => setError(''), 5000);
        return;
      }
    }

    setSaving(category);
    try {
      await apiFetch('/budgets', {
        method: 'POST',
        body: JSON.stringify({ category, amount })
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(null);
    }
  };

  const handleChange = (category, value) => {
    setBudgets(prev => ({ ...prev, [category]: value }));
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const added = addCategory(newCatName.trim(), newCatIcon);
    if (added) {
      setNewCatName('');
      setNewCatIcon('📁');
      setIsAdding(false);
    } else {
      alert("La categoría ya existe");
    }
  };

  const handleDeleteCategory = (name) => {
    if (window.confirm(`¿Eliminar la categoría ${name}?`)) {
      removeCategory(name);
    }
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>;
  }

  return (
    <div className="flex flex-col h-full transition-colors relative">
      {/* Error Toast */}
      {error && (
        <div className="absolute top-4 left-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl z-50 shadow-lg font-medium text-sm animate-in slide-in-from-top-2">
          {error}
        </div>
      )}

      <header className="px-6 pt-24 pb-6 sticky top-0 z-10 flex justify-between items-start bg-transparent">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Presupuesto</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gestiona límites y categorías</p>
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </header>

      <div className="px-6 pb-24 space-y-4 overflow-y-auto">
        
        {/* Presupuesto Maestro */}
        <div className="bg-indigo-600 dark:bg-indigo-900 p-5 rounded-2xl border border-indigo-500 dark:border-indigo-700 shadow-lg shadow-indigo-500/20 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Presupuesto General</h3>
              <p className="text-indigo-200 text-xs font-medium">Tope máximo mensual</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300 font-medium">$</span>
              <input
                type="text"
                inputMode="numeric"
                value={budgets['Total'] || ''}
                onChange={(e) => handleChange('Total', formatBudgetInput(e.target.value))}
                placeholder="500.000"
                className="w-full pl-7 pr-3 py-2.5 bg-indigo-700/50 dark:bg-indigo-950/50 border border-indigo-500 dark:border-indigo-600 rounded-xl text-white placeholder-indigo-300/50 font-bold focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              />
            </div>
            <button 
              onClick={() => handleSave('Total')}
              disabled={saving === 'Total' || !budgets['Total']}
              className="px-4 bg-white text-indigo-600 rounded-xl flex flex-shrink-0 items-center justify-center hover:bg-indigo-50 disabled:opacity-50 transition-colors font-bold shadow-sm"
            >
              {saving === 'Total' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar'}
            </button>
          </div>
        </div>

        <div className="h-px w-full bg-slate-200 dark:bg-slate-800 my-4"></div>

        {/* Añadir categoría */}
        {!isAdding ? (
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full py-4 border-2 border-dashed border-indigo-200 dark:border-indigo-900/50 rounded-2xl flex flex-col items-center justify-center text-indigo-500 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors gap-2"
          >
            <Plus className="w-6 h-6" />
            <span className="font-semibold text-sm">Crear nueva categoría</span>
          </button>
        ) : (
          <form onSubmit={handleAddCategory} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white">Nueva Categoría</h3>
            <div className="flex gap-3">
              <input 
                type="text" 
                value={newCatIcon}
                onChange={e => setNewCatIcon(e.target.value)}
                placeholder="Icono"
                className="w-16 text-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xl"
                maxLength={2}
              />
              <input 
                type="text" 
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                placeholder="Nombre de la categoría"
                className="flex-1 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-2 rounded-lg font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Cancelar</button>
              <button type="submit" disabled={!newCatName.trim()} className="flex-1 py-2 rounded-lg font-medium bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-50 transition-colors">Guardar</button>
            </div>
          </form>
        )}

        {categories.map(cat => (
          <div key={cat.name} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4 group transition-colors">
            <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-2xl border border-slate-100 dark:border-slate-700">
              {cat.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <p className="font-bold text-slate-900 dark:text-white">{cat.name}</p>
                <button onClick={() => handleDeleteCategory(cat.name)} className="text-slate-400 hover:text-red-500 p-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={budgets[cat.name] || ''}
                  onChange={(e) => handleChange(cat.name, formatBudgetInput(e.target.value))}
                  placeholder="No definido"
                  className="w-full pl-7 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 dark:text-white transition-all"
                />
              </div>
            </div>
            <button 
              onClick={() => handleSave(cat.name)}
              disabled={saving === cat.name || !budgets[cat.name]}
              className="w-10 h-10 mt-6 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex flex-shrink-0 items-center justify-center hover:bg-indigo-100 dark:hover:bg-indigo-500/30 disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400 transition-colors"
            >
              {saving === cat.name ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
