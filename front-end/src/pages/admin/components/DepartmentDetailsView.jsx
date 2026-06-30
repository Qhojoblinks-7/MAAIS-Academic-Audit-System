import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StaffTab } from "../StaffTab";
import { DepartmentTabs } from "../DepartmentTabs";

export function DepartmentDetailsView({
  departments,
  selectedDept,
  activeTab,
  setActiveTab,
  openKebabId,
  toggleKebab,
  handleAssignHOD,
  handleNodeOperation,
  openTransferModal,
}) {
  return (
    <div className="flex-1 overflow-y-auto p-8 lg:p-12 bg-slate-50/30 scrollbar-hide">
      <div className="max-w-4xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.3, ease: "circOut" }}
          >
            {activeTab === "staff" && (
              <StaffTab
                selectedDept={selectedDept}
                departments={departments}
                openKebabId={openKebabId}
                toggleKebab={toggleKebab}
                handleAssignHOD={handleAssignHOD}
                handleNodeOperation={handleNodeOperation}
                onTransferTeacher={openTransferModal}
              />
            )}
{(activeTab === "grading" || activeTab === "vault") && (
               <DepartmentTabs
                 selectedDept={selectedDept}
                 activeTab={activeTab}
                 setActiveTab={setActiveTab}
                 handleNodeOperation={handleNodeOperation}
               />
             )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default DepartmentDetailsView;