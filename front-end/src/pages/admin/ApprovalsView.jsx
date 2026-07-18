import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { EmptyState } from '../../components/molecules';
import { 
  Users, AlertCircle, Clock, TrendingUp, Check, X, 
  ThumbsUp, ThumbsDown, FileCheck, Search, 
  Calendar, Plus, Menu, ChevronRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useRole } from '../../context/RoleContext';

export function ApprovalsView() {
  const { user } = useRole();
  const navigate = useNavigate();
  
  const [approvals, setApprovals] = React.useState([]);
  const [filter, setFilter] = React.useState('all');
  const [searchTerm, setSearchTerm] = React.useState('');
  
  // Filter approvals based on search and filter
  const filteredApprovals = approvals.filter(approval => 
    (filter === 'all' || 
     (filter === 'pending' && approval.status !== 'resolved') ||
     (filter === 'resolved' && approval.status === 'resolved')) &&
    approval.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
    approval.detail.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleResolveApproval = (id, status, teacher) => {
    // In a real app, this would be an API call
    setApprovals(prev => prev.map(approval => 
      approval.id === id ? {...approval, status: status === 'grant' ? 'approved' : 'rejected'} : approval
    ));
    
    // Add to activity log (simplified)
    // This would typically update a separate activity log state
  };
  
  return (
    <div className="flex-1 overflow-y-auto bg-background p-6 scrollbar-hide">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-text-primary">Approval Queue Management</h1>
          <div className="flex items-center gap-3">
            <Link to="/admin/home" className="text-text-secondary hover:text-text-primary transition-colors">
              <Users size={20} /> Back to Dashboard
            </Link>
            <button 
              onClick={() => navigate('/approvals/new')}
              className="flex items-center gap-2 px-4 py-2 bg-brand-dark text-primary-foreground rounded-lg hover:bg-brand-dark/90 transition-colors text-sm font-medium"
            >
              <Plus size={16} /> New Approval Request
            </button>
          </div>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-surface p-4 rounded-xl border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Total Requests</p>
                <p className="text-2xl font-bold text-text-primary">{approvals.length}</p>
              </div>
              <Users size={24} className="text-text-secondary" />
            </div>
          </div>
          <div className="bg-surface p-4 rounded-xl border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Pending Review</p>
                <p className="text-2xl font-bold text-brand-primary">{approvals.filter(a => !['approved', 'rejected'].includes(a.status)).length}</p>
              </div>
              <AlertCircle size={24} className="text-warning" />
            </div>
          </div>
          <div className="bg-surface p-4 rounded-xl border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Today's Actions</p>
                <p className="text-2xl font-bold text-text-primary">12</p>
              </div>
              <Clock size={24} className="text-brand-primary" />
            </div>
          </div>
        </div>
        
        {/* Filters and Search */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-5 rounded-xl border border-border">
          <div className="flex items-center gap-3">
            <label className="text-text-primary font-medium text-sm">Filter:</label>
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-border rounded px-3 py-1 text-sm focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Requests</option>
              <option value="pending">Pending Review</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search by teacher or detail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 border border-border rounded px-4 py-2 focus:ring-2 focus:ring-ring text-sm"
            />
            <button 
              onClick={() => setSearchTerm('')}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-muted rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        
        {/* Approvals List */}
        <div className="bg-surface rounded-xl border border-border">
          {filteredApprovals.length === 0 ? (
            <div className="p-8 text-center">
              <EmptyState context="tickets" />
              {filter !== 'all' && (
                <button 
                  onClick={() => setFilter('all')}
                  className="mt-4 px-4 py-2 bg-brand-dark text-primary-foreground rounded-lg hover:bg-brand-dark/90 transition-colors text-sm font-medium"
                >
                  Show All Requests
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredApprovals.map((approval) => (
                <div key={approval.id} className="p-5 hover:bg-muted transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                          <Users size={18} className="text-text-secondary" />
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">{approval.teacher}</p>
                          <p className="text-text-secondary text-sm">{approval.time}</p>
                        </div>
                      </div>
                      <p className="text-text-primary">{approval.detail}</p>
                      {approval.document && (
                        <div className="mt-2 flex items-center gap-2 text-sm">
                          <FileCheck size={14} className="text-success" />
                          <span className="text-text-secondary">Document attached</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded text-[9px] font-medium",
                        approval.status === 'approved' ? "bg-brand-primary/10 text-brand-primary" :
                        approval.status === 'rejected' ? "bg-destructive/10 text-destructive" :
                        "bg-background text-text-secondary"
                      )}>
                        {approval.status === 'approved' ? 'Approved' : 
                         approval.status === 'rejected' ? 'Rejected' : 
                         'Pending'}
                      </span>
                      
                      <button 
                        onClick={() => navigate(`/approvals/inspect/${approval.id}`)}
                        className="p-1 text-text-secondary hover:text-text-primary hover:bg-muted rounded-lg transition-colors"
                        title="View Details"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  {!['approved', 'rejected'].includes(approval.status) && (
                    <div className="mt-4 flex gap-3">
                      <button 
                        onClick={() => handleResolveApproval(approval.id, 'grant', approval.teacher)}
                        className="flex-1 px-4 py-2 bg-brand-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-brand-primary/90 transition-colors flex items-center justify-center gap-2"
                      >
                        <ThumbsUp size={16} /> Approve
                      </button>
                      <button 
                        onClick={() => handleResolveApproval(approval.id, 'abort', approval.teacher)}
                        className="flex-1 px-4 py-2 bg-surface border border-border text-text-secondary rounded-lg text-sm font-medium hover:text-destructive hover:border-destructive/30 transition-colors flex items-center justify-center gap-2"
                      >
                        <ThumbsDown size={16} /> Reject
                      </button>
                    </div>
                  )}
                  
                  {/* Status Info for resolved items */}
                  {['approved', 'rejected'].includes(approval.status) && (
                    <div className="mt-3 p-3 bg-background rounded-lg text-sm">
                      <p className="font-medium text-text-primary">Resolution:</p>
                      <p className="text-text-secondary">
                        {approval.status === 'approved' 
                          ? 'Approved by admin on ' + new Date().toLocaleDateString() 
                          : 'Rejected by admin on ' + new Date().toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}