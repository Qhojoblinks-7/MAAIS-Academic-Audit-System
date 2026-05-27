import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export function Unauthorized() {
  const navigate = useNavigate();
  const error = new URLSearchParams(window.location.search).get('error') || 'Access denied';

  return (
    <div className="flex-1 flex items-center justify-center bg-slate-50/50 font-sans antialiased">
      <div className="max-w-md w-full mx-auto p-8 text-center">
        <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert size={32} className="text-rose-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Unauthorized Access</h1>
        <p className="text-gray-500 mb-6">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 mx-auto"
        >
          <ArrowLeft size={14} />
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}