import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Users, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export function ClassCard({ subject, className, status, progress, studentCount, color = "hsl(162 78% 41%)" }) {
  const data = [
    { value: progress },
    { value: Math.max(0, 100 - progress) },
  ];

  const isComplete = progress === 100;

  return (
    <div className={cn(
      "p-6 rounded-2xl border transition-all duration-300 group select-none text-left flex flex-col justify-between h-full min-h-[220px]",
      isComplete 
        ? "bg-success border-success text-background shadow-md shadow-success/10 hover:shadow-xl hover:shadow-success/20" 
        : "bg-card border-border text-foreground shadow-sm hover:shadow-xl hover:border-border/50"
    )}>
      
      {/* 1. Header Information Area */}
      <div className="w-full mb-4 min-w-0">
        <h3 className="font-black text-lg leading-snug tracking-tight text-left truncate group-hover:text-clip group-hover:whitespace-normal">
          {subject}
        </h3>
        <p className={cn(
          "text-[10px] font-black mt-1 uppercase tracking-widest text-left truncate opacity-90", 
          isComplete ? "text-success-foreground/80" : "text-muted-foreground"
        )}>
          {className} • Grading Sheet
        </p>
      </div>

      {/* 2. Main Analytics & Controls Splitting Grid */}
      <div className="flex items-center gap-4 flex-1 min-w-0 w-full">
        
        {/* Left Side: Parameters and CTA Action Button */}
        <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
          <div>
            <p className={cn(
              "text-xs font-black uppercase tracking-wider mb-2 truncate text-left", 
              isComplete ? "text-success-foreground" : "text-success"
            )}>
              {status}
            </p>

            <div className="flex items-center gap-1.5 mb-4 text-left">
              <Users size={12} className={isComplete ? "text-success-foreground" : "text-muted-foreground"} />
              <span className={cn("text-xs font-bold tracking-tight", isComplete ? "text-success-foreground" : "text-foreground")}>
                {studentCount} Enrolled Students
              </span>
            </div>
          </div>

          <button className={cn(
            "w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer shrink-0 border border-transparent active:scale-[0.98]",
            isComplete
              ? "bg-background/15 hover:bg-background/25 text-background backdrop-blur-sm hover:border-background/10"
              : "bg-muted hover:bg-success/10 text-foreground hover:text-success hover:border-success/20"
          )}>
            <span>Enter Marks</span>
            <ChevronRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Right Side: Progress Indicator Radial Donut Chart */}
        <div className="w-28 h-28 shrink-0 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={34}
                outerRadius={46}
                paddingAngle={0}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                stroke="none"
                animationDuration={800}
              >
                <Cell fill={isComplete ? "hsl(0 0% 100%)" : color} />
                <Cell fill={isComplete ? "hsla(0 0% 100% / 0.15)" : "hsl(210 40% 98%)"} />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          
          {/* Inner Absolute Percentage Readout Layer */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-lg font-black tracking-tighter">
              {progress}%
            </span>
            <span className={cn(
              "text-[7px] font-black uppercase tracking-widest leading-none mt-0.5 scale-90",
              isComplete ? "text-success-foreground" : "text-muted-foreground"
            )}>
              Done
            </span>
          </div>

        </div>
      </div>

    </div>
  );
}