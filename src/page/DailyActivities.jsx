import React, { useState, useEffect, useContext } from "react";
import { db } from "../utils/firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // นำเข้า AuthContext เพื่อตรวจสอบ role
import "./style/DailyActivities.css";

const DailyActivities = () => {
  const { patientId } = useParams();
  const { userRole } = useContext(AuthContext); // ดึง role ของ user ที่ล็อกอิน
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editActivity, setEditActivity] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const initialFormData = {
    date: "",
    personalRoutine: "",
    medicationIntake: "",
    nutrition: "",
    exercise: "",
    mentalActivity: "",
    socialActivity: "",
    restAndRelaxation: "",
    healthMonitoring: "",
  };

  const [formData, setFormData] = useState(initialFormData);

  // ✅ โหลดข้อมูลกิจกรรมของผู้ป่วยจาก Firestore
  useEffect(() => {
    fetchActivities();
  }, [patientId]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "dailyActivities"), where("patientId", "==", patientId));
      const querySnapshot = await getDocs(q);
      setActivities(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาดในการดึงข้อมูล: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const addOrUpdateActivity = async () => {
    if (Object.values(formData).some((field) => !field.trim())) {
      alert("⚠️ กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    setLoading(true);
    try {
      if (editActivity) {
        const activityRef = doc(db, "dailyActivities", editActivity.id);
        await updateDoc(activityRef, formData);
        alert("✅ อัปเดตข้อมูลกิจกรรมสำเร็จ");
      } else {
        const docRef = await addDoc(collection(db, "dailyActivities"), { ...formData, patientId });
        setActivities([...activities, { id: docRef.id, ...formData, patientId }]);
        alert("✅ บันทึกกิจกรรมประจำวันสำเร็จ");
      }

      resetForm();
      fetchActivities();
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาดในการบันทึกกิจกรรม: ", error);
    } finally {
      setLoading(false);
    }
  };

  const removeActivity = async (id) => {
    if (window.confirm("⚠️ คุณแน่ใจหรือไม่ว่าต้องการลบกิจกรรมนี้?")) {
      try {
        await deleteDoc(doc(db, "dailyActivities", id));
        alert("🗑️ ลบกิจกรรมสำเร็จ");
        setActivities(activities.filter((activity) => activity.id !== id));
      } catch (error) {
        console.error("❌ เกิดข้อผิดพลาดในการลบกิจกรรม: ", error);
      }
    }
  };

  const editActivityData = (activity) => {
    setFormData(activity);
    setEditActivity(activity);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditActivity(null);
    setShowForm(false);
  };

  return (
    <div className="daily-container">
      <h3 className="title">📅 กิจกรรมประจำวันของผู้ป่วย</h3>

      {/* ✅ ปุ่มเพิ่มกิจกรรม (เฉพาะ Owner, Admin, Staff) */}
      {(userRole === "owner" || userRole === "admin" || userRole === "staff") && !showForm && (
        <button className="add-btn" onClick={() => setShowForm(true)}>
          ➕ เพิ่มข้อมูลกิจกรรม
        </button>
      )}

      {showForm && (
        <form className="daily-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label>📅 วันที่</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} />
          </div>

          {Object.entries(initialFormData).map(([key, _]) =>
            key !== "date" ? (
              <div className="form-group" key={key}>
                <label>{key}</label>
                <textarea name={key} value={formData[key]} onChange={handleChange} />
              </div>
            ) : null
          )}

          <button type="button" className="submit-btn" onClick={addOrUpdateActivity} disabled={loading}>
            {loading ? "⏳ กำลังบันทึก..." : editActivity ? "💾 อัปเดตกิจกรรม" : "📥 บันทึกข้อมูล"}
          </button>
          <button type="button" className="cancel-btn" onClick={resetForm}>
            ❌ ยกเลิก
          </button>
        </form>
      )}

      {loading ? (
        <p>⏳ กำลังโหลดข้อมูล...</p>
      ) : activities.length > 0 ? (
        <div className="activity-list">
          <h3>📌 รายการกิจกรรมที่บันทึก</h3>
          <table>
            <thead>
              <tr>
                <th>วันที่</th>
                <th>กิจวัตรส่วนตัว</th>
                <th>การรับประทานยา</th>
                <th>โภชนาการ</th>
                <th>ออกกำลังกาย</th>
                <th>กิจกรรมทางจิต</th>
                <th>กิจกรรมทางสังคม</th>
                <th>พักผ่อน</th>
                <th>ติดตามสุขภาพ</th>
                {(userRole === "owner" || userRole === "admin" || userRole === "staff") && <th>การจัดการ</th>}
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr key={activity.id}>
                  {Object.entries(initialFormData).map(([key, _]) => (
                    <td key={key}>{activity[key]}</td>
                  ))}
                  {(userRole === "owner" || userRole === "admin" || userRole === "staff") && (
                    <td>
                      <button className="edit-btn" onClick={() => editActivityData(activity)}>✏️ แก้ไข</button>
                      <button className="delete-btn" onClick={() => removeActivity(activity.id)}>🗑️ ลบ</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>❌ ไม่มีข้อมูลกิจกรรมสำหรับผู้ป่วยคนนี้</p>
      )}
    </div>
  );
};

export default DailyActivities;
