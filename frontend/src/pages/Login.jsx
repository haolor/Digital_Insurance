import React, { useState } from 'react';
import { Shield, Mail, Lock, Loader2 } from 'lucide-react';
import { userService } from '../services/api';

const Login = ({ onLogin }) => {
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
    <div className="container flex items-center justify-center min-h-[80vh]">
      <div className="card w-full max-w-md fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield size={32} />
          </div>
          <h2>Welcome Back</h2>
          <p className="text-slate-500">Enter your details to access your account</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email Address</label>
            <div className="relative">
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t text-center text-sm text-slate-500">
          Don't have an account? <span className="text-indigo-600 font-semibold cursor-pointer">Register now</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
