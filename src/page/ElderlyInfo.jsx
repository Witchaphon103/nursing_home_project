import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db, auth } from "../utils/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import "./style/ElderlyInfo.css";

const ElderlyInfo = () => {
  const { patientId } = useParams();
  const [elderly, setElderly] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const fetchElderlyData = async () => {
      try {
        const docRef = doc(db, "elderly", patientId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setElderly(docSnap.data());
          setFormData(docSnap.data());
        } else {
          console.error("❌ ไม่พบข้อมูลของผู้สูงอายุนี้");
        }
      } catch (error) {
        console.error("🔥 Error fetching elderly data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchElderlyData();
  }, [patientId]);

  useEffect(() => {
    const fetchUserRole = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role || "user");
          }
        } catch (error) {
          console.error("🔥 Error fetching user role:", error);
        }
      }
    };

    fetchUserRole();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!formData) return alert("⚠️ กรุณากรอกข้อมูลให้ครบถ้วน!");

    try {
      await updateDoc(doc(db, "elderly", patientId), formData);
      setElderly(formData);
      setIsEditing(false);
      alert("✅ บันทึกข้อมูลสำเร็จ!");
    } catch (error) {
      console.error("🚨 เกิดข้อผิดพลาดในการบันทึกข้อมูล:", error);
    }
  };

  if (loading) {
    return <div className="profile-container"><p>📌 กำลังโหลดข้อมูล...</p></div>;
  }

  if (!elderly) {
    return <div className="profile-container"><p>❌ ไม่พบข้อมูลของผู้สูงอายุนี้</p></div>;
  }

  return (
    <div className="profile-container">
      <h1>👴 ข้อมูลส่วนตัวผู้สูงอายุ</h1>

      <div className="profile-card">
        <div className="profile-photo">
          <img
            src={elderly.photoUrl || "/default-profile.png"}
            alt="รูปถ่ายผู้สูงอายุ"
          />
        </div>

        <div className="profile-section">
          <h2>📋 ข้อมูลทั่วไป</h2>
          {isEditing ? (
            <>
              <label>ชื่อ-นามสกุล:</label>
              <input type="text" name="name" value={formData.name || ""} onChange={handleChange} />

              <label>วันเกิด:</label>
              <input type="date" name="dateOfBirth" value={formData.dateOfBirth || ""} onChange={handleChange} />

              <label>อายุ:</label>
              <input type="number" name="age" value={formData.age || ""} onChange={handleChange} />

              <label>เพศ:</label>
              <select name="gender" value={formData.gender || ""} onChange={handleChange}>
                <option value="">เลือกเพศ</option>
                <option value="ชาย">ชาย</option>
                <option value="หญิง">หญิง</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
            </>
          ) : (
            <>
              <p><strong>ชื่อ-นามสกุล:</strong> {elderly?.name || "ไม่ระบุ"}</p>
              <p><strong>วันเกิด:</strong> {elderly?.dateOfBirth || "ไม่ระบุ"}</p>
              <p><strong>อายุ:</strong> {elderly?.age ? `${elderly.age} ปี` : "ไม่ระบุ"}</p>
              <p><strong>เพศ:</strong> {elderly?.gender || "ไม่ระบุ"}</p>
            </>
          )}
        </div>
        <div className="profile-section">
          <h2>🩺 ข้อมูลสุขภาพ</h2>
          {isEditing ? (
            <>
              <label>โรคประจำตัว:</label>
              <input type="text" name="medicalConditions" value={formData.medicalConditions || ""} onChange={handleChange} />

              <label>ภาวะสุขภาพพิเศษ:</label>
              <input type="text" name="specialConditions" value={formData.specialConditions || ""} onChange={handleChange} />

              <label>การเคลื่อนไหว:</label>
              <input type="text" name="mobility" value={formData.mobility || ""} onChange={handleChange} />

              <label>ประวัติการแพ้ยา/อาหาร:</label>
              <input type="text" name="allergies" value={formData.allergies || ""} onChange={handleChange} />
            </>
          ) : (
            <>
              <p><strong>โรคประจำตัว:</strong> {elderly?.medicalConditions || "ไม่ระบุ"}</p>
              <p><strong>ภาวะสุขภาพพิเศษ:</strong> {elderly?.specialConditions || "ไม่ระบุ"}</p>
              <p><strong>การเคลื่อนไหว:</strong> {elderly?.mobility || "ไม่ระบุ"}</p>
              <p><strong>ประวัติการแพ้ยา/อาหาร:</strong> {elderly?.allergies || "ไม่ระบุ"}</p>
            </>
          )}
        </div>
        <div className="profile-section">
          <h2>📞 ข้อมูลผู้ดูแล</h2>
          {isEditing ? (
            <>
                <label>ที่อยู่ปัจจุบัน:</label>
                  <input
                    type="text"
                    name="currentAddress"
                    value={formData.currentAddress || ""}
                    onChange={handleChange}
                  />
              <label>ชื่อผู้ดูแล:</label>
              <input
                type="text"
                name="caregiver.name"
                value={formData.caregiver?.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, caregiver: { ...formData.caregiver, name: e.target.value } })
                }
              />
              <label>อีเมล:</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ""}
                    onChange={handleChange}
                  />
              <label>เบอร์โทรศัพท์ผู้ดูแล:</label>
              <input
                type="text"
                name="caregiver.phone"
                value={formData.caregiver?.phone || ""}
                onChange={(e) =>
                  setFormData({ ...formData, caregiver: { ...formData.caregiver, phone: e.target.value } })
                }
              />

              <label>ความสัมพันธ์กับผู้สูงอายุ:</label>
                  <input
                    type="text"
                    name="caregiver.relationship"
                    value={formData.caregiver?.relationship || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      caregiver: { ...formData.caregiver, relationship: e.target.value }
                    })}
                  />
            </>
          ) : (
            <>
              <p><strong>ชื่อผู้ดูแล:</strong> {elderly?.caregiver?.name || "ไม่ระบุ"}</p>
              <p><strong>เบอร์โทรศัพท์ผู้ดูแล:</strong> {elderly?.caregiver?.phone || "ไม่ระบุ"}</p>
              <p><strong>ที่อยู่ปัจจุบัน:</strong> {elderly.currentAddress || "ไม่ระบุ"}</p>
              <p><strong>อีเมล:</strong> {elderly.email || "ไม่ระบุ"}</p>
              <p><strong>ความสัมพันธ์:</strong> {elderly.caregiver?.relationship || "ไม่ระบุ"}</p>
            </>
          )}
        </div>

        <div className="profile-section">
          <h2>📄 เอกสารที่เกี่ยวข้อง</h2>
          {isEditing ? (
            <>
              <label>ประกันสุขภาพ:</label>
              <input
                type="text"
                name="insurance"
                value={formData.insurance || ""}
                onChange={handleChange}
              />

              <label>ใบรับรองแพทย์:</label>
              <input
                type="text"
                name="medicalCertificate"
                value={formData.medicalCertificate || ""}
                onChange={handleChange}
              />

              <label>เอกสารยินยอมการดูแล:</label>
              <input
                type="text"
                name="consentForm"
                value={formData.consentForm || ""}
                onChange={handleChange}
              />
            </>
          ) : (
            <>
              <p><strong>ประกันสุขภาพ:</strong> {elderly?.insurance || "ไม่มีข้อมูล"}</p>
              <p><strong>ใบรับรองแพทย์:</strong> {elderly?.medicalCertificate || "ไม่มีข้อมูล"}</p>
              <p><strong>เอกสารยินยอมการดูแล:</strong> {elderly?.consentForm || "ไม่มีข้อมูล"}</p>
            </>
          )}
        </div>

        {userRole === "owner" || userRole === "owner" ? (
          isEditing ? (
            <>
              <button onClick={handleSave} className="save-btn">✅ บันทึกข้อมูล</button>
              <button onClick={() => setIsEditing(false)} className="cancel-btn">❌ ยกเลิก</button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="edit-btn">✏️ แก้ไขข้อมูล</button>
          )
        ) : (
          <p style={{ color: "red", fontWeight: "bold" }}></p>
        )}
      </div>
    </div>
  );
};

export default ElderlyInfo;
