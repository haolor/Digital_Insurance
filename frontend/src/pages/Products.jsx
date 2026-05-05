import React, { useState, useEffect } from 'react';
import { ShoppingCart, CheckCircle2, Loader2, Sparkles, ShieldCheck, Zap, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/api';

const Products = ({ user }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(null);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  useEffect(() => {
    productService.getProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  const handleOrder = async (productId) => {
    setOrdering(productId);
    try {
      await productService.createOrder({ userId: user.id, productId });
      showMessage('Order created! Redirecting to your orders...');
      setTimeout(() => navigate('/orders'), 1500);
    } catch (err) {
      showMessage('Failed to create order.', 'error');
    } finally {
      setOrdering(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="text-indigo-600">
        <Loader2 size={48} />
      </motion.div>
    </div>
  );

  return (
    <div className="container py-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold mb-2 text-slate-900">Insurance Store</h1>
          <p className="text-slate-500 text-lg">Premium protection plans for every need.</p>
        </div>
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              className={`px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-3 shadow-lg ${
                message.type === 'error'
                  ? 'bg-red-500 text-white shadow-red-200'
                  : 'bg-emerald-500 text-white shadow-emerald-200'
              }`}
            >
              {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Store Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card group flex flex-col relative overflow-hidden hover:shadow-xl transition-shadow border-slate-100"
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full group-hover:scale-150 transition-transform duration-500 opacity-60"></div>
            <div className="relative z-10 flex-1">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-slate-100 shadow-sm">
                  <ShieldCheck size={14} className="text-indigo-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Official</span>
                </div>
                <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-lg shadow-indigo-100"><Zap size={18} fill="white" /></div>
              </div>
              <h3 className="text-2xl font-bold mb-1 group-hover:text-indigo-600 transition-colors">{product.name}</h3>
              <p className="text-slate-400 text-xs font-mono mb-4">{product.code}</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-extrabold text-slate-900">${product.price?.toLocaleString()}</span>
                <span className="text-slate-400 font-medium">/ year</span>
              </div>
              <p className="text-slate-600 text-sm mb-8 leading-relaxed">
                {product.description || 'Premium protection including emergency assistance, global coverage, and instant claims.'}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => handleOrder(product.id)}
              disabled={ordering === product.id}
              className="btn btn-primary w-full group/btn overflow-hidden relative"
            >
              {ordering === product.id ? <Loader2 className="animate-spin" size={20} /> : (
                <div className="flex items-center justify-center gap-2">
                   <ShoppingCart size={18} /> Purchase Plan
                </div>
              )}
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* CTA Banner */}
      <motion.div
        initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="mt-24 p-1 rounded-[32px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-2xl shadow-indigo-200"
      >
        <div className="bg-slate-950 rounded-[28px] p-12 text-white relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <h2 className="text-white text-4xl font-black mb-4">Not sure what fits? <span className="text-indigo-400">Let's talk.</span></h2>
            <p className="text-slate-400 mb-8 text-lg">Our advisors craft personalized protection strategies that evolve with your life.</p>
            <button className="btn bg-white text-slate-950 hover:bg-indigo-50 px-8">Book a Consultation</button>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-[120px] opacity-20 -mr-20 -mt-20"></div>
          <motion.div animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 5 }} className="absolute top-12 right-12 hidden lg:block">
            <Sparkles size={160} className="text-white opacity-10" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Products;
