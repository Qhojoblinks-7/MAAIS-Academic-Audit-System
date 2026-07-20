import React from 'react';
import { cn } from '../../lib/utils';
import { Clock, Trash2, Copy, Save } from 'lucide-react';

export const SlotManager = ({ isManagingSlots, editingSlot, slotForm, setSlotForm, TIME_SLOTS, onStartEdit, onCreate, onUpdate, onDelete, onCancel }) => {
  if (!isManagingSlots) return null;

  return (
    <div className="bg-surface rounded-[2.5rem] border border-border p-6 shadow-sm">
      <h3 className="text-[11px] font-black text-text-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
        <Clock size={16} className="text-brand-primary" />
        {editingSlot ? 'Edit Time Slot' : 'Create Time Slot'}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="space-y-1">
          <label className="text-[9px] font-black text-text-secondary uppercase tracking-widest ml-1">Label</label>
          <input
            type="text"
            value={slotForm.label}
            onChange={(e) => setSlotForm((prev) => ({ ...prev, label: e.target.value }))}
            placeholder="e.g. Period 1"
            className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-brand-primary/5 transition-all"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-black text-text-secondary uppercase tracking-widest ml-1">Start Time</label>
          <input
            type="time"
            value={slotForm.startTime}
            onChange={(e) => setSlotForm((prev) => ({ ...prev, startTime: e.target.value }))}
            className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-brand-primary/5 transition-all"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-black text-text-secondary uppercase tracking-widest ml-1">End Time</label>
          <input
            type="time"
            value={slotForm.endTime}
            onChange={(e) => setSlotForm((prev) => ({ ...prev, endTime: e.target.value }))}
            className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-brand-primary/5 transition-all"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-black text-text-secondary uppercase tracking-widest ml-1">Type</label>
          <div className="flex p-1 bg-background rounded-xl">
            <button
              onClick={() => setSlotForm((prev) => ({ ...prev, isBreak: false }))}
              className={cn(
                'flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                !slotForm.isBreak ? 'bg-brand-primary text-primary-foreground shadow-sm' : 'text-text-secondary hover:text-text-primary',
              )}
            >
              Period
            </button>
            <button
              onClick={() => setSlotForm((prev) => ({ ...prev, isBreak: true }))}
              className={cn(
                'flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                slotForm.isBreak ? 'bg-warning text-primary-foreground shadow-sm' : 'text-text-secondary hover:text-text-primary',
              )}
            >
              Break
            </button>
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={editingSlot ? onUpdate : onCreate}
          className="px-6 py-2.5 bg-brand-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-dark transition-all shadow-lg shadow-brand-primary/10"
        >
          <Save size={12} className="inline mr-1" />
          {editingSlot ? 'Update' : 'Create'}
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-2.5 bg-surface border border-border text-text-secondary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-muted transition-all"
        >
          Cancel
        </button>
      </div>

      {!editingSlot && TIME_SLOTS.length > 1 && (
        <div className="mt-6">
          <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-3">Current Slots</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {TIME_SLOTS.map((slot) => (
              <div
                key={slot.id}
                className={cn(
                  'p-3 rounded-xl border flex items-center justify-between',
                  slot.isBreak ? 'bg-muted/30 border-border' : 'bg-background border-border',
                )}
              >
                <div>
                  <p className="text-[10px] font-black text-text-primary">{slot.label}</p>
                  <p className="text-[8px] font-bold text-text-secondary uppercase tracking-wider">
                    <Clock size={8} className="inline mr-1" />
                    {slot.startTime} - {slot.endTime}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => onStartEdit(slot)}
                    className="p-1.5 text-text-secondary hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all"
                  >
                    <Copy size={10} />
                  </button>
                  <button
                    onClick={() => onDelete(slot.id)}
                    className="p-1.5 text-text-secondary hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
