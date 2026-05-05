import React, { useState, useEffect } from 'react';
import { FileText, Key, CheckCircle2, AlertCircle, Loader2, Download, ShieldCheck, ExternalLink, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Contracts = ({ user, addNotification }) => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeOtp, setActiveOtp] = useState(null);
  const [otp, setOtp] = useState('');
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchContracts();
  }, [user.id]);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/contracts/user/${user.id}`);
      setContracts(res.data);
    } catch (err) {
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (id) => {
    setProcessing(true);
    try {
      const res = await api.post(`/contracts/${id}/send-otp`);
      setActiveOtp(id);
      
      // Notify the user with the OTP (Simulating SMS/Email arrival in the navbar)
      if (addNotification) {
        addNotification(
          'Security Code (OTP)', 
          `Your authorization code for contract #${id} is: ${res.data.otpCode}. Valid for 2 minutes.`,
          'warning'
        );
      }

      setMessage({ type: 'success', text: 'Authorization code sent to your phone.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Communication error. Please try again.' });
    } finally {
      setProcessing(false);
    }
  };

  const handleVerify = async (id) => {
    setProcessing(true);
    try {
      const res = await api.post(`/contracts/${id}/verify`, { otp });
      
      if (res.data.status === 'VERIFIED') {
        setMessage({ type: 'success', text: 'Identity verified. Handing over to e-signing service...' });
        
        // Simulating the e-signing callback which happens after verification
        setTimeout(async () => {
          await api.post('/contracts/callback', { contractId: id, status: 'SIGNED' });
          setActiveOtp(null);
          setOtp('');
          fetchContracts();
          if (addNotification) {
            addNotification('Policy Signed', `Contract #${id} has been successfully signed and stored.`, 'success');
          }
        }, 2000);
      } else {
        setMessage({ type: 'error', text: `Verification failed. Attempts: ${res.data.failedAttempts}/${res.data.maxWrongAttempts}` });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Verification failed. Please check the code.' });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  return (
    <div className="container py-12 max-w-4xl fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black mb-2 text-slate-900">Legal Vault</h1>
          <p className="text-slate-500 text-lg">Access and manage your legally binding insurance agreements</p>
        </div>
        <button onClick={fetchContracts} className="btn btn-outline p-3 rounded-full hover:bg-slate-100">
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`mb-8 p-5 rounded-[24px] flex items-center gap-4 border shadow-sm ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${message.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'}`}>
              {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            </div>
            <span className="font-bold text-sm">{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {contracts.length === 0 ? (
        <div className="card text-center py-24 bg-white/50 border-dashed border-2 border-slate-200">
          <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center shadow-inner mx-auto mb-6 text-slate-200">
            <FileText size={48} />
          </div>
          <h3 className="text-slate-400 text-xl font-bold">No active agreements</h3>
          <p className="text-slate-300 text-sm mb-8">Purchase a plan to generate your first policy.</p>
          <Link to="/" className="btn btn-primary mx-auto px-10">Visit Store</Link>
        </div>
      ) : (
        <div className="space-y-8">
          {contracts.map((contract, index) => (
            <motion.div 
              key={contract.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card relative group hover:shadow-xl hover:shadow-indigo-500/5 transition-all border-slate-100 p-8"
            >
              <div className="flex flex-col gap-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-slate-900 text-white rounded-[24px] flex items-center justify-center flex-shrink-0 shadow-lg">
                      <FileText size={28} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-black text-slate-900">{contract.contractCode}</h3>
                        <span className={`badge ${
                          contract.status === 'SIGNED' ? 'badge-success' : 
                          contract.status === 'PENDING' ? 'badge-pending' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {contract.status}
                        </span>
                      </div>
                      <p className="text-slate-500 font-medium leading-relaxed max-w-lg">{contract.content}</p>
                      {contract.order?.product && (
                        <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                          <ShieldCheck size={14} /> Product: {contract.order.product.name}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {contract.status === 'SIGNED' ? (
                      <button className="btn btn-outline group-hover:border-indigo-200 border-slate-200">
                        <Download size={18} /> PDF
                      </button>
                    ) : (
                      <button className="btn btn-outline border-slate-200">
                        <ExternalLink size={18} /> Terms
                      </button>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {contract.status === 'PENDING' && !activeOtp && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-indigo-600 p-8 rounded-[28px] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-indigo-200"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                          <ShieldCheck size={28} />
                        </div>
                        <div>
                          <p className="font-black text-xl">Sign Policy</p>
                          <p className="text-indigo-100 text-sm">One-time signature required for this policy.</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleSendOtp(contract.id)}
                        disabled={processing}
                        className="btn bg-white text-indigo-600 hover:bg-indigo-50 px-10 shadow-lg"
                      >
                        {processing ? <Loader2 className="animate-spin" size={20} /> : 'Request OTP'}
                      </button>
                    </motion.div>
                  )}

                  {activeOtp === contract.id && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-slate-950 p-8 rounded-[28px] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center">
                          <Key size={28} />
                        </div>
                        <div>
                          <p className="font-black text-xl">Verification</p>
                          <p className="text-slate-400 text-sm">Enter the code from your notifications.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          placeholder="000000"
                          className="w-44 py-4 px-4 text-center tracking-[0.4em] font-black text-2xl bg-white/10 border-white/10 text-white focus:border-indigo-500 rounded-2xl outline-none"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          maxLength={6}
                        />
                        <button 
                          onClick={() => handleVerify(contract.id)}
                          disabled={processing || otp.length !== 6}
                          className="btn btn-primary px-8 h-14"
                        >
                          {processing ? <Loader2 className="animate-spin" size={20} /> : 'Verify'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="flex items-center justify-between pt-6 border-t border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   <span className="flex items-center gap-2">Issued: {new Date(contract.createdAt).toLocaleDateString()}</span>
                   <span className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full"><ShieldCheck size={14} className="text-emerald-500"/> Secured by AES-256</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Contracts;
