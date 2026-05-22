import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Link as LinkIcon, FileText, ExternalLink, Trash2, Youtube, HardDrive } from 'lucide-react';
import { cn } from '../../lib/utils';

// WAEC STP-compliant resource types: LINK (external URL), PDF (stored document),
// GOOGLE_DRIVE (Google Drive/Docs/Sheets shared link), YOUTUBE (video embed link)
// Each type has a unique display icon and accepts any valid public URL.

export function ResourceModal({ isOpen, onClose, selectedEntry, user, newMaterial, setNewMaterial }) {
  /* WAEC STP — resource type icon resolver.
   * Maps each STP-compliant resource type to its display icon.
   * Types: LINK, PDF, GOOGLE_DRIVE, YOUTUBE */
  const getResourceIcon = (type) => {
    switch (type) {
      case 'PDF':         return <FileText size={20} />;
      case 'GOOGLE_DRIVE': return <HardDrive size={20} />;
      case 'YOUTUBE':     return <Youtube size={20} />;
      case 'LINK':
      default:            return <LinkIcon size={20} />;
    }
  };

  if (!isOpen || !selectedEntry) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-2xl bg-[#F9F9F7] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="px-8 py-6 bg-white border-b border-gray-100 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-800 rounded-xl flex items-center justify-center text-white">
                <BookOpen size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900 tracking-tight">Learning Materials</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{selectedEntry.subjectName} — {selectedEntry.className}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400">
              <Plus size={24} className="rotate-45" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            <div>
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Linked Resources</h4>
              <div className="space-y-3">
                {selectedEntry.materials?.length ? selectedEntry.materials.map(material => (
                  <div key={material.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl group hover:border-emerald-200 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        material.type === 'PDF'          ? "bg-rose-50 text-rose-600"   :
                        material.type === 'GOOGLE_DRIVE' ? "bg-blue-50 text-blue-600"   :
                        material.type === 'YOUTUBE'      ? "bg-red-50 text-red-600"     :
                                                           "bg-blue-50 text-blue-600"
                      )}>
                        {getResourceIcon(material.type)}
                      </div>
                      <div>
                        <p className="text-[14px] font-black text-gray-900 leading-none mb-1">{material.title}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Added on {material.addedAt}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <a href={material.url} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all">
                        <ExternalLink size={18} />
                      </a>
                      <button className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-3xl">
                    <FileText className="mx-auto text-gray-200 mb-2" size={32} />
                    <p className="text-xs font-bold text-gray-400 italic">No resources attached to this session.</p>
                  </div>
                )}
              </div>
            </div>

            {user?.role !== 'STUDENT' && (
              <div className="pt-8 border-t border-gray-100">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Attach New Material</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Resource Title</label>
                      <input 
                        type="text" 
                        placeholder="e.g., Week 4 Practical Guide" 
                        value={newMaterial.title}
                        onChange={(e) => setNewMaterial(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-sm"
                      />
                    </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Resource Type</label>
                        <div className="flex p-1 bg-gray-100 rounded-xl">
                          {['LINK', 'PDF', 'GOOGLE_DRIVE', 'YOUTUBE'].map(t => (
                            <button
                              key={t}
                              onClick={() => setNewMaterial(prev => ({ ...prev, type: t }))}
                              className={cn(
                                "flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                newMaterial.type === t ? "bg-white text-emerald-800 shadow-sm" : "text-gray-400"
                              )}
                            >
                              {t === 'GOOGLE_DRIVE' ? 'Drive' : t === 'YOUTUBE' ? 'YouTube' : t}
                            </button>
                          ))}
                        </div>
                      </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Resource URL (shared link or storage path)</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                      <input 
                        type="text" 
                        placeholder="https://..." 
                        value={newMaterial.url}
                        onChange={(e) => setNewMaterial(prev => ({ ...prev, url: e.target.value }))}
                        className="w-full pl-12 pr-5 py-3.5 bg-white border border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-sm"
                      />
                    </div>
                  </div>
                  <button className="w-full py-4 bg-emerald-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-emerald-900/10 flex items-center justify-center gap-3">
                    <Plus size={16} />
                    Append to Session Registry
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}