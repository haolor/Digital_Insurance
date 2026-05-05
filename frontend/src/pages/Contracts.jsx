import React, { useState, useEffect } from 'react';
import { FileText, Key, CheckCircle2, AlertCircle, Loader2, Send } from 'lucide-react';
import api from '../services/api';

const Contracts = ({ user }) => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeOtp, setActiveOtp] = useState(null);
  const [otp, setOtp] = useState('');
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = () => {
    api.get('/users').then(res => {
      const me = res.data.find(u => u.id === user.id);
      // We need to fetch individual contracts or filter them
      // For now let's assume we can fetch all and filter or backend has /my-contracts
      api.get('/contracts/1').then(res => setContracts([res.data])).catch(() => setContracts([]))
        .finally(() => setLoading(false));
    });
  };

  const handleSendOtp = async (id) => {
    setProcessing(true);
    try {
      await api.post(`/contracts/${id}/send-otp`);
      setActiveOtp(id);
      setMessage({ type: 'success', text: 'OTP sent! Check server console.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to send OTP.' });
    } finally {
      setProcessing(false);
    }
  };

  const handleVerify = async (id) => {
    setProcessing(true);
    try {
      await api.post(`/contracts/${id}/verify`, { otp });
      setMessage({ type: 'success', text: 'Contract verified successfully!' });
      setActiveOtp(null);
      fetchContracts();
    } catch (err) {
      setMessage({ type: 'error', text: 'Invalid OTP or contract locked.' });
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
    <div className="container fade-in">
      <div className="mb-8">
        <h1 className="text-3xl">My Contracts</h1>
        <p className="text-slate-500">Manage and sign your active insurance policies</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 border ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {contracts.length === 0 ? (
        <div className="card text-center py-16 bg-slate-50 border-dashed border-2">
          <FileText size={48} className="mx-auto mb-4 text-slate-300" />
          <h3 className="text-slate-400">No contracts found</h3>
          <p className="text-slate-400 text-sm">You haven't purchased any insurance yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {contracts.map((contract) => (
            <div key={contract.id} className="card">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg leading-tight mb-1">{contract.contractCode}</h3>
                    <p className="text-sm text-slate-500 mb-2">{contract.content}</p>
                    <span className={`badge badge-${contract.status.toLowerCase()}`}>
                      {contract.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {contract.status === 'PENDING' && (
                    <button 
                      onClick={() => handleSendOtp(contract.id)}
                      disabled={processing}
                      className="btn btn-primary"
                    >
                      {processing ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                      Sign Now
                    </button>
                  )}
                  
                  {activeOtp === contract.id && (
                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border">
                      <input
                        type="text"
                        placeholder="6-digit OTP"
                        className="w-32 py-2 px-3 text-center tracking-widest font-bold"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={6}
                      />
                      <button 
                        onClick={() => handleVerify(contract.id)}
                        disabled={processing || otp.length !== 6}
                        className="btn btn-primary py-2 px-4"
                      >
                        {processing ? <Loader2 className="animate-spin" size={16} /> : 'Verify'}
                      </button>
                    </div>
                  )}

                  <button className="btn btn-outline">View Details</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Contracts;
