import React, { useState } from 'react';
import { Wallet, ArrowRight } from 'lucide-react';
import api from '../services/api';

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      const payload = isLogin ? { email, password } : { name, email, password };
      const { data } = await api.post(endpoint, payload);
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLogin();
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-emerald-500 text-white p-12 flex-col justify-center relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-emerald-600 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
        
        <div className="relative z-10 max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-12">
            <div className="bg-white/20 p-2.5 rounded-xl">
              <Wallet className="h-8 w-8 text-white" />
            </div>
            <span className="font-bold text-3xl tracking-tight">FairShare</span>
          </div>
          
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Smart Expense Splitting,<br />Made Simple
          </h1>
          
          <p className="text-emerald-50 text-xl leading-relaxed">
            Split bills, track expenses, and settle debts with friends — powered by smart debt simplification.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-12 lg:p-24 bg-white">
        <div className="max-w-md w-full mx-auto">
          
          {/* Toggle */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-12">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                !isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="text-slate-500 mb-8">
              {isLogin ? 'Sign in to manage your expenses' : 'Sign up to start splitting expenses'}
            </p>
            
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1.5">Name</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 text-white py-3 rounded-xl hover:bg-emerald-600 transition-colors font-medium flex items-center justify-center gap-2 mt-2"
              >
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight className="h-4 w-4" />
              </button>
              
              {isLogin && (
                <button
                  type="button"
                  onClick={async () => {
                    setEmail('demo@fairshare.com');
                    setPassword('password123');
                    try {
                      const { data } = await api.post('/auth/login', { email: 'demo@fairshare.com', password: 'password123' });
                      localStorage.setItem('token', data.token);
                      localStorage.setItem('user', JSON.stringify(data.user));
                      onLogin();
                    } catch (err: any) {
                      setError(err.response?.data?.error || 'An error occurred');
                    }
                  }}
                  className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl hover:bg-slate-200 transition-colors font-medium flex items-center justify-center gap-2 mt-4"
                >
                  Login as Guest/Demo
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
