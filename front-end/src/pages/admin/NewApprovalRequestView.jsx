import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  X, Plus, FileCheck, UploadCloud, AlertCircle, CheckCircle2, Loader2,
  Flag, LayoutGrid, FileText, User, ChevronDown
} from 'lucide-react';
import { useRole } from '../../context/RoleContext';

export function NewApprovalRequestView() {
  const { user } = useRole();
  const navigate = useNavigate();
  
  const [requestData, setRequestData] = React.useState({
    teacher: '',
    detail: '',
    priority: 'normal',
    category: '',
    document: null
  });
  
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState(false);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setError('');
    if (type === 'file') {
      setRequestData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setRequestData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!requestData.teacher.trim() || !requestData.detail.trim()) {
      setError('Please fill out all required fields.');
      return;
    }
    
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => navigate('/approvals/all'), 1500);
    }, 1500);
  };

  // Border & text variations based on selected priority level
  const priorityStyles = {
    low: { active: 'border-emerald-600 bg-emerald-50 text-emerald-700 ring-4 ring-emerald-100', dot: 'bg-emerald-500' },
    normal: { active: 'border-blue-600 bg-blue-50 text-blue-700 ring-4 ring-blue-100', dot: 'bg-blue-500' },
    high: { active: 'border-amber-600 bg-amber-50 text-amber-700 ring-4 ring-amber-100', dot: 'bg-amber-500' },
    urgent: { active: 'border-rose-600 bg-rose-50 text-rose-700 ring-4 ring-rose-100', dot: 'bg-rose-500' }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        
        {/* Page Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center">
          <div>
            <h1 className="mt-1 text-3xl font-black text-slate-900 tracking-tight">Create New Request</h1>
          </div>
          <Link 
            to="/approvals/all" 
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95"
          >
            <X size={16} /> Close Form
          </Link>
        </div>

        {/* Dynamic Alerts */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 shadow-sm">
            <AlertCircle size={18} className="shrink-0 text-rose-600" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 shadow-sm">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
            <span className="font-semibold">Request successfully queued! Redirecting...</span>
          </div>
        )}
        
        {/* Main Content Layout Grid */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Main Content Body */}
          <div className="space-y-6 lg:col-span-2">
            
            {/* Input Wrapper Group */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <h2 className="mb-6 text-sm font-bold uppercase tracking-wider text-slate-400">Primary Information</h2>
              
              {/* Teacher Field */}
              <div className="space-y-2 mb-6">
                <label className="block text-sm font-bold text-slate-800">Requesting Teacher <span className="text-rose-500">*</span></label>
                <div className="relative rounded-xl shadow-sm focus-within:ring-4 focus-within:ring-indigo-100 transition-all">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <User size={18} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="teacher"
                    value={requestData.teacher}
                    onChange={handleChange}
                    placeholder="Enter full name (e.g., Professor Miller)"
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>
              
              {/* Details Text Area */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-800">Justification & Details <span className="text-rose-500">*</span></label>
                <div className="relative rounded-xl shadow-sm focus-within:ring-4 focus-within:ring-indigo-100 transition-all">
                  <div className="pointer-events-none absolute top-3.5 left-0 flex items-center pl-4">
                    <FileText size={18} className="text-slate-400" />
                  </div>
                  <textarea
                    name="detail"
                    value={requestData.detail}
                    onChange={handleChange}
                    placeholder="Provide a highly explicit detail log or reasoning for this override request..."
                    className="block w-full min-h-[220px] rounded-xl border border-slate-200 bg-slate-50/50 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all resize-y"
                    required
                  />
                </div>
              </div>

            </div>
          </div>
          
          {/* Sidebar Properties Panel */}
          <div className="space-y-6">
            
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-100 space-y-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Metadata & Workflow</h2>
              
              {/* Dropdown Category Input */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-800">Workflow Category</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <LayoutGrid size={18} className="text-slate-400" />
                  </div>
                  <select
                    name="category"
                    value={requestData.category}
                    onChange={handleChange}
                    className="block w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 py-3.5 pl-11 pr-10 text-sm font-semibold text-slate-700 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="">Unassigned</option>
                    <option value="grade_change">Grade Change Override</option>
                    <option value="enrollment">Special Enrollment Waiver</option>
                    <option value="curriculum">Curriculum Alteration</option>
                    <option value="resource_allocation">Resource Allocation</option>
                    <option value="policy_exception">Policy Exception Request</option>
                    <option value="other">Other System Action</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>

              {/* Priority Custom Cards (No standard radio dots!) */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-800">System Priority Level</label>
                <div className="flex flex-col gap-2">
                  {['low', 'normal', 'high', 'urgent'].map((lvl) => {
                    const isSelected = requestData.priority === lvl;
                    return (
                      <label 
                        key={lvl}
                        className={`
                          relative flex items-center justify-between rounded-xl border p-3.5 cursor-pointer transition-all select-none
                          ${isSelected 
                            ? priorityStyles[lvl].active 
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50/80 hover:border-slate-300'}
                        `}
                      >
                        <input
                          type="radio"
                          name="priority"
                          value={lvl}
                          checked={isSelected}
                          onChange={handleChange}
                          className="sr-only" 
                        />
                        <div className="flex items-center gap-3">
                          <span className={`h-2.5 w-2.5 rounded-full ${isSelected ? priorityStyles[lvl].dot : 'bg-slate-300'}`} />
                          <span className="text-sm font-bold capitalize">{lvl}</span>
                        </div>
                        {isSelected && <span className="text-xs font-extrabold uppercase tracking-wide opacity-80">Selected</span>}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Dropzone File Input Block */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-800">Supporting Attachments</label>
                
                {!requestData.document ? (
                  <label className="group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-5 text-center cursor-pointer transition-all hover:bg-slate-50 hover:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100">
                    <UploadCloud size={28} className="text-slate-400 group-hover:text-indigo-500 group-hover:scale-110 transition-all mb-2" />
                    <span className="text-xs font-bold text-slate-700">Upload Validation PDF</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Drag-and-drop or click to browse</span>
                    <input
                      type="file"
                      name="document"
                      onChange={handleChange}
                      className="sr-only"
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/40 p-3 text-xs text-emerald-900 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileCheck size={16} className="text-emerald-600 shrink-0" />
                      <span className="truncate font-bold">{requestData.document.name}</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setRequestData(p => ({ ...p, document: null }))}
                      className="text-xs font-black text-rose-600 hover:text-rose-800"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Action Submit Control Button */}
            <button 
              type="submit"
              disabled={isSubmitting || success}
              className="w-full relative flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-4 text-sm font-bold text-white shadow-md transition-all hover:bg-slate-900 active:scale-[0.98] disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Processing Pipeline...</span>
                </>
              ) : (
                <>
                  <Plus size={16} strokeWidth={3} />
                  <span>Dispatch Request</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}