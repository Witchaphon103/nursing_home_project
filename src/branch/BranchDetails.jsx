import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../utils/firebase";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import "./style/BranchDetails.css";

const BranchDetails = () => {
  const { branchId } = useParams();
  const [branch, setBranch] = useState(null);
  const [patients, setPatients] = useState([]); // รายชื่อผู้ป่วย
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBranchDetails = async () => {
      try {
        // 🔹 ดึงข้อมูลของสาขาจาก Firestore
        const branchDoc = await getDoc(doc(db, "branches", branchId));
        if (branchDoc.exists()) {
          setBranch(branchDoc.data());
        } else {
          console.error("❌ ไม่พบข้อมูลสาขานี้");
        }

        // 🔹 ดึงรายชื่อผู้ป่วยที่อยู่ในสาขานี้
        const patientQuery = query(collection(db, "patients"), where("branch", "==", branchId));
        const patientSnapshot = await getDocs(patientQuery);
        const patientList = patientSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPatients(patientList);
      } catch (error) {
        console.error("🔥 Error fetching data:", error);
      }
    };

    fetchBranchDetails();
  }, [branchId]);

  return (
    <div className="branch-details-container">
      

      {/* Main Content */}
      <div className="main-content">
       

        {/* Content */}
        <div className="branch-details-content">
          {branch ? (
            <>
              <h2>{branch.name}</h2>
              <p>{branch.description || "ไม่มีข้อมูลเพิ่มเติม"}</p>
            </>
          ) : (
            <p>📌 กำลังโหลดข้อมูลสาขา...</p>
          )}

          {/* 🔹 รายชื่อผู้ป่วย */}
          <h3>📋 รายชื่อผู้ป่วยในสาขานี้:</h3>
          {patients.length > 0 ? (
            <ul className="patient-list">
              {patients.map((patient) => (
                <li key={patient.id} onClick={() => navigate(`/patient-detail/${branchId}/${patient.id}`)}>
                  🏥 {patient.name} - อายุ {patient.age} ปี
                </li>
              ))}
            </ul>
          ) : (
            <p>❌ ไม่มีข้อมูลผู้ป่วย</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BranchDetails;
