import { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { formatMoney } from '../lib/utils';
import { Shield, Zap, Sparkles, Building, Globe, Banknote, Loader2, Plus, X, RefreshCw } from 'lucide-react';

export default function Investments() {
  const [profile, setProfile] = useState('leve');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modal de nueva inversión
  const [showModal, setShowModal] = useState(false);
  const [newInv, setNewInv] = useState({ name: '', amount: '', type: 'Tasa Fija', duration: '12 meses', date: '' });
  const [creating, setCreating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  // Conjuntos de opciones que se rotan al refrescar
  const investmentSets = {
    leve: [
      [
        { name: 'CDT Bancolombia', desc: 'Certificado de Depósito a Término', rate: '8.0% E.A.', rateNum: 0.08, risk: 'Riesgo Bajo', icon: Banknote, color: 'indigo' },
        { name: 'Fondo Fiduciaria Bogotá', desc: 'Fondo de renta fija diversificado', rate: '7.5% E.A.', rateNum: 0.075, risk: 'Riesgo Bajo', icon: Building, color: 'blue' }
      ],
      [
        { name: 'CDT Davivienda', desc: 'Tasa fija a 90 días', rate: '7.8% E.A.', rateNum: 0.078, risk: 'Riesgo Bajo', icon: Banknote, color: 'indigo' },
        { name: 'Fondo Skandia', desc: 'Renta fija colombiana', rate: '8.2% E.A.', rateNum: 0.082, risk: 'Riesgo Bajo', icon: Building, color: 'blue' }
      ],
      [
        { name: 'CDT BBVA', desc: 'Plazo fijo 180 días', rate: '8.5% E.A.', rateNum: 0.085, risk: 'Riesgo Bajo', icon: Banknote, color: 'indigo' },
        { name: 'TES Colombia', desc: 'Títulos de deuda pública', rate: '7.0% E.A.', rateNum: 0.07, risk: 'Riesgo Bajo', icon: Building, color: 'blue' }
      ]
    ],
    moderado: [
      [
        { name: 'ETF S&P 500 (iShares)', desc: 'Exposición a las 500 mayores empresas de EE.UU.', rate: '~12% E.A.', rateNum: 0.12, risk: 'Riesgo Moderado', icon: Globe, color: 'purple' }
      ],
      [
        { name: 'Acciones Ecopetrol', desc: 'Principal petrolera colombiana', rate: '~15% E.A.', rateNum: 0.15, risk: 'Riesgo Moderado', icon: Globe, color: 'purple' }
      ],
      [
        { name: 'ETF Nasdaq 100', desc: 'Índice tecnológico de EE.UU.', rate: '~14% E.A.', rateNum: 0.14, risk: 'Riesgo Moderado', icon: Globe, color: 'purple' }
      ]
    ]
  };
  const [setIndex, setSetIndex] = useState(0);

  const handleRefresh = () => {
    setRefreshing(true);
    setSetIndex(prev => (prev + 1) % 3);
    setLastUpdated(new Date());
    setTimeout(() => setRefreshing(false), 600);
  };

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

  const handleCreateInvestment = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const amountNum = parseFloat(newInv.amount.replace(/\./g, '').replace(/,/g, ''));
      if (isNaN(amountNum) || amountNum <= 0) return;
      
      const payload = {
        name: newInv.name,
        amount: amountNum,
        type: newInv.type,
        duration: newInv.duration,
      };
      if (newInv.date) {
        payload.createdAt = new Date(newInv.date).toISOString();
      }

      await apiFetch('/investments', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setShowModal(false);
      setNewInv({ name: '', amount: '', type: 'Tasa Fija', duration: '12 meses', date: '' });
      alert('¡Inversión registrada! Ganaste 5 estrellas ⭐️');
    } catch (err) {
      console.error(err);
      alert('Error al registrar inversión');
    } finally {
      setCreating(false);
    }
  };

  const getRecommendation = () => {
    if (!data) return 'Cargando recomendación...';

    const spent = parseFloat(data.totalMonth) || 0;
    const budget = parseFloat(data.budget) || 500000;
    const ahorro = Math.max(budget - spent, 0);

    if (ahorro <= 0) {
      return `Este mes gastaste ${formatMoney(spent)}, excediendo o igualando tu presupuesto general de ${formatMoney(budget)}. Te recomendamos reducir tus gastos primero para liberar capital antes de empezar a invertir.`;
    }

    const currentOptions = investmentSets[profile][setIndex];
    const avgRate = currentOptions.reduce((sum, opt) => sum + opt.rateNum, 0) / currentOptions.length;
    const optNames = currentOptions.map(o => o.name).join(' / ');
    const rateLabel = (avgRate * 100).toFixed(1);

    const gananciaMensual = ahorro * (avgRate / 12);
    const proj6m = ahorro + (gananciaMensual * 6);
    const proj2y = ahorro * Math.pow(1 + avgRate, 2);
    const proj5y = ahorro * Math.pow(1 + avgRate, 5);

    return (
      <div className="space-y-3">
        <p>
          Con tu ahorro de <strong>{formatMoney(ahorro)}</strong>, si inviertes en{' '}
          <strong>{optNames}</strong> a una tasa del <strong>{rateLabel}% E.A.</strong>,
          podrías generar <strong>{formatMoney(gananciaMensual)}</strong> al mes.
        </p>
        <div className="bg-white/10 p-4 rounded-xl">
          <h4 className="font-bold text-amber-300 mb-2">Proyección con interés compuesto:</h4>
          <ul className="space-y-1 text-sm">
            <li>A 6 meses: <strong>{formatMoney(proj6m)}</strong></li>
            <li>A 2 años: <strong>{formatMoney(proj2y)}</strong></li>
            <li>A 5 años: <strong className="text-emerald-300">{formatMoney(proj5y)}</strong></li>
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full transition-colors">
      <header className="px-6 pt-24 pb-6 sticky top-0 z-10 bg-transparent flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Inversiones</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Haz crecer tu dinero</p>
        </div>
        <button
          onClick={handleRefresh}
          className={`w-10 h-10 mt-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all shadow-sm ${refreshing ? 'animate-spin' : ''}`}
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </header>

      {loading ? (
        <div className="flex justify-center mt-12"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>
      ) : (
        <div className="px-6 pb-24 space-y-6 flex-1 overflow-y-auto">

          {/* Actualizado */}
          <div className="text-center">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              Actualizado: {lastUpdated.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })} — {lastUpdated.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

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
            <div key={`leve-${setIndex}`} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800/50 p-3 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors">
                <Shield className="w-4 h-4" />
                Bajo riesgo — Ideal para empezar con seguridad
              </div>
              
              {investmentSets.leve[setIndex].map((opt, i) => (
                <div key={i} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 bg-${opt.color}-50 dark:bg-${opt.color}-500/20 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors`}>
                      <opt.icon className={`w-6 h-6 text-${opt.color}-500 dark:text-${opt.color}-400`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{opt.name}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{opt.desc}</p>
                      <div className="flex gap-2">
                        <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded text-xs font-semibold">{opt.rate}</span>
                        <span className="bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded text-xs font-semibold">{opt.risk}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {profile === 'moderado' && (
            <div key={`mod-${setIndex}`} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border border-amber-100 dark:border-amber-800/50 p-3 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors">
                <Zap className="w-4 h-4" />
                Riesgo moderado — Mayor retorno y volatilidad
              </div>
              
              {investmentSets.moderado[setIndex].map((opt, i) => (
                <div key={i} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-purple-50 dark:bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
                      <opt.icon className="w-6 h-6 text-purple-500 dark:text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{opt.name}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{opt.desc}</p>
                      <div className="flex gap-2">
                        <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded text-xs font-semibold">{opt.rate}</span>
                        <span className="bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 px-2 py-1 rounded text-xs font-semibold">{opt.risk}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden mt-6 transition-transform hover:scale-[1.02]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <h3 className="font-bold text-lg">Proyección IA</h3>
            </div>
            <div className="text-indigo-100 leading-relaxed text-sm">
              {getRecommendation()}
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 z-40 border border-indigo-400"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Investment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 w-full max-w-md shadow-2xl relative border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Registrar Inversión</h3>
            
            <form onSubmit={handleCreateInvestment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre (Acción, CDT, etc)</label>
                <input 
                  required
                  type="text" 
                  value={newInv.name}
                  onChange={e => setNewInv({...newInv, name: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ej: Acciones Ecopetrol"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Monto ($)</label>
                  <input 
                    required
                    type="text" 
                    value={newInv.amount}
                    onChange={e => {
                      const val = e.target.value.replace(/\./g, '');
                      const formatted = val.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                      setNewInv({...newInv, amount: formatted});
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="1.000.000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fecha</label>
                  <input 
                    type="date" 
                    value={newInv.date}
                    onChange={e => setNewInv({...newInv, date: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo</label>
                  <select 
                    value={newInv.type}
                    onChange={e => setNewInv({...newInv, type: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Tasa Fija">Tasa Fija (CDT)</option>
                    <option value="Acción Volátil">Acción Volátil</option>
                    <option value="Fondo">Fondo de Inversión</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tiempo (Duración)</label>
                  <input 
                    type="text" 
                    value={newInv.duration}
                    onChange={e => setNewInv({...newInv, duration: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Ej: 12 meses"
                  />
                </div>
              </div>
              <button 
                type="submit"
                disabled={creating}
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md flex justify-center items-center gap-2"
              >
                {creating && <Loader2 className="w-5 h-5 animate-spin" />}
                Guardar Inversión
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
