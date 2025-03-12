import React from "react";
import "./styles/global.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./login_system/Login";
import Dashboard from "./Dashboard";
import SelectBranch from "./page/SelectBranch";
import SelectPatient from "./page/SelectPatient";
import PatientDetail from "./branch/PatientDetail";
import BranchDetails from "./branch/BranchDetails";
import Layout from "./components/Layout"; 
import { AuthProvider } from "./context/AuthContext"; 

// 📌 หน้าข้อมูลของผู้ป่วย
import ElderlyInfo from "./page/ElderlyInfo";
import HealthRecords from "./page/HealthRecords";
import MedicineSchedule from "./page/MedicineSchedule";
import SpecialCare from "./page/SpecialCare";
import DailyActivities from "./page/DailyActivities";

// 📌 หน้าเมนูหลักจาก Sidebar
import StaffInfo from "./page/StaffInfo";
import WorkSchedule from "./page/WorkSchedule";
import NutritionManagement from "./page/NutritionManagement";
import FinanceManagement from "./page/FinanceManagement";
import SecurityManagement from "./page/SecurityManagement";
import MyWorkSchedule from "./page/MyWorkSchedule";

// 📌 ตั้งค่าการใช้งาน Routing
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ✅ หน้า Login (ไม่มี Layout) */}
          <Route path="/" element={<Login />} />

          {/* ✅ ใช้ Layout กับหน้า Dashboard และเมนูต่างๆ */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/branch/:branchId" element={<BranchDetails />} />
            <Route path="/select-branch" element={<SelectBranch />} />
            <Route path="/select-patient/:branchId" element={<SelectPatient />} />
            <Route path="/patient-detail/:branchId/:patientId" element={<PatientDetail />} />

            {/* ✅ Dynamic Routes สำหรับข้อมูลผู้ป่วย */}
            <Route path="/elderly-info/:patientId" element={<ElderlyInfo />} />
            <Route path="/health-records/:patientId" element={<HealthRecords />} />
            <Route path="/medicine-schedule/:patientId" element={<MedicineSchedule />} />
            <Route path="/special-care/:patientId" element={<SpecialCare />} />
            <Route path="/daily-activities/:patientId" element={<DailyActivities />} />

            {/* ✅ เพิ่มหน้าเมนูจาก Sidebar */}
            <Route path="/staff-info" element={<StaffInfo />} />
            <Route path="/work-schedule" element={<WorkSchedule />} />
            <Route path="/nutrition-management" element={<NutritionManagement />} />
            <Route path="/finance-management" element={<FinanceManagement />} />
            <Route path="/security-management" element={<SecurityManagement />} />
            <Route path="/my-work-schedule" element={<MyWorkSchedule />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
