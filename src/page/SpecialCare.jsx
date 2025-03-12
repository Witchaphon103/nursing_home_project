import React, { useState, useEffect, useCallback, useContext } from "react";
import { useParams } from "react-router-dom";
import { db } from "../utils/firebase";
import { AuthContext } from "../context/AuthContext"; // Import AuthContext
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import "./style/SpecialCare.css";

const SpecialCare = () => {
  const { patientId } = useParams();
  const { userRole } = useContext(AuthContext); // รับ role ของผู้ใช้
  const [specialCareData, setSpecialCareData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editCare, setEditCare] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const defaultCareState = {
    careType: "",
    schedule: "",
    initialAssessment: "",
    carePlan: "",
  };

  const [newCare, setNewCare] = useState(defaultCareState);

  useEffect(() => {
    fetchSpecialCareData();
  }, [patientId]);

  const fetchSpecialCareData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, "specialCare"), where("patientId", "==", patientId));
      const querySnapshot = await getDocs(q);
      setSpecialCareData(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("❌ Error fetching data:", error);
      setError("เกิดข้อผิดพลาดในการดึงข้อมูล กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  const saveSpecialCare = async () => {
    if (!newCare.careType || !newCare.schedule) {
      alert("⚠️ กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (editCare) {
        const careRef = doc(db, "specialCare", editCare.id);
        await updateDoc(careRef, newCare);
        alert("✅ อัปเดตข้อมูลสำเร็จ");
      } else {
        await addDoc(collection(db, "specialCare"), { ...newCare, patientId });
        alert("✅ บันทึกข้อมูลการดูแลพิเศษสำเร็จ");
      }

      resetForm();
      fetchSpecialCareData();
    } catch (error) {
      console.error("❌ Error saving data:", error);
      setError("เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  const deleteSpecialCare = async (id) => {
    if (window.confirm("⚠️ คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?")) {
      try {
        await deleteDoc(doc(db, "specialCare", id));
        alert("🗑️ ลบข้อมูลสำเร็จ");
        fetchSpecialCareData();
      } catch (error) {
        console.error("❌ Error deleting data:", error);
        setError("เกิดข้อผิดพลาดในการลบข้อมูล กรุณาลองใหม่อีกครั้ง");
      }
    }
  };

  const resetForm = () => {
    setNewCare(defaultCareState);
    setEditCare(null);
    setShowForm(false);
  };

  return (
    <div className="special-care-container">
      <h3 className="title">🩺 การดูแลพิเศษและวางแผนดูแลเบื้องต้น</h3>

      {error && <p className="error-message">❌ {error}</p>}

      {/* ✅ ปุ่มเพิ่มบันทึกดูแลพิเศษ (Owner, Admin, Staff เท่านั้น) */}
      {(userRole === "owner" || userRole === "admin" || userRole === "staff") && !showForm && (
        <button className="add-btn" onClick={() => setShowForm(true)}>
          ➕ เพิ่มข้อมูลดูแลพิเศษ
        </button>
      )}

      {showForm && (
        <div className="special-care-form">
          <h4>{editCare ? "✏️ แก้ไขข้อมูลดูแลพิเศษ" : "📥 เพิ่มข้อมูลดูแลพิเศษ"}</h4>
          <label>ประเภทการดูแล</label>
          <input
            type="text"
            value={newCare.careType}
            onChange={(e) => setNewCare({ ...newCare, careType: e.target.value })}
          />

          <label>กำหนดการดูแล</label>
          <input
            type="text"
            value={newCare.schedule}
            onChange={(e) => setNewCare({ ...newCare, schedule: e.target.value })}
          />

          <label>การประเมินสุขภาพเบื้องต้น</label>
          <textarea
            value={newCare.initialAssessment}
            onChange={(e) => setNewCare({ ...newCare, initialAssessment: e.target.value })}
          />

          <label>แผนการดูแล</label>
          <textarea
            value={newCare.carePlan}
            onChange={(e) => setNewCare({ ...newCare, carePlan: e.target.value })}
          />

          <button onClick={saveSpecialCare} disabled={loading}>
            {loading ? "⏳ กำลังบันทึก..." : editCare ? "💾 อัปเดตข้อมูล" : "📥 บันทึกข้อมูล"}
          </button>
          <button className="cancel-btn" onClick={resetForm}>❌ ยกเลิก</button>
        </div>
      )}

      <div className="special-care-list">
        <h4>📌 รายการดูแลพิเศษ</h4>
        {loading ? (
          <p>⏳ กำลังโหลดข้อมูล...</p>
        ) : specialCareData.length > 0 ? (
          <ul>
            {specialCareData.map((care) => (
              <li key={care.id}>
                <p><strong>ประเภทการดูแล:</strong> {care.careType}</p>
                <p><strong>กำหนดการ:</strong> {care.schedule}</p>
                <p><strong>🩺 การประเมินสุขภาพ:</strong> {care.initialAssessment || "ไม่มีข้อมูล"}</p>
                <p><strong>📋 แผนการดูแล:</strong> {care.carePlan || "ไม่มีข้อมูล"}</p>

                {/* ✅ ปุ่มแก้ไข / ลบ (Owner, Admin เท่านั้น) */}
                {(userRole === "owner" || userRole === "admin") && (
                  <>
                    <button
                      onClick={() => {
                        setEditCare(care);
                        setNewCare(care);
                        setShowForm(true);
                      }}
                    >
                      ✏️ แก้ไข
                    </button>
                    <button onClick={() => deleteSpecialCare(care.id)}>🗑️ ลบ</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>❌ ไม่มีรายการดูแลพิเศษ</p>
        )}
      </div>
    </div>
  );
};

export default SpecialCare;
