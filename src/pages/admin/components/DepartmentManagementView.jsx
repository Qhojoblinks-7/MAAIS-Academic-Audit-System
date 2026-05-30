import React from "react";
import { motion, AnimatePresence } from "framer-motion";
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
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        />
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
        >
          <div className="p-10">
            <header className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
<div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center">
                   {type === "Registry Transfer" && <ArrowRight size={24} />}
                   {type === "Credential Reset" && <RotateCcw size={24} />}
                   {type === "Audit Trail View" && <Search size={24} />}
                   {type === "Revoke Authority" && <ShieldCheck size={24} />}
                   {type === "Deep Archive" && <Trash2 size={24} />}
                   {type === "Authorize Template Update" && <FileText size={24} />}
                 </div>
                <div>
                  <h3 className="text-xl font-black italic font-display text-slate-900 leading-none mb-1">
                    {type}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic leading-none">
                    Node: {staffName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveOperation(null)}
                className="p-2 text-slate-300 hover:text-slate-900 transition-all"
              >
                <X size={24} />
              </button>
            </header>

            {type === "Registry Transfer" && (
              <div className="space-y-6">
                <p className="text-sm font-medium text-slate-600 leading-relaxed">
                  Select the destination cluster for this faculty node. This
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
                        className="p-4 border border-slate-100 rounded-2xl text-left hover:border-slate-300 hover:bg-slate-50 transition-all group flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-1.5 h-6 rounded-full ${d.color}`}
                          />
                          <span className="text-[13px] font-black italic text-slate-900">
                            {d.name} Cluster
                          </span>
                        </div>
                        <ChevronRight
                          size={16}
                          className="text-slate-300 group-hover:text-slate-900 transition-all"
                        />
                      </button>
                    ))}
                </div>
              </div>
            )}

            {type === "Credential Reset" && (
              <div className="space-y-8">
                <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100">
                  <p className="text-sm font-medium text-amber-900 leading-relaxed">
                    This will invalidate current session tokens and generate a
                    temporary institutional access key for{" "}
                    <span className="font-black italic underline">
                      {staffName}
                    </span>
                    .
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                    Authentication Required
                  </p>
                  <button
                    onClick={performCredentialReset}
                    className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl text-[11px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/20 cursor-pointer"
                  >
                    Authorize Reset Protocol
                  </button>
                </div>
              </div>
            )}

            {type === "Audit Trail View" && (
              <div className="space-y-6">
                <div className="space-y-4">
                  {[
                    {
                      action: "Mark Validation",
                      time: "2 hours ago",
                      status: "Success",
                    },
                    {
                      action: "Registry Entry",
                      time: "Yesterday, 14:20",
                      status: "Verified",
                    },
                    {
                      action: "Login Attempt",
                      time: "Oct 22, 09:12",
                      status: "Authenticated",
                    },
                  ].map((log, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl"
                    >
                      <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <div>
                        <p className="text-sm font-black italic text-slate-900">
                          {log.action}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {log.time} • {log.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={async () => {
                    const result = await generateFullForensicReport(selectedDept?.id, selectedDept?.name);
                    setAlert({ isOpen: true, title: 'Forensic Report Generated', message: result.message, type: result.success ? 'success' : 'info' });
                  }}
                  className="w-full py-4 border border-slate-200 text-slate-900 font-black rounded-2xl text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Generate Full Forensic Report
                </button>
              </div>
            )}

            {type === "Revoke Authority" && (
              <div className="space-y-8 text-center">
                <p className="text-slate-500 font-medium leading-relaxed italic px-4">
                  Confirmed: strip{" "}
                  <span className="text-slate-900 font-black italic">
                    "{staffName}"
                  </span>{" "}
                  of all HOD management tokens and administrative oversight?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setActiveOperation(null)}
                    className="flex-1 py-4 bg-slate-50 text-slate-900 font-black rounded-2xl text-[11px] uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRevokeAuthority}
                    className="flex-1 py-4 bg-rose-600 text-white font-black rounded-2xl text-[11px] uppercase tracking-widest hover:bg-rose-700 shadow-xl shadow-rose-600/20 cursor-pointer"
                  >
                    Revoke Authority
                  </button>
                </div>
              </div>
            )}

{type === "Deep Archive" && (
               <div className="space-y-8 text-center">
                 <div className="p-6 bg-slate-900 text-white rounded-[2rem] text-left">
                   <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-3">
                     Protocol Implications
                   </p>
                   <ul className="space-y-3">
                     {[
                       "Preservation of academic records",
                       "Inactivation of login permissions",
                       "Node removal from active registry",
                     ].map((text, i) => (
                       <li
                         key={i}
                         className="flex items-center gap-3 text-[11px] font-bold italic"
                       >
                         <ShieldCheck size={14} className="text-emerald-400" />
                         {text}
                       </li>
                     ))}
                   </ul>
                 </div>
                 <div className="flex gap-3">
                   <button
                     onClick={() => setActiveOperation(null)}
                     className="flex-1 py-4 bg-slate-50 text-slate-900 font-black rounded-2xl text-[11px] uppercase tracking-widest"
                   >
                     Abort
                   </button>
                   <button
                     onClick={handleDeepArchive}
                     className="flex-1 py-4 bg-slate-900 text-white font-black rounded-2xl text-[11px] uppercase tracking-widest cursor-pointer"
                   >
                     Initiate Archive
                   </button>
                 </div>
               </div>
             )}

             {type === "Authorize Template Update" && (
               <div className="space-y-6">
                 <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
                   <p className="text-sm font-medium text-blue-900 leading-relaxed">
                     Authorize template updates for{" "}
                     <span className="font-black italic underline">
                       {staffName}
                     </span>{" "}
                     at the 20% threshold level. This will permit limited template modifications while maintaining audit trail integrity.
                   </p>
                 </div>
                 <div className="space-y-3">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                     Authorization Required
                   </p>
                   <button
                     onClick={handleAuthorizeTemplateUpdate}
                     className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl text-[11px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/20 cursor-pointer"
                   >
                     Authorize Template Update (20%)
                   </button>
                 </div>
               </div>
             )}
          </div>
          <div className="bg-slate-50 py-5 text-center border-t border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
              Institutional Protocol: Level 4 Authorized
            </p>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden relative">
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
            className="flex-1 flex flex-col bg-white overflow-hidden"
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
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10 text-center">
                <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner ring-1 ring-amber-100">
                  <Crown size={40} className="fill-amber-500/20" />
                </div>

                <h3 className="text-2xl font-black italic font-display text-slate-900 tracking-tight leading-none mb-3">
                  Authority Elevation
                </h3>
                <p className="text-slate-500 font-bold leading-relaxed mb-10 px-4 text-sm">
                  Elevate{" "}
                  <span className="text-slate-900 font-black italic">
                    "{assigningHOD.staffName}"
                  </span>{" "}
                  to Head of Department for {assigningHOD.deptName}?
                </p>

                <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 mb-10 text-left">
                  <div className="flex items-center gap-3 mb-3">
                    <ShieldCheck size={16} className="text-emerald-600" />
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                      Granted Token Permissions
                    </p>
                  </div>
                  <ul className="space-y-2">
                    <li className="text-[11px] font-medium text-slate-500 flex items-center gap-2 italic">
                      <div className="w-1 h-1 rounded-full bg-slate-300" />
                      validation of Cluster Assessment Matrices
                    </li>
                    <li className="text-[11px] font-medium text-slate-500 flex items-center gap-2 italic">
                      <div className="w-1 h-1 rounded-full bg-slate-300" />
                      Registry Certification Authority
                    </li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setAssigningHOD(null)}
                    className="flex-1 py-4 bg-slate-50 text-slate-900 font-black rounded-2xl text-[11px] uppercase tracking-widest border border-slate-200/50"
                  >
                    Abort
                  </button>
                  <button
                    onClick={confirmAssignment}
                    className="flex-1 py-4 bg-slate-900 text-white font-black rounded-2xl text-[11px] uppercase tracking-widest"
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
             <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={closeSpawnModal}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
             />
             <motion.div
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
             >
               <div className="p-10">
                 <div className="flex items-center justify-between mb-6">
                   <h3 className="text-xl font-black italic font-display text-slate-900">
                     Spawn Department
                   </h3>
                   <button
                     type="button"
                     onClick={closeSpawnModal}
                     className="p-2 text-slate-300 hover:text-slate-900 transition-all"
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
                    <label className="block text-[10px] font-bold text-slate-600 mb-2">
                      Department Name
                    </label>
                    <input
                      type="text"
                      value={spawnForm.name}
                      onChange={(e) =>
                        setSpawnForm({ ...spawnForm, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 outline-none transition-all"
                      placeholder="Enter department name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-2">
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
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 outline-none transition-all h-[80px] resize-none"
                      placeholder="Enter department description"
                    />
                  </div>

<div className="flex justify-end gap-3">
                     <button
                       type="button"
                       onClick={closeSpawnModal}
                       className="flex-1 px-5 py-3 text-slate-900 font-black rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all"
                     >
                       Cancel
                     </button>
                    <button
                      type="submit"
                      className="flex-1 px-5 py-3 bg-slate-900 text-white font-black rounded-xl hover:bg-black transition-all shadow-lg shadow-slate-900/10"
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeTransferModal}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <header className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center">
                      <ArrowRight size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black italic font-display text-slate-900 leading-none mb-1">
                        Transfer Teacher
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic leading-none">
                        Select teacher to add to {transferModal.deptName}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeTransferModal}
                    className="p-2 text-slate-300 hover:text-slate-900 transition-all"
                  >
                    <X size={24} />
                  </button>
                </header>

                <div className="space-y-6">
                  <p className="text-sm font-medium text-slate-600 leading-relaxed">
                    Select a teacher from another department to transfer to this cluster.
                  </p>
<div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto">
                    {transferModal?.availableStaff?.map((staff) => (
                      <button
                        key={staff.id}
                        onClick={() => executeTransfer && executeTransfer(staff.id, transferModal.deptId)}
                        className="p-4 border border-slate-100 rounded-2xl text-left hover:border-slate-300 hover:bg-slate-50 transition-all group flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-black text-[10px]">
                            {staff.name?.trim().split(/\s+/).map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-[13px] font-black italic text-slate-900 block">
                              {staff.name}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400">
                              {staff.currentDept}
                            </span>
                          </div>
                        </div>
                        <ChevronRight
                          size={16}
                          className="text-slate-300 group-hover:text-slate-900 transition-all"
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

export default DepartmentManagementView;