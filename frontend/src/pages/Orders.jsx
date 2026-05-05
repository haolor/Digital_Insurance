import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Package, CalendarDays, CreditCard } from 'lucide-react';
import { orderService } from '../services/api';

const Orders = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const allOrders = await orderService.getOrders();
        const userOrders = allOrders
          .filter((order) => order.user?.id === user.id)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(userOrders);
      } catch (err) {
        setError('Unable to load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user.id]);

  const totalAmount = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.amount || 0), 0),
    [orders],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  return (
    <div className="container py-12 fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black mb-2">My Orders</h1>
          <p className="text-slate-500">Track all insurance orders placed from your account.</p>
        </div>
        <div className="card py-4 px-6 bg-white">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Spent</p>
          <p className="text-2xl font-black text-slate-900">${totalAmount.toLocaleString()}</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          {error}
        </div>
      )}

      {!error && orders.length === 0 ? (
        <div className="card text-center py-20 bg-slate-50/50 border-dashed border-2">
          <div className="w-20 h-20 bg-white rounded-[24px] flex items-center justify-center shadow-sm mx-auto mb-6 text-slate-300">
            <Package size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-500">No orders yet</h3>
          <p className="text-slate-400">Purchase a plan from Store to see your orders here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className="card"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                    Order #{order.id}
                  </p>
                  <h3 className="text-2xl font-bold text-slate-900 mb-1">{order.product?.name || 'Insurance Plan'}</h3>
                  <p className="text-sm text-slate-500">Code: {order.product?.code || 'N/A'}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto">
                  <InfoPill icon={<CreditCard size={14} />} label="Amount" value={`$${Number(order.amount || 0).toLocaleString()}`} />
                  <InfoPill icon={<CalendarDays size={14} />} label="Created" value={new Date(order.createdAt).toLocaleDateString()} />
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                    <span className={`badge ${getBadgeClass(order.status)}`}>{order.status}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

const InfoPill = ({ icon, label, value }) => (
  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
      {icon}
      {value}
    </p>
  </div>
);

const getBadgeClass = (status) => {
  if (status === 'PAID') return 'badge-success';
  if (status === 'PENDING') return 'badge-pending';
  return 'bg-red-50 text-red-600 border border-red-100';
};

export default Orders;
