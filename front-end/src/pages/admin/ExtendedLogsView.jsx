import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  Search, 
  Filter, 
  Download, 
  Clock, 
  Shield, 
  AlertTriangle, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Calendar,
  User,
  Terminal,
  Cpu,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';

const MOCK_SYSTEM_LOGS = [
  {
    id: 'L-001',
    timestamp: new Date().toISOString(),
    severity: 'INFO',
    category: 'AUTH',
    event: 'Successful Admin Login via MFA',
    user: 'immanuel.eshun@school.edu',
    ipAddress: '192.168.1.45',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    metadata: { method: 'Google OAuth', location: 'Accra, GH' }
  },
  {
    id: 'L-002',
    timestamp: new Date(Date.now() - 500000).toISOString(),
    severity: 'WARNING',
    category: 'SECURITY',
    event: 'Multiple Failed Login Attempts Detected',
    user: 'unknown.user@external.com',
    ipAddress: '45.12.33.109',
    userAgent: 'Python-requests/2.25.1', 
    metadata: { count: 15, target: 'admin_portal' }
  },
  {
    id: 'L-003',
    timestamp: new Date(Date.now() - 1200000).toISOString(),
    severity: 'ERROR',
    category: 'SYSTEM',
    event: 'Database Sync Failure: Node #14',
    user: 'System Process',
    ipAddress: '127.0.0.1',
    userAgent: 'Internal Node Poller v2.0',
    metadata: { error: 'Connection Timeout', retry_count: 3 }
  },
  {
    id: 'L-004',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    severity: 'CRITICAL',
    category: 'SECURITY',
    event: 'Unauthorised API Access Attempt in Vault',
    user: 'guest_user_99',
    ipAddress: '103.44.1.22',
    userAgent: 'CURL/7.64.1',
    metadata: { endpoint: '/api/v1/vault/keys', payload_size: '1.2MB' }
  },
  {
    id: 'L-005',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    severity: 'INFO',
    category: 'ACADEMIC',
    event: 'Bulk Grade Export - SHS 3 Science',
    user: 'Mr. Hackman',
    ipAddress: '192.168.1.12',
    userAgent: 'Chrome 120.0.0.0',
    metadata: { file_name: 'results_shs3_sci.csv', records: 450 }
  }
];

export const ExtendedLogsView = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [expandedLogId, setExpandedLogId] = useState(null);

  const filteredLogs = useMemo(() => {
    return MOCK_SYSTEM_LOGS.filter(log => {
      const matchesSearch = log.event.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            log.user.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSeverity = selectedSeverity === 'ALL' || log.severity === selectedSeverity;
      const matchesCategory = selectedCategory === 'ALL' || log.category === selectedCategory;
      return matchesSearch && matchesSeverity && matchesCategory;
    });
  }, [searchQuery, selectedSeverity, selectedCategory]);

  const toggleExpand = (id) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'ERROR': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'WARNING': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'INFO': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'AUTH': return <Shield size={14} />;
      case 'SECURITY': return <AlertTriangle size={14} />;
      case 'ACADEMIC': return <Activity size={14} />;
      case 'SYSTEM': return <Cpu size={14} />;
      case 'SUPPORT': return <Terminal size={14} />;
      default: return <Terminal size={14} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden h-screen">
      {/* Header */}
      <header className="px-4 sm:px-8 py-6 sm:py-10 bg-white border-b border-slate-200/60 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-900 rounded-[1.25rem] sm:rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-slate-900/20 shrink-0">
              <Activity className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-black italic font-display text-slate-900 tracking-tight">
                Extended System Logs
              </h1>
              <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] sm:tracking-[0.3em] mt-1 sm:mt-2">
                Institutional Operational Intelligence & Forensics
              </p>
            </div>
          </div>

          <div className="flex gap-2 sm:gap-3 w-full lg:w-auto">
            <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-slate-100 text-slate-900 border border-slate-200 rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
              <Download size={14} />
              <span className="hidden sm:inline">Export Archive</span>
              <span className="sm:hidden">Export</span>
            </button>
            <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-slate-900 text-white rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-black transition-all">
              <Calendar size={14} />
              <span>Temporal Shift</span>
            </button>
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="px-4 sm:px-8 py-4 sm:py-6 bg-slate-50/50 backdrop-blur-md border-b border-slate-200/40 sticky top-0 z-10 shrink-0">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="sm:col-span-2 relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search Events, Users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-3.5 bg-white border border-slate-200 rounded-[2rem] text-[13px] font-bold text-slate-600 outline-none focus:ring-4 focus:ring-slate-900/5 transition-all shadow-sm"
            />
          </div>

          <div className="relative group">
            <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select 
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full pl-12 pr-10 py-3.5 bg-white border border-slate-200 rounded-[2rem] text-[11px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer shadow-sm"
            >
              <option value="ALL">All Severities</option>
              <option value="INFO">Information</option>
              <option value="WARNING">Warning</option>
              <option value="ERROR">Error</option>
              <option value="CRITICAL">Critical</option>
            </select>
            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
          </div>

          <div className="relative group">
            <Terminal className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-12 pr-10 py-3.5 bg-white border border-slate-200 rounded-[2rem] text-[11px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer shadow-sm"
            >
              <option value="ALL">All Categories</option>
              <option value="AUTH">Authentication</option>
              <option value="SECURITY">Security Ops</option>
              <option value="ACADEMIC">Academic Logic</option>
              <option value="SYSTEM">System Process</option>
              <option value="SUPPORT">ICT Support</option>
            </select>
            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
          </div>
        </div>
      </div>

      {/* Logs Content Container */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
        <div className="max-w-7xl mx-auto pb-24">
          {filteredLogs.length > 0 ? (
            <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
              
              {/* Responsive Table Grid Header - Hidden on Mobile */}
              <div className="hidden lg:grid grid-cols-12 bg-slate-50 border-b border-slate-100 uppercase px-8 py-5">
                <div className="col-span-2 text-[10px] font-black text-slate-400 tracking-widest">Timestamp</div>
                <div className="col-span-2 text-[10px] font-black text-slate-400 tracking-widest">Severity</div>
                <div className="col-span-2 text-[10px] font-black text-slate-400 tracking-widest">Category</div>
                <div className="col-span-4 text-[10px] font-black text-slate-400 tracking-widest">Event Narrative</div>
                <div className="col-span-2 text-[10px] font-black text-slate-400 tracking-widest">Actor</div>
              </div>

              {/* Data Log Rows */}
              <div className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="w-full">
                    
                    {/* Row Trigger Block */}
                    <div 
                      onClick={() => toggleExpand(log.id)}
                      className={cn(
                        "p-5 sm:p-6 lg:px-8 lg:py-5 transition-all cursor-pointer group flex flex-col lg:grid lg:grid-cols-12 lg:items-center gap-4 lg:gap-0",
                        expandedLogId === log.id ? "bg-slate-50/70" : "hover:bg-slate-50/40"
                      )}
                    >
                      {/* 1. Timestamp */}
                      <div className="col-span-2 flex items-center lg:items-start justify-between lg:flex-col lg:justify-center">
                        <span className="text-[12px] font-black text-slate-900 tracking-tighter">
                          {format(new Date(log.timestamp), 'HH:mm:ss.SSS')}
                        </span>
                        <span className="text-[10px] lg:text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                          {format(new Date(log.timestamp), 'MMM d, yyyy')}
                        </span>
                      </div>

                      {/* 2. Severity & Category wrapper for tight dynamic spacing on mobile layouts */}
                      <div className="col-span-4 lg:col-span-4 flex items-center gap-3 lg:contents">
                        {/* Severity Wrapper */}
                        <div className="col-span-2 shrink-0">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border block text-center w-max",
                            getSeverityStyle(log.severity)
                          )}>
                            {log.severity}
                          </span>
                        </div>

                        {/* Category Wrapper */}
                        <div className="col-span-2 text-slate-500 flex items-center gap-2">
                          {getCategoryIcon(log.category)}
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            {log.category}
                          </span>
                        </div>
                      </div>

                      {/* 3. Event Narrative */}
                      <div className="col-span-4 pr-2">
                        <p className="text-[13px] font-bold text-slate-800 tracking-tight leading-snug lg:leading-none">
                          {log.event}
                        </p>
                      </div>

                      {/* 4. Actor & Expand Arrow Container */}
                      <div className="col-span-2 flex items-center justify-between mt-1 lg:mt-0 pt-3 lg:pt-0 border-t border-slate-100 lg:border-none">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                            <User size={12} className="text-slate-400" />
                          </div>
                          <span className="text-[11px] font-black text-slate-600 truncate max-w-[180px] lg:max-w-[120px]">
                            {log.user}
                          </span>
                        </div>
                        
                        <div className="pl-2">
                          {expandedLogId === log.id ? (
                            <ChevronUp className="text-slate-400 shrink-0" size={16} />
                          ) : (
                            <ChevronDown className="text-slate-400 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity shrink-0" size={16} />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Expandable Meta Panel Drawer */}
                    <AnimatePresence initial={false}>
                      {expandedLogId === log.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden bg-slate-50/30"
                        >
                          <div className="p-6 lg:p-8 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                            
                            {/* Column 1: Source Identification */}
                            <div className="space-y-3">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Source Identification</h4>
                              <div className="space-y-2 bg-white p-4 rounded-2xl border border-slate-100 shadow-2xl shadow-slate-100/40">
                                <div className="flex items-center justify-between text-[11px] border-b border-dashed border-slate-100 pb-2">
                                  <span className="font-bold text-slate-400">IP Address</span>
                                  <span className="font-black text-slate-900 font-mono">{log.ipAddress}</span>
                                </div>
                                <div className="flex items-center justify-between text-[11px] border-b border-dashed border-slate-100 pb-2">
                                  <span className="font-bold text-slate-400">Identity ID</span>
                                  <span className="font-black text-slate-900 font-mono">{log.id}</span>
                                </div>
                                <div className="flex items-center justify-between text-[11px] pt-1">
                                  <span className="font-bold text-slate-400">Authentication</span>
                                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[9px] font-black tracking-widest border border-emerald-100">VERIFIED</span>
                                </div>
                              </div>
                            </div>

                            {/* Column 2: Proxy Context */}
                            <div className="space-y-3">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hardware/Software Context</h4>
                              <div className="p-4 bg-white border border-slate-100 rounded-2xl h-[94px] flex items-start gap-3 shadow-2xl shadow-slate-100/40">
                                <Globe size={16} className="text-slate-400 mt-0.5 shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-[11px] font-black text-slate-900 leading-tight">User Agent Proxy</p>
                                  <p className="text-[10px] font-bold text-slate-400 mt-1.5 leading-relaxed break-all font-mono line-clamp-2">{log.userAgent}</p>
                                </div>
                              </div>
                            </div>

                            {/* Column 3: Code Payload Payload */}
                            <div className="space-y-3 md:col-span-2 lg:col-span-1">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Event Meta-Payload</h4>
                              <div className="bg-slate-900 text-emerald-400 p-4 rounded-[1.25rem] font-mono text-[10px] overflow-x-auto shadow-xl max-h-[94px]">
                                <pre className="whitespace-pre-wrap">{JSON.stringify(log.metadata, null, 2)}</pre>
                              </div>
                            </div>

                            {/* Action Row */}
                            <div className="md:col-span-2 lg:col-span-3 flex flex-col sm:flex-row justify-end gap-2.5 pt-2 border-t border-slate-100/70">
                              <button className="w-full sm:w-auto px-5 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all text-center">
                                Copy Evidence URI
                              </button>
                              <button className="w-full sm:w-auto px-5 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/10 hover:bg-black transition-all flex items-center justify-center gap-2">
                                <span>Audit Dossier</span>
                                <ExternalLink size={12} />
                              </button>
                            </div>

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-24 sm:py-40 text-center px-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-100 rounded-[2rem] sm:rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 sm:mb-8">
                <Info size={36} className="text-slate-300" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 italic font-display">No logs found in the selected range</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 max-w-md mx-auto leading-relaxed">
                Adjust your search parameters or temporal filters to view system activity
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};