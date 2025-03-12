import React, { useState, useEffect } from "react";
import { db } from "../utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import "./style/StaffInfo.css"; // นำเข้าไฟล์ CSS

const StaffInfo = () => {
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffDetails, setSelectedStaffDetails] = useState(null);

  // ดึงข้อมูลพนักงานจาก Firestore
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const staffData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setStaffList(staffData);
      } catch (error) {
        console.error("❌ Error fetching staff:", error);
      }
    };
    fetchStaff();
  }, []);

  return (
    <div>
      <h3>👥 รายชื่อพนักงาน</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
        {staffList.map((staff) => (
          <div
            key={staff.id}
            style={{ border: "1px solid #ccc", padding: "10px", textAlign: "center", cursor: "pointer", borderRadius: "10px", boxShadow: "2px 2px 10px rgba(0,0,0,0.1)" }}
            onClick={() => setSelectedStaffDetails(staff)}
          >
            <img
              src={staff.profilePicture || "/default-profile.png"}
              alt={staff.fullName}
              style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover" }}
            />
            <h4>{staff.fullName}</h4>
            <p>📍 สาขา: {staff.branchAssigned}</p>
            <p>🧑‍💼 ตำแหน่ง: {staff.position || "ไม่ระบุ"}</p>
          </div>
        ))}
      </div>

      {/* แสดงรายละเอียดพนักงานที่เลือก */}
      {selectedStaffDetails && (
        <div className="staff-details" style={{ marginTop: "20px", padding: "15px", borderRadius: "10px", boxShadow: "2px 2px 10px rgba(0,0,0,0.1)", backgroundColor: "#fff" }}>
          <h3>📌 รายละเอียดพนักงาน</h3>
          <img
            src={selectedStaffDetails.profilePicture || "/default-profile.png"}
            alt={selectedStaffDetails.fullName}
            style={{ width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover" }}
          />
          <p><strong>👤 ชื่อ:</strong> {selectedStaffDetails.fullName}</p>
          <p><strong>📍 สาขา:</strong> {selectedStaffDetails.branchAssigned}</p>
          <p><strong>🧑‍💼 ตำแหน่ง:</strong> {selectedStaffDetails.role || "ไม่ระบุ"}</p>
          <p><strong>📅 วันที่เริ่มงาน:</strong> {selectedStaffDetails.startDate || "ไม่ระบุ"}</p>
          <p><strong>📧 อีเมล:</strong> {selectedStaffDetails.email || "ไม่ระบุ"}</p>
          <p><strong>📞 โทร:</strong> {selectedStaffDetails.phoneNumber || "ไม่ระบุ"}</p>
          <p><strong>🏡 ที่อยู่:</strong> {selectedStaffDetails.address || "ไม่ระบุ"}</p>
          <p><strong>🎂 วันเกิด:</strong> {selectedStaffDetails.birthDate || "ไม่ระบุ"}</p>
          <p><strong>🆔 เลขบัตรประชาชน:</strong> {selectedStaffDetails.idCard || "ไม่ระบุ"}</p>
          <p><strong>🔹 อายุ:</strong> {selectedStaffDetails.age ? `${selectedStaffDetails.age} ปี` : "ไม่ระบุ"}</p>
          <p><strong>📌 สถานะ:</strong> {selectedStaffDetails.status || "ทำงานอยู่"}</p>
          <p><strong>🏦 ธนาคาร:</strong> {selectedStaffDetails.bankName || "ไม่ระบุ"}</p>
          <p><strong>🏦 เลขบัญชี:</strong> {selectedStaffDetails.bankAccount || "ไม่ระบุ"}</p>
          <p><strong>🏦 ชื่อบัญชี:</strong> {selectedStaffDetails.accountHolder || "ไม่ระบุ"}</p>
          <button onClick={() => setSelectedStaffDetails(null)} style={{ padding: "10px 15px", backgroundColor: "#d9534f", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", marginTop: "10px" }}>
            ❌ ปิด
          </button>
        </div>
      )}
    </div>
  );
};

export default StaffInfo;
