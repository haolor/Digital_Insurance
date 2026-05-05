import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Shield, Users, ShoppingBag, FileText, LayoutDashboard, LogOut, User as UserIcon } from 'lucide-react';

// Components
import Login from './pages/Login';
import Products from './pages/Products';
import Contracts from './pages/Contracts';
import Leads from './pages/Leads';

const App = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

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
      <div className="app-container">
        {user && (
          <nav className="navbar">
            <div className="container nav-content">
              <Link to="/" className="nav-logo">
                <Shield size={32} />
                <span>DIGITAL INSURE</span>
              </Link>
              <div className="nav-links">
                <Link to="/" className="nav-link">Products</Link>
                <Link to="/contracts" className="nav-link">My Contracts</Link>
                {(user.role === 'ADMIN' || user.role === 'SALE') && (
                  <Link to="/leads" className="nav-link flex items-center gap-1">
                    <LayoutDashboard size={18} />
                    Leads
                  </Link>
                )}
                <div className="flex items-center gap-4 ml-4 pl-4 border-l">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <UserIcon size={16} />
                    </div>
                    <span className="font-semibold text-sm">{user.name}</span>
                  </div>
                  <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors">
                    <LogOut size={20} />
                  </button>
                </div>
              </div>
            </div>
          </nav>
        )}

        <main className="flex-1 py-8">
          <Routes>
            <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
            <Route path="/" element={user ? <Products user={user} /> : <Navigate to="/login" />} />
            <Route path="/contracts" element={user ? <Contracts user={user} /> : <Navigate to="/login" />} />
            <Route path="/leads" element={user && (user.role === 'ADMIN' || user.role === 'SALE') ? <Leads user={user} /> : <Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;