import React, { useState, useEffect } from 'react';
import { ClipboardList, CreditCard, X, Loader2, AlertCircle, CheckCircle2, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Orders = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelingOrder, setCancelingOrder] = useState(null);
  const [payingOrder, setPayingOrder] = useState(null);
  const [message, setMessage] = useState(null);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get(`/orders/user/${user.id}`);
      setOrders(res.data);
    } catch (err) {
      showMessage('Failed to load orders.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handlePay = async (orderId) => {
    setPayingOrder(orderId);
    try {
      await api.post('/payments/callback', { orderId, status: 'PAID' });
      await fetchOrders();
      showMessage('Payment successful! Your contract is being prepared.');
    } catch (err) {
      showMessage('Payment failed. Please try again.', 'error');
    } finally {
      setPayingOrder(null);
    }
  };

  const handleCancel = async (orderId) => {
    setCancelingOrder(orderId);
    try {
      await api.patch(`/orders/${orderId}/cancel`);
      await fetchOrders();
      showMessage('Order has been canceled.');
    } catch (err) {
      showMessage(err?.response?.data?.message || 'Cannot cancel this order.', 'error');
    } finally {
      setCancelingOrder(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  return (
    <div className="container py-12 max-w-4xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-black mb-2">My Orders</h1>
          <p className="text-slate-500">Track and manage your insurance purchases</p>
        </div>
        <Link to="/" className="btn btn-primary flex items-center gap-2">
          <ShoppingBag size={18} /> Browse Plans
        </Link>
      </motion.div>

      {/* Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`mb-8 p-5 rounded-2xl flex items-center gap-4 border ${
              message.type === 'error'
                ? 'bg-red-50 text-red-700 border-red-100'
                : 'bg-emerald-50 text-emerald-700 border-emerald-100'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${message.type === 'error' ? 'bg-red-100' : 'bg-emerald-100'}`}>
              {message.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
            </div>
            <span className="font-bold">{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {orders.length === 0 ? (
        <div className="card text-center py-24 border-dashed border-2 bg-slate-50">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm mx-auto mb-6">
            <ClipboardList size={40} className="text-slate-200" />
          </div>
          <h3 className="text-slate-400 text-xl font-bold mb-2">No orders yet</h3>
          <p className="text-slate-300 mb-8">Browse our plans and start your protection journey.</p>
          <Link to="/" className="btn btn-primary mx-auto">Explore Plans</Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.07 }}
              className="card flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              {/* Left: order info */}
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm flex-shrink-0 ${
                  order.status === 'PAID' ? 'bg-emerald-600 text-white' :
                  order.status === 'CANCELED' ? 'bg-slate-200 text-slate-400' :
                  order.status === 'FAILED' ? 'bg-red-100 text-red-500' :
                  'bg-indigo-600 text-white'
                }`}>
                  #{order.id}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{order.product?.name || 'Insurance Plan'}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mt-1">
                    <span className="font-mono font-bold text-slate-700">${Number(order.amount).toLocaleString()}</span>
                    <span>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </div>

              {/* Right: status + actions */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`badge ${
                  order.status === 'PAID'     ? 'badge-success' :
                  order.status === 'CANCELED' ? 'bg-slate-100 text-slate-500 border border-slate-200' :
                  order.status === 'FAILED'   ? 'bg-red-50 text-red-600 border border-red-100' :
                  'badge-pending'
                }`}>
                  {order.status}
                </span>

                {/* Pay button — only for PENDING */}
                {order.status === 'PENDING' && (
                  <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => handlePay(order.id)}
                    disabled={payingOrder === order.id}
                    className="btn btn-primary py-2 px-5 text-sm"
                  >
                    {payingOrder === order.id
                      ? <Loader2 className="animate-spin" size={16} />
                      : <><CreditCard size={16} /> Pay Now</>}
                  </motion.button>
                )}

                {/* Cancel button — only for PENDING */}
                {order.status === 'PENDING' && (
                  <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => handleCancel(order.id)}
                    disabled={cancelingOrder === order.id}
                    className="btn btn-outline border-red-200 text-red-500 hover:bg-red-50 py-2 px-5 text-sm"
                  >
                    {cancelingOrder === order.id
                      ? <Loader2 className="animate-spin" size={16} />
                      : <><X size={16} /> Cancel</>}
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
