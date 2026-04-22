import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getAuthToken } from './services/api';
import Auth from './components/Auth';
import Layout from './components/Layout';
import Home from './views/Home';
import Stats from './views/Stats';
import History from './views/History';
import Investments from './views/Investments';
import Budgets from './views/Budgets';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAuthToken());

  useEffect(() => {
    const handleAuthExpired = () => setIsAuthenticated(false);
    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Auth onLogin={() => setIsAuthenticated(true)} /> : <Navigate to="/" />} 
        />
        
        <Route 
          path="/" 
          element={isAuthenticated ? <Layout onLogout={() => setIsAuthenticated(false)} /> : <Navigate to="/login" />}
        >
          <Route index element={<Home />} />
          <Route path="stats" element={<Stats />} />
          <Route path="history" element={<History />} />
          <Route path="investments" element={<Investments />} />
          <Route path="budgets" element={<Budgets />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
