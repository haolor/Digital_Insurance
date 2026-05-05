import React, { useState, useEffect } from 'react';
import { Users, Phone, Mail, Clock, MessageSquare, UserPlus, Filter, Search, Loader2, ChevronRight, TrendingUp, BarChart3, UserCheck, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { leadService } from '../services/api';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [history, setHistory] = useState([]);
  const [fetchingHistory, setFetchingHistory] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    leadService.getLeads().then(setLeads).finally(() => setLoading(false));
  }, []);

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

  const handleCreateLead = async () => {
    const name = `Walk-in Lead ${leads.length + 1}`;
    const now = new Date().toISOString();
    try {
      const created = await leadService.createLead({
        name,
        phone: 'N/A',
        email: '',
        status: 'NEW',
        source: 'Manual',
        createdAt: now,
      });
      setLeads((prev) => [created, ...prev]);
    } catch (err) {
      // Fallback to local item for mock/demo data sources.
      const fallbackLead = {
        id: Date.now(),
        name,
        phone: 'N/A',
        email: '',
        status: 'NEW',
        source: 'Manual',
        createdAt: now,
      };
      setLeads((prev) => [fallbackLead, ...prev]);
    }
  };

  const handleUpdateLeadStatus = async (lead, status) => {
    try {
      await leadService.updateLead(lead.id, { status });
    } catch (err) {
      // Keep UI responsive even if backend doesn't persist this update yet.
    }
    setLeads((prev) => prev.map((item) => (item.id === lead.id ? { ...item, status } : item)));
    setSelectedLead((prev) => (prev?.id === lead.id ? { ...prev, status } : prev));
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  return (
    <div className="container py-8 fade-in">
      {/* Dashboard Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <StatCard icon={<Users className="text-indigo-600"/>} label="Total Leads" value={leads.length} trend="+12%" />
        <StatCard icon={<UserCheck className="text-emerald-600"/>} label="Converted" value={leads.filter(l => l.status === 'WON').length} trend="+5%" />
        <StatCard icon={<Clock className="text-amber-600"/>} label="Pending" value={leads.filter(l => l.status === 'NEW').length} trend="-2%" />
        <StatCard icon={<TrendingUp className="text-blue-600"/>} label="Total Revenue" value="$42.5k" trend="+18%" />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black mb-2">Sales Intelligence</h1>
          <p className="text-slate-500">Manage and optimize your lead conversion funnel</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 py-3 w-80 bg-slate-50/50 border-none focus:ring-0"
            />
          </div>
          <button
            type="button"
            onClick={() => setStatusFilter((prev) => (prev === 'NEW' ? 'ALL' : 'NEW'))}
            className="btn btn-outline border-none bg-slate-100 hover:bg-indigo-50 px-4"
            title={statusFilter === 'NEW' ? 'Show all leads' : 'Show only new leads'}
          >
            <Filter size={20} />
          </button>
          <button type="button" onClick={handleCreateLead} className="btn btn-primary px-6">
            <UserPlus size={20} /> New Lead
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Lead List */}
        <div className="lg:col-span-7 space-y-4 overflow-y-auto max-h-[800px] pr-2 custom-scrollbar">
          {filteredLeads.map((lead, index) => (
            <motion.div 
              key={lead.id} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleSelectLead(lead)}
              className={`card cursor-pointer group transition-all relative ${
                selectedLead?.id === lead.id ? 'ring-2 ring-indigo-500 bg-indigo-50/30' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm ${
                    selectedLead?.id === lead.id ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700'
                  }`}>
                    {lead.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1 group-hover:text-indigo-600 transition-colors">{lead.name}</h3>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-slate-500">
                      <span className="flex items-center gap-2"><Phone size={14} className="text-indigo-400" /> {lead.phone}</span>
                      <span className="flex items-center gap-2"><Calendar size={14} className="text-indigo-400" /> {new Date(lead.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`badge ${
                    lead.status === 'NEW' ? 'badge-pending' : lead.status === 'WON' ? 'badge-success' : 'bg-slate-100 text-slate-500'
                  }`}>{lead.status}</span>
                  <ChevronRight size={24} className={`transition-transform duration-300 ${selectedLead?.id === lead.id ? 'translate-x-1 text-indigo-500' : 'text-slate-300'}`} />
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
                className="card sticky top-24 bg-white/90 backdrop-blur-xl border-indigo-100"
              >
                <div className="flex justify-between items-start mb-8">
                  <h2 className="text-2xl font-black">Customer Insights</h2>
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">Profile View</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <DetailBox label="EMAIL" value={selectedLead.email || 'No email provided'} icon={<Mail size={16}/>} />
                  <DetailBox label="SOURCE" value={selectedLead.source || 'Marketing'} icon={<BarChart3 size={16}/>} />
                  <DetailBox label="ASSIGNED TO" value={selectedLead.assignedTo?.name || 'Unassigned'} icon={<UserCheck size={16}/>} />
                  <DetailBox label="LAST CONTACT" value={new Date().toLocaleDateString()} icon={<MessageSquare size={16}/>} />
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Interaction History</h3>
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
                          <div className="absolute left-0 top-1 w-6 h-6 bg-white border-2 border-indigo-500 rounded-full flex items-center justify-center z-10 shadow-sm">
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                          </div>
                          <p className="text-sm font-bold text-slate-800">{log.action}</p>
                          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                            <Clock size={10} /> {new Date(log.createdAt).toLocaleString()}
                          </p>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-8 opacity-40 grayscale">
                        <MessageSquare size={32} className="mx-auto mb-2" />
                        <p className="text-sm">No activity records found</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-12 flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleUpdateLeadStatus(selectedLead, 'WON')}
                    className="btn btn-primary flex-1 shadow-indigo-200"
                  >
                    Convert to Policy
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateLeadStatus(selectedLead, 'LOST')}
                    className="btn btn-outline border-slate-200"
                  >
                    Mark Lost
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="card h-full flex flex-col items-center justify-center py-32 bg-slate-50/50 border-dashed border-2 opacity-60">
                <div className="w-20 h-20 bg-white rounded-[24px] flex items-center justify-center shadow-sm mb-6">
                  <Users size={40} className="text-slate-200" />
                </div>
                <h3 className="text-slate-400 font-bold">Select a Lead to analyze</h3>
                <p className="text-slate-300 text-sm">Deep insights will appear here</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, trend }) => (
  <div className="card bg-white p-6 flex items-center gap-6 hover:border-indigo-200">
    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl">
      {icon}
    </div>
    <div>
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
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
  <div className="p-4 bg-slate-50/50 rounded-[20px] border border-slate-100">
    <div className="flex items-center gap-2 mb-2 text-slate-400">
      {icon}
      <p className="text-[9px] font-black uppercase tracking-widest">{label}</p>
    </div>
    <p className="text-sm font-bold text-slate-800 truncate">{value}</p>
  </div>
);

export default Leads;
