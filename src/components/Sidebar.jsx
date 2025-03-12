import React, { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; 
import { 
  FaUserNurse, FaClipboardList, FaUtensils, FaMoneyBillWave, 
  FaShieldAlt, FaChartBar, FaArrowLeft, FaUser, FaNotesMedical, 
  FaPills, FaHeartbeat, FaWalking 
} from "react-icons/fa";
import "./style/Sidebar.css";

const Sidebar = ({ patientId, branchId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedBranch, userRole, loading } = useContext(AuthContext);

  // 📌 Debug เช็คค่า Role ของผู้ใช้
  console.log("🔍 User Role:", userRole);

  // ✅ ถ้ายังโหลดไม่เสร็จ ให้แสดงข้อความรอ
  if (loading) {
    return <p className="sidebar-loading">กำลังโหลดข้อมูล...</p>;
  }

  // ✅ ถ้าไม่มี role หรือไม่ได้ล็อกอิน ไม่แสดง Sidebar
  if (!userRole) {
    return null;
  }

  // ✅ เช็คว่าอยู่ในหน้าที่เกี่ยวข้องกับผู้ป่วยหรือไม่
  const isPatientPage = [
    "/patient-detail",
    "/elderly-info",
    "/health-records",
    "/medicine-schedule",
    "/special-care",
    "/daily-activities",
    "/my-work-schedule"
  ].some(path => location.pathname.includes(path));

  // 📌 เมนูหลัก กำหนด role ที่เข้าถึงได้
  const menuItems = [
    { path: "/dashboard", label: "เลือกสาขา", icon: <FaUserNurse />, roles: ["employee", "staff", "admin", "owner"] },
    { path: "/staff-info", label: "ข้อมูลเจ้าหน้าที่", icon: <FaUserNurse />, roles: ["admin", "owner"] },
    {path: "/my-work-schedule", label: "ตารางเวรพนักงาน", icon: <FaUserNurse />, roles: ["employee","staff","admin", "owner"] },
    { path: "/work-schedule", label: "ตารางเวรงาน", icon: <FaClipboardList />, roles: ["admin", "owner"] },
    { path: "/nutrition-management", label: "การจัดการอาหารและโภชนาการ", icon: <FaUtensils />, roles: ["employee", "staff", "admin", "owner"] },
    { path: "/finance-management", label: "การเงินและค่าใช้จ่าย", icon: <FaMoneyBillWave />, roles: ["owner"] },
    { path: "/security-management", label: "ระบบรักษาความปลอดภัย", icon: <FaShieldAlt />, roles: ["admin", "owner"] },
  ];

  // 📌 เมนูสำหรับผู้สูงอายุ (จะแสดงเฉพาะถ้าอยู่ในหน้าที่เกี่ยวข้อง)
  const patientMenu = [
    { path: `/elderly-info/${patientId}`, label: "ข้อมูลส่วนตัว", icon: <FaUser />, roles: ["employee", "staff", "admin", "owner"] },
    { path: `/health-records/${patientId}`, label: "บันทึกสุขภาพ", icon: <FaNotesMedical />, roles: ["employee","staff", "admin", "owner"] },
    { path: `/medicine-schedule/${patientId}`, label: "ตารางการรับประทานยา", icon: <FaPills />, roles: ["employee", "staff", "admin", "owner"] },
    { path: `/special-care/${patientId}`, label: "การดูแลพิเศษ", icon: <FaHeartbeat />, roles: ["employee", "staff", "admin", "owner"] },
    { path: `/daily-activities/${patientId}`, label: "กิจกรรมประจำวัน", icon: <FaWalking />, roles: ["employee", "staff", "admin", "owner"] },
  ];

  return (
    <div className="sidebar">
      <h2>Nursing Home</h2>
      <ul>
        {/* ✅ แสดงเฉพาะเมนูที่ userRole มีสิทธิ์เข้าถึง */}
        {!isPatientPage &&
          menuItems
            .filter(item => item.roles.includes(userRole))
            .map((item) => (
              <li key={item.path} className={location.pathname.includes(item.path) ? "active" : ""} onClick={() => navigate(item.path)}>
                {item.icon} {item.label}
              </li>
            ))}

        {/* 🏥 เมนูสำหรับผู้สูงอายุ */}
        {isPatientPage && patientId && branchId && (
          <>
            <h3>📌 เมนูผู้สูงอายุ</h3>
            {patientMenu
              .filter(item => item.roles.includes(userRole))
              .map((item) => (
                <li key={item.path} className={location.pathname.includes(item.path) ? "active" : ""} onClick={() => navigate(item.path)}>
                  {item.icon} {item.label}
                </li>
              ))}
          </>
        )}

        {/* 🔙 ปุ่มย้อนกลับ */}
        <li className="back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> ย้อนกลับ
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
