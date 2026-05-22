import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LifeBuoy, Clock, AlertCircle, CheckCircle, X, Send, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useHOD } from '../../context/HODContext';
import { LoadingSpinner, EmptyState } from '../../components/molecules';

const TicketStatusTabs = ({ activeTab, onChange }) => {
  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'OPEN', label: 'Open' },
    { id: 'IN_PROGRESS', label: 'In Progress' },
    { id: 'RESOLVED', label: 'Resolved' },
  ];

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "px-3 py-1 text-xs font-medium rounded-md transition-all",
            activeTab === tab.id
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

const TicketItem = ({ ticket, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [reply, setReply] = useState('');

  const getSLAStatus = () => {
    if (!ticket.createdAt) return 'unknown';
    const age = Math.floor((Date.now() - new Date(ticket.createdAt).getTime()) / 60000);
    return age > 30 ? 'breach' : 'ok';
  };

  const slaStatus = getSLAStatus();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden"
    >
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900">{ticket.subject}</h3>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ticket.description}</p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            {slaStatus === 'breach' && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-50 text-rose-700 rounded-full">
                SLA Breach
              </span>
            )}
            <span className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full",
              ticket.priority === 'HIGH' ? "bg-rose-50 text-rose-700" :
              ticket.priority === 'MEDIUM' ? "bg-amber-50 text-amber-700" :
              "bg-blue-50 text-blue-700"
            )}>
              {ticket.priority}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 text-[11px] text-gray-400">
          <span>{ticket.createdAt?.split('T')[0] || 'Today'}</span>
          <span>#{ticket.id?.slice(-6) || '000000'}</span>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 pt-0 border-t border-gray-100">
          <div className="space-y-3">
            {ticket.comments?.map((comment, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold">{comment.author?.[0] || '?'}</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-900">{comment.text}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{comment.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Add a reply..."
              className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <button
              onClick={() => {
                if (reply.trim() && onUpdate) {
                  onUpdate(ticket.id, { status: 'IN_PROGRESS' });
                  setReply('');
                }
              }}
              disabled={!reply.trim()}
              className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              <Send size={12} />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export function HODSupport() {
  const { 
    supportTickets, 
    ticketFilter, 
    setTicketFilter,
    systemHealth,
    createTicket,
    updateTicketAction,
    refreshSupportTickets 
  } = useHOD();

  const [activeTab, setActiveTab] = useState('all');
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', description: '', priority: 'MEDIUM' });
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshSupportTickets();
    setRefreshing(false);
  };

  const handleCreateTicket = async () => {
    if (newTicket.subject && newTicket.description) {
      await createTicket(newTicket);
      setNewTicket({ subject: '', description: '', priority: 'MEDIUM' });
      setShowNewTicket(false);
    }
  };

  const filteredTickets = supportTickets.filter(ticket => {
    if (activeTab !== 'all' && (ticket.status || 'OPEN') !== activeTab) return false;
    if (ticketFilter !== 'all' && 
        (ticket.priority || '').toUpperCase() !== ticketFilter.toUpperCase()) return false;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50/30">
      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">HOD Support Center</h1>
              <p className="text-sm text-gray-500 mt-1">Ticket tracking & system health</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button
                onClick={() => setShowNewTicket(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700"
              >
                New Ticket
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
                <div className="flex items-center justify-between">
                  <TicketStatusTabs activeTab={activeTab} onChange={setActiveTab} />
                  <select
                    value={ticketFilter}
                    onChange={(e) => setTicketFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg"
                  >
                    <option value="all">All Priorities</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {filteredTickets.length > 0 ? (
                  filteredTickets.map(ticket => (
                    <TicketItem 
                      key={ticket.id} 
                      ticket={ticket} 
                      onUpdate={updateTicketAction}
                    />
                  ))
                ) : (
                  <EmptyState
                    icon={LifeBuoy}
                    title="No support tickets"
                    description="All tickets have been resolved. Create a new ticket if you need assistance."
                  />
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <h3 className="text-xs font-semibold text-gray-900 mb-3 uppercase tracking-wider">
                  System Health
                </h3>
                {systemHealth ? (
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-gray-500">CPU Usage</span>
                        <span className="text-xs font-medium">{systemHealth.cpu || 0}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${systemHealth.cpu || 0}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-gray-500">Memory</span>
                        <span className="text-xs font-medium">{systemHealth.memory || 0}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${systemHealth.memory || 0}%` }}
                        />
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-emerald-600">
                        <CheckCircle size={14} />
                        <span className="text-xs font-medium">All systems operational</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <LoadingSpinner size="sm" className="mx-auto mb-2" />
                    <p className="text-[11px] text-gray-500">Loading system status...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {showNewTicket && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-gray-900/60" onClick={() => setShowNewTicket(false)} />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">Create Support Ticket</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Subject"
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <textarea
                    placeholder="Description"
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                  />
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                  >
                    <option value="LOW">Low Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="HIGH">High Priority</option>
                  </select>
                </div>
                <div className="flex gap-2 mt-6">
                  <button
                    onClick={() => setShowNewTicket(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateTicket}
                    disabled={!newTicket.subject || !newTicket.description}
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Create
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}