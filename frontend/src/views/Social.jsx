import { useState, useEffect, useRef } from 'react';
import { Trophy, Star, Users, TrendingUp, Sparkles, Medal, Settings, X, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';

// --- Mini sparkline chart component ---
function Sparkline({ data, up }) {
  if (!data || data.length < 2) return null;
  const w = 80, h = 32;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline
        points={pts}
        fill="none"
        stroke={up ? '#10b981' : '#f43f5e'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// --- Stock data with simulated history ---
const ALL_STOCKS = [
  {
    id: 'sp500', name: 'S&P 500 ETF', ticker: 'SPY', change: '+1.2%', up: true,
    price: '521.40', category: 'Internacional',
    history: [505, 508, 503, 510, 512, 518, 515, 521]
  },
  {
    id: 'btc', name: 'Bitcoin', ticker: 'BTC/USD', change: '+5.4%', up: true,
    price: '$68,200', category: 'Crypto',
    history: [61000, 62500, 60000, 63000, 64000, 66000, 67500, 68200]
  },
  {
    id: 'eco', name: 'Ecopetrol', ticker: 'EC', change: '-0.8%', up: false,
    price: '$10.82', category: 'Colombia',
    history: [11.2, 11.0, 11.1, 10.9, 11.0, 10.95, 10.9, 10.82]
  },
  {
    id: 'bco', name: 'Bancolombia', ticker: 'CIB', change: '+0.3%', up: true,
    price: '$27.50', category: 'Colombia',
    history: [27.0, 27.1, 26.9, 27.2, 27.3, 27.4, 27.45, 27.50]
  },
  {
    id: 'eth', name: 'Ethereum', ticker: 'ETH/USD', change: '+3.1%', up: true,
    price: '$3,210', category: 'Crypto',
    history: [3000, 3050, 2980, 3100, 3150, 3180, 3200, 3210]
  },
  {
    id: 'nvda', name: 'NVIDIA', ticker: 'NVDA', change: '+2.8%', up: true,
    price: '$875.20', category: 'Internacional',
    history: [840, 845, 838, 855, 862, 868, 870, 875]
  },
];

export default function Social() {
  const navigate = useNavigate();
  const [stars, setStars] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  const [visibleStocks, setVisibleStocks] = useState(
    () => JSON.parse(localStorage.getItem('pc_visible_stocks') || '["sp500","btc","eco","bco"]')
  );

  const friends = [
    { id: 1, name: 'Carlos_M', type: 'Acción Volátil', stars: 125 },
    { id: 2, name: 'Ana_G', type: 'Fondo Indexado', stars: 98 },
    { id: 3, name: 'Tú', type: 'Tu Portafolio', stars: stars, isMe: true },
    { id: 4, name: 'Juan_P', type: 'CDT', stars: 45 },
  ];

  useEffect(() => {
    apiFetch('/auth/me')
      .then(res => { if (res) setStars(res.stars || 0); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const sortedFriends = [...friends].sort((a, b) => {
    const sA = a.isMe ? stars : a.stars;
    const sB = b.isMe ? stars : b.stars;
    return sB - sA;
  });

  const toggleStock = (id) => {
    const next = visibleStocks.includes(id)
      ? visibleStocks.filter(s => s !== id)
      : [...visibleStocks, id];
    setVisibleStocks(next);
    localStorage.setItem('pc_visible_stocks', JSON.stringify(next));
  };

  const shown = ALL_STOCKS.filter(s => visibleStocks.includes(s.id));

  return (
    <div className="flex flex-col h-full transition-colors">
      <header className="px-6 pt-24 pb-4 sticky top-0 z-10 bg-transparent flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Social y Competencia</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Compara tu progreso con amigos</p>
        </div>
        <button
          onClick={() => setShowConfig(true)}
          className="w-10 h-10 mt-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm hover:scale-105 transition-all"
        >
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* Config Modal */}
      {showConfig && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowConfig(false)} />
          <div className="relative w-full max-w-[400px] bg-white dark:bg-slate-900 rounded-t-3xl p-6 pb-10 shadow-2xl z-10 border-t border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Acciones visibles</h3>
              <button onClick={() => setShowConfig(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <X className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              </button>
            </div>
            <div className="space-y-3">
              {ALL_STOCKS.map(stock => (
                <div key={stock.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{stock.name}</p>
                    <p className="text-xs text-slate-400">{stock.ticker} · {stock.category}</p>
                  </div>
                  <button
                    onClick={() => toggleStock(stock.id)}
                    className={`w-12 h-6 rounded-full transition-all duration-300 relative ${
                      visibleStocks.includes(stock.id) ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${
                      visibleStocks.includes(stock.id) ? 'left-6' : 'left-0.5'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="px-6 pb-24 space-y-6 flex-1 overflow-y-auto">

        {/* Score Card */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 rounded-[2rem] p-6 text-white shadow-xl shadow-orange-500/20 relative overflow-hidden transition-transform hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl transform translate-x-1/3 -translate-y-1/3"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-white/90 font-medium text-sm mb-1">Tu Puntaje Actual</p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-5xl font-extrabold tracking-tight text-white">{stars}</h2>
                <span className="text-xl">⭐️</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/metas')}
              className="w-16 h-16 bg-white/20 hover:bg-white/30 active:scale-95 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 transition-all"
            >
              <Trophy className="w-8 h-8 text-white" />
            </button>
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs font-semibold bg-white/20 w-fit px-3 py-1.5 rounded-full backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-white">¡Gana +1 ⭐️ por gasto y +5 ⭐️ por invertir!</span>
          </div>
        </div>

        {/* Leaderboard */}
        <div>
          <div className="flex items-center gap-2 mb-4 px-1">
            <Users className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Ranking de Amigos</h3>
          </div>
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-3xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm space-y-3">
            {sortedFriends.map((friend, index) => (
              <div
                key={friend.id}
                className={`flex items-center p-3 rounded-2xl transition-all ${
                  friend.isMe
                    ? 'bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-100 dark:border-indigo-500/30'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                <div className="w-8 h-8 flex items-center justify-center font-bold text-slate-400 dark:text-slate-500 mr-2">
                  {index === 0 ? <Medal className="w-6 h-6 text-yellow-500" /> :
                   index === 1 ? <Medal className="w-6 h-6 text-slate-400" /> :
                   index === 2 ? <Medal className="w-6 h-6 text-amber-600" /> :
                   <span className="text-sm">#{index + 1}</span>}
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 mr-3 shrink-0">
                  {friend.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold truncate ${friend.isMe ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-900 dark:text-white'}`}>
                    {friend.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{friend.type}</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-slate-900 dark:text-white">{friend.isMe ? stars : friend.stars}</span>
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Trends */}
        <div>
          <div className="flex items-center gap-2 mb-4 px-1 flex-wrap">
            <TrendingUp className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Bolsa en General</h3>
            <span className="ml-auto flex items-center gap-1 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full text-xs font-bold">
              +5 ⭐️ al invertir
            </span>
          </div>

          {shown.length === 0 ? (
            <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-sm">
              <p>Ninguna acción seleccionada.</p>
              <button onClick={() => setShowConfig(true)} className="mt-2 text-indigo-500 font-semibold underline">Configurar</button>
            </div>
          ) : (
            <div className="space-y-3">
              {shown.map(stock => (
                <div key={stock.id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{stock.name}</p>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-semibold">{stock.ticker}</span>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{stock.category}</p>
                  </div>
                  <Sparkline data={stock.history} up={stock.up} />
                  <div className="text-right shrink-0">
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{stock.price}</p>
                    <div className={`flex items-center justify-end gap-0.5 text-xs font-bold ${stock.up ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {stock.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {stock.change}
                    </div>
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
