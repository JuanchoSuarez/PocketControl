import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, LogOut, Send, AlertTriangle, Coffee, ShoppingCart, Gamepad2, GraduationCap, Pill, Package, Bus } from 'lucide-react';
import { apiFetch, getUserEmail } from '../services/api';
import { formatMoney, formatDate } from '../lib/utils';
import { useCategories } from '../lib/categories';

export default function Home() {
  const navigate = useNavigate();
  const { categories } = useCategories();
  const [data, setData] = useState(null);
  const [expenseText, setExpenseText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [stars, setStars] = useState(0);
  const [showStarAnim, setShowStarAnim] = useState(false);
  const userEmail = getUserEmail();

  const loadData = async () => {
    try {
      const [res, meRes] = await Promise.all([
        apiFetch('/stats/home'),
        apiFetch('/auth/me')
      ]);
      if (res) setData(res);
      if (meRes) setStars(meRes.stars || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    if (!expenseText.trim()) return;

    let catName = selectedCategory;
    let catIcon = '';
    if (selectedCategory) {
      const c = categories.find(cat => cat.name === selectedCategory);
      if (c) catIcon = c.icon;
    }

    try {
      await apiFetch('/expenses', {
        method: 'POST',
        body: JSON.stringify({ 
          text: expenseText, 
          category: catName,
          categoryIcon: catIcon
        })
      });
      setExpenseText('');
      setSelectedCategory('');
      
      // Mostrar animación y actualizar estrellas optimísticamente
      setStars(prev => prev + 1);
      setShowStarAnim(true);
      setTimeout(() => setShowStarAnim(false), 2000);
      
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTextChange = (e) => {
    const val = e.target.value;
    // Match each numeric sequence (digits possibly mixed with dots from previous formatting),
    // strip all dots within it, then re-apply thousand separators.
    const formatted = val.replace(/\d[\d.]*/g, (match) => {
      const digits = match.replace(/\./g, '');
      return digits.length > 3
        ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
        : digits;
    });
    setExpenseText(formatted);
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    const name = userEmail ? userEmail.split('@')[0] : '';
    if (h < 12) return `Buenos días, ${name} ☀️`;
    if (h < 18) return `Buenas tardes, ${name} 🌤️`;
    return `Buenas noches, ${name} 🌙`;
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const spent = parseFloat(data?.totalMonth) || 0;
  const budget = parseFloat(data?.budget) || 500000;
  const remaining = parseFloat(data?.remaining) || (budget - spent);
  const percent = parseFloat(data?.budgetPercent) || 0;
  const clampedPercent = Math.min(percent, 100);
  const recent = data?.recentExpenses || [];

  return (
    <div className="flex flex-col h-full transition-colors">
      <header className="px-6 pt-24 pb-4 sticky top-0 z-10 bg-transparent flex flex-col items-start gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{getGreeting()}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Aquí va tu resumen del mes</p>
        </div>
        <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-500/20 px-4 py-2 rounded-full border border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 shadow-sm relative transition-transform hover:scale-105">
          <span className="font-extrabold text-lg">{stars}</span>
          <span className="text-lg">⭐️</span>
          <span className="text-xs font-semibold ml-1">Puntos acumulados</span>
          {showStarAnim && (
            <span className="absolute -top-4 right-0 text-amber-500 font-bold animate-bounce text-sm">+1</span>
          )}
        </div>
      </header>

      <div className="px-6 pb-48 space-y-8 flex-1 overflow-y-auto">
        {/* Budget Alert */}
        {percent >= 80 && (
          <div className={`flex items-center gap-3 p-4 rounded-2xl border shadow-sm backdrop-blur-md ${percent >= 100 ? 'bg-red-50/80 border-red-200 dark:bg-red-900/30 dark:border-red-900/50 text-red-800 dark:text-red-300' : 'bg-amber-50/80 border-amber-200 dark:bg-amber-900/30 dark:border-amber-900/50 text-amber-800 dark:text-amber-300'}`}>
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">
              {percent >= 100 ? '¡Superaste tu presupuesto mensual!' : `Has usado el ${Math.round(percent)}% de tu presupuesto`}
            </p>
          </div>
        )}

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 dark:from-slate-900 dark:to-slate-800 border border-indigo-500/30 dark:border-slate-700 rounded-[2rem] p-7 text-white shadow-2xl shadow-indigo-500/20 dark:shadow-indigo-900/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 dark:bg-indigo-500/30 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 dark:bg-purple-500/20 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2"></div>
          
          <div className="relative z-10">
            <p className="text-indigo-100 dark:text-slate-400 text-sm font-medium mb-2">Gastado este mes</p>
            <h2 className="text-4xl font-extrabold tracking-tight mb-8">{formatMoney(spent)}</h2>
            
            <div className="space-y-3">
              <div className="h-2.5 w-full bg-white/20 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${percent >= 100 ? 'bg-rose-300 dark:bg-gradient-to-r dark:from-red-500 dark:to-rose-400' : percent >= 80 ? 'bg-amber-300 dark:bg-gradient-to-r dark:from-amber-500 dark:to-orange-400' : 'bg-white dark:bg-gradient-to-r dark:from-indigo-500 dark:to-purple-500'}`}
                  style={{ width: `${clampedPercent}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-indigo-100 dark:text-slate-400">Presupuesto: {formatMoney(budget)}</span>
                <span className={remaining < 0 ? 'text-rose-300 dark:text-rose-400' : 'text-emerald-300 dark:text-emerald-400'}>
                  Disponible: {formatMoney(remaining)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/budgets')}
            className="flex-1 flex items-center justify-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md text-indigo-700 dark:text-indigo-300 px-4 py-3 rounded-2xl text-sm font-bold hover:bg-white dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 shadow-sm"
          >
            <FolderOpen className="w-5 h-5" />
            Gestionar Categorías
          </button>
        </div>

        {/* Gamification Banner */}
        <div
          className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden transform hover:-translate-y-1 transition-transform cursor-pointer active:scale-95"
          onClick={() => navigate('/metas')}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="relative z-10">
            <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
              <span>🎯</span> Siguiente meta: 100 ⭐️
            </h3>
            <p className="text-amber-50 text-sm mb-3">Te faltan {Math.max(0, 100 - stars)} puntos para subir de nivel.</p>
            <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((stars / 100) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Recent Expenses */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 px-1">Últimos gastos</h3>
          {recent.length === 0 ? (
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 text-center border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
              <div className="w-14 h-14 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-700">
                <Package className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Aún no tienes gastos registrados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recent.map((exp, i) => (
                <div key={i} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Expense Input */}
      <div className="fixed bottom-[88px] left-0 w-full flex justify-center px-4 pointer-events-none z-40">
        <div className="w-full max-w-md pointer-events-auto">
          <form onSubmit={handleExpenseSubmit} className="bg-white/95 dark:bg-slate-900/95 p-3 rounded-[24px] shadow-2xl flex flex-col gap-2 border border-slate-200/80 dark:border-slate-800/50 backdrop-blur-xl transition-colors">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 px-1">
              <button
                type="button"
                onClick={() => setSelectedCategory('')}
                className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex-shrink-0 ${!selectedCategory ? 'bg-indigo-500 text-white shadow-md' : 'bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
              >
                ✨ Auto
              </button>
              {categories.map(cat => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex flex-shrink-0 items-center gap-1.5 ${selectedCategory === cat.name ? 'bg-indigo-500 text-white shadow-md' : 'bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
                >
                  <span>{cat.icon}</span> {cat.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={expenseText}
                onChange={handleTextChange}
                className="flex-1 bg-white/90 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400 text-sm font-medium transition-all shadow-sm"
                placeholder='Ej: "café 3500" o "uber 8000"'
              />
              <button 
                type="submit"
                disabled={!expenseText.trim()}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 text-white p-3.5 rounded-xl transition-all shadow-md flex-shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
