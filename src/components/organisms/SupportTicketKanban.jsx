import React, { useState, useMemo } from 'react';
import { motion, Reorder } from 'framer-motion';
import { MessageSquare, Send, AlertTriangle, Clock, CheckCircle2, AlertCircle, Minus, RefreshCw, Plus, ChevronRight, Flag, Archive as ArchiveIcon, ArrowLeftRight, Pause } from 'lucide-react';
import { cn } from '../../lib/utils';
import { AlertSeverityChip, ActionButtonGroup, LoadingSpinner } from '../molecules';
import { useHOD } from '../../context/HODContext';

const TICKET_COLUMNS = [
  { id: 'OPEN', label: 'Open', color: 'rose', icon: AlertCircle },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'amber', icon: Clock },
  { id: 'PENDING', label: 'Pending', color: 'blue', icon: Pause },
  { id: 'RESOLVED', label: 'Resolved', color: 'emerald', icon: CheckCircle2 },
];

const PRIORITY_ALERT = { HIGH: 'rose', MEDIUM: 'amber', LOW: 'blue' };

function KanbanCard({ ticket, actions }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      className="bg-white rounded-xl border border-gray-200 p-3 cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <AlertSeverityChip severity={ticket.priority || ticket.severity || 'MEDIUM'} />
        {ticket.updatedAt && (
          <span className="text-[9px] text-gray-400">
            {new Date(ticket.updatedAt).toLocaleDateString()}
          </span>
        )}
      </div>
      <h4 className="text-xs font-semibold text-gray-900 mb-1">{ticket.subject || 'Untitled'}</h4>
      {ticket.description && (
        <p className="text-[10px] text-gray-500 mb-2 line-clamp-2">
          {ticket.description}
        </p>
      )}
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-gray-400">
          #{ticket.id?.slice(-6) || '—'}
        </span>
        {actions && (
          <ActionButtonGroup actions={actions.filter(a => a.variant !== 'secondary')} />
        )}
      </div>
    </motion.div>
  );
}

function ColumnHead({ column, count }) {
  const colorClasses = {
    rose: 'bg-rose-100 text-rose-700',
    amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-blue-100 text-blue-700',
    emerald: 'bg-emerald-100 text-emerald-700',
  };

  return (
    <div className="flex items-center gap-2 mb-3">
      <span className={cn('w-6 h-6 rounded-lg flex items-center justify-center', colorClasses[column.color] || colorClasses.blue)}>
        {React.createElement(column.icon, { size: 12 })}
      </span>
      <span className="text-xs font-bold text-gray-800">{column.label}</span>
      <span className="ml-auto px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-full">
        {count}
      </span>
    </div>
  );
}

export function SupportTicketKanban({
  tickets: controlledTickets,
  onUpdateStatus,
  onEscalate,
  onCreate,
  columns = TICKET_COLUMNS,
  className,
}) {
  const { supportTickets, getFilteredTickets, ticketTabs, setTicketTabs, updateTicketAction, escalateTicketAction, createTicket, isLoading } = useHOD();
  const tickets = controlledTickets ?? supportTickets;
  const filtered = getFilteredTickets(tickets);

  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketDesc, setNewTicketDesc] = useState('');

  // Group tickets by status
  const columnsData = useMemo(() => {
    return columns.map((col) => ({
      ...col,
      tickets: filtered.filter((t) => (t.status || '').toUpperCase() === col.id),
    }));
  }, [filtered, columns]);

  const handleDragEnd = async (event, column, fromIndex, toIndex) => {
    const ticket = columnsData.find((c) => c.id === column.id)?.tickets?.[fromIndex];
    if (!ticket || !onUpdateStatus) return;

    const newStatus = columns[Math.min(toIndex, columns.length - 1)]?.id;
    if (newStatus && newStatus !== ticket.status) {
      await onUpdateStatus(ticket.id, { status: newStatus });
    }
  };

  const handleCreate = async () => {
    if (!newTicketSubject.trim()) return;
    await onCreate?.({ subject: newTicketSubject, description: newTicketDesc, priority: 'MEDIUM' });
    setNewTicketSubject('');
    setNewTicketDesc('');
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Quick create */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Plus size={14} className="text-emerald-600" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
            New Ticket
          </span>
        </div>
        <input
          type="text"
          value={newTicketSubject}
          onChange={(e) => setNewTicketSubject(e.target.value)}
          placeholder="Subject"
          className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500/30 focus:border-emerald-500"
        />
        <textarea
          value={newTicketDesc}
          onChange={(e) => setNewTicketDesc(e.target.value)}
          placeholder="Description (optional)"
          rows={1}
          className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500/30 focus:border-emerald-500"
        />
        <button
          onClick={handleCreate}
          disabled={!newTicketSubject.trim()}
          className="ml-auto px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-40 flex items-center gap-1"
        >
          <Plus size={11} /> Create Ticket
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 flex-wrap">
        {[
          { id: 'all', label: 'All' },
          { id: 'OPEN', label: 'Open' },
          { id: 'IN_PROGRESS', label: 'In Progress' },
          ...(isLoading ? [{ id: 'PENDING', label: 'Pending' }] : []),
          { id: 'RESOLVED', label: 'Resolved' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTicketTabs(t.id)}
            className={cn(
              'px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all uppercase tracking-wider',
              ticketTabs === t.id
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Kanban columns */}
      {columnsData.map((col) => (
        <div key={col.id} className="space-y-2">
          <ColumnHead column={col} count={col.tickets.length} />
          {col.tickets.length === 0 ? (
            <div className="border border-dashed border-gray-200 rounded-xl p-4 text-center">
              <p className="text-[10px] text-gray-400">No {col.label.toLowerCase()} tickets</p>
            </div>
          ) : (
            <div className="space-y-2">
              {col.tickets.map((ticket, i) => (
                <KanbanCard
                  key={ticket.id || i}
                  ticket={ticket}
                  actions={
                    ticket.status !== 'RESOLVED'
                      ? [
                          {
                            label: ticket.status === 'OPEN' ? 'Start' : 'Advance',
                            variant: 'secondary',
                            onClick: async () => {
                              const nextIdx = columns.findIndex((c) => c.id === ticket.status) + 1;
                              const nextCol = columns[Math.min(nextIdx, columns.length - 1)];
                              await onUpdateStatus?.(ticket.id, { status: nextCol.id });
                            },
                          },
                          {
                            label: 'Escalate',
                            variant: 'danger',
                            icon: Flag,
                            onClick: () => onEscalate?.(ticket),
                          },
                        ]
                      : undefined
                  }
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
