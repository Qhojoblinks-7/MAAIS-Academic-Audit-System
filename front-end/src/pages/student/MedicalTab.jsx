import React from 'react';
import { MedicalRecordForm, MedicalRecordList } from './MedicalRecordComponents';

export function MedicalTab({ 
  user, 
  isAddingMedical, 
  setIsAddingMedical,
  medicalForm, 
  setMedicalForm,
  medicalSubmitting,
  portalData,
  backendStudent,
  handleAddMedicalRecord,
  handleUpdateMedicalRecord,
  handleDeleteMedicalRecord,
  formatDate 
}) {
  return (
    <div className="space-y-4">
      {(user?.role === 'TEACHER' || user?.role === 'HOD' || user?.role === 'SUPER_ADMIN' || user?.role === 'HEADMASTER') && !isAddingMedical && (
        <button
          onClick={() => setIsAddingMedical(true)}
          className="w-full py-3 bg-emerald-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-emerald-700 shadow-md transition-all"
        >
          + Add Medical Record
        </button>
      )}

      <MedicalRecordForm
        isAddingMedical={isAddingMedical}
        setIsAddingMedical={setIsAddingMedical}
        medicalForm={medicalForm}
        setMedicalForm={setMedicalForm}
        medicalSubmitting={medicalSubmitting}
        handleAddMedicalRecord={handleAddMedicalRecord}
      />

      <MedicalRecordList
        medicalRecords={portalData?.medicalRecords || []}
        user={user}
        handleUpdateMedicalRecord={handleUpdateMedicalRecord}
        handleDeleteMedicalRecord={handleDeleteMedicalRecord}
        formatDate={formatDate}
      />
    </div>
  );
}