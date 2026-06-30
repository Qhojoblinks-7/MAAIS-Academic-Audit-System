import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { 
  Users, AlertCircle, Clock, TrendingUp, Check, X, 
  ThumbsUp, ThumbsDown, FileCheck, Search, 
  Calendar, Plus, Menu, ChevronRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useRole } from '../../context/RoleContext';
import { initialPendingApprovals } from './data/mockDashboard';

export function ApprovalsView() {
  const { user } = useRole();
  const navigate = useNavigate();
  
  const [approvals, setApprovals] = React.useState(initialPendingApprovals);
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
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 scrollbar-hide">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-900">Approval Queue Management</h1>
          <div className="flex items-center gap-3">
            <Link to="/admin/home" className="text-slate-500 hover:text-slate-700 transition-colors">
              <Users size={20} /> Back to Dashboard
            </Link>
            <button 
              onClick={() => navigate('/approvals/new')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
            >
              <Plus size={16} /> New Approval Request
            </button>
          </div>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Total Requests</p>
                <p className="text-2xl font-bold text-slate-900">{approvals.length}</p>
              </div>
              <Users size={24} className="text-slate-400" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Pending Review</p>
                <p className="text-2xl font-bold text-emerald-600">{approvals.filter(a => !['approved', 'rejected'].includes(a.status)).length}</p>
              </div>
              <AlertCircle size={24} className="text-amber-400" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Today's Actions</p>
                <p className="text-2xl font-bold text-slate-900">12</p>
              </div>
              <Clock size={24} className="text-blue-400" />
            </div>
          </div>
        </div>
        
        {/* Filters and Search */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/50">
          <div className="flex items-center gap-3">
            <label className="text-slate-700 font-medium text-sm">Filter:</label>
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-slate-200 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-slate-400"
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
              className="flex-1 border border-slate-200 rounded px-4 py-2 focus:ring-2 focus:ring-slate-400 text-sm"
            />
            <button 
              onClick={() => setSearchTerm('')}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        
        {/* Approvals List */}
        <div className="bg-white rounded-xl border border-slate-200/50">
          {filteredApprovals.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-500 text-lg">No approval requests found</p>
              {filter !== 'all' && (
                <button 
                  onClick={() => setFilter('all')}
                  className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
                >
                  Show All Requests
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredApprovals.map((approval) => (
                <div key={approval.id} className="p-5 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                          <Users size={18} className="text-slate-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{approval.teacher}</p>
                          <p className="text-slate-500 text-sm">{approval.time}</p>
                        </div>
                      </div>
                      <p className="text-slate-700">{approval.detail}</p>
                      {approval.document && (
                        <div className="mt-2 flex items-center gap-2 text-sm">
                          <FileCheck size={14} className="text-emerald-500" />
                          <span className="text-slate-600">Document attached</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded text-[9px] font-medium",
                        approval.status === 'approved' ? "bg-emerald-50 text-emerald-800" :
                        approval.status === 'rejected' ? "bg-rose-50 text-rose-800" :
                        "bg-slate-50 text-slate-600"
                      )}>
                        {approval.status === 'approved' ? 'Approved' : 
                         approval.status === 'rejected' ? 'Rejected' : 
                         'Pending'}
                      </span>
                      
                      <button 
                        onClick={() => navigate(`/approvals/inspect/${approval.id}`)}
                        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
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
                        className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <ThumbsUp size={16} /> Approve
                      </button>
                      <button 
                        onClick={() => handleResolveApproval(approval.id, 'abort', approval.teacher)}
                        className="flex-1 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:text-rose-600 hover:border-rose-200 transition-colors flex items-center justify-center gap-2"
                      >
                        <ThumbsDown size={16} /> Reject
                      </button>
                    </div>
                  )}
                  
                  {/* Status Info for resolved items */}
                  {['approved', 'rejected'].includes(approval.status) && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-lg text-sm">
                      <p className="font-medium text-slate-900">Resolution:</p>
                      <p className="text-slate-600">
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