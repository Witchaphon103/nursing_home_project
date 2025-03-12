import React, { useState, useEffect } from "react";
import { db } from "../utils/firebase";
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc } from "firebase/firestore";
import "./style/SecurityManagement.css";

const SecurityManagement = () => {
  const [entryDetails, setEntryDetails] = useState("");
  const [entryType, setEntryType] = useState("เข้า");
  const [personName, setPersonName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [securityLogs, setSecurityLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editEntry, setEditEntry] = useState(null);

  // ดึงข้อมูลจาก Firestore
  useEffect(() => {
    fetchSecurityLogs();
  }, []);

  const fetchSecurityLogs = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "security"));
      setSecurityLogs(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching security logs: ", error);
    } finally {
      setLoading(false);
    }
  };

  // เพิ่มหรือแก้ไขข้อมูลการเข้าออก
  const handleEntry = async () => {
    if (!personName.trim() || !idNumber.trim() || !entryDetails.trim()) {
      alert("⚠️ กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    setLoading(true);
    try {
      if (editEntry) {
        // แก้ไขข้อมูล
        await updateDoc(doc(db, "security", editEntry.id), {
          personName,
          idNumber,
          entryType,
          vehicle,
          entryDetails,
          timestamp: new Date().toISOString(),
        });
        alert("✅ อัปเดตข้อมูลสำเร็จ");
      } else {
        // เพิ่มข้อมูลใหม่
        await addDoc(collection(db, "security"), {
          personName,
          idNumber,
          entryType,
          vehicle,
          entryDetails,
          timestamp: new Date().toISOString(),
        });
        alert("✅ บันทึกข้อมูลสำเร็จ");
      }

      resetForm();
      fetchSecurityLogs();
    } catch (error) {
      console.error("Error recording entry: ", error);
    } finally {
      setLoading(false);
    }
  };

  // ลบข้อมูล
  const removeEntry = async (id) => {
    if (window.confirm("⚠️ คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?")) {
      try {
        await deleteDoc(doc(db, "security", id));
        alert("🗑️ ลบข้อมูลสำเร็จ");
        fetchSecurityLogs();
      } catch (error) {
        console.error("Error deleting entry: ", error);
      }
    }
  };

  // รีเซ็ตฟอร์ม
  const resetForm = () => {
    setEntryDetails("");
    setEntryType("เข้า");
    setPersonName("");
    setIdNumber("");
    setVehicle("");
    setEditEntry(null);
  };

  return (
    <div className="security-container">
      <h3>🔒 ระบบจัดการความปลอดภัย</h3>

      {/* ฟอร์มบันทึกข้อมูล */}
      <form className="security-form" onSubmit={(e) => { e.preventDefault(); handleEntry(); }}>
        <input type="text" placeholder="👤 ชื่อ-นามสกุล" value={personName} onChange={(e) => setPersonName(e.target.value)} />
        <input type="text" placeholder="🆔 เลขบัตรประชาชน" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} />
        <input type="text" placeholder="🚗 ยานพาหนะ (ถ้ามี)" value={vehicle} onChange={(e) => setVehicle(e.target.value)} />
        <select value={entryType} onChange={(e) => setEntryType(e.target.value)}>
          <option value="เข้า">🚪 เข้า</option>
          <option value="ออก">🚪 ออก</option>
        </select>
        <textarea placeholder="📝 รายละเอียดเพิ่มเติม" value={entryDetails} onChange={(e) => setEntryDetails(e.target.value)} />
        <button type="submit" disabled={loading}>{loading ? "⏳ กำลังบันทึก..." : editEntry ? "💾 อัปเดตข้อมูล" : "📥 บันทึกข้อมูล"}</button>
      </form>

      {/* แสดงข้อมูลที่บันทึก */}
      <h3>📌 บันทึกการเข้าออก</h3>
      {securityLogs.length > 0 ? (
        <table className="security-table">
          <thead>
            <tr><th>📅 วันที่-เวลา</th><th>👤 ชื่อ</th><th>🆔 เลขบัตร</th><th>🚗 ยานพาหนะ</th><th>📝 รายละเอียด</th><th>🛠️ จัดการ</th></tr>
          </thead>
          <tbody>
            {securityLogs.map((log) => (
              <tr key={log.id}><td>{new Date(log.timestamp).toLocaleString()}</td><td>{log.personName}</td><td>{log.idNumber}</td><td>{log.vehicle}</td><td>{log.entryDetails}</td><td><button className="delete-btn" onClick={() => removeEntry(log.id)}>🗑️ ลบ</button></td></tr>
            ))}
          </tbody>
        </table>
      ) : <p>❌ ไม่มีบันทึกการเข้าออก</p>}
    </div>
  );
};

export default SecurityManagement;
