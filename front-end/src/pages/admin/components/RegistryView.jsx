import React from 'react';
import { Search, UserPlus, Edit2, Trash2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { registryStats, adminUsers } from '../data';

export function RegistryView() {
  return (
    <div className="space-y-3 px-1 sm:px-0">
      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {registryStats.map((stat, i) => (
          <div key={i} className="bg-white p-3 rounded-xl border border-gray-100 shadow-xs flex flex-col justify-between">
            <div>
              <p className="text-[16px] font-black text-gray-900 tracking-tighter leading-none">{stat.value}</p>
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-wider mt-1 leading-none">{stat.label}</p>
            </div>
            <p className="text-[7.5px] font-black text-emerald-600 uppercase tracking-wider mt-2 bg-emerald-50/60 w-fit px-1.5 py-0.5 rounded-md font-mono">
              {stat.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Action Bar & High-Density Node Feed */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
        {/* Filter Controls Header */}
        <div className="p-2.5 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50/30 gap-2">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
              <input 
                type="text" 
                placeholder="Search nodes..." 
                className="w-full h-8 pl-8 pr-3 bg-white border border-gray-100 rounded-lg text-[11px] font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all"
              />
            </div>
            
            <div className="flex gap-0.5 p-0.5 bg-gray-100 rounded-lg shrink-0">
              {['ALL', 'TEACH', 'HOD', 'STUD'].map((role) => (
                <button key={role} className="px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-wider hover:bg-white transition-all text-gray-400 hover:text-gray-900 whitespace-nowrap">
                  {role}
                </button>
              ))}
            </div>
          </div>
          
          <button className="h-8 px-4 bg-emerald-900 hover:bg-emerald-800 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-1.5 w-full sm:w-auto shrink-0 active:scale-[0.99]">
            <UserPlus size={12} />
            Onboard Entity
          </button>
        </div>

        {/* High-Density Row List (Replaces Table) */}
        <div className="divide-y divide-gray-100">
          {adminUsers.map((user) => (
            <div 
              key={user.id} 
              className="p-2 sm:p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-gray-50/40 transition-colors group"
            >
              {/* Identity Column */}
              <div className="flex items-center gap-2.5 min-w-0 sm:w-1/3">
                <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 font-bold text-[11px] group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-gray-900 tracking-tight leading-none mb-0.5 truncate">{user.name}</p>
                  <p className="text-[8px] font-medium text-gray-400 font-mono truncate">Last: {user.lastLogin}</p>
                </div>
              </div>

              {/* Attributes Container */}
              <div className="flex items-center justify-between sm:justify-start gap-4 sm:w-2/3 min-w-0">
                {/* Authorization Status */}
                <div className="sm:w-1/3">
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider inline-block font-mono",
                    user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700' :
                    user.role === 'HOD' ? 'bg-blue-50 text-blue-700' :
                    user.role === 'TEACHER' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-400'
                  )}>
                    {user.role}
                  </span>
                </div>

                {/* Sub-Node Department */}
                <div className="sm:w-1/3 truncate">
                  <span className="text-[10px] font-bold text-gray-800 uppercase tracking-wider font-mono">
                    {user.dept}
                  </span>
                </div>

                {/* Protocol Lifecycle Status */}
                <div className="flex items-center gap-1.5 sm:w-1/3 sm:justify-center">
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full shrink-0",
                    user.status === 'ACTIVE' ? "bg-emerald-500 animate-pulse" : "bg-gray-300"
                  )} />
                  <span className={cn(
                    "text-[9px] font-bold uppercase tracking-wider",
                    user.status === 'ACTIVE' ? "text-emerald-600" : "text-gray-400"
                  )}>
                    {user.status === 'ACTIVE' ? 'Online' : 'Dormant'}
                  </span>
                </div>

                {/* Actions Control Deck */}
                <div className="flex items-center justify-end gap-0.5 shrink-0 sm:ml-auto md:opacity-0 md:group-hover:opacity-100 transition-all duration-150 transform md:translate-x-1 md:group-hover:translate-x-0">
                  <button className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all">
                    <Edit2 size={11} />
                  </button>
                  <button className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all">
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}