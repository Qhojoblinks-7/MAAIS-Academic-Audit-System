import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Users, AlertCircle, Clock, X, 
  Calendar, Plus, ArrowRight, AlertTriangle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { hodService } from '../../services/hodService';
import { LoadingSpinner } from '../../components/molecules';

export function SupportTicketDetailView() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    hodService.getSupportTickets()
      .then(data => {
        const found = (data?.tickets || data || []).find(t => t.id === id);
        setTicket(found || null);
      })
      .catch(() => setTicket(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <LoadingSpinner size="md" className="text-emerald-600" />
      </div>
    );
  }

  if (!ticket) {
    navigate('/support');
    return null;
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 scrollbar-hide">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-900">Support Ticket Details</h1>
          <div className="flex items-center gap-3">
            <Link to="/support" className="text-slate-500 hover:text-slate-700 transition-colors">
              <X size={20} /> Back to Support Queue
            </Link>
            <button 
              onClick={() => navigate('/support/new')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
            >
              <Plus size={16} /> New Ticket
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200/50 shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Users size={24} className="text-slate-600" />
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm">Submitted By</p>
                    <p className="text-2xl font-bold text-slate-900">{ticket.student?.name || ticket.user || 'System'}</p>
                  </div>
                </div>
                <p className="text-slate-700">{ticket.subject || ticket.issue || '—'}</p>
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-slate-400" />
                    <span>Created: {formatDate(ticket.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-slate-400" />
                    <span>Updated: {formatDate(ticket.updatedAt)}</span>
                  </div>
                  <div className={cn(
                    "px-3 py-1 rounded text-sm font-medium",
                    ticket.status === 'OPEN' ? "bg-rose-50 text-rose-800" :
                    ticket.status === 'IN_PROGRESS' ? "bg-amber-50 text-amber-800" :
                    ticket.status === 'RESOLVED' ? "bg-emerald-50 text-emerald-800" :
                    "bg-slate-50 text-slate-600"
                  )}>
                    {ticket.status?.replace(/_/g, ' ') || '—'}
                  </div>
                </div>
              </div>
              
              <div className="text-right space-y-2">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  ticket.status === 'OPEN' ? "bg-rose-100 text-rose-800" :
                  ticket.status === 'IN_PROGRESS' ? "bg-amber-100 text-amber-800" :
                  ticket.status === 'RESOLVED' ? "bg-emerald-100 text-emerald-800" :
                  "bg-slate-100 text-slate-500"
                )}>
                  <AlertCircle size={18} className={ticket.status === 'OPEN' ? "text-rose-600" : ticket.status === 'IN_PROGRESS' ? "text-amber-600" : ticket.status === 'RESOLVED' ? "text-emerald-600" : "text-slate-500"} />
                </div>
                <div className="flex-1 pt-2">
                  <span className={cn(
                    "px-3 py-1 rounded text-sm font-medium",
                    ticket.priority === 'HIGH' ? "bg-rose-50 text-rose-800" :
                    ticket.priority === 'MEDIUM' ? "bg-amber-50 text-amber-800" :
                    "bg-slate-50 text-slate-600"
                  )}>
                    {ticket.priority} Priority
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {ticket.description && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Description</h2>
              <p className="text-slate-600 leading-relaxed">{ticket.description}</p>
            </div>
          )}
          
          <div className="p-6 border-t border-slate-100">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Ticket Details</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-slate-500 font-medium mb-2">Category</p>
                <p className="text-slate-600">{ticket.category || '—'}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium mb-2">Assigned To</p>
                <p className="text-slate-600">{ticket.assignedTo || 'Unassigned'}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium mb-2">Status</p>
                <p className={cn(
                  "px-3 py-1 rounded text-sm font-medium",
                  ticket.status === 'OPEN' ? "bg-rose-50 text-rose-800" :
                  ticket.status === 'IN_PROGRESS' ? "bg-amber-50 text-amber-800" :
                  ticket.status === 'RESOLVED' ? "bg-emerald-50 text-emerald-800" :
                  "bg-slate-50 text-slate-600"
                )}>
                  {ticket.status?.replace(/_/g, ' ') || '—'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-6 pt-4 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:justify-end gap-4">
              <Link 
                to="/support" 
                className="flex-1 sm:auto px-4 py-3 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <ArrowRight size={16} /> Back to Queue
              </Link>
              <button 
                onClick={() => navigate(`/support/edit/${id}`)}
                className="flex-1 sm:auto px-4 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <AlertTriangle size={16} /> Edit Ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}