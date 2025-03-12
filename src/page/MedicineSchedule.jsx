import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { db } from "../utils/firebase";
import { collection, addDoc, getDocs, query, where, orderBy, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { useParams } from "react-router-dom";
import "./style/MedicineSchedule.css";

const MedicineSchedule = () => {
  const { patientId } = useParams(); // ดึง patientId จาก URL
  const [medicineData, setMedicineData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedDayMedicines, setSelectedDayMedicines] = useState([]);
  const [editMedicine, setEditMedicine] = useState(null);
  const [newMedicine, setNewMedicine] = useState({
    medicineName: "",
    dosage: "",
    route: "Oral",
    date: "", // ใช้ YYYY-MM-DD
    frequency: "",
    instructions: "",
    status: "Not Given",
  });

  // ✅ ดึงข้อมูลตารางยาเฉพาะของคนไข้คนนั้น
  useEffect(() => {
    fetchData();
  }, [patientId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "medicineSchedule"),
        where("patientId", "==", patientId),
        orderBy("date") // ใช้ date ที่เป็น YYYY-MM-DD
      );
      const querySnapshot = await getDocs(q);
      const fetchedData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("📥 ข้อมูลจาก Firestore:", fetchedData);
      setMedicineData(fetchedData);
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ จัดกลุ่มเหตุการณ์ตามวัน
  const eventsByDate = medicineData.reduce((acc, curr) => {
    if (!curr.date) return acc;
    const eventDate = curr.date; // Firestore ใช้ YYYY-MM-DD
    if (!acc[eventDate]) acc[eventDate] = [];
    acc[eventDate].push(curr);
    return acc;
  }, {});

  // ✅ เมื่อคลิกวันที่ในปฏิทินให้แสดงรายการยา
  const handleDateClick = (date) => {
    const dateString = date.toISOString().split("T")[0]; // ได้เป็น YYYY-MM-DD
    console.log("📅 คลิกวันที่:", dateString);
    console.log("📋 ยาที่มี:", eventsByDate[dateString] || []);

    setSelectedDate(date);
    setSelectedDayMedicines(eventsByDate[dateString] || []);
    setShowModal(true);
  };

  // ✅ ฟังก์ชันเพิ่มหรืออัปเดตข้อมูลยาเข้า Firestore
  const saveMedicineSchedule = async () => {
    if (!newMedicine.medicineName || !newMedicine.dosage || !newMedicine.date) {
      alert("⚠️ กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    try {
      setLoading(true);
      if (editMedicine) {
        // อัปเดตข้อมูลยา
        const medicineRef = doc(db, "medicineSchedule", editMedicine.id);
        await updateDoc(medicineRef, newMedicine);
        alert("✏️ อัปเดตข้อมูลสำเร็จ");
      } else {
        // เพิ่มข้อมูลยาใหม่
        await addDoc(collection(db, "medicineSchedule"), {
          ...newMedicine,
          patientId,
        });
        alert("✅ บันทึกข้อมูลการรับประทานยาสำเร็จแล้ว");
      }

      // รีเซ็ตค่า
      setNewMedicine({
        medicineName: "",
        dosage: "",
        route: "Oral",
        date: "",
        frequency: "",
        instructions: "",
        status: "Not Given",
      });

      setEditMedicine(null);
      fetchData(); // โหลดข้อมูลใหม่
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล: ", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ ฟังก์ชันลบข้อมูลยา
  const deleteMedicine = async (id) => {
    if (window.confirm("⚠️ คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?")) {
      try {
        await deleteDoc(doc(db, "medicineSchedule", id));
        alert("🗑️ ลบข้อมูลสำเร็จ");
        fetchData();
      } catch (error) {
        console.error("❌ เกิดข้อผิดพลาดในการลบข้อมูล: ", error);
      }
    }
  };

  return (
    <div className="schedule-container">
      <h3 className="title">📅 ตารางการรับยาของคนไข้</h3>

      {/* ✅ แสดงปฏิทิน */}
      <Calendar 
        onClickDay={handleDateClick} 
        tileContent={({ date }) => eventsByDate[date.toISOString().split("T")[0]] ? <div className="calendar-dot"></div> : null} 
      />

      {/* ✅ ฟอร์มเพิ่มการรับยา */}
      <div className="medicine-form">
        <h4>{editMedicine ? "✏️ แก้ไขข้อมูลยา" : "➕ เพิ่มข้อมูลยา"}</h4>
        <input type="text" placeholder="ชื่อยา" value={newMedicine.medicineName} onChange={(e) => setNewMedicine({ ...newMedicine, medicineName: e.target.value })} />
        <input type="text" placeholder="ขนาดยา (เช่น 500mg)" value={newMedicine.dosage} onChange={(e) => setNewMedicine({ ...newMedicine, dosage: e.target.value })} />
        <input type="text" placeholder="ความถี่ (เช่น วันละ 2 ครั้ง)" value={newMedicine.frequency} onChange={(e) => setNewMedicine({ ...newMedicine, frequency: e.target.value })} />
        <input type="text" placeholder="คำแนะนำพิเศษ" value={newMedicine.instructions} onChange={(e) => setNewMedicine({ ...newMedicine, instructions: e.target.value })} />
        <input type="date" value={newMedicine.date} onChange={(e) => setNewMedicine({ ...newMedicine, date: e.target.value })} />
        <button onClick={saveMedicineSchedule} disabled={loading}>{loading ? "⏳ กำลังบันทึก..." : editMedicine ? "💾 อัปเดตข้อมูล" : "💊 บันทึกข้อมูลยา"}</button>
      </div>

      {/* ✅ แสดง Modal รายละเอียดของวันนั้น */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h4>📌 รายการยาในวันที่ {selectedDate.toISOString().split("T")[0]}</h4>
            <ul>
              {selectedDayMedicines.length > 0 ? selectedDayMedicines.map((med) => (
                <li key={med.id}>
                  {med.medicineName} - {med.dosage} ({med.status})
                  <button onClick={() => setEditMedicine(med)}>✏️</button>
                  <button onClick={() => deleteMedicine(med.id)}>🗑️</button>
                </li>
              )) : <p>❌ ไม่มีรายการยา</p>}
            </ul>
            <button className="close-btn" onClick={() => setShowModal(false)}>ปิด</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineSchedule;
