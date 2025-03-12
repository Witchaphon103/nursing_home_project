import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { signOut, updateProfile } from "firebase/auth";
import { auth, db } from "../utils/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const Header = () => {
  const { user, userRole, selectedBranch } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showProfile, setShowProfile] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [staffDetails, setStaffDetails] = useState({
    fullName: user?.displayName || "",
    branchAssigned: selectedBranch || "",
    position: "",
    startDate: "",
    phoneNumber: "",
    address: "",
    birthDate: "",
    age: "",
    status: "ทำงานอยู่",
    bankName: "",
    bankAccount: "",
    accountHolder: "",
    idCard: "",
  });

  // ✅ กำหนดตำแหน่งโดยอิงจาก `userRole`
  useEffect(() => {
    setStaffDetails((prevDetails) => ({
      ...prevDetails,
      position: getPositionFromRole(userRole), // กำหนดตำแหน่งอัตโนมัติ
    }));
  }, [userRole]);

  // ✅ ฟังก์ชันกำหนดตำแหน่งตาม role
  const getPositionFromRole = (role) => {
    switch (role) {
      case "owner":
        return "ผู้ดูแลระบบ";
      case "admin":
        return "พยาบาล";
      case "staff":
        return "พนักงานทั่วไป";
      case "employee":
        return "พนักงาน";
      default:
        return "ไม่ระบุ";
    }
  };

  useEffect(() => {
    const fetchStaffDetails = async () => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setStaffDetails(userSnap.data());
          }
        } catch (error) {
          console.error("❌ Error fetching staff details:", error);
        }
      }
    };
    fetchStaffDetails();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      if (user) {
        await updateProfile(auth.currentUser, { displayName: staffDetails.fullName });

        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, staffDetails);

        alert("✅ บันทึกข้อมูลสำเร็จ!");
        setShowForm(false);
      }
    } catch (error) {
      console.error("❌ Error saving staff details:", error);
      alert("⚠️ ไม่สามารถบันทึกข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="dashboard-header">
      <h1>ระบบจัดการข้อมูล</h1>
      <div className="profile-section">
        <img
          src={user?.photoURL || "/default-profile.png"}
          alt="Profile"
          className="profile-pic"
          onClick={() => setShowProfile(!showProfile)}
        />
        {showProfile && (
          <div className="profile-dropdown">
            <p><strong>👤 ชื่อผู้ใช้:</strong> {user?.displayName || "N/A"}</p>
            <p><strong>📧 อีเมล:</strong> {user?.email}</p>
            <p><strong>🧑‍💼 ตำแหน่ง:</strong> {staffDetails.role || "ไม่ระบุ"}</p>
            <p><strong>📍 สาขาที่ประจำอยู่:</strong> {selectedBranch || "ไม่ได้ระบุ"}</p>

            <button onClick={() => setShowForm(true)} className="settings-btn">📝 แก้ไขข้อมูล</button>
            <button onClick={handleLogout} className="logout-btn">🚪 ออกจากระบบ</button>
          </div>
        )}
      </div>

      {/* ✅ ฟอร์มแก้ไขข้อมูล */}
      {showForm && (
        <div className="edit-form">
          <h3>📝 แก้ไขข้อมูลพนักงาน</h3>
          <form onSubmit={(e) => { e.preventDefault(); handleSaveChanges(); }}>
            <div className="form-section">
              <h4>📌 ข้อมูลส่วนตัว</h4>
              <label>👤 ชื่อ-นามสกุล</label>
              <input
                type="text"
                value={staffDetails.fullName}
                onChange={(e) => setStaffDetails({ ...staffDetails, fullName: e.target.value })}
              />

              <label>📍 สาขาที่ประจำอยู่</label>
              <input
                type="text"
                value={staffDetails.branchAssigned}
                onChange={(e) => setStaffDetails({ ...staffDetails, branchAssigned: e.target.value })}
              />

              <label>🧑‍💼 ตำแหน่ง</label>
              <input
                type="text"
                value={staffDetails.position}
                disabled // 🔹 ป้องกันไม่ให้เปลี่ยนตำแหน่งเอง
              />

              <label>📅 วันที่เริ่มงาน</label>
              <input
                type="date"
                value={staffDetails.startDate}
                onChange={(e) => setStaffDetails({ ...staffDetails, startDate: e.target.value })}
              />

              <label>📞 เบอร์โทรศัพท์</label>
              <input
                type="text"
                value={staffDetails.phoneNumber}
                onChange={(e) => setStaffDetails({ ...staffDetails, phoneNumber: e.target.value })}
              />

              <label>🏡 ที่อยู่</label>
              <input
                type="text"
                value={staffDetails.address}
                onChange={(e) => setStaffDetails({ ...staffDetails, address: e.target.value })}
              />
            </div>

            <div className="form-section">
              <h4>🏦 ข้อมูลธนาคาร</h4>
              <label>🏦 ธนาคาร</label>
              <input
                type="text"
                value={staffDetails.bankName}
                onChange={(e) => setStaffDetails({ ...staffDetails, bankName: e.target.value })}
              />

              <label>🏦 เลขบัญชี</label>
              <input
                type="text"
                value={staffDetails.bankAccount}
                onChange={(e) => setStaffDetails({ ...staffDetails, bankAccount: e.target.value })}
              />

              <label>🏦 ชื่อบัญชี</label>
              <input
                type="text"
                value={staffDetails.accountHolder}
                onChange={(e) => setStaffDetails({ ...staffDetails, accountHolder: e.target.value })}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="save-btn" disabled={loading}>
                {loading ? "⏳ กำลังบันทึก..." : "💾 บันทึก"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="cancel-btn">❌ ยกเลิก</button>
            </div>
          </form>
        </div>
      )}
    </header>
  );
};

export default Header;
