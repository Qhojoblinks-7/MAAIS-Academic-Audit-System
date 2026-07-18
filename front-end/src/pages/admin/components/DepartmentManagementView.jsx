import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import {
   ChevronRight,
   X,
   Crown,
   ArrowRight,
   RotateCcw,
   ShieldCheck,
   Trash2,
   Search,
   FileText,
 } from "lucide-react";
import DepartmentGrid from "./DepartmentGrid";
import DepartmentDetailsHeader from "./DepartmentDetailsHeader";
import DepartmentDetailsView from "./DepartmentDetailsView";
import { auditTrail } from "../../../services/auditTrailService";

export function DepartmentManagementView({
   departments,
   selectedDept,
   viewType,
   setViewType,
   setSelectedDeptId,
   onSpawnClick,
   exportDossier,
   initiateFreeze,
   setAlert,
   setAssigningHOD,
   assigningHOD,
   activeTab,
   setActiveTab,
   handleAssignHOD,
   handleNodeOperation,
   openKebabId,
   toggleKebab,
   openTransferModal,
   activeOperation,
   setActiveOperation,
   performCredentialReset,
   handleRegistryTransfer,
   handleRevokeAuthority,
   handleDeepArchive,
   handleAuthorizeTemplateUpdate,
   showSpawnModal,
   spawnForm,
   setSpawnForm,
   handleSpawnSubmit,
   confirmAssignment,
   transferModal,
   closeTransferModal,
   executeTransfer,
   generateFullForensicReport,
   closeSpawnModal,
 }) {
   const renderOperationModal = () => {
     if (!activeOperation) return null;
     const { type, staffName, deptId } = activeOperation;

    return (
      <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setActiveOperation(null)}
          className="absolute inset-0 bg-brand-dark/60 backdrop-blur-md"
        />
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-surface rounded-[2.5rem] shadow-2xl overflow-hidden"
        >
          <div className="p-10">
            <header className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
<div className="w-12 h-12 bg-brand-primary text-primary-foreground rounded-2xl flex items-center justify-center">
                    {type === "Transfer" && <ArrowRight size={24} />}
                   {type === "Credential Reset" && <RotateCcw size={24} />}
                   {type === "Audit Trail View" && <Search size={24} />}
                   {type === "Revoke Authority" && <ShieldCheck size={24} />}
                    {type === "Deactivate Staff" && <Trash2 size={24} />}
                   {type === "Authorize Template Update" && <FileText size={24} />}
                 </div>
                <div>
                  <h3 className="text-xl font-black italic font-display text-foreground leading-none mb-1">
                    {type}
                  </h3>
<p className="text-xs font-bold text-muted-foreground uppercase tracking-widest italic leading-none">
                      {type === "Authorize Template Update" ? "Target:" : "Staff:"} {staffName}
                   </p>
                </div>
              </div>
              <button
                onClick={() => setActiveOperation(null)}
                className="p-2 text-muted-foreground hover:text-foreground transition-all"
              >
                <X size={24} />
              </button>
            </header>

            {type === "Transfer" && (

              <div className="space-y-3">
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  Select the destination department for this staff member. This
                  will relocate all associated academic history and current
                  assessment permissions.
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {departments
                    .filter((d) => d.id !== selectedDept?.id)
                    .map((d) => (
                      <button
                        key={d.id}
                        onClick={() => handleRegistryTransfer(d.id)}
                        className="p-4 border border-border rounded-2xl text-left hover:border-border hover:bg-muted/30 transition-all group flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-1.5 h-6 rounded-full ${d.color}`}
                          />
                          <span className="text-sm font-black italic text-foreground">
                            {d.name} Department
                          </span>
                        </div>
                        <ChevronRight
                          size={16}
                          className="text-muted-foreground group-hover:text-foreground transition-all"
                        />
                      </button>
                    ))}
                </div>
              </div>
            )}

            {type === "Credential Reset" && (
              <div className="space-y-8">
                <div className="p-6 bg-warning/10 rounded-3xl border border-warning/20">
                  <p className="text-sm font-medium text-warning leading-relaxed">
                    This will invalidate current session tokens and generate a
                    temporary institutional access key for{" "}
                    <span className="font-black italic underline">
                      {staffName}
                    </span>
                    .
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest text-center">
                    Authentication Required
                  </p>
                  <button
                    onClick={performCredentialReset}
                    className="w-full py-4 bg-brand-primary text-primary-foreground font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-brand-primary/90 transition-all shadow-xl shadow-brand-primary/20 cursor-pointer"
                  >
                     Authorize Password Reset
                  </button>
                </div>
              </div>
            )}

{type === "Audit Trail View" && (
               <div className="space-y-6">
                 <div className="space-y-4">
                   {activeOperation && activeOperation.deptId ? (
                     <AuditTrailLogs deptId={activeOperation.deptId} />
                   ) : (
                     <p className="text-sm text-foreground/50 italic">Loading audit logs...</p>
                   )}
                 </div>
                 <button 
                   onClick={async () => {
                     const result = await generateFullForensicReport(selectedDept?.id, selectedDept?.name);
                     setAlert({ isOpen: true, title: 'Forensic Report Generated', message: result.message, type: result.success ? 'success' : 'info' });
                   }}
                   className="w-full py-4 border border-border text-foreground font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-muted/30 transition-all"
                 >
                   Generate Full Forensic Report
                 </button>
               </div>
             )}

            {type === "Revoke Authority" && (
              <div className="space-y-8 text-center">
                <p className="text-foreground/50 font-medium leading-relaxed italic px-4">
                  Confirmed: strip{" "}
                  <span className="text-foreground font-black italic">
                    "{staffName}"
                  </span>{" "}
                  of all HOD management tokens and administrative oversight?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setActiveOperation(null)}
                    className="flex-1 py-4 bg-muted/30 text-foreground font-black rounded-2xl text-xs uppercase tracking-widest"
                  >
                    Cancel
                  </button>
<button
                     onClick={handleRevokeAuthority}
                     className="flex-1 py-4 bg-destructive text-primary-foreground font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-destructive/80 shadow-xl shadow-destructive/20 cursor-pointer"
                   >
                     Revoke Authority
                   </button>
                 </div>
               </div>
             )}

             {type === "Deactivate Staff" && (
               <div className="space-y-8 text-center">
                 <div className="p-6 bg-brand-primary text-primary-foreground rounded-[2rem] text-left">
                   <p className="text-xs font-black text-primary-foreground/40 uppercase tracking-[0.2em] mb-3">
                      What happens next
                   </p>
                   <ul className="space-y-3">
                     {[
                       "Preservation of academic records",
                       "Inactivation of login permissions",
                        "Removal from active staff list",
                     ].map((text, i) => (
                       <li
                         key={i}
                         className="flex items-center gap-3 text-xs font-bold italic"
                       >
                         <ShieldCheck size={14} className="text-success" />
                         {text}
                       </li>
                     ))}
                   </ul>
                 </div>
                 <div className="flex gap-3">
                   <button
                     onClick={() => setActiveOperation(null)}
                     className="flex-1 py-4 bg-muted/30 text-foreground font-black rounded-2xl text-xs uppercase tracking-widest"
                   >
                     Abort
                   </button>
                   <button
                     onClick={handleDeepArchive}
                     className="flex-1 py-4 bg-brand-primary text-primary-foreground font-black rounded-2xl text-xs uppercase tracking-widest cursor-pointer"
                   >
                     Initiate Archive
                   </button>
                 </div>
               </div>
             )}

             {type === "Authorize Template Update" && (
               <div className="space-y-6">
                 <div className="p-6 bg-brand-primary/10 rounded-3xl border border-brand-primary/20">
                   <p className="text-sm font-medium text-brand-primary leading-relaxed">
                     Authorize template updates for{" "}
                     <span className="font-black italic underline">
                       {selectedDept?.name || staffName}
                     </span>{" "}
                     at the 20% threshold level. This will permit limited template modifications while maintaining audit trail integrity.
                   </p>
                 </div>
                 <div className="space-y-3">
                   <p className="text-xs font-black text-muted-foreground uppercase tracking-widest text-center">
                     Authorization Required
                   </p>
                   <button
                     onClick={handleAuthorizeTemplateUpdate}
                     className="w-full py-4 bg-brand-primary text-primary-foreground font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-brand-primary/90 transition-all shadow-xl shadow-brand-primary/20 cursor-pointer"
                   >
                     Authorize Template Update (20%)
                   </button>
                 </div>
               </div>
             )}
          </div>
          <div className="bg-muted/30 py-5 text-center border-t border-border">
            <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.25em]">
               Authorized Administrative Action
            </p>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-muted/30 overflow-hidden relative">
      <AnimatePresence mode="wait">
        {!selectedDept ? (
          <DepartmentGrid
            departments={departments}
            viewType={viewType}
            setViewType={setViewType}
            setSelectedDeptId={setSelectedDeptId}
            onSpawnClick={onSpawnClick}
          />
        ) : (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col bg-surface overflow-hidden"
          >
            <DepartmentDetailsHeader
              selectedDept={selectedDept}
              onBack={() => setSelectedDeptId(null)}
              onExport={async () => {
                const result = await exportDossier(selectedDept);
                setAlert({ isOpen: true, title: 'Export Dossier', message: result.message, type: result.success ? 'success' : 'danger' });
              }}
              onFreeze={async () => {
                const result = await initiateFreeze(selectedDept);
                setAlert({ isOpen: true, title: 'Initiate Freeze', message: result.message, type: result.success ? 'success' : 'warning' });
              }}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />

<DepartmentDetailsView
               departments={departments}
               selectedDept={selectedDept}
               activeTab={activeTab}
               setActiveTab={setActiveTab}
               openKebabId={openKebabId}
               toggleKebab={toggleKebab}
               handleAssignHOD={handleAssignHOD}
               handleNodeOperation={handleNodeOperation}
               openTransferModal={openTransferModal}
             />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {assigningHOD && (
          <div
            key="hod-modal"
            className="fixed inset-0 z-[600] flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAssigningHOD(null)}
              className="absolute inset-0 bg-brand-dark/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-surface rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10 text-center">
                <div className="w-20 h-20 bg-warning/10 text-warning rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner ring-1 ring-warning/20">
                  <Crown size={40} className="fill-warning/20" />
                </div>

                <h3 className="text-2xl font-black italic font-display text-foreground tracking-tight leading-none mb-3">
                  Authority Elevation
                </h3>
                <p className="text-foreground/50 font-bold leading-relaxed mb-10 px-4 text-sm">
                  Elevate{" "}
                  <span className="text-foreground font-black italic">
                    "{assigningHOD.staffName}"
                  </span>{" "}
                  to Head of Department for {assigningHOD.deptName}?
                </p>

                <div className="bg-muted/30 border border-border rounded-3xl p-5 mb-10 text-left">
                  <div className="flex items-center gap-3 mb-3">
                    <ShieldCheck size={16} className="text-success" />
                    <p className="text-xs font-black text-foreground uppercase tracking-widest">
                      Granted Token Permissions
                    </p>
                  </div>
                  <ul className="space-y-2">
                    <li className="text-xs font-medium text-foreground/50 flex items-center gap-2 italic">
                      <div className="w-1 h-1 rounded-full bg-border" />
                       validation of Department Assessment Matrices
                    </li>
                    <li className="text-xs font-medium text-foreground/50 flex items-center gap-2 italic">
                      <div className="w-1 h-1 rounded-full bg-border" />
                       Department Administration
                    </li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setAssigningHOD(null)}
                    className="flex-1 py-4 bg-muted/30 text-foreground font-black rounded-2xl text-xs uppercase tracking-widest border border-border/50"
                  >
                    Abort
                  </button>
                  <button
                    onClick={confirmAssignment}
                    className="flex-1 py-4 bg-brand-primary text-primary-foreground font-black rounded-2xl text-xs uppercase tracking-widest"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

<AnimatePresence>
         {showSpawnModal && (
           <div
             key="spawn-modal"
             className="fixed inset-0 z-[600] flex items-center justify-center p-6"
           >
             <div className="absolute inset-0 bg-brand-dark/60 backdrop-blur-md transition-opacity duration-200 opacity-100" />
             <motion.div
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="relative w-full max-w-md bg-surface rounded-[2.5rem] shadow-2xl overflow-hidden"
             >
               <div className="p-10">
                 <div className="flex items-center justify-between mb-6">
                   <h3 className="text-xl font-black italic font-display text-foreground">
                     Spawn Department
                   </h3>
                   <button
                     type="button"
                     onClick={closeSpawnModal}
                     className="p-2 text-muted-foreground hover:text-foreground transition-all"
                   >
                     <X size={24} />
                   </button>
                 </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSpawnSubmit();
                  }}
                  className="space-y-6"
                >
                   <div>
                     <label className="block text-xs font-bold text-foreground/60 mb-2">
                       Department Name
                     </label>
                     <input
                       type="text"
                       value={spawnForm.name}
                       onChange={(e) =>
                         setSpawnForm({ ...spawnForm, name: e.target.value })
                       }
                       className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-transparent text-foreground outline-none transition-all"
                       placeholder="Enter department name"
                       required
                     />
                   </div>

                   <div>
                     <label className="block text-xs font-bold text-foreground/60 mb-2">
                       Initial HOD Name
                     </label>
                     <input
                       type="text"
                       value={spawnForm.hodName}
                       onChange={(e) =>
                         setSpawnForm({ ...spawnForm, hodName: e.target.value })
                       }
                       className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-transparent text-foreground outline-none transition-all"
                       placeholder="e.g., Anthony Hackman"
                     />
                   </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground/60 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={spawnForm.description}
                      onChange={(e) =>
                        setSpawnForm({
                          ...spawnForm,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-transparent text-foreground outline-none transition-all h-[80px] resize-none"
                      placeholder="Enter department description"
                    />
                  </div>

<div className="flex justify-end gap-3">
                     <button
                       type="button"
                       onClick={closeSpawnModal}
                       className="flex-1 px-5 py-3 text-foreground font-black rounded-xl border border-border bg-muted/30 hover:bg-muted/20 transition-all"
                     >
                       Cancel
                     </button>
                    <button
                      type="submit"
                      className="flex-1 px-5 py-3 bg-brand-primary text-primary-foreground font-black rounded-xl hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/10"
                    >
                      Spawn Department
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeOperation && renderOperationModal()}
      </AnimatePresence>

      <AnimatePresence>
        {transferModal.isOpen && (
          <div
            key="transfer-modal"
            className="fixed inset-0 z-[600] flex items-center justify-center p-6"
          >
            <div className="absolute inset-0 bg-brand-dark/60 backdrop-blur-md transition-opacity duration-200 opacity-100" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-surface rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <header className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-primary text-primary-foreground rounded-2xl flex items-center justify-center">
                      <ArrowRight size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black italic font-display text-foreground leading-none mb-1">
                        Transfer Teacher
                      </h3>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest italic leading-none">
                        Select teacher to add to {transferModal.deptName}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeTransferModal}
                    className="p-2 text-muted-foreground hover:text-foreground transition-all"
                  >
                    <X size={24} />
                  </button>
                </header>

                <div className="space-y-6">
                  <p className="text-sm font-medium text-foreground/60 leading-relaxed">
                     Select a teacher from another department to transfer to this team.
                  </p>
<div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto scrollbar-hide">
                    {transferModal?.availableStaff?.map((staff) => (
                      <button
                        key={staff.id}
                        onClick={() => executeTransfer && executeTransfer(staff.id, transferModal.deptId)}
                        className="p-4 border border-border rounded-2xl text-left hover:border-border hover:bg-muted/30 transition-all group flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-muted/20 flex items-center justify-center text-foreground/60 font-black text-xs">
                            {staff.name?.trim().split(/\s+/).map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-sm font-black italic text-foreground block">
                              {staff.name}
                            </span>
                            <span className="text-xs font-medium text-muted-foreground">
                              {staff.currentDept}
                            </span>
                          </div>
                        </div>
                        <ChevronRight
                          size={16}
                          className="text-muted-foreground group-hover:text-foreground transition-all"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
</motion.div>
           </div>
         )}
       </AnimatePresence>
     </div>
   );
}

function AuditTrailLogs({ deptId }) {
   const [logs, setLogs] = React.useState([]);
   const [loading, setLoading] = React.useState(true);

   React.useEffect(() => {
     if (!deptId) return;
     setLoading(true);
     auditTrail.getHistory('department', deptId)
       .then(setLogs)
       .catch(() => setLogs([]))
       .finally(() => setLoading(false));
   }, [deptId]);

   if (loading) {
     return <p className="text-sm text-foreground/50 italic">Loading audit trail...</p>;
   }

   if (!logs || logs.length === 0) {
     return <p className="text-sm text-foreground/50 italic">No audit trail entries found for this department.</p>;
   }

   return logs.map((log, i) => (
     <div
       key={log.id || i}
       className="flex items-start gap-4 p-4 bg-muted/30 rounded-2xl"
     >
       <div className="w-2 h-2 rounded-full bg-success/100 mt-1.5 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
       <div>
         <p className="text-sm font-black italic text-foreground">
           {log.action || log.payload?.action || 'Action'}
         </p>
         <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
           {new Date(log.createdAt || log.timestamp || log.time).toLocaleString()} • {log.status || log.payload?.status || 'Completed'}
         </p>
         {log.payload?.description && (
           <p className="text-[9px] text-foreground/50 mt-1 truncate max-w-xs">
             {log.payload.description}
           </p>
         )}
       </div>
     </div>
   ));
 }

export default DepartmentManagementView;
