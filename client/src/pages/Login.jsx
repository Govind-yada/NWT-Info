import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ShieldCheck, User, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export const Login = () => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login, adminLogin, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('admin') === 'true') {
      setIsAdminMode(true);
    }
  }, [location]);

  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) {
        navigate('/admin');
      } else {
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, isAdmin, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isAdminMode) {
        await adminLogin(email, password);
        navigate('/admin');
      } else {
        await login(email, password);
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please verify your login details.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') {
      setIsAdminMode(true);
      setEmail('admin@nwtinfo.com');
      setPassword('Admin@Nwt2026!');
    } else {
      setIsAdminMode(false);
      setEmail('aarav@techventure.in');
      setPassword('Customer@123');
    }
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 py-12">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-violet flex items-center justify-center shadow-glow-sm">
              <span className="font-extrabold text-white text-base">NW</span>
            </div>
            <span className="text-xl font-bold text-white">NWT Info</span>
          </Link>
          <h2 className="text-2xl font-bold text-white">
            {isAdminMode ? 'Administrator Control Access' : 'Client Portal Sign In'}
          </h2>
          <p className="text-xs text-slate-400">
            {isAdminMode
              ? 'Authorized platform administration personnel only'
              : 'Access your project milestones, bookings, and payment history'}
          </p>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="p-1 rounded-xl bg-navy-900 border border-slate-800 flex">
          <button
            type="button"
            onClick={() => {
              setIsAdminMode(false);
              setError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition ${
              !isAdminMode ? 'bg-brand-blue text-white shadow-glow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Customer Portal
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAdminMode(true);
              setError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition ${
              isAdminMode ? 'bg-violet-700 text-white shadow-glow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Admin Terminal
          </button>
        </div>

        {/* Demo Fast Fill Buttons */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 space-y-2">
          <span className="font-medium text-slate-300 block">⚡ Quick Demo Credentials:</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fillDemo('customer')}
              className="flex-1 py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-medium"
            >
              Fill Demo Client
            </button>
            <button
              type="button"
              onClick={() => fillDemo('admin')}
              className="flex-1 py-1 px-2 rounded bg-violet-950 hover:bg-violet-900 text-violet-300 border border-violet-800/80 text-[10px] font-medium"
            >
              Fill Demo Admin
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-6 sm:p-8 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isAdminMode ? 'admin@nwtinfo.com' : 'client@company.com'}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-slate-300">Password</label>
              {!isAdminMode && (
                <Link to="/forgot-password" className="text-[11px] text-brand-electric hover:underline">
                  Forgot password?
                </Link>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-white transition shadow-glow disabled:opacity-50 ${
              isAdminMode
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500'
                : 'bg-gradient-to-r from-brand-blue to-brand-violet hover:from-blue-600 hover:to-purple-600'
            }`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Sign In to {isAdminMode ? 'Admin Console' : 'Customer Portal'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {!isAdminMode && (
          <p className="text-center text-xs text-slate-400">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-brand-electric font-semibold hover:underline">
              Register as New Customer
            </Link>
          </p>
        )}

      </div>
    </div>
  );
};
