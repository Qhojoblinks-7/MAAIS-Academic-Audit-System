import React from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Users, AlertCircle, Clock, FileCheck, Check, X,
  ThumbsUp, ThumbsDown, Calendar, Plus, Menu,
  ChevronRight, ExternalLink, Copy, Trash2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useRole } from '../../context/RoleContext';
import { initialPendingApprovals } from './data/mockDashboard';

export function ApprovalInspectView() {
  const { user } = useRole();
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Find the approval by ID
  const approval = initialPendingApprovals.find(a => a.id === id);
  
  if (!approval) {
    navigate('/approvals/all');
    return null;
  }
  
  const [isEditing, setIsEditing] = React.useState(false);
  const [editDetail, setEditDetail] = React.useState(approval.detail || '');
  const [resolutionStatus, setResolutionStatus] = React.useState('');
  const [resolutionNotes, setResolutionNotes] = React.useState('');
  
  const handleResolveApproval = () => {
    // In a real app, this would be an API call
    // For now, we'll just navigate back
    navigate('/approvals/all');
  };
  
  const handleDeleteApproval = () => {
    if (window.confirm('Are you sure you want to delete this approval request?')) {
      navigate('/approvals/all');
    }
  };
  
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 scrollbar-hide">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-900">Approval Request Details</h1>
          <div className="flex items-center gap-3">
            <Link to="/approvals/all" className="text-slate-500 hover:text-slate-700 transition-colors">
              <X size={20} /> Back to Queue
            </Link>
            <button 
              onClick={handleDeleteApproval}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors text-sm font-medium"
            >
              <Trash2 size={16} /> Delete Request
            </button>
          </div>
        </div>
        
        {/* Approval Card */}
        <div className="bg-white rounded-xl border border-slate-200/50 shadow-sm">
          {/* Header Info */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Users size={24} className="text-slate-600" />
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm">Requested By</p>
                    <p className="text-2xl font-bold text-slate-900">{approval.teacher}</p>
                  </div>
                </div>
                <p className="text-slate-700">{approval.detail}</p>
              </div>
              
              <div className="text-right">
                <p className="text-slate-500 text-sm">Request Time</p>
                <p className="text-2xl font-bold text-slate-900">{approval.time}</p>
                <div className="mt-4">
                  <span className={cn(
                    "px-3 py-1 rounded text-sm font-medium",
                    "bg-slate-100 text-slate-600"
                  )}>
                    ID: {approval.id}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Resolution Section */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Resolution</h2>
            
            {/* Resolution Form (if not already resolved) */}
            {resolutionStatus === '' && (
              <div className="mb-6">
                <div className="mb-4">
                  <label className="block text-slate-700 font-medium mb-2">Resolution Status</label>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="resolution"
                        value="grant"
                        checked={resolutionStatus === 'grant'}
                        onChange={(e) => setResolutionStatus(e.target.value)}
                        className="h-4 w-4 text-slate-600"
                      />
                      <span>Grant Approval</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="resolution"
                        value="abort"
                        checked={resolutionStatus === 'abort'}
                        onChange={(e) => setResolutionStatus(e.target.value)}
                        className="h-4 w-4 text-slate-600"
                      />
                      <span>Reject Request</span>
                    </label>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-slate-700 font-medium mb-2">Resolution Notes (Optional)</label>
                  <textarea
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Provide details for your decision..."
                    className="w-full min-h-[80px] border border-slate-200 rounded px-3 py-2 focus:ring-2 focus:ring-slate-400 text-sm resize-y"
                  />
                </div>
                
                <button 
                  onClick={handleResolveApproval}
                  disabled={resolutionStatus === ''}
                  className="w-full px-4 py-3 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                >
                  {resolutionStatus === '' ? 'Submit Resolution' : 'Submitting...'}
                  {resolutionStatus !== '' && (
                    <span className="ml-2">
                      <Check size={16} className="text-green-400" />
                    </span>
                  )}
                </button>
              </div>
            )}
            
            {/* Resolution Details (if resolved) */}
            {resolutionStatus !== '' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-lg">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    resolutionStatus === 'grant' ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                  )}>
                    {resolutionStatus === 'grant' ? <Check size={18} /> : <ThumbsDown size={18} />}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      {resolutionStatus === 'grant' ? 'Approval Granted' : 'Request Rejected'}
                    </p>
                    <p className="text-slate-600 text-sm">
                      Resolved on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                
                {resolutionNotes.trim() !== '' && (
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-slate-700 font-medium mb-2">Resolution Notes:</p>
                    <p className="text-slate-600">{resolutionNotes}</p>
                  </div>
                )}
                
                <div className="flex justify-end">
                  <button 
                    onClick={() => {
                      setResolutionStatus('');
                      setResolutionNotes('');
                    }}
                    className="px-4 py-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors text-sm font-medium"
                  >
                    Edit Resolution
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Activity Log */}
          <div className="p-6 border-t border-slate-100">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Activity Log</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-4 py-3 border-b border-slate-50">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Clock size={16} className="text-slate-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-700">Request submitted by {approval.teacher}</p>
                  <p className="text-slate-500 text-sm">{approval.time}</p>
                </div>
              </div>
              
              {resolutionStatus !== '' && (
                <div className="flex items-start gap-4 py-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                      {resolutionStatus === 'grant' ? <Check size={16} className="text-emerald-600" /> : <ThumbsDown size={16} className="text-rose-600" />}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-700">
                      {resolutionStatus === 'grant' ? 'Approval granted by admin' : 'Request rejected by admin'}
                    </p>
                    <p className="text-slate-500 text-sm">
                      {new Date().toLocaleTimeString()} • {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}