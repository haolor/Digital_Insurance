import React, { useState, useEffect } from 'react';
import { ShoppingCart, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { productService } from '../services/api';

const Products = ({ user }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(null);
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
      setMessage('Order created successfully! Check your contracts.');
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setOrdering(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  return (
    <div className="container fade-in">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl">Available Insurance</h1>
          <p className="text-slate-500">Find the perfect protection for your needs</p>
        </div>
        {message && (
          <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-lg text-sm flex items-center gap-2 border border-emerald-100 animate-bounce">
            <CheckCircle2 size={16} /> {message}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <div key={product.id} className="card hover:shadow-lg transition-all border-t-4 border-t-indigo-500 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="badge badge-success mb-2 inline-block">{product.type || 'Standard'}</span>
                <h3 className="text-xl mb-1">{product.name}</h3>
                <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">{product.code}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-indigo-600">${product.price.toLocaleString()}</p>
                <p className="text-xs text-slate-400">/year</p>
              </div>
            </div>
            
            <p className="text-slate-600 text-sm mb-6 flex-1">
              {product.description || 'Comprehensive insurance coverage with 24/7 support and worldwide protection.'}
            </p>

            <button 
              onClick={() => handleOrder(product.id)}
              disabled={ordering === product.id}
              className="btn btn-primary w-full group"
            >
              {ordering === product.id ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  <ShoppingCart size={18} className="group-hover:scale-110 transition-transform" />
                  Purchase Now
                </>
              )}
            </button>
          </div>
        ))}
      </div>
      
      <div className="mt-16 bg-slate-900 rounded-3xl p-12 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-white text-3xl mb-4">Need Custom Protection?</h2>
          <p className="text-slate-400 max-w-md mb-8">Talk to our experts for a tailored insurance plan that fits your unique lifestyle and business needs.</p>
          <button className="btn bg-white text-slate-900 hover:bg-slate-100">Contact Expert</button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20 -mr-32 -mt-32"></div>
        <Sparkles className="absolute bottom-8 right-8 text-indigo-400 opacity-20" size={120} />
      </div>
    </div>
  );
};

export default Products;
