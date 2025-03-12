import React, { useContext, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet, useParams, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // ใช้ AuthContext ดึงข้อมูลผู้ใช้

const Layout = () => {
  const { user, selectedBranch } = useContext(AuthContext);
  const { branchId, patientId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // 🛠 ตรวจสอบสิทธิ์ของผู้ใช้ว่าเข้าได้เฉพาะสาขาที่ได้รับอนุญาต
  useEffect(() => {
    if (user && selectedBranch && branchId && selectedBranch !== branchId) {
      alert("คุณไม่มีสิทธิ์เข้าถึงสาขานี้");
      navigate("/dashboard");
    }
  }, [user, selectedBranch, branchId, navigate]);

  // ✅ แสดง Sidebar เฉพาะหน้าที่เกี่ยวข้อง
  const showSidebar = [
    "/dashboard",
    "/branch/",
    "/patient-detail",
    "/elderly-info",
    "/health-records",
    "/medicine-schedule",
    "/special-care",
    "/daily-activities",
    "/staff-info",
    "/work-schedule",
    "/nutrition-management",
    "/finance-management",
    "/security-management",
    "/my-work-schedule",
  ].some((path) => location.pathname.includes(path));

  return (
    <div className="layout">
      {/* ✅ แสดง Sidebar ถ้าอยู่ในหน้าที่เกี่ยวข้อง */}
      {showSidebar && <Sidebar patientId={patientId} branchId={branchId} />}

      <div className="main-content">
        <Header /> {/* ✅ เพิ่ม Header ที่มีปุ่ม Profile */}
        
        <div className="content">
          <Outlet /> {/* ✅ ใช้ Outlet เพื่อแสดงเนื้อหาของแต่ละหน้า */}
        </div>
      </div>
    </div>
  );
};

export default Layout;
