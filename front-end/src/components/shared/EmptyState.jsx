import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import { 
  Inbox, Compass, ArrowRight, HelpCircle, Users, UserCheck, Bell, 
  ClipboardList, Award, CheckCircle, MessageSquare, FolderOpen 
} from 'lucide-react';

const CONTEXT_CONFIG = {
  students: {
    title: 'No Students Found',
    description: 'No student records match your current search criteria. Try adjusting your filters or add a new student.',
    icon: Users,
  },
  teachers: {
    title: 'No Teachers Found',
    description: 'No staff records match your search. Teachers must be assigned to a department before appearing here.',
    icon: UserCheck,
  },
  parents: {
    title: 'No Parents Found',
    description: 'No parent accounts found. Parents are created when linked to student records.',
    icon: Users,
  },
  notifications: {
    title: 'No Notifications',
    description: 'You are up to date. No new notifications at this time.',
    icon: Bell,
  },
  grades: {
    title: 'No Grades Entered',
    description: 'No assessment records found for this class. Start by entering marks in the grading sheet.',
    icon: ClipboardList,
  },
  results: {
    title: 'No Results Available',
    description: 'No academic results have been published for this term yet.',
    icon: Award,
  },
  tickets: {
    title: 'No Support Tickets',
    description: 'No open or closed tickets found. All issues have been resolved.',
    icon: CheckCircle,
  },
  comments: {
    title: 'No Comments',
    description: 'No feedback or comments have been recorded for this entry.',
    icon: MessageSquare,
  },
  departments: {
    title: 'No Departments',
    description: 'No academic departments have been configured yet.',
    icon: FolderOpen,
  },
};

export function EmptyState({
  context,
  title,
  description,
  icon: IconComponent,
  actionLabel = "",
  onAction = null,
  variant = "default",
  illustration = null
}) {
  const resolvedIcon = context && CONTEXT_CONFIG[context]
    ? CONTEXT_CONFIG[context].icon
    : IconComponent || Inbox;
  const resolvedTitle = context && CONTEXT_CONFIG[context]
    ? CONTEXT_CONFIG[context].title
    : title || "No Records Registered";
  const resolvedDescription = context && CONTEXT_CONFIG[context]
    ? CONTEXT_CONFIG[context].description
    : description || "The database returned no matching records for your query.";

  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  if (variant === "compact") {
    return (
      <div id="empty_compact_container" className="p-5 bg-slate-50 border border-dashed border-slate-200 rounded-2xl flex items-center justify-between text-left gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white border border-slate-150 rounded-xl text-slate-400 shrink-0">
            <resolvedIcon size={16} />
          </div>
          <div>
            <h4 className="text-[11px] font-black text-slate-950 uppercase tracking-widest">{resolvedTitle}</h4>
            <p className="text-[10px] font-medium text-slate-450 mt-0.5">{resolvedDescription}</p>
          </div>
        </div>
        {actionLabel && onAction && (
          <button
            id="empty_compact_action_btn"
            onClick={onAction}
            className="px-4.5 py-2.5 bg-slate-900 hover:bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all outline-none border-none cursor-pointer shrink-0"
          >
            {actionLabel}
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      id={`empty_${variant}_container`}
      className={cn(
        "flex flex-col items-center justify-center text-center p-8",
        variant === "fullscreen" && "min-h-screen bg-[#F8FAFC]",
        variant === "card" && "bg-white border border-slate-200/80 rounded-[2.5rem] shadow-sm py-16 px-8",
        variant === "default" && "w-full py-20"
      )}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full flex flex-col items-center space-y-6"
      >
        {illustration ? (
          <div className="mb-2 shrink-0">{illustration}</div>
        ) : (
          <div className="relative flex justify-center" id="empty_badge_wrapper">
            <div className="absolute inset-0 bg-slate-100 rounded-[2rem] blur-xl opacity-50" />

            <div className="w-20 h-20 bg-slate-50 border border-slate-200 text-slate-400 rounded-[2rem] flex items-center justify-center relative z-10 shadow-sm">
              <resolvedIcon size={32} />
            </div>

            <span className="absolute -bottom-2 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-500 rounded-lg text-[8px] font-black uppercase tracking-widest z-20">
              VACANT
            </span>
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.15em] italic font-display leading-none">
            {resolvedTitle}
          </h3>
          <p className="text-xs font-semibold text-slate-450 leading-relaxed max-w-sm mx-auto">
            {resolvedDescription}
          </p>
        </div>

        {actionLabel && onAction && (
          <motion.button
            id="empty_action_button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAction}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 hover:bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/15 transition-all outline-none border-none cursor-pointer mt-2"
          >
            <span>{actionLabel}</span>
            <ArrowRight size={14} className="text-teal-400" />
          </motion.button>
        )}

        <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider pt-2">
          <HelpCircle size={12} />
          <span>Need help? Contact system administration desk</span>
        </div>

      </motion.div>
    </div>
  );
}

export default EmptyState;
