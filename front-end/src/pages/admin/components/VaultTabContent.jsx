import React, { useState } from 'react';
import { cn } from '../../../lib/utils';
import { FileText, Download, Upload } from 'lucide-react';
import { uploadStrategyPulseFile } from '../../../services/departmentService';

export function VaultTabContent({ selectedDept }) {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setUploading(true);
    setUploadMessage('');
    
    try {
      const result = await uploadStrategyPulseFile(files, selectedDept?.id);
      if (result.success) {
        setUploadMessage(result.message);
        setUploadedFiles(prev => [...prev, ...files.map(f => ({
          id: `PULSE-${Date.now()}-${f.name}`,
          name: f.name,
          size: `${(f.size / 1024).toFixed(1)} KB`,
          date: new Date().toISOString().split('T')[0],
        }))]);
      } else {
        setUploadMessage(result.message);
      }
    } catch (error) {
      setUploadMessage('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (file) => {
    const blob = new Blob([`Mock content for ${file.name}`], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const vaultFiles = uploadedFiles.length > 0 ? uploadedFiles : [
    { id: 'default-1', name: 'Department Meeting Minutes - Q1 2024.pdf', size: '245 KB', date: '2024-01-15' },
    { id: 'default-2', name: 'Curriculum Review - Mathematics.pdf', size: '182 KB', date: '2024-02-20' },
  ];
   
  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {uploadMessage && (
        <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-lg text-sm font-medium">
          {uploadMessage}
        </div>
      )}
      
      {/* Upload Drag & Drop Area */}
      <label className="border border-dashed border-border rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-10 flex flex-col items-center justify-center text-center bg-muted/30 hover:bg-muted/50 transition-all group cursor-pointer w-full">
        <input
          type="file"
          accept="application/pdf"
          multiple
          onChange={handleFileUpload}
          disabled={uploading}
          className="hidden"
        />
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-surface rounded-2xl flex items-center justify-center text-muted-foreground mb-4 sm:mb-6 shadow-sm group-hover:scale-110 transition-transform flex-shrink-0">
          <Upload size={22} className="sm:hidden" />
          <Upload size={28} className="hidden sm:block" />
        </div>
        <p className="text-xs sm:text-sm font-black text-foreground uppercase tracking-widest mb-1 sm:mb-2">
          {uploading ? 'Uploading...' : 'Upload Strategy Pulse'}
        </p>
        <p className="text-[9px] sm:text-[10px] text-muted-foreground font-bold uppercase tracking-widest max-w-[180px] sm:max-w-[200px]">
          PDF format strictly required for departmental meeting minutes.
        </p>
      </label>

      {/* File Registry List */}
      <div className="space-y-2.5 sm:space-y-3 w-full">
        {vaultFiles.map((file, i) => (
          <div 
            key={file.id || i} 
            className="p-3 sm:p-4 bg-surface border border-border rounded-2xl flex items-center justify-between gap-4 group hover:border-border transition-all w-full"
          >
            {/* File Info Block */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-destructive/5 text-destructive rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText size={16} className="sm:hidden" />
                <FileText size={18} className="hidden sm:block" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-[12px] font-black text-foreground truncate tracking-tight max-w-[160px] xs:max-w-[240px] sm:max-w-md md:max-w-xl">
                  {file.name}
                </p>
                <p className="text-[8px] sm:text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5 sm:mt-0">
                  {file.date} • {file.size}
                </p>
              </div>
            </div>

            {/* Action Item */}
            <button 
              onClick={() => handleDownload(file)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 rounded-lg hover:bg-muted/20"
              aria-label={`Download ${file.name}`}
            >
              <Download size={16} className="sm:hidden" />
              <Download size={18} className="hidden sm:block" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
 }