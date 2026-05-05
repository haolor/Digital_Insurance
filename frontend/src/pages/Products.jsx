import React, { useState, useEffect } from 'react';
import { ShoppingCart, CheckCircle2, Loader2, Sparkles, ArrowRight, ShieldCheck, Zap, X, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { productService, paymentService } from '../services/api';

const Products = ({ user }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(null);
  const [paying, setPaying] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    productService.getProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  const handleOrder = async (productId) => {
    setOrdering(productId);
    try {
      await productService.createOrder({ userId: user.id, productId });
      setMessage('Added to Orders with PENDING status.');
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      setMessage('Unable to create order. Please try again.');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setOrdering(null);
    }
  };

  const handlePayNow = async (productId) => {
    setPaying(productId);
    try {
      const order = await productService.createOrder({ userId: user.id, productId });
      await paymentService.callback({ orderId: order.id, status: 'PAID' });
      setMessage(`Payment successful for order #${order.id}.`);
      setSelectedProduct(null);
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      setMessage('Payment failed. Please try again.');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setPaying(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="text-indigo-600"
      >
        <Loader2 size={48} />
      </motion.div>
    </div>
  );

  return (
    <div className="container py-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6"
      >
        <div>
          <h1 className="text-4xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-indigo-600">
            Secure Your Future
          </h1>
          <p className="text-slate-500 text-lg">Modern insurance solutions tailored for your lifestyle.</p>
        </div>
        
        <AnimatePresence>
          {message && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              className="bg-emerald-500 text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-3 shadow-lg shadow-emerald-200"
            >
              <CheckCircle2 size={20} /> {message}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {products.map((product, index) => (
          <motion.div 
            key={product.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setSelectedProduct(product)}
            className="card group flex flex-col relative overflow-hidden cursor-pointer"
          >
            {/* Background Decoration */}
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full group-hover:scale-150 transition-transform duration-500 opacity-50"></div>
            
            <div className="relative z-10 flex-1">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-slate-100 shadow-sm">
                  <ShieldCheck size={14} className="text-indigo-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Official Policy</span>
                </div>
                <div className="bg-indigo-600 text-white p-2 rounded-xl">
                  <Zap size={18} fill="white" />
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-1 group-hover:text-indigo-600 transition-colors">{product.name}</h3>
                <p className="text-slate-400 text-xs font-mono">{product.code}</p>
              </div>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-extrabold text-slate-900">${product.price.toLocaleString()}</span>
                <span className="text-slate-400 font-medium">/ year</span>
              </div>

              <p className="text-slate-600 text-sm mb-8 leading-relaxed">
                {product.description || 'Premium protection plan including emergency assistance, global coverage, and instant claims processing.'}
              </p>
            </div>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedProduct(product);
              }}
              disabled={ordering === product.id || paying === product.id}
              className="btn btn-primary w-full mt-auto"
            >
              {ordering === product.id || paying === product.id ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  View Details <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-slate-950/60 backdrop-blur-sm px-4 py-8 overflow-y-auto"
          >
            <motion.div
              initial={{ y: 20, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: 0.98 }}
              className="max-w-2xl mx-auto card bg-white relative"
            >
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900"
                title="Close"
              >
                <X size={20} />
              </button>

              <div className="pr-10">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Plan Details</p>
                <h3 className="text-3xl font-black text-slate-900 mb-2">{selectedProduct.name}</h3>
                <p className="text-slate-500 text-sm mb-6">Code: {selectedProduct.code}</p>
              </div>

              <div className="mb-6 p-5 rounded-2xl bg-indigo-50 border border-indigo-100">
                <p className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-2">Price</p>
                <p className="text-3xl font-black text-indigo-700">${selectedProduct.price.toLocaleString()} / year</p>
              </div>

              <p className="text-slate-600 leading-relaxed mb-8">
                {selectedProduct.description || 'Premium protection plan including emergency assistance, global coverage, and instant claims processing.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleOrder(selectedProduct.id)}
                  disabled={ordering === selectedProduct.id || paying === selectedProduct.id}
                  className="btn btn-outline border-slate-200"
                >
                  {ordering === selectedProduct.id ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      Add to Orders
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handlePayNow(selectedProduct.id)}
                  disabled={paying === selectedProduct.id || ordering === selectedProduct.id}
                  className="btn btn-primary"
                >
                  {paying === selectedProduct.id ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      <CreditCard size={18} />
                      Pay Now
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-24 p-1 rounded-[32px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
      >
        <div className="bg-slate-950 rounded-[30px] p-12 md:p-20 text-white relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-white text-4xl md:text-5xl font-black mb-6 leading-tight">
                Not sure what fits you? <br/>
                <span className="text-indigo-400">Let's talk.</span>
              </h2>
              <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                Our advisors are ready to help you craft a personalized protection strategy that evolves with your life.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => {
                    if (user?.role === 'ADMIN' || user?.role === 'SALE') {
                      navigate('/leads');
                      return;
                    }
                    setMessage('Our advisor will contact you shortly.');
                    setTimeout(() => setMessage(''), 5000);
                  }}
                  className="btn bg-white text-slate-950 hover:bg-indigo-50"
                >
                  Book a Consultation
                </button>
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="btn border border-slate-800 text-white hover:bg-slate-900"
                >
                  View All Plans
                </button>
              </div>
            </motion.div>
          </div>
          
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-[120px] opacity-20 -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-pink-500 rounded-full blur-[100px] opacity-10"></div>
          
          <motion.div 
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ repeat: Infinity, duration: 5 }}
            className="absolute top-12 right-12 hidden lg:block"
          >
            <Sparkles size={160} className="text-white opacity-10" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Products;
