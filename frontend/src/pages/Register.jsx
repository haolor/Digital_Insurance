import React, { useState } from 'react';
import { Shield, Mail, Lock, User as UserIcon, ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await api.post('/users', {
        ...formData,
        role: 'CUSTOMER' // Default role
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/50 p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="card p-10 bg-white shadow-2xl shadow-indigo-100 border-indigo-50 relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col items-center mb-10">
              <div className="w-16 h-16 bg-indigo-600 rounded-[24px] flex items-center justify-center text-white shadow-xl shadow-indigo-200 mb-6">
                <Shield size={32} fill="white" />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Join Us</h1>
              <p className="text-slate-500 font-medium mt-2">Start your protection journey today</p>
            </div>

            <AnimatePresence>
              {success ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-50 text-emerald-700 p-6 rounded-2xl border border-emerald-100 flex flex-col items-center text-center gap-4"
                >
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <p className="font-black text-lg">Account Created!</p>
                    <p className="text-sm opacity-80 mt-1">Redirecting you to login...</p>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleRegister} className="space-y-6">
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2"
                    >
                      <AlertCircle size={16} /> {error}
                    </motion.div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                        <UserIcon size={18} />
                      </div>
                      <input 
                        required
                        type="text" 
                        placeholder="John Doe"
                        className="w-full bg-slate-50/50 border-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-medium"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                        <Mail size={18} />
                      </div>
                      <input 
                        required
                        type="email" 
                        placeholder="name@example.com"
                        className="w-full bg-slate-50/50 border-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-medium"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Password</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                        <Lock size={18} />
                      </div>
                      <input 
                        required
                        type="password" 
                        placeholder="••••••••"
                        className="w-full bg-slate-50/50 border-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-medium"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                      />
                    </div>
                  </div>

                  <button 
                    disabled={loading}
                    type="submit" 
                    className="btn btn-primary w-full py-4 text-base group"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Create Account <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </button>

                  <p className="text-center text-xs text-slate-400 font-medium">
                    Already have an account? <Link to="/login" className="text-indigo-600 font-bold hover:underline">Log in</Link>
                  </p>
                </form>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">NextGen Digital Insurance Platform</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
