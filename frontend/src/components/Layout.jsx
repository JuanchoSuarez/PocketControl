import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, PieChart, Clock, TrendingUp, LogOut, Moon, Sun } from 'lucide-react';
import { clearAuth } from '../services/api';
import { useState, useEffect } from 'react';

export default function Layout({ onLogout }) {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(
    localStorage.getItem('theme') === 'dark' || 
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleLogout = () => {
    clearAuth();
    onLogout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Inicio' },
    { path: '/stats', icon: PieChart, label: 'Stats' },
    { path: '/history', icon: Clock, label: 'Historial' },
    { path: '/investments', icon: TrendingUp, label: 'Inversión' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex justify-center transition-colors duration-500 relative overflow-hidden">
      
      {/* Animated Background Mesh */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] max-w-[600px] aspect-square bg-indigo-500/20 dark:bg-indigo-600/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] max-w-[500px] aspect-square bg-purple-500/20 dark:bg-fuchsia-600/10 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Mobile container */}
      <div className="w-full max-w-md bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl shadow-2xl min-h-screen flex flex-col relative border-x border-white/20 dark:border-slate-800 z-10 transition-colors duration-500">
        
        {/* Floating Theme Toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="absolute top-12 right-6 z-50 w-10 h-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-sm hover:scale-105 transition-all border border-slate-200 dark:border-slate-700"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar relative z-0">
          <Outlet />
        </div>

        {/* Bottom Tab Bar */}
        <nav className="absolute bottom-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pb-safe transition-colors duration-500">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex flex-col items-center gap-1.5 transition-all duration-300 ${
                  isActive ? 'text-indigo-600 dark:text-indigo-400 scale-110' : 'text-slate-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-300 hover:scale-105'
                }`
              }
            >
              <item.icon className={`w-6 h-6 ${true ? 'stroke-[2px]' : ''}`} />
              <span className="text-[10px] font-semibold tracking-wide">{item.label}</span>
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1.5 text-slate-400 dark:text-slate-500 hover:text-red-500 transition-all duration-300"
          >
            <LogOut className="w-6 h-6 stroke-[2px]" />
            <span className="text-[10px] font-semibold tracking-wide">Salir</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
