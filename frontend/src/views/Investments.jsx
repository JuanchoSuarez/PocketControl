import { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { formatMoney } from '../lib/utils';
import { Shield, Zap, Sparkles, Building, Globe, Banknote, Loader2 } from 'lucide-react';

export default function Investments() {
  const [profile, setProfile] = useState('leve');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await apiFetch('/stats/home');
        if (res) setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getRecommendation = () => {
    if (!data) return 'Cargando recomendación...';
    
    const spent = parseFloat(data.totalMonth) || 0;
    const budget = parseFloat(data.budget) || 500000;
    const ahorro = Math.max(budget - spent, 0);

    if (ahorro <= 0) {
      return `Este mes gastaste ${formatMoney(spent)}, excediendo o igualando tu presupuesto general de ${formatMoney(budget)}. Te recomendamos reducir tus gastos primero para liberar capital antes de empezar a invertir.`;
    }

    if (profile === 'leve') {
      // 8% anual / 12 meses
      const gananciaMensual = ahorro * (0.08 / 12);
      return `Tu ahorro disponible es ${formatMoney(ahorro)}. Si inviertes esto en un CDT tradicional con una tasa del 8% E.A., podrías generar aproximadamente ${formatMoney(gananciaMensual)} en rendimiento en solo 30 días, sin ningún riesgo de pérdida de capital.`;
    } else {
      // 12% anual / 12 meses
      const gananciaMensual = ahorro * (0.12 / 12);
      return `Tienes ${formatMoney(ahorro)} para invertir. En el perfil moderado, un fondo diversificado o un ETF como el S&P 500 tiene un retorno histórico del ~12% anual. Esto te generaría un promedio de ${formatMoney(gananciaMensual)} al mes, asumiendo un riesgo a corto plazo a favor de mayores ganancias a largo plazo.`;
    }
  };

  return (
    <div className="flex flex-col h-full transition-colors">
      <header className="px-6 pt-12 pb-6 sticky top-0 z-10 bg-transparent">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Inversiones</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Haz crecer tu dinero</p>
      </header>

      {loading ? (
        <div className="flex justify-center mt-12"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>
      ) : (
        <div className="px-6 pb-24 space-y-6 flex-1 overflow-y-auto">
          <div className="flex bg-slate-200/50 dark:bg-slate-800 p-1 rounded-xl transition-colors">
            <button
              onClick={() => setProfile('leve')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${profile === 'leve' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              <Shield className="w-4 h-4" />
              Perfil Leve
            </button>
            <button
              onClick={() => setProfile('moderado')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${profile === 'moderado' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              <Zap className="w-4 h-4" />
              Perfil Moderado
            </button>
          </div>

          {profile === 'leve' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800/50 p-3 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors">
                <Shield className="w-4 h-4" />
                Bajo riesgo — Ideal para empezar con seguridad
              </div>
              
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
                    <Banknote className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">CDT Bancolombia</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Certificado de Depósito a Término</p>
                    <div className="flex gap-2">
                      <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded text-xs font-semibold">8.0% E.A.</span>
                      <span className="bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded text-xs font-semibold">Riesgo Bajo</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
                    <Building className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Fondo Fiduciaria Bogotá</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Fondo de renta fija diversificado</p>
                    <div className="flex gap-2">
                      <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded text-xs font-semibold">7.5% E.A.</span>
                      <span className="bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded text-xs font-semibold">Riesgo Bajo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {profile === 'moderado' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border border-amber-100 dark:border-amber-800/50 p-3 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors">
                <Zap className="w-4 h-4" />
                Riesgo moderado — Mayor retorno y volatilidad
              </div>
              
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-purple-50 dark:bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
                    <Globe className="w-6 h-6 text-purple-500 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">ETF S&P 500 (iShares)</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Exposición a las 500 mayores empresas de EE.UU.</p>
                    <div className="flex gap-2">
                      <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded text-xs font-semibold">~12% E.A.</span>
                      <span className="bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 px-2 py-1 rounded text-xs font-semibold">Riesgo Moderado</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden mt-6 transition-transform hover:scale-[1.02]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <h3 className="font-bold text-lg">Proyección IA</h3>
            </div>
            <p className="text-indigo-100 leading-relaxed text-sm">
              {getRecommendation()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
