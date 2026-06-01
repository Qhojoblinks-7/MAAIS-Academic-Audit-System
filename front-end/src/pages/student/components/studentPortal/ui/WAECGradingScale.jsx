import React from 'react';
import { cn } from './cn';

const GRADES = [
  { label: 'A1', range: '75-100%', interpretation: 'Excellent' },
  { label: 'B2', range: '70-74%', interpretation: 'Very Good' },
  { label: 'B3', range: '65-69%', interpretation: 'Good' },
  { label: 'C4', range: '60-64%', interpretation: 'Credit' },
  { label: 'C5', range: '55-59%', interpretation: 'Credit' },
  { label: 'C6', range: '50-54%', interpretation: 'Credit' },
  { label: 'D7', range: '45-49%', interpretation: 'Pass' },
  { label: 'E8', range: '40-44%', interpretation: 'Pass' },
  { label: 'F9', range: '0-39%', interpretation: 'Fail' },
];

export function WAECGradingScale() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm w-full">
      <h2 className="text-lg sm:text-xl font-black text-gray-900 mb-4">WAEC Grading Scale</h2>
      
      {/* 1. Mobile View Mode: Replaces tables with high-contrast indicator list cards */}
      <div className="block sm:hidden space-y-2">
        {GRADES.map((grade, index) => {
          const isFail = grade.label === 'F9';
          return (
            <div 
              key={index} 
              className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100/50"
            >
              <div className="flex items-center gap-3">
                {/* Visual Grade Badge Icon */}
                <span className={cn(
                  "w-10 h-10 rounded-xl font-black text-sm flex items-center justify-center shadow-sm border",
                  isFail 
                    ? "bg-red-50 text-red-700 border-red-100" 
                    : "bg-blue-50 text-blue-700 border-blue-100"
                )}>
                  {grade.label}
                </span>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-gray-900">
                    {grade.interpretation}
                  </span>
                  <span className="text-[11px] font-medium text-gray-400 mt-0.5">
                    Score Matrix Interval
                  </span>
                </div>
              </div>
              <span className="text-xs font-black bg-white px-2.5 py-1.5 rounded-lg border border-gray-200/60 text-gray-700">
                {grade.range}
              </span>
            </div>
          );
        })}
      </div>

      {/* 2. Desktop View Mode: Standard table grid layout activated smoothly above mobile break margins */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead>
            <tr className="bg-gray-50 rounded-lg">
              <th scope="col" className="px-5 py-3 text-left text-xs font-black text-gray-400 uppercase tracking-widest rounded-l-xl">
                Grade
              </th>
              <th scope="col" className="px-5 py-3 text-left text-xs font-black text-gray-400 uppercase tracking-widest">
                Score Range
              </th>
              <th scope="col" className="px-5 py-3 text-left text-xs font-black text-gray-400 uppercase tracking-widest rounded-r-xl">
                Interpretation
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {GRADES.map((grade, index) => (
              <tr key={index} className="transition-colors hover:bg-gray-50/40">
                <td className="px-5 py-3.5 text-sm font-black text-gray-900">{grade.label}</td>
                <td className="px-5 py-3.5 text-sm font-medium text-gray-600">{grade.range}</td>
                <td className="px-5 py-3.5 text-sm font-medium text-gray-600">{grade.interpretation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}