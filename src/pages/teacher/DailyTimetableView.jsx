import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, MapPin, ShieldAlert, BookOpen, FilePlus, FileText, Link as LinkIcon, Calendar } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { DailyClassCard } from '../../components/shared/DailyClassCard';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export function DailyTimetableView({ timetable, selectedDay, setSelectedDay, setHoveredId, hoveredId, user, selectedEntry, setIsResourceModalOpen, newMaterial, setNewMaterial }) {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col p-8 overflow-y-auto">
      <div className="max-w-3xl mx-auto w-full">
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={cn(
                "px-6 py-3 rounded-2xl text-sm font-black transition-all whitespace-nowrap",
                selectedDay === day ? "bg-emerald-800 text-white shadow-lg" : "bg-white text-gray-500 hover:bg-gray-50"
              )}
            >
              {day}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {timetable.filter(e => e.day === selectedDay).sort((a, b) => a.startTime.localeCompare(b.startTime)).map(entry => (
            <DailyClassCard
              key={entry.id}
              entry={entry}
              user={user}
              hoveredId={hoveredId}
              setHoveredId={setHoveredId}
              selectedEntry={selectedEntry}
              setIsResourceModalOpen={setIsResourceModalOpen}
              newMaterial={newMaterial}
              setNewMaterial={setNewMaterial}
            />
          ))}
          
          {timetable.filter(e => e.day === selectedDay).length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
              <Calendar className="mx-auto text-gray-300 mb-4" size={48} />
              <h3 className="text-lg font-black text-gray-900">No Classes Scheduled</h3>
              <p className="text-sm font-bold text-gray-500">Enjoy your free period!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}