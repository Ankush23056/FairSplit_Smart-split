import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import GroupPage from './pages/GroupPage';
import Navbar from './components/Navbar';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Login onLogin={() => setIsAuthenticated(true)} /> : <Navigate to="/" />} />
          <Route path="/*" element={
            isAuthenticated ? (
              <>
                <Navbar onLogout={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  setIsAuthenticated(false);
                }} />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/group/:id" element={<GroupPage />} />
                  </Routes>
                </main>
              </>
            ) : <Navigate to="/login" />
          } />
        </Routes>
      </div>
    </Router>
  );
}
