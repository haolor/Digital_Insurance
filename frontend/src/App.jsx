import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { Shield, ShoppingBag, FileText, LayoutDashboard, LogOut, User as UserIcon, Bell, Package, X, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from './services/api';

// Components
import Login from './pages/Login';
import Products from './pages/Products';
import Contracts from './pages/Contracts';
import Leads from './pages/Leads';
import Orders from './pages/Orders';
import Register from './pages/Register';

const NavLink = ({ to, children, icon: Icon, badge }) => {
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
      {badge > 0 && (
        <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
          {badge}
        </span>
      )}
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
  const [orderCount, setOrderCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const addNotification = (title, message, type = 'info') => {
    const newNotif = {
      id: Date.now(),
      title,
      message,
      type,
      time: new Date().toLocaleTimeString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
    // Auto show if it's a critical OTP
    if (title.includes('OTP')) setShowNotifications(true);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    if (user && user.role === 'CUSTOMER') {
      const fetchOrders = async () => {
        try {
          const res = await api.get(`/orders/user/${user.id}`);
          setOrderCount(res.data.length);
        } catch (err) {
          console.error('Failed to fetch orders for badge', err);
        }
      };
      fetchOrders();
      const interval = setInterval(fetchOrders, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <BrowserRouter>
      <div className="app-container min-h-screen flex flex-col bg-slate-50/30">
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
                  <span className="hidden md:inline font-black tracking-tighter text-xl">DIGITAL<span className="text-slate-900">INSURE</span></span>
                </Link>

                <div className="nav-links">
                  {user.role === 'CUSTOMER' && (
                    <>
                      <NavLink to="/" icon={ShoppingBag}>Store</NavLink>
                      <NavLink to="/contracts" icon={FileText}>Policies</NavLink>
                      <NavLink to="/orders" icon={Package} badge={orderCount}>Orders</NavLink>
                    </>
                  )}
                  {(user.role === 'ADMIN' || user.role === 'SALE') && (
                    <NavLink to="/leads" icon={LayoutDashboard}>CRM Dashboard</NavLink>
                  )}
                </div>

                <div className="flex items-center gap-6 relative">
                  <div className="hidden md:flex items-center gap-3 pr-6 border-r border-slate-200">
                    <button 
                      onClick={() => setShowNotifications(!showNotifications)}
                      className={`transition-colors relative p-2 rounded-xl ${showNotifications ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-indigo-600'}`}
                    >
                      <Bell size={20} />
                      {notifications.length > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                      )}
                    </button>
                    
                    {/* Notification Dropdown */}
                    <AnimatePresence>
                      {showNotifications && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-40 top-14 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
                        >
                          <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <h4 className="font-black text-sm uppercase tracking-widest text-slate-400">Notifications</h4>
                            <button onClick={() => setNotifications([])} className="text-[10px] font-bold text-indigo-600 uppercase hover:underline">Clear all</button>
                          </div>
                          <div className="max-h-96 overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                              <div className="p-10 text-center text-slate-300">
                                <Bell size={32} className="mx-auto mb-2 opacity-20" />
                                <p className="text-xs font-bold">All caught up!</p>
                              </div>
                            ) : (
                              notifications.map(n => (
                                <div key={n.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors relative group">
                                  <button onClick={() => removeNotification(n.id)} className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded-full transition-all">
                                    <X size={12} />
                                  </button>
                                  <div className="flex gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${n.title.includes('OTP') ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                      <Clock size={16} />
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-slate-800">{n.title}</p>
                                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                                      <p className="text-[10px] text-slate-300 mt-2 font-bold uppercase">{n.time}</p>
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
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
          <Routes>
            <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
            <Route path="/" element={
              user ? (
                user.role === 'CUSTOMER' ? <Products user={user} addNotification={addNotification} /> : <Navigate to="/leads" />
              ) : <Navigate to="/login" />
            } />
            <Route path="/contracts" element={
              user ? (
                user.role === 'CUSTOMER' ? <Contracts user={user} addNotification={addNotification} /> : <Navigate to="/leads" />
              ) : <Navigate to="/login" />
            } />
            <Route path="/orders" element={user && user.role === 'CUSTOMER' ? <Orders user={user} addNotification={addNotification} /> : <Navigate to="/" />} />
            <Route path="/leads" element={user && (user.role === 'ADMIN' || user.role === 'SALE') ? <Leads user={user} addNotification={addNotification} /> : <Navigate to="/" />} />
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
              <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Support</a>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;