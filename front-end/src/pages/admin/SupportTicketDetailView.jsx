import React from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Users, AlertCircle, Clock, Check, X, 
  ThumbsUp, ThumbsDown, FileCheck, 
  Calendar, Plus, Menu, ChevronRight,
  ShieldAlert, Activity, Zap, Settings,ArrowRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useRole } from '../../context/RoleContext';

export function SupportTicketDetailView() {
  const { user } = useRole();
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Mock ticket data - in a real app, this would come from an API
  const mockTickets = [
    { 
      id: '1', 
      user: 'Madam Gladys', 
      issue: 'Password reset encryption loop', 
      status: 'priority',
      createdAt: '2026-05-10T14:30:00Z',
      updatedAt: '2026-05-10T14:30:00Z',
      description: 'Users unable to reset passwords due to encryption loop in the authentication service. Affects all staff attempting to access the system after password expiration.',
      priority: 'High',
      category: 'Security',
      assignedTo: 'IT Security Team',
      resolutionSteps: [
        'Identified encryption key mismatch in auth service',
        'Rotated encryption keys and updated config',
        'Tested password reset flow with QA team',
        'Monitored for recurrence over 24-hour period'
      ]
    },
    { 
      id: '2', 
      user: 'Chemistry Lab', 
      issue: 'Tablet Node #14 sync error', 
      status: 'active',
      createdAt: '2026-05-12T09:15:00Z',
      updatedAt: '2026-05-12T10:45:00Z',
      description: 'Tablet Node #14 in the Chemistry Lab failing to synchronize with the central grading database, causing delays in grade entry and retrieval.',
        priority: 'Medium',
        category: 'Technical',
        assignedTo: 'Hardware Support Team',
      resolutionSteps: [
        'Diagnosed network connectivity issue at node level',
        'Replaced faulty Ethernet cable connected to tablet node',
        'Updated device drivers and synchronization software',
        'Verified sync functionality with test data'
      ]
    }
  ];
  
  // Find the ticket by ID
  const ticket = mockTickets.find(t => t.id === id);
  
  // If ticket not found, redirect to support queue
  if (!ticket) {
    navigate('/support');
    return null;
  }
  
  // Format dates for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 scrollbar-hide">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
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
        
        {/* Ticket Detail Card */}
        <div className="bg-white rounded-xl border border-slate-200/50 shadow-sm">
          {/* Ticket Header */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Users size={24} className="text-slate-600" />
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm">Submitted By</p>
                    <p className="text-2xl font-bold text-slate-900">{ticket.user}</p>
                  </div>
                </div>
                <p className="text-slate-700">{ticket.issue}</p>
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
                    ticket.status === 'priority' ? "bg-rose-50 text-rose-800" :
                    ticket.status === 'active' ? "bg-blue-50 text-blue-800" :
                    "bg-slate-50 text-slate-600"
                  )}>
                    {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                  </div>
                </div>
              </div>
              
              <div className="text-right space-y-2">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  ticket.status === 'priority' ? "bg-rose-100 text-rose-800" :
                  ticket.status === 'active' ? "bg-blue-100 text-blue-800" :
                  "bg-slate-100 text-slate-500"
                )}>
                  <AlertCircle size={18} className={ticket.status === 'priority' ? "text-rose-600" : ticket.status === 'active' ? "text-blue-600" : "text-slate-500"} />
                </div>
                <div className="flex-1 pt-2">
                  <span className={cn(
                    "px-3 py-1 rounded text-sm font-medium",
                    ticket.status === 'priority' ? "bg-rose-50 text-rose-800" :
                    ticket.status === 'active' ? "bg-blue-50 text-blue-800" :
                    "bg-slate-50 text-slate-600"
                  )}>
                    {ticket.priority} Priority
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Ticket Description */}
          {ticket.description && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Description</h2>
              <p className="text-slate-600 leading-relaxed">{ticket.description}</p>
            </div>
          )}
          
          {/* Ticket Details */}
          <div className="p-6 border-t border-slate-100">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Ticket Details</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-slate-500 font-medium mb-2">Category</p>
                <p className="text-slate-600">{ticket.category}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium mb-2">Assigned To</p>
                <p className="text-slate-600">{ticket.assignedTo}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium mb-2">Status</p>
                <p className={cn(
                  "px-3 py-1 rounded text-sm font-medium",
                  ticket.status === 'priority' ? "bg-rose-50 text-rose-800" :
                  ticket.status === 'active' ? "bg-blue-50 text-blue-800" :
                  "bg-slate-50 text-slate-600"
                )}>
                  {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                </p>
              </div>
            </div>
          </div>
          
          {/* Resolution Steps */}
          {ticket.resolutionSteps && ticket.resolutionSteps.length > 0 && (
            <div className="p-6 border-t border-slate-100">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Resolution Steps</h2>
              <ol className="list-decimal list-inside space-y-2 text-slate-600">
                {ticket.resolutionSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 text-slate-400">{index + 1}.</span>
                    <span className="flex-1">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
          
          {/* Actions */}
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
                <Activity size={16} /> Edit Ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}