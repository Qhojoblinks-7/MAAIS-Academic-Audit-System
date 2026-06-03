import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Link as LinkIcon, FileText, ExternalLink, Trash2, Youtube, HardDrive } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';

// WAEC STP-compliant resource types: LINK (external URL), PDF (stored document),
// GOOGLE_DRIVE (Google Drive/Docs/Sheets shared link), YOUTUBE (video embed link)
// Each type has a unique display icon and accepts any valid public URL.

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
          className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-2xl bg-card rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="px-8 py-6 bg-card border-b border-border flex justify-between items-center shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-primary-foreground">
                <BookOpen size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground tracking-tight">Learning Materials</h3>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{selectedEntry.subjectName} — {selectedEntry.className}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-all text-muted-foreground">
              <Plus size={24} className="rotate-45" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            <div>
              <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Linked Resources</h4>
              <div className="space-y-3">
                {selectedEntry.materials?.length ? selectedEntry.materials.map(material => (
                  <Card key={material.id} className="p-4 group hover:border-brand-primary/20 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        material.type === 'PDF'          ? "bg-destructive/10 text-destructive" :
                        material.type === 'GOOGLE_DRIVE' ? "bg-brand-secondary/10 text-brand-secondary"   :
                        material.type === 'YOUTUBE'      ? "bg-warning/10 text-warning"     :
                                                           "bg-brand-primary/10 text-brand-primary"
                      )}>
                        {getResourceIcon(material.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-black text-foreground leading-none mb-1">{material.title}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Added on {material.addedAt}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-all justify-end">
                      <a href={material.url} target="_blank" rel="noopener noreferrer" className="p-2 text-muted-foreground hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all">
                        <ExternalLink size={18} />
                      </a>
                      <button className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </Card>
                )) : (
                  <div className="text-center py-10 border-2 border-dashed border-border rounded-3xl">
                    <FileText className="mx-auto text-muted-foreground mb-2" size={32} />
                    <p className="text-xs font-bold text-muted-foreground italic">No resources attached to this session.</p>
                  </div>
                )}
              </div>
            </div>

            {user?.role !== 'STUDENT' && (
              <div className="pt-8 border-t border-border">
                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Attach New Material</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Resource Title</label>
                      <Input 
                        type="text" 
                        placeholder="e.g., Week 4 Practical Guide"
                        value={newMaterial.title}
                        onChange={(e) => setNewMaterial(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-5 py-3.5 font-bold focus:ring-4 focus:ring-brand-primary/5"
                      />
                    </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Resource Type</label>
                        <div className="flex p-1 bg-muted rounded-xl">
                          {['LINK', 'PDF', 'GOOGLE_DRIVE', 'YOUTUBE'].map(t => (
                            <button
                              key={t}
                              onClick={() => setNewMaterial(prev => ({ ...prev, type: t }))}
                              className={cn(
                                "flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                newMaterial.type === t ? "bg-card text-brand-primary shadow-sm" : "text-muted-foreground"
                              )}
                            >
                              {t === 'GOOGLE_DRIVE' ? 'Drive' : t === 'YOUTUBE' ? 'YouTube' : t}
                            </button>
                          ))}
                        </div>
                      </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Resource URL (shared link or storage path)</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-border" size={16} />
                      <Input 
                        type="text" 
                        placeholder="https://..."
                        value={newMaterial.url}
                        onChange={(e) => setNewMaterial(prev => ({ ...prev, url: e.target.value }))}
                        className="w-full pl-12 pr-5 py-3.5 font-bold focus:ring-4 focus:ring-brand-primary/5"
                      />
                    </div>
                  </div>
                  <Button className="w-full py-4 font-black uppercase tracking-widest shadow-xl">
                    <Plus size={16} />
                    Append to Session Registry
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}