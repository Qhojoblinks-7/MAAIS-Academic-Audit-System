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
      <div className="flex-1 flex items-center justify-center bg-background">
        <LoadingSpinner size="md" className="text-brand-primary" />
      </div>
    );
  }

  if (!ticket) {
    navigate('/support');
    return null;
  }

  const nameFromProfile = (profile) =>
    profile ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() : '';
  const creator = ticket.createdBy;
  const submittedBy =
    nameFromProfile(ticket.student) ||
    nameFromProfile(creator?.staffProfile || creator?.studentProfile) ||
    creator?.email ||
    ticket.user ||
    'Unknown User';

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6 scrollbar-hide">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-text-primary">Support Ticket Details</h1>
          <div className="flex items-center gap-3">
            <Link to="/support" className="text-text-secondary hover:text-text-primary transition-colors">
              <X size={20} /> Back to Support Queue
            </Link>
            <button 
              onClick={() => navigate('/support/new')}
              className="flex items-center gap-2 px-4 py-2 bg-brand-dark text-primary-foreground rounded-lg hover:bg-brand-dark/90 transition-colors text-sm font-medium"
            >
              <Plus size={16} /> New Ticket
            </button>
          </div>
        </div>
        
        <div className="bg-surface rounded-xl border border-border shadow-sm">
          <div className="p-6 border-b border-border">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                    <Users size={24} className="text-text-secondary" />
                  </div>
                  <div>
                    <p className="text-text-secondary text-sm">Submitted By</p>
                    <p className="text-2xl font-bold text-text-primary">{submittedBy}</p>
                  </div>
                </div>
                <p className="text-text-primary">{ticket.title || ticket.subject || ticket.issue || '—'}</p>
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-text-secondary" />
                    <span>Created: {formatDate(ticket.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-text-secondary" />
                    <span>Updated: {formatDate(ticket.updatedAt)}</span>
                  </div>
                  <div className={cn(
                    "px-3 py-1 rounded text-sm font-medium",
                    ticket.status === 'OPEN' ? "bg-destructive/10 text-destructive" :
                    ticket.status === 'IN_PROGRESS' ? "bg-warning/10 text-warning" :
                    ticket.status === 'RESOLVED' ? "bg-brand-primary/10 text-brand-primary" :
                    "bg-muted text-text-secondary"
                  )}>
                    {ticket.status?.replace(/_/g, ' ') || '—'}
                  </div>
                </div>
              </div>
              
              <div className="text-right space-y-2">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  ticket.status === 'OPEN' ? "bg-destructive/10 text-destructive" :
                  ticket.status === 'IN_PROGRESS' ? "bg-warning/10 text-warning" :
                  ticket.status === 'RESOLVED' ? "bg-brand-primary/10 text-brand-primary" :
                  "bg-muted text-text-secondary"
                )}>
                  <AlertCircle size={18} className={ticket.status === 'OPEN' ? "text-destructive" : ticket.status === 'IN_PROGRESS' ? "text-warning" : ticket.status === 'RESOLVED' ? "text-brand-primary" : "text-text-secondary"} />
                </div>
                <div className="flex-1 pt-2">
                  <span className={cn(
                    "px-3 py-1 rounded text-sm font-medium",
                    ticket.priority === 'HIGH' ? "bg-destructive/10 text-destructive" :
                    ticket.priority === 'MEDIUM' ? "bg-warning/10 text-warning" :
                    "bg-muted text-text-secondary"
                  )}>
                    {ticket.priority} Priority
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {ticket.description && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">Description</h2>
              <p className="text-text-secondary leading-relaxed">{ticket.description}</p>
            </div>
          )}
          
          <div className="p-6 border-t border-border">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Ticket Details</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-text-secondary font-medium mb-2">Category</p>
                <p className="text-text-secondary">{ticket.category || '—'}</p>
              </div>
              <div>
                <p className="text-text-secondary font-medium mb-2">Assigned To</p>
                <p className="text-text-secondary">{ticket.assignedTo || 'Unassigned'}</p>
              </div>
              <div>
                <p className="text-text-secondary font-medium mb-2">Status</p>
                <p className={cn(
                  "px-3 py-1 rounded text-sm font-medium",
                  ticket.status === 'OPEN' ? "bg-destructive/10 text-destructive" :
                  ticket.status === 'IN_PROGRESS' ? "bg-warning/10 text-warning" :
                  ticket.status === 'RESOLVED' ? "bg-brand-primary/10 text-brand-primary" :
                  "bg-muted text-text-secondary"
                )}>
                  {ticket.status?.replace(/_/g, ' ') || '—'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-6 pt-4 border-t border-border">
            <div className="flex flex-col sm:flex-row sm:justify-end gap-4">
              <Link 
                to="/support" 
                className="flex-1 sm:auto px-4 py-3 bg-muted text-text-secondary rounded-lg hover:bg-muted transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <ArrowRight size={16} /> Back to Queue
              </Link>
              <button 
                onClick={() => navigate(`/support/edit/${id}`)}
                className="flex-1 sm:auto px-4 py-3 bg-brand-dark text-primary-foreground rounded-lg hover:bg-brand-dark transition-colors text-sm font-medium flex items-center justify-center gap-2"
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