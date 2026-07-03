import React from 'react';

export function MedicalRecordForm({ 
  isAddingMedical, 
  setIsAddingMedical,
  medicalForm, 
  setMedicalForm,
  medicalSubmitting,
  handleAddMedicalRecord 
}) {
  if (!isAddingMedical) return null;

  return (
    <div className="p-4 bg-white/80 rounded-xl border border-emerald-100 space-y-3">
      <h4 className="text-xs font-black uppercase tracking-wider text-gray-700">New Medical Record</h4>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[9px] font-bold uppercase text-gray-400 mb-1">Condition *</label>
          <input
            type="text"
            value={medicalForm.condition}
            onChange={(e) => setMedicalForm({ ...medicalForm, condition: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="e.g. Malaria, Asthma"
          />
        </div>
        <div>
          <label className="block text-[9px] font-bold uppercase text-gray-400 mb-1">Status</label>
          <select
            value={medicalForm.status}
            onChange={(e) => setMedicalForm({ ...medicalForm, status: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="ACTIVE">Active</option>
            <option value="ONGOING">Ongoing</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
        <div>
          <label className="block text-[9px] font-bold uppercase text-gray-400 mb-1">Onset Date</label>
          <input
            type="date"
            value={medicalForm.onsetDate}
            onChange={(e) => setMedicalForm({ ...medicalForm, onsetDate: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <div>
          <label className="block text-[9px] font-bold uppercase text-gray-400 mb-1">Resolved Date</label>
          <input
            type="date"
            value={medicalForm.resolvedAt}
            onChange={(e) => setMedicalForm({ ...medicalForm, resolvedAt: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <div>
          <label className="block text-[9px] font-bold uppercase text-gray-400 mb-1">Medication</label>
          <input
            type="text"
            value={medicalForm.medication}
            onChange={(e) => setMedicalForm({ ...medicalForm, medication: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="e.g. Paracetamol"
          />
        </div>
        <div>
          <label className="block text-[9px] font-bold uppercase text-gray-400 mb-1">Dosage</label>
          <input
            type="text"
            value={medicalForm.dosage}
            onChange={(e) => setMedicalForm({ ...medicalForm, dosage: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="e.g. 500mg twice daily"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-[9px] font-bold uppercase text-gray-400 mb-1">Treatment</label>
          <input
            type="text"
            value={medicalForm.treatment}
            onChange={(e) => setMedicalForm({ ...medicalForm, treatment: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="Treatment description"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-[9px] font-bold uppercase text-gray-400 mb-1">Notes</label>
          <textarea
            value={medicalForm.notes}
            onChange={(e) => setMedicalForm({ ...medicalForm, notes: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
            placeholder="Additional notes..."
          ></textarea>
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button
          onClick={() => setIsAddingMedical(false)}
          className="flex-1 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          onClick={handleAddMedicalRecord}
          disabled={medicalSubmitting || !medicalForm.condition.trim()}
          className="flex-1 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-40"
        >
          {medicalSubmitting ? 'Saving...' : 'Save Record'}
        </button>
      </div>
    </div>
  );
}

export function MedicalRecordList({ 
  medicalRecords, 
  user, 
  handleUpdateMedicalRecord, 
  handleDeleteMedicalRecord,
  formatDate 
}) {
  if (medicalRecords.length === 0) {
    return <p className="text-xs text-gray-400 py-6 text-center">No medical records recorded</p>;
  }

  return (
    <div className="space-y-3">
      {medicalRecords.map((record) => (
        <div key={record.id} className="p-3 bg-white/60 rounded-xl border border-slate-100">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-gray-800">{record.condition}</span>
            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
              record.status === 'ACTIVE' ? 'bg-rose-50 text-rose-700' :
              record.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700' :
              'bg-amber-50 text-amber-700'
            }`}>
              {record.status}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-600">
            {record.onsetDate && (
              <div>
                <span className="font-semibold">Onset:</span> {formatDate(record.onsetDate)}
              </div>
            )}
            {record.resolvedAt && (
              <div>
                <span className="font-semibold">Resolved:</span> {formatDate(record.resolvedAt)}
              </div>
            )}
            {record.medication && (
              <div>
                <span className="font-semibold">Medication:</span> {record.medication} {record.dosage ? `(${record.dosage})` : ''}
              </div>
            )}
            {record.treatment && (
              <div>
                <span className="font-semibold">Treatment:</span> {record.treatment}
              </div>
            )}
          </div>
          {record.notes && (
            <p className="text-[10px] text-gray-500 mt-1.5 italic">"{record.notes}"</p>
          )}
          {(user?.role === 'TEACHER' || user?.role === 'HOD' || user?.role === 'SUPER_ADMIN' || user?.role === 'HEADMASTER') && (
            <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => handleUpdateMedicalRecord(record.id, { status: record.status === 'ACTIVE' ? 'RESOLVED' : 'ACTIVE' })}
                className="text-[9px] font-bold uppercase text-emerald-700 hover:text-emerald-800"
              >
                {record.status === 'ACTIVE' ? 'Mark Resolved' : 'Mark Active'}
              </button>
              <button
                onClick={() => {
                  if (confirm('Delete this medical record?')) {
                    handleDeleteMedicalRecord(record.id);
                  }
                }}
                className="text-[9px] font-bold uppercase text-rose-600 hover:text-rose-700"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}