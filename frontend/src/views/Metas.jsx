import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Zap, Users, Check } from 'lucide-react';
import { apiFetch } from '../services/api';

const LEVELS = [
  { level: 1, name: 'Ahorrador Novato',     min: 0,    max: 100,  badge: '🌱', from: 'from-emerald-500', to: 'to-teal-600' },
  { level: 2, name: 'Finanzas Consciente',  min: 100,  max: 300,  badge: '🌿', from: 'from-blue-500',    to: 'to-cyan-600' },
  { level: 3, name: 'Inversor Activo',      min: 300,  max: 600,  badge: '💰', from: 'from-indigo-500',  to: 'to-violet-600' },
  { level: 4, name: 'Experto Financiero',   min: 600,  max: 1000, badge: '🏆', from: 'from-purple-600',  to: 'to-fuchsia-700' },
  { level: 5, name: 'Maestro del Dinero',   min: 1000, max: Infinity, badge: '👑', from: 'from-amber-500', to: 'to-orange-600' },
];

const GOALS = [
  { id: 'g1', title: 'Primer gasto registrado',  desc: 'Empieza a controlar tu dinero',     icon: '✍️',  starsRequired: 1  },
  { id: 'g2', title: '10 estrellas acumuladas',   desc: 'Sé constante con el registro',      icon: '📊',  starsRequired: 10 },
  { id: 'g3', title: '25 estrellas',              desc: 'Buen ritmo de ahorro',               icon: '💼',  starsRequired: 25 },
  { id: 'g4', title: '100 estrellas ⭐️',          desc: 'Tu primer gran hito',               icon: '⭐️', starsRequired: 100 },
  { id: 'g5', title: '300 estrellas',             desc: 'Constancia financiera',              icon: '🌟',  starsRequired: 300 },
  { id: 'g6', title: '600 estrellas',             desc: 'Inversor de élite',                  icon: '💫',  starsRequired: 600 },
  { id: 'g7', title: '1000 estrellas 👑',          desc: 'Maestro del dinero',                icon: '👑',  starsRequired: 1000 },
];

const FEED = [
  { user: 'Carlos_M',  badge: '🌿', action: 'alcanzó el nivel Finanzas Consciente',  time: 'hace 2h'  },
  { user: 'Ana_G',     badge: '💰', action: 'completó su primera inversión',         time: 'hace 5h'  },
  { user: 'Juan_P',    badge: '🌱', action: 'registró su primer gasto',              time: 'hace 1d'  },
  { user: 'María_R',   badge: '💰', action: 'subió a Inversor Activo',               time: 'hace 2d'  },
  { user: 'Diego_V',   badge: '🏆', action: 'alcanzó 600 estrellas',                 time: 'hace 3d'  },
];

const NETWORK = [
  { name: 'Carlos',  badge: '🌿', level: 2, angle: 45,  dist: 85  },
  { name: 'Ana',     badge: '💰', level: 3, angle: 140, dist: 80  },
  { name: 'Juan',    badge: '🌱', level: 1, angle: 220, dist: 95  },
  { name: 'María',   badge: '💰', level: 3, angle: 315, dist: 82  },
];

export default function Metas() {
  const navigate = useNavigate();
  const [stars, setStars] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/auth/me')
      .then(res => { if (res) setStars(res.stars || 0); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const currentLevel = [...LEVELS].reverse().find(l => stars >= l.min) || LEVELS[0];
  const nextLevel = LEVELS.find(l => l.level === currentLevel.level + 1);
  const progressInLevel = nextLevel
    ? Math.min(((stars - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100, 100)
    : 100;

  return (
    <div className="flex flex-col h-full transition-colors">
      <header className="px-6 pt-24 pb-4 sticky top-0 z-10 bg-transparent flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Metas</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Tu progreso en la red</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </header>

      <div className="px-6 pb-28 space-y-6 flex-1 overflow-y-auto">

        {/* Level card */}
        <div className={`bg-gradient-to-br ${currentLevel.from} ${currentLevel.to} rounded-[2rem] p-6 text-white shadow-2xl relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl backdrop-blur-sm border border-white/30 shadow-lg">
                {currentLevel.badge}
              </div>
              <div>
                <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-0.5">Nivel {currentLevel.level}</p>
                <h3 className="text-xl font-extrabold leading-tight">{currentLevel.name}</h3>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="font-extrabold text-2xl">{stars}</span>
                  <span className="text-lg">⭐️</span>
                  <span className="text-white/70 text-sm">acumuladas</span>
                </div>
              </div>
            </div>
            {nextLevel ? (
              <>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-white/70">Hacia: {nextLevel.badge} {nextLevel.name}</span>
                  <span>{Math.round(progressInLevel)}%</span>
                </div>
                <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progressInLevel}%` }}
                  />
                </div>
                <p className="text-xs text-white/60 mt-2">
                  Te faltan <strong className="text-white">{nextLevel.min - stars} ⭐️</strong> para el siguiente nivel
                </p>
              </>
            ) : (
              <p className="text-white/80 text-sm font-semibold mt-2">🎉 ¡Nivel máximo alcanzado!</p>
            )}
          </div>
        </div>

        {/* Network visualization */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            <h3 className="font-bold text-slate-900 dark:text-white">Tu Red Financiera</h3>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Compite y aprende con tu círculo</p>
          <div className="relative h-52 flex items-center justify-center select-none">
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              {NETWORK.map((u, i) => {
                const rad = (u.angle * Math.PI) / 180;
                const scale = u.dist / 220;
                const x = 50 + scale * 100 * Math.cos(rad);
                const y = 50 + scale * 100 * Math.sin(rad);
                return (
                  <line
                    key={i}
                    x1="50" y1="50"
                    x2={x} y2={y}
                    stroke="#6366f1" strokeWidth="0.5" strokeOpacity="0.4"
                    strokeDasharray="2 2"
                  />
                );
              })}
              <circle cx="50" cy="50" r="12" fill="#6366f1" fillOpacity="0.1" stroke="#6366f1" strokeWidth="0.5" strokeOpacity="0.3" />
            </svg>

            {/* You */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex flex-col items-center justify-center shadow-xl border-2 border-white dark:border-slate-900">
                <span className="text-xl leading-none">{currentLevel.badge}</span>
                <span className="text-[9px] font-bold text-white mt-0.5">Tú</span>
              </div>
            </div>

            {/* Friends */}
            {NETWORK.map((u, i) => {
              const rad = (u.angle * Math.PI) / 180;
              const scale = u.dist / 220;
              const x = 50 + scale * 100 * Math.cos(rad);
              const y = 50 + scale * 100 * Math.sin(rad);
              return (
                <div
                  key={i}
                  className="absolute z-10 flex flex-col items-center gap-0.5"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div className="w-10 h-10 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl flex items-center justify-center shadow-md text-lg">
                    {u.badge}
                  </div>
                  <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap bg-white/90 dark:bg-slate-800/90 px-1.5 py-0.5 rounded-full shadow-sm border border-slate-100 dark:border-slate-700">
                    {u.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Goals */}
        <div>
          <div className="flex items-center gap-2 mb-4 px-1">
            <Target className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Objetivos</h3>
          </div>
          <div className="space-y-3">
            {GOALS.map(goal => {
              const done = stars >= goal.starsRequired;
              const pct = Math.min((stars / goal.starsRequired) * 100, 100);
              return (
                <div
                  key={goal.id}
                  className={`backdrop-blur-sm p-4 rounded-2xl border shadow-sm transition-all ${
                    done
                      ? 'bg-emerald-50/80 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50'
                      : 'bg-white/80 dark:bg-slate-800/80 border-slate-100 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${done ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-slate-50 dark:bg-slate-900'}`}>
                      {done ? '✅' : goal.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm ${done ? 'text-emerald-700 dark:text-emerald-400 line-through' : 'text-slate-900 dark:text-white'}`}>
                        {goal.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{goal.desc}</p>
                    </div>
                    {done && <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />}
                  </div>
                  {!done && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mb-1">
                        <span>{stars} / {goal.starsRequired} ⭐️</span>
                        <span>{Math.round(pct)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Social feed */}
        <div>
          <div className="flex items-center gap-2 mb-4 px-1">
            <Zap className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Actividad de la Red</h3>
          </div>
          <div className="space-y-3">
            {FEED.map((item, i) => (
              <div key={i} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-xl flex-shrink-0">
                  {item.badge}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">{item.user}</span>{' '}
                    {item.action}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
