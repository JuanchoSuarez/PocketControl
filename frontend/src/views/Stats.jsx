import { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { formatMoney } from '../lib/utils';
import { TrendingUp, TrendingDown, Activity, DollarSign, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, eachWeekOfInterval, isSameDay, isSameMonth } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Stats() {
  const [data, setData] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartView, setChartView] = useState('daily'); // 'daily', 'weekly', 'monthly'

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [statsRes, expensesRes] = await Promise.all([
          apiFetch('/stats'),
          apiFetch('/expenses')
        ]);
        if (statsRes) setData(statsRes);
        if (expensesRes) setExpenses(expensesRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const getChartData = () => {
    if (!expenses || expenses.length === 0) return [];
    
    const now = new Date();
    let result = [];

    if (chartView === 'daily') {
      const start = startOfWeek(now, { weekStartsOn: 1 });
      const end = endOfWeek(now, { weekStartsOn: 1 });
      const days = eachDayOfInterval({ start, end });
      
      result = days.map(day => {
        const dayExpenses = expenses.filter(e => isSameDay(parseISO(e.createdAt), day));
        const total = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
        return {
          name: format(day, 'EEEEEE', { locale: es }).toUpperCase(), // L, M, X, J, V, S, D
          fullDate: format(day, 'dd MMM', { locale: es }),
          total
        };
      });
    } else if (chartView === 'weekly') {
      const start = startOfMonth(now);
      const end = endOfMonth(now);
      const weeks = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 });
      
      result = weeks.map((weekStart, i) => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
        const weekExpenses = expenses.filter(e => {
          const d = parseISO(e.createdAt);
          return d >= weekStart && d <= weekEnd;
        });
        const total = weekExpenses.reduce((sum, e) => sum + e.amount, 0);
        return {
          name: `Sem ${i + 1}`,
          fullDate: `${format(weekStart, 'dd MMM', { locale: es })} - ${format(weekEnd, 'dd MMM', { locale: es })}`,
          total
        };
      });
    } else if (chartView === 'monthly') {
      const monthExpenses = expenses.filter(e => isSameMonth(parseISO(e.createdAt), now));
      const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
      result = [{
        name: format(now, 'MMM', { locale: es }).toUpperCase(),
        fullDate: format(now, 'MMMM yyyy', { locale: es }),
        total
      }];
    }

    return result;
  };

  const chartData = getChartData();

  if (loading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>;
  }

  const total = parseFloat(data?.totalMonth) || 0;
  const prev = parseFloat(data?.totalPrevMonth) || 0;
  const count = data?.transactionCount || 0;
  const avg = parseFloat(data?.averagePerDay) || 0;
  const cats = data?.categories || [];

  return (
    <div className="flex flex-col h-full transition-colors">
      <header className="px-6 pt-12 pb-6 sticky top-0 z-10 bg-transparent">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Estadísticas</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Análisis detallado de tus gastos</p>
      </header>

      <div className="px-6 pb-24 space-y-8 overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-500/20 flex items-center justify-center mb-3 text-indigo-600 dark:text-indigo-400">
              <DollarSign className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Total mes</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{formatMoney(total)}</p>
          </div>
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
            <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center mb-3 text-slate-600 dark:text-slate-300">
              <Activity className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Mes anterior</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{formatMoney(prev)}</p>
          </div>
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/20 flex items-center justify-center mb-3 text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Transacciones</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{count}</p>
          </div>
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
            <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-500/20 flex items-center justify-center mb-3 text-purple-600 dark:text-purple-400">
              <TrendingDown className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Promedio/día</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{formatMoney(avg)}</p>
          </div>
        </div>

        {/* Interactive Chart */}
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Evolución</h3>
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
              <button onClick={() => setChartView('daily')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${chartView === 'daily' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>Día</button>
              <button onClick={() => setChartView('weekly')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${chartView === 'weekly' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>Sem</button>
              <button onClick={() => setChartView('monthly')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${chartView === 'monthly' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>Mes</button>
            </div>
          </div>
          
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#94a3b8' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8' }} 
                  tickFormatter={(val) => `$${val/1000}k`}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl border border-slate-700">
                          <p className="font-bold mb-1 opacity-80">{payload[0].payload.fullDate}</p>
                          <p className="text-sm font-bold text-indigo-400">{formatMoney(payload[0].value)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="total" radius={[6, 6, 6, 6]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="url(#colorTotal)" opacity={entry.total > 0 ? 1 : 0.2} />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={1}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Progress */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 px-1">Por categoría</h3>
          {cats.length === 0 ? (
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 text-center border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
              <p className="text-slate-500 dark:text-slate-400 font-medium">Sin datos aún</p>
            </div>
          ) : (
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm space-y-5 transition-colors">
              {cats.map((cat, i) => (
                <div key={i}>
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <span className="text-xl bg-slate-50 dark:bg-slate-900 w-8 h-8 flex justify-center items-center rounded-lg">{cat.icon}</span> 
                      {cat.category}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatMoney(cat.total)}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                      style={{ width: `${Math.min(cat.percent, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
