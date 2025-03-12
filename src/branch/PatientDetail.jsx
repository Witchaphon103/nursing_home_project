import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import "./style/PatientDetail.css";
import defaultAvatar from "../assets/images (6).jpeg"; 

const PatientDetail = () => {
  const { branchId, patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const patientRef = doc(db, "patients", patientId);
        const patientDoc = await getDoc(patientRef);

        if (patientDoc.exists()) {
          setPatient(patientDoc.data());
        } else {
          console.error("❌ ไม่พบข้อมูลผู้ป่วยนี้");
        }
      } catch (error) {
        console.error("🔥 Error fetching patient data:", error);
      }
    };

    fetchPatientDetails();
  }, [patientId]);

  return (
    <div className="patient-page">
      <h1>🩺 ข้อมูลผู้ป่วย</h1>

      {patient ? (
        <div className="patient-card">
          {/* 🔹 รูปโปรไฟล์ของผู้ป่วย */}
          <div className="patient-photo">
            <img src={patient.photoUrl || defaultAvatar} alt="รูปผู้ป่วย" />
          </div>

          {/* 🔹 ข้อมูลส่วนตัว */}
          <div className="patient-info">
            <h2>{patient.name}</h2>
            <p><strong>อายุ:</strong> {patient.age} ปี</p>
            <p><strong>เพศ:</strong> {patient.gender || "ไม่ระบุ"}</p>
            <p><strong>โรคประจำตัว:</strong> {patient.conditions || "ไม่มีข้อมูล"}</p>
            <p><strong>ข้อมูลเพิ่มเติม:</strong> {patient.notes || "ไม่มีข้อมูลเพิ่มเติม"}</p>
          </div>
        </div>
      ) : (
        <p>📌 กำลังโหลดข้อมูล...</p>
      )}

    </div>
  );
};

export default PatientDetail;
