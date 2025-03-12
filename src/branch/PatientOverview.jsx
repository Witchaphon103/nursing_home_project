import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./style/PatientOverview.css"; 

const PatientOverview = () => {
  const { branchId, patientId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="patient-overview-container">
      <h1>🩺 รายละเอียดผู้ป่วย</h1>
      <p>คุณต้องการทำอะไรต่อไป?</p>

      {/* ปุ่มไปดูข้อมูลผู้ป่วย */}
      <button onClick={() => navigate(`/patient-detail/${branchId}/${patientId}`)} className="detail-btn">
        📄 ดูข้อมูลผู้ป่วย
      </button>

      {/* ปุ่มกลับไปที่หน้าสาขา */}
      <button onClick={() => navigate(`/branch/${branchId}`)} className="back-btn">
        ⬅️ กลับไปเลือกผู้ป่วย
      </button>
    </div>
  );
};

export default PatientOverview;
