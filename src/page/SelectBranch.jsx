import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../utils/firebase"; // นำเข้า Firestore
import "../Dashboard.css"; // เชื่อม CSS

const SelectBranch = () => {
  const navigate = useNavigate();
  const [selectedBranch, setSelectedBranch] = useState(""); // เก็บสาขาที่เลือก
  const [branches, setBranches] = useState([]); // รายชื่อสาขาจาก Firestore
  const [loading, setLoading] = useState(true); // เช็คสถานะการโหลด

  // ✅ โหลดข้อมูลสาขาจาก Firestore
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const branchCollection = await getDocs(collection(db, "branches"));
        const branchList = branchCollection.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBranches(branchList);
      } catch (error) {
        console.error("🔥 Error fetching branches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  // ✅ ฟังก์ชันเมื่อกดปุ่ม "Next"
  const handleSelectBranch = () => {
    if (!selectedBranch) {
      alert("⚠️ กรุณาเลือกสาขาก่อนดำเนินการต่อ!");
      return;
    }
    navigate(`/select-patient/${selectedBranch}`); // ไปหน้าถัดไปพร้อมกับสาขาที่เลือก
  };

  return (
    <div className="dashboard-container">
      <div className="main-content">
        <h1>🏢 เลือกสาขา</h1>

        {/* โหลดข้อมูลอยู่ */}
        {loading ? (
          <p>⏳ กำลังโหลดข้อมูลสาขา...</p>
        ) : (
          <>
            {/* Dropdown สำหรับเลือกสาขา */}
            <div className="dropdown-container">
              <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
                <option value="">-- เลือกสาขา --</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name} {/* แสดงชื่อสาขาจาก Firestore */}
                  </option>
                ))}
              </select>
            </div>

            {/* ปุ่มถัดไป */}
            <button className="next-btn" onClick={handleSelectBranch} disabled={!selectedBranch}>
              ➡️ ถัดไป
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SelectBranch;
