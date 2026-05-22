import React from 'react';
import { cn } from '../../lib/utils';
import { WeeklyClassCard } from '../../components/shared/WeeklyClassCard';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const HOURS = Array.from({ length: 10 }, (_, i) => i + 8);

export function WeeklyTimetableView({ 
  timetable, 
  currentTime, 
  getTimePosition, 
  formatTime, 
  setHoveredId, 
  hoveredId 
}) {
  return (
    <div className="h-full flex flex-col p-6 overflow-auto">
      <div className="min-w-[1000px] flex-1 flex flex-col">
        
        {/* 1. DAYS HEADER */}
        <div className="flex border-b border-gray-200 pb-4">
          <div className="w-20" />
          {DAYS.map(day => (
            <div key={day} className="flex-1 text-center">
              <span className="text-sm font-black text-gray-900 uppercase tracking-widest">
                {day}
              </span>
            </div>
          ))}
        </div>

        {/* 2. TIMETABLE GRID RELATIVE CONTAINER */}
        <div className="flex-1 relative mt-4">
          
          {/* Time indicator grid lines */}
          <div className="absolute inset-0 flex flex-col pointer-events-none">
            {HOURS.map(hour => (
              <div key={hour} className="flex-1 border-t border-gray-100 relative">
                <span className="absolute -left-16 -top-2.5 text-[10px] font-black text-gray-400">
                  {hour.toString().padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* Current Time Line Indicator */}
          {currentTime.getDay() >= 1 && currentTime.getDay() <= 5 && (
            <div 
              className="absolute left-0 right-0 border-t-2 border-red-500 z-20 pointer-events-none flex items-center"
              style={{ top: `${getTimePosition(formatTime(currentTime))}%` }}
            >
              <div className="w-2 h-2 bg-red-500 rounded-full -ml-1" />
              <div className="px-2 py-0.5 bg-red-500 text-white text-[8px] font-black rounded-full ml-2">
                {formatTime(currentTime)}
              </div>
            </div>
          )}

          {/* 3. COLUMNS LAYER */}
          <div className="absolute inset-0 flex">
            <div className="w-20" /> {/* Time column spacing buffer */}
            
            {DAYS.map(day => (
              <div key={day} className="flex-1 border-r border-gray-100 relative last:border-r-0">
                
                {timetable.filter(e => e.day === day).map(entry => {
                  const topPosition = getTimePosition(entry.startTime);
                  const cardHeight = getTimePosition(entry.endTime) - topPosition;
                  const isCurrentlyHovered = hoveredId === entry.id;

                  return (
                    <div
                      key={entry.id}
                      /* 
                        FIXED: This wrapper container lifts the active entry card 
                        above the calendar grid stacking flow on hover 
                      */
                      className={cn(
                        "absolute left-1 right-1 transition-all", 
                        isCurrentlyHovered ? "z-50" : "z-10"
                      )}
                      style={{
                        top: `${topPosition ?? 0}%`,
                        height: `${cardHeight ?? 1}%`
                      }}
                    >
                      <WeeklyClassCard
                        entry={{
                          ...entry,
                          _top: topPosition,
                          _height: cardHeight, 
                        }}
                        hoveredId={hoveredId}
                        setHoveredId={setHoveredId}
                      />
                    </div>
                  );
                })}

              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}