import React, { useState, useEffect } from 'react';
import { Users, Phone, Mail, Clock, MessageSquare, UserPlus, Filter, Search, Loader2, ChevronRight } from 'lucide-react';
import { leadService } from '../services/api';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [history, setHistory] = useState([]);
  const [fetchingHistory, setFetchingHistory] = useState(false);

  useEffect(() => {
    leadService.getLeads().then(setLeads).finally(() => setLoading(false));
  }, []);

  const handleSelectLead = async (lead) => {
    setSelectedLead(lead);
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

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  return (
    <div className="container fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl">CRM Dashboard</h1>
          <p className="text-slate-500">Manage and convert your potential leads</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search leads..." className="pl-10 py-2 w-64" />
          </div>
          <button className="btn btn-outline flex items-center gap-2">
            <Filter size={18} /> Filter
          </button>
          <button className="btn btn-primary flex items-center gap-2">
            <UserPlus size={18} /> Add Lead
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lead List */}
        <div className="lg:col-span-2 space-y-4">
          {leads.map((lead) => (
            <div 
              key={lead.id} 
              onClick={() => handleSelectLead(lead)}
              className={`card cursor-pointer transition-all hover:border-primary border-l-4 ${
                selectedLead?.id === lead.id ? 'border-l-primary ring-2 ring-indigo-50 shadow-md' : 'border-l-transparent'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-bold text-lg">
                    {lead.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg leading-tight mb-1">{lead.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1"><Phone size={14} /> {lead.phone}</span>
                      <span className="flex items-center gap-1"><Clock size={14} /> {new Date(lead.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge badge-${lead.status.toLowerCase()}`}>{lead.status}</span>
                  <ChevronRight size={20} className="text-slate-300" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lead Detail / History */}
        <div className="lg:col-span-1">
          {selectedLead ? (
            <div className="card sticky top-24">
              <h2 className="text-xl mb-4">Lead Information</h2>
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Mail className="text-slate-400" size={20} />
                  <div>
                    <p className="text-xs text-slate-500 font-medium">EMAIL</p>
                    <p className="text-sm font-semibold">{selectedLead.email || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <MessageSquare className="text-slate-400" size={20} />
                  <div>
                    <p className="text-xs text-slate-500 font-medium">SOURCE</p>
                    <p className="text-sm font-semibold">{selectedLead.source || 'Direct'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Users className="text-slate-400" size={20} />
                  <div>
                    <p className="text-xs text-slate-500 font-medium">ASSIGNED TO</p>
                    <p className="text-sm font-semibold">{selectedLead.assignedTo?.name || 'Unassigned'}</p>
                  </div>
                </div>
              </div>

              <h2 className="text-xl mb-4">Activity History</h2>
              <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                {fetchingHistory ? (
                  <div className="flex justify-center p-4"><Loader2 className="animate-spin text-slate-300" /></div>
                ) : history.length > 0 ? (
                  history.map((log) => (
                    <div key={log.id} className="relative pl-8">
                      <div className="absolute left-0 top-1.5 w-6 h-6 bg-white border-2 border-indigo-500 rounded-full flex items-center justify-center z-10">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      </div>
                      <p className="text-sm font-medium">{log.action}</p>
                      <p className="text-xs text-slate-400">{new Date(log.createdAt).toLocaleString()}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 pl-8">No activity recorded</p>
                )}
              </div>
              
              <div className="mt-8 flex gap-2">
                <button className="btn btn-primary flex-1">Update Status</button>
                <button className="btn btn-outline">Call</button>
              </div>
            </div>
          ) : (
            <div className="card text-center py-20 bg-slate-50 border-dashed border-2">
              <Users size={48} className="mx-auto mb-4 text-slate-200" />
              <p className="text-slate-400">Select a lead to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leads;
