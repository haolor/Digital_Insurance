import React, { useState } from 'react';
import { Shield, Mail, Lock, Loader2, ArrowRight, Globe, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { userService } from '../services/api';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const user = await userService.login(email, password);
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid credentials or user not found');
      }
    } catch (err) {
      setError('Connection failed. Is backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container min-h-[90vh] flex items-center justify-center py-12">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-200 rounded-full blur-[120px] opacity-30"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-pink-200 rounded-full blur-[120px] opacity-30"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card w-full max-w-xl relative z-10 grid grid-cols-1 md:grid-cols-2 p-1 overflow-hidden"
      >
        {/* Left Side - Visual */}
        <div className="hidden md:flex bg-slate-950 p-10 flex-col justify-between relative overflow-hidden rounded-[20px]">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-12">
              <Shield className="text-white" size={24} />
            </div>
            <h2 className="text-white text-3xl font-black mb-4">Enterprise Grade Security</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your assets and data are protected by the industry's most advanced encryption protocols.
            </p>
          </div>
          
          <div className="relative z-10 flex gap-4 text-slate-500">
            <Send size={20} className="hover:text-white transition-colors cursor-pointer" />
            <Globe size={20} className="hover:text-white transition-colors cursor-pointer" />
          </div>

          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-20"></div>
        </div>

        {/* Right Side - Form */}
        <div className="p-10">
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
            <p className="text-slate-500 text-sm">Please enter your credentials</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-semibold mb-8 flex items-center gap-3 border border-red-100"
            >
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">!</div>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="input-group">
              <label>Work Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  className="pl-12"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <div className="flex justify-between items-center mb-2">
                <label className="mb-0">Password</label>
                <button
                  type="button"
                  onClick={() => setError('Please contact support to reset your password.')}
                  className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  className="pl-12"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit" 
              className="btn btn-primary w-full group" 
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  Continue <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-xs text-slate-400">
              New here? <Link to="/register" className="text-indigo-600 font-bold hover:underline">Create an account</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
