import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { db } from "../utils/firebase";
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { AuthContext } from "../context/AuthContext";

const HealthRecords = () => {
  const { patientId } = useParams();
  const [healthRecords, setHealthRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const { userRole } = useContext(AuthContext);

  useEffect(() => {
    fetchHealthRecords();
  }, [patientId]);

  const fetchHealthRecords = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "healthRecords"), where("patientId", "==", patientId));
      const querySnapshot = await getDocs(q);
      const records = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHealthRecords(records);
    } catch (error) {
      console.error("🔥 Error fetching health data:", error);
    } finally {
      setLoading(false);
    }
  };

  const initialRecordState = {
    bloodPressure: "",
    sugarLevel: "",
    temperature: "",
    heartRate: "",
    weight: "",
    height: "",
    bmi: "",
    lastDoctorVisit: "",
    diagnosis: "",
  };

  const [newRecord, setNewRecord] = useState(initialRecordState);

  const resetForm = () => {
    setNewRecord(initialRecordState);
    setEditRecord(null);
    setShowForm(false);
  };

  const handleEdit = (record) => {
    setEditRecord(record);
    setNewRecord({ ...record });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("⚠️ คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?")) {
      try {
        await deleteDoc(doc(db, "healthRecords", id));
        setHealthRecords(prevRecords => prevRecords.filter(record => record.id !== id));
      } catch (error) {
        console.error("🔥 Error deleting health record:", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editRecord) {
        const recordRef = doc(db, "healthRecords", editRecord.id);
        await updateDoc(recordRef, { ...newRecord });
        setHealthRecords(prevRecords => prevRecords.map(record => (record.id === editRecord.id ? { id: editRecord.id, ...newRecord } : record)));
      } else {
        const docRef = await addDoc(collection(db, "healthRecords"), {
          ...newRecord,
          patientId,
        });
        setHealthRecords([{ id: docRef.id, ...newRecord, patientId }, ...healthRecords]);
      }
      resetForm();
    } catch (error) {
      console.error("🔥 Error saving health record:", error);
    }
  };

  return (
    <div>
      <h1>🩺 บันทึกสุขภาพของผู้ป่วย</h1>
      
      {/* ✅ แสดงปุ่มเพิ่มบันทึกสุขภาพเฉพาะ Owner, Admin, และ Staff */}
      {(userRole === "owner" || userRole === "admin" || userRole === "staff") && (
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? "❌ ปิดฟอร์ม" : "➕ เพิ่มบันทึกสุขภาพ"}
        </button>
      )}

      {/* ✅ แสดงฟอร์มเมื่อกดปุ่ม */}
      {showForm && (
        <form onSubmit={handleSubmit}>
          <label>ความดันโลหิต:</label>
          <input type="text" value={newRecord.bloodPressure} onChange={(e) => setNewRecord({ ...newRecord, bloodPressure: e.target.value })} />
          
          <label>ระดับน้ำตาล:</label>
          <input type="text" value={newRecord.sugarLevel} onChange={(e) => setNewRecord({ ...newRecord, sugarLevel: e.target.value })} />
          
          <label>อุณหภูมิ (°C):</label>
          <input type="text" value={newRecord.temperature} onChange={(e) => setNewRecord({ ...newRecord, temperature: e.target.value })} />
          
          <label>อัตราการเต้นของหัวใจ (bpm):</label>
          <input type="text" value={newRecord.heartRate} onChange={(e) => setNewRecord({ ...newRecord, heartRate: e.target.value })} />
          
          <label>น้ำหนัก (kg):</label>
          <input type="text" value={newRecord.weight} onChange={(e) => setNewRecord({ ...newRecord, weight: e.target.value })} />
          
          <label>ส่วนสูง (cm):</label>
          <input type="text" value={newRecord.height} onChange={(e) => setNewRecord({ ...newRecord, height: e.target.value })} />
          
          <label>BMI:</label>
          <input type="text" value={newRecord.bmi} onChange={(e) => setNewRecord({ ...newRecord, bmi: e.target.value })} />
          
          <label>วันที่พบแพทย์ล่าสุด:</label>
          <input type="date" value={newRecord.lastDoctorVisit} onChange={(e) => setNewRecord({ ...newRecord, lastDoctorVisit: e.target.value })} />
          
          <label>การวินิจฉัยจากแพทย์:</label>
          <textarea value={newRecord.diagnosis} onChange={(e) => setNewRecord({ ...newRecord, diagnosis: e.target.value })} />
          
          <button type="submit">💾 บันทึก</button>
          <button type="button" onClick={resetForm}>❌ ยกเลิก</button>
        </form>
      )}
      
      {loading ? <p>📌 กำลังโหลดข้อมูล...</p> : (
        healthRecords.length > 0 ? (
          <div>
            {healthRecords.map((record) => (
              <div key={record.id}>
                <h2>📋 ข้อมูลสุขภาพ</h2>
                <p><strong>ความดันโลหิต:</strong> {record.bloodPressure || "ไม่ระบุ"}</p>
                <p><strong>ระดับน้ำตาล:</strong> {record.sugarLevel || "ไม่ระบุ"}</p>
                <p><strong>อุณหภูมิ:</strong> {record.temperature || "ไม่ระบุ"} °C</p>
                <p><strong>อัตราการเต้นของหัวใจ:</strong> {record.heartRate || "ไม่ระบุ"} bpm</p>
                <p><strong>น้ำหนัก:</strong> {record.weight || "ไม่ระบุ"} kg</p>
                <p><strong>ส่วนสูง:</strong> {record.height || "ไม่ระบุ"} cm</p>
                <p><strong>BMI:</strong> {record.bmi || "ไม่ระบุ"} </p>
                <p><strong>วันที่พบแพทย์ล่าสุด:</strong> {record.lastDoctorVisit || "ไม่ระบุ"} </p>
                <p><strong>การวินิจฉัย:</strong> {record.diagnosis || "ไม่ระบุ"}</p>
                {(userRole === "owner" || userRole === "admin") && <button onClick={() => handleEdit(record)}>✏️ แก้ไข</button>}
                {(userRole === "owner" || userRole === "admin") && <button onClick={() => handleDelete(record.id)}>🗑️ ลบ</button>}
              </div>
            ))}
          </div>
        ) : <p>❌ ไม่พบข้อมูลสุขภาพ</p>
      )}
    </div>
  );
};

export default HealthRecords;
