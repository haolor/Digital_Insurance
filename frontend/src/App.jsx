import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { Shield, ShoppingBag, FileText, LayoutDashboard, LogOut, User as UserIcon, Bell, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import Login from './pages/Login';
import Products from './pages/Products';
import Contracts from './pages/Contracts';
import Leads from './pages/Leads';
import Orders from './pages/Orders';

const NavLink = ({ to, children, icon: Icon }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link 
      to={to} 
      className={`relative px-4 py-2 flex items-center gap-2 font-bold text-sm transition-colors ${
        isActive ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'
      }`}
    >
      <Icon size={18} />
      {children}
      {isActive && (
        <motion.div 
          layoutId="nav-pill"
          className="absolute inset-0 bg-indigo-50 rounded-full -z-10"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </Link>
  );
};

const App = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [notice, setNotice] = useState('');

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const handleFooterNotice = (text) => {
    setNotice(text);
    setTimeout(() => setNotice(''), 4000);
  };

  return (
    <BrowserRouter>
      <div className="app-container">
        <AnimatePresence>
          {user && (
            <motion.nav 
              initial={{ y: -100 }}
              animate={{ y: 0 }}
              className="navbar container"
            >
              <div className="container nav-content px-6">
                <Link to="/" className="nav-logo flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                    <Shield size={24} fill="white" />
                  </div>
                  <span className="hidden md:inline">DIGITAL<span className="text-slate-900">INSURE</span></span>
                </Link>

                <div className="nav-links">
                  <NavLink to="/" icon={ShoppingBag}>Store</NavLink>
                  <NavLink to="/contracts" icon={FileText}>Policies</NavLink>
                  {user.role === 'CUSTOMER' && (
                    <NavLink to="/orders" icon={Package}>Orders</NavLink>
                  )}
                  {(user.role === 'ADMIN' || user.role === 'SALE') && (
                    <NavLink to="/leads" icon={LayoutDashboard}>CRM</NavLink>
                  )}
                </div>

                <div className="flex items-center gap-6">
                  <div className="hidden md:flex items-center gap-3 pr-6 border-r border-slate-100">
                    <button className="text-slate-400 hover:text-indigo-600 transition-colors relative">
                      <Bell size={20} />
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{user.role}</p>
                      <p className="text-sm font-bold text-slate-900 leading-none">{user.name}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-all overflow-hidden shadow-inner">
                      <UserIcon size={20} />
                    </div>
                    <button 
                      onClick={handleLogout} 
                      className="ml-2 text-slate-300 hover:text-red-500 transition-colors"
                      title="Logout"
                    >
                      <LogOut size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>

        <main className="flex-1">
          {!!notice && (
            <div className="container mt-4">
              <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700">
                {notice}
              </div>
            </div>
          )}
          <Routes>
            <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
            <Route path="/" element={user ? <Products user={user} /> : <Navigate to="/login" />} />
            <Route path="/contracts" element={user ? <Contracts user={user} /> : <Navigate to="/login" />} />
            <Route path="/orders" element={user && user.role === 'CUSTOMER' ? <Orders user={user} /> : <Navigate to="/" />} />
            <Route path="/leads" element={user && (user.role === 'ADMIN' || user.role === 'SALE') ? <Leads user={user} /> : <Navigate to="/" />} />
          </Routes>
        </main>

        <footer className="py-12 mt-20 border-t border-slate-100 bg-white/50 backdrop-blur-sm">
          <div className="container flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3 opacity-50 grayscale hover:grayscale-0 transition-all cursor-pointer">
               <Shield size={24} className="text-indigo-600" />
               <span className="font-black text-lg">DIGITALINSURE</span>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
              © 2026 NextGen Insurance Platform. All rights reserved.
            </p>
            <div className="flex gap-8 text-xs font-black text-slate-400 uppercase tracking-widest">
              <button
                type="button"
                onClick={() => handleFooterNotice('Privacy policy page will be available soon.')}
                className="hover:text-indigo-600 transition-colors"
              >
                Privacy
              </button>
              <button
                type="button"
                onClick={() => handleFooterNotice('Terms and conditions are being updated.')}
                className="hover:text-indigo-600 transition-colors"
              >
                Terms
              </button>
              <button
                type="button"
                onClick={() => handleFooterNotice('Support: support@digitalinsure.local')}
                className="hover:text-indigo-600 transition-colors"
              >
                Support
              </button>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;