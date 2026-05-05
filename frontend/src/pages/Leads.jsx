import React, { useState, useEffect } from 'react';
import { Users, Phone, Mail, Clock, MessageSquare, UserPlus, Filter, Search, Loader2, ChevronRight, TrendingUp, BarChart3, UserCheck, Calendar, FileText, CheckCircle2, ShieldAlert, X, Plus, User as UserIcon, AlertCircle, Ban, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api, { leadService } from '../services/api';

const Leads = ({ user, addNotification }) => {
  const [leads, setLeads] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [salesStaff, setSalesStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('leads');
  const [selectedLead, setSelectedLead] = useState(null);
  const [history, setHistory] = useState([]);
  const [fetchingHistory, setFetchingHistory] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Form State
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', assignedToId: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'leads') {
        const [leadsData, staffData] = await Promise.all([
          leadService.getLeads(),
          api.get('/users/sales').then(res => res.data)
        ]);
        
        // Filter for SALE role
        const filteredLeads = user.role === 'SALE' 
          ? leadsData.filter(l => l.assignedTo?.id === user.id)
          : leadsData;
          
        setLeads(filteredLeads);
        setSalesStaff(staffData);
      } else {
        const res = await api.get('/contracts');
        
        // Filter contracts for SALE role (only show contracts of their assigned leads/users)
        // Note: This assumes we want Sale to only track their own portfolio
        const filteredContracts = user.role === 'SALE'
          ? res.data.filter(c => c.user?.id && leads.some(l => l.email === c.user.email))
          : res.data;
          
        setContracts(filteredContracts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await leadService.createLead(formData);
      addNotification('Lead Created', `Successfully added ${formData.name} to CRM.`, 'success');
      setShowCreateModal(false);
      setFormData({ name: '', phone: '', email: '', assignedToId: '' });
      fetchData();
    } catch (err) {
      addNotification('Error', 'Failed to create lead.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (leadId, newStatus) => {
    setUpdatingStatus(true);
    try {
      if (newStatus === 'WON') {
        // Run conversion API
        const result = await leadService.convertLead(leadId);
        addNotification(
          'Customer Account Created', 
          `Account for ${selectedLead.name} is ready.\nEmail: ${result.user.email}\nPassword: ${result.defaultPassword}`, 
          'success'
        );
      } else {
        await leadService.updateLead(leadId, { status: newStatus });
        addNotification('Status Updated', `Lead marked as ${newStatus}.`, 'info');
      }
      
      // Refresh data
      await fetchData();
      // Update selected lead view
      const updatedLeads = await leadService.getLeads();
      const updatedOne = updatedLeads.find(l => l.id === leadId);
      setSelectedLead(updatedOne);
      
    } catch (err) {
      addNotification('Error', err?.response?.data?.message || 'Failed to update status.', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSelectLead = async (lead) => {
    setSelectedLead(lead);
    setHistory([]);
    setFetchingHistory(true);
    try {
      const logs = await leadService.getHistory(lead.id);
      setHistory(logs);
    } catch (err) {
      setHistory([]);
    } finally {
      setFetchingHistory(false);
    }
  };

  if (loading && !showCreateModal) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  return (
    <div className="container py-8 fade-in">
      {/* Dashboard Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <StatCard icon={<Users className="text-indigo-600"/>} label="Total Leads" value={leads.length} trend="+12%" />
        <StatCard icon={<FileText className="text-emerald-600"/>} label="Active Policies" value={contracts.length} trend="+8%" />
        <StatCard icon={<Clock className="text-amber-600"/>} label="Pending Sign" value={contracts.filter(c => c.status !== 'SIGNED').length} trend="-3%" />
        <StatCard icon={<TrendingUp className="text-blue-600"/>} label="Est. Revenue" value="$42.5k" trend="+18%" />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black mb-2">CRM Dashboard</h1>
          <p className="text-slate-500">Manage customers and track contract lifecycle</p>
        </div>
        <div className="flex items-center gap-4">
          {user.role === 'ADMIN' && activeTab === 'leads' && (
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary flex items-center gap-2 px-6"
            >
              <Plus size={18} /> Create Lead
            </button>
          )}
          <div className="flex items-center gap-2 p-1 bg-white rounded-2xl shadow-sm border border-slate-100">
            <button 
              onClick={() => setActiveTab('leads')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'leads' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              Leads
            </button>
            <button 
              onClick={() => setActiveTab('contracts')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'contracts' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              Contracts
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {activeTab === 'leads' ? (
          <>
            {/* Lead List */}
            <div className="lg:col-span-7 space-y-4 overflow-y-auto max-h-[800px] pr-2 custom-scrollbar">
              {leads.map((lead, index) => (
                <motion.div 
                  key={lead.id} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSelectLead(lead)}
                  className={`card cursor-pointer group transition-all relative p-6 ${
                    selectedLead?.id === lead.id ? 'ring-2 ring-indigo-500 bg-indigo-50/30' : 
                    lead.status === 'LOST' ? 'bg-red-50/50 border-red-100' : 'hover:bg-white hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm ${
                        selectedLead?.id === lead.id ? 'bg-indigo-600 text-white' : 
                        lead.status === 'LOST' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {lead.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className={`text-lg font-bold mb-1 transition-colors ${lead.status === 'LOST' ? 'text-red-700' : 'group-hover:text-indigo-600'}`}>{lead.name}</h3>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-2"><Phone size={12} className={lead.status === 'LOST' ? 'text-red-300' : 'text-indigo-400'} /> {lead.phone}</span>
                          <span className="flex items-center gap-2"><Calendar size={12} className={lead.status === 'LOST' ? 'text-red-300' : 'text-indigo-400'} /> {new Date(lead.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`badge ${
                        lead.status === 'NEW' ? 'badge-pending' : 
                        lead.status === 'WON' ? 'badge-success' : 
                        lead.status === 'LOST' ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>{lead.status}</span>
                      <ChevronRight size={24} className={`transition-transform duration-300 ${selectedLead?.id === lead.id ? 'translate-x-1 text-indigo-500' : lead.status === 'LOST' ? 'text-red-200' : 'text-slate-300'}`} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Lead Detail Panel */}
            <div className="lg:col-span-5">
              <AnimatePresence mode="wait">
                {selectedLead ? (
                  <motion.div 
                    key={selectedLead.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`card sticky top-24 backdrop-blur-xl p-8 border-2 transition-colors ${
                      selectedLead.status === 'LOST' ? 'bg-red-50/80 border-red-100' : 
                      selectedLead.status === 'WON' ? 'bg-emerald-50/80 border-emerald-100' : 'bg-white/90 border-indigo-100'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-8">
                      <h2 className="text-2xl font-black">Lead Details</h2>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        selectedLead.status === 'LOST' ? 'bg-red-500 text-white' : 
                        selectedLead.status === 'WON' ? 'bg-emerald-500 text-white' : 'bg-indigo-50 text-indigo-600'
                      }`}>{selectedLead.status}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <DetailBox label="EMAIL" value={selectedLead.email || 'No email'} icon={<Mail size={16}/>} />
                      <DetailBox label="SOURCE" value={selectedLead.source || 'Marketing'} icon={<BarChart3 size={16}/>} />
                      <DetailBox label="ASSIGNED TO" value={selectedLead.assignedTo?.name || 'Unassigned'} icon={<UserCheck size={16}/>} />
                      <DetailBox label="PHONE" value={selectedLead.phone} icon={<Phone size={16}/>} />
                    </div>

                    {/* Status Actions */}
                    {selectedLead.status !== 'WON' && selectedLead.status !== 'LOST' && (
                      <div className="mb-10">
                         <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Actions</h3>
                         <div className="flex flex-wrap gap-3">
                           <button 
                             disabled={updatingStatus}
                             onClick={() => handleUpdateStatus(selectedLead.id, 'CONTACTED')}
                             className="flex-1 py-3 px-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
                           >
                             <Phone size={14} /> Contacted
                           </button>
                           <button 
                             disabled={updatingStatus}
                             onClick={() => handleUpdateStatus(selectedLead.id, 'LOST')}
                             className="flex-1 py-3 px-4 bg-red-50 border border-red-100 rounded-xl text-xs font-bold text-red-600 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                           >
                             <Ban size={14} /> Lost
                           </button>
                           <button 
                             disabled={updatingStatus || !selectedLead.email}
                             onClick={() => handleUpdateStatus(selectedLead.id, 'WON')}
                             title={!selectedLead.email ? "Email required to convert to user" : ""}
                             className="w-full py-4 px-4 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 disabled:opacity-50"
                           >
                             {updatingStatus ? <Loader2 className="animate-spin" size={16} /> : <><ArrowUpRight size={16} /> Convert to Customer (WON)</>}
                           </button>
                           {!selectedLead.email && <p className="text-[10px] text-red-400 font-bold w-full text-center mt-1">* Email is required for conversion</p>}
                         </div>
                      </div>
                    )}

                    <div>
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Activity Timeline</h3>
                      <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                        {fetchingHistory ? (
                          <div className="flex justify-center p-8"><Loader2 className="animate-spin text-indigo-300" size={32} /></div>
                        ) : history.length > 0 ? (
                          history.map((log, i) => (
                            <motion.div 
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              key={log.id} 
                              className="relative pl-10"
                            >
                              <div className={`absolute left-0 top-1 w-6 h-6 bg-white border-2 rounded-full flex items-center justify-center z-10 ${
                                log.action.includes('WON') ? 'border-emerald-500' : 
                                log.action.includes('LOST') ? 'border-red-500' : 'border-indigo-500'
                              }`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${
                                  log.action.includes('WON') ? 'bg-emerald-500' : 
                                  log.action.includes('LOST') ? 'bg-red-500' : 'bg-indigo-500'
                                }`}></div>
                              </div>
                              <p className="text-sm font-bold text-slate-800">{log.action}</p>
                              <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-bold uppercase">
                                <Clock size={10} /> {new Date(log.createdAt).toLocaleString()}
                              </p>
                            </motion.div>
                          ))
                        ) : (
                          <div className="text-center py-8 opacity-40">
                            <p className="text-xs font-bold text-slate-400">No activity logged yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="card h-full flex flex-col items-center justify-center py-32 bg-slate-50/50 border-dashed border-2 opacity-60">
                    <Users size={40} className="text-slate-200 mb-4" />
                    <p className="text-slate-400 font-bold">Select a lead to view profile</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <div className="lg:col-span-12 space-y-4">
            {/* Contracts List for Admin */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contracts.map((contract, index) => (
                <motion.div 
                  key={contract.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="card p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${contract.status === 'SIGNED' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                        <FileText size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{contract.contractCode}</h3>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <UserIcon size={12} /> {contract.user?.name || 'Unknown Client'}
                        </p>
                      </div>
                    </div>
                    <span className={`badge ${contract.status === 'SIGNED' ? 'badge-success' : 'badge-pending'}`}>
                      {contract.status}
                    </span>
                  </div>
                  
                  <div className="bg-slate-50 rounded-xl p-4 mb-6">
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {contract.content}
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Created: {new Date(contract.createdAt).toLocaleDateString()}
                    </div>
                    {contract.order?.product && (
                       <div className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                         {contract.order.product.name}
                       </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Lead Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg relative z-10 overflow-hidden"
            >
              <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                <h2 className="text-2xl font-black">Create New Lead</h2>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20}/></button>
              </div>
              <form onSubmit={handleCreateLead} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Customer Name</label>
                  <input 
                    required type="text" placeholder="John Doe"
                    className="w-full bg-slate-50 border-slate-100 focus:bg-white focus:border-indigo-500 rounded-2xl py-4 px-5 outline-none transition-all font-medium"
                    value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                    <input 
                      required type="text" placeholder="0901234567"
                      className="w-full bg-slate-50 border-slate-100 focus:bg-white focus:border-indigo-500 rounded-2xl py-4 px-5 outline-none transition-all font-medium"
                      value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email (Optional)</label>
                    <input 
                      type="email" placeholder="john@example.com"
                      className="w-full bg-slate-50 border-slate-100 focus:bg-white focus:border-indigo-500 rounded-2xl py-4 px-5 outline-none transition-all font-medium"
                      value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign to Sale Staff</label>
                  <select 
                    className="w-full bg-slate-50 border-slate-100 focus:bg-white focus:border-indigo-500 rounded-2xl py-4 px-5 outline-none transition-all font-medium appearance-none"
                    value={formData.assignedToId} onChange={(e) => setFormData({...formData, assignedToId: e.target.value})}
                  >
                    <option value="">Auto-assign or Select later</option>
                    {salesStaff.map(staff => (
                      <option key={staff.id} value={staff.id}>{staff.name} ({staff.role})</option>
                    ))}
                  </select>
                </div>
                <button 
                  disabled={submitting}
                  type="submit" 
                  className="btn btn-primary w-full py-4 mt-4"
                >
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Create and Assign'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatCard = ({ icon, label, value, trend }) => (
  <div className="card bg-white p-6 flex items-center gap-6 hover:border-indigo-200">
    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-end gap-3">
        <span className="text-2xl font-black text-slate-900">{value}</span>
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${
          trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
        }`}>{trend}</span>
      </div>
    </div>
  </div>
);

const DetailBox = ({ label, value, icon }) => (
  <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
    <div className="flex items-center gap-2 mb-2 text-slate-400">
      {icon}
      <p className="text-[9px] font-black uppercase tracking-widest">{label}</p>
    </div>
    <p className="text-xs font-bold text-slate-800 truncate">{value}</p>
  </div>
);

export default Leads;
