import React, { useState, useEffect } from 'react';
import { FileText, Key, CheckCircle2, AlertCircle, Loader2, Send, Download, ShieldCheck, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const Contracts = ({ user }) => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeOtp, setActiveOtp] = useState(null);
  const [otp, setOtp] = useState('');
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState(null);
  const [archivedIds, setArchivedIds] = useState([]);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = () => {
    // For demo purposes, we fetch all users then contracts
    api.get('/contracts/1').then(res => setContracts([res.data])).catch(() => setContracts([]))
      .finally(() => setLoading(false));
  };

  const handleSendOtp = async (id) => {
    setProcessing(true);
    try {
      await api.post(`/contracts/${id}/send-otp`);
      setActiveOtp(id);
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
      await api.post(`/contracts/${id}/verify`, { otp });
      setMessage({ type: 'success', text: 'Agreement signed and secured.' });
      setActiveOtp(null);
      fetchContracts();
    } catch (err) {
      setMessage({ type: 'error', text: 'Verification failed. Please check the code.' });
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadContract = (contract) => {
    const content = [
      `Contract Code: ${contract.contractCode}`,
      `Status: ${contract.status}`,
      `Issued: ${new Date(contract.createdAt).toLocaleString()}`,
      '',
      contract.content,
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${contract.contractCode}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    if (contracts.length === 0) {
      setMessage({ type: 'error', text: 'No contracts available to download.' });
      return;
    }
    contracts.forEach((contract) => handleDownloadContract(contract));
    setMessage({ type: 'success', text: 'All available contracts were downloaded.' });
  };

  const handleArchive = () => {
    const pendingIds = contracts.filter((contract) => contract.status !== 'SIGNED').map((contract) => contract.id);
    if (pendingIds.length === 0) {
      setMessage({ type: 'error', text: 'No pending contracts to archive.' });
      return;
    }
    setArchivedIds((prev) => [...new Set([...prev, ...pendingIds])]);
    setMessage({ type: 'success', text: 'Pending contracts were archived from this view.' });
  };

  const visibleContracts = contracts.filter((contract) => !archivedIds.includes(contract.id));

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  return (
    <div className="container py-12 max-w-4xl fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black mb-2">Legal Vault</h1>
          <p className="text-slate-500">Access and manage your legally binding insurance agreements</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={handleDownloadAll} className="btn btn-outline text-xs px-4">Download All</button>
          <button type="button" onClick={handleArchive} className="btn btn-outline text-xs px-4">Archive</button>
        </div>
      </div>

      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`mb-8 p-5 rounded-[20px] flex items-center gap-4 border ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${message.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'}`}>
              {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            </div>
            <span className="font-bold">{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {visibleContracts.length === 0 ? (
        <div className="card text-center py-24 bg-slate-50/50 border-dashed border-2">
          <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-sm mx-auto mb-6 text-slate-200">
            <FileText size={48} />
          </div>
          <h3 className="text-slate-400 text-xl font-bold">No active agreements</h3>
          <p className="text-slate-300">Your signed policies will appear here.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {visibleContracts.map((contract, index) => (
            <motion.div 
              key={contract.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card relative group hover:ring-2 hover:ring-indigo-500/20"
            >
              <div className="flex flex-col gap-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-slate-950 text-white rounded-[24px] flex items-center justify-center flex-shrink-0 shadow-lg shadow-slate-200">
                      <FileText size={28} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-black text-slate-900">{contract.contractCode}</h3>
                        <span className={`badge ${
                          contract.status === 'SIGNED' ? 'badge-success' : 'badge-pending'
                        }`}>
                          {contract.status}
                        </span>
                      </div>
                      <p className="text-slate-500 font-medium">{contract.content}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {contract.status === 'SIGNED' ? (
                      <button
                        type="button"
                        onClick={() => handleDownloadContract(contract)}
                        className="btn btn-outline border-slate-200 group-hover:border-indigo-200"
                      >
                        <Download size={18} /> Download PDF
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setMessage({ type: 'success', text: 'Terms are displayed in the contract content section.' })}
                        className="btn btn-outline border-slate-200"
                      >
                        <ExternalLink size={18} /> Review Terms
                      </button>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {contract.status === 'PENDING' && !activeOtp && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-indigo-600 p-8 rounded-[24px] text-white flex flex-col md:flex-row items-center justify-between gap-6"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                          <ShieldCheck size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-lg">Signature Required</p>
                          <p className="text-indigo-100 text-sm">Please verify your identity to finalize this policy.</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleSendOtp(contract.id)}
                        disabled={processing}
                        className="btn bg-white text-indigo-600 hover:bg-indigo-50 px-10 shadow-xl shadow-indigo-900/20"
                      >
                        {processing ? <Loader2 className="animate-spin" size={20} /> : 'Begin Signing'}
                      </button>
                    </motion.div>
                  )}

                  {activeOtp === contract.id && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-slate-950 p-8 rounded-[24px] text-white flex flex-col md:flex-row items-center justify-between gap-6"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center">
                          <Key size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-lg">Identity Verification</p>
                          <p className="text-slate-400 text-sm">Enter the 6-digit code we sent you.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          placeholder="000 000"
                          className="w-40 py-3 px-4 text-center tracking-[0.3em] font-black text-xl bg-white/10 border-white/20 text-white focus:border-indigo-500 rounded-2xl"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          maxLength={6}
                        />
                        <button 
                          onClick={() => handleVerify(contract.id)}
                          disabled={processing || otp.length !== 6}
                          className="btn btn-primary px-8"
                        >
                          {processing ? <Loader2 className="animate-spin" size={20} /> : 'Verify'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="flex items-center justify-between pt-6 border-t border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-widest">
                   <span>Issued: {new Date(contract.createdAt).toLocaleDateString()}</span>
                   <span className="flex items-center gap-2"><ShieldCheck size={14} className="text-indigo-400"/> Cryptographically Secured</span>
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
