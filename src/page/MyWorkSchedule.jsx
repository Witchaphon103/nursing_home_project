import React, { useState, useEffect } from "react";
import { db, auth } from "../utils/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, getDoc } from "firebase/firestore";

const WorkSchedule = () => {
  const [staffName, setStaffName] = useState("");
  const [shift, setShift] = useState("");
  const [date, setDate] = useState("");
  const [branch, setBranch] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState("ทั้งหมด");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchUserBranch = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setSelectedBranch(userDoc.data().selectedBranch || "ทั้งหมด");
          }
        } catch (error) {
          console.error("🔥 Error fetching user branch:", error);
        }
      }
    };
    fetchUserBranch();
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [selectedMonth, selectedYear, selectedBranch]);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      let scheduleQuery = collection(db, "workSchedules");
      let constraints = [
        where("date", ">=", `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`),
        where("date", "<=", `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-31`),
      ];

      if (selectedBranch !== "ทั้งหมด") {
        constraints.push(where("branch", "==", selectedBranch));
      }

      const q = query(scheduleQuery, ...constraints);
      const querySnapshot = await getDocs(q);
      const scheduleData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSchedules(scheduleData);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    } finally {
      setLoading(false);
    }
  };

  const addSchedule = async () => {
    if (!staffName || !shift || !date || !branch) {
      alert("⚠️ กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "workSchedules"), { staffName, shift, date, branch });
      alert("✅ เพิ่มตารางงานสำเร็จ");
      setStaffName("");
      setShift("");
      setDate("");
      setBranch("");
      fetchSchedules();
    } catch (error) {
      console.error("Error adding schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSchedule = async (id) => {
    if (window.confirm("⚠️ คุณแน่ใจหรือไม่ว่าต้องการลบตารางงานนี้?")) {
      try {
        await deleteDoc(doc(db, "workSchedules", id));
        alert("🗑️ ลบตารางงานสำเร็จ");
        fetchSchedules();
      } catch (error) {
        console.error("Error deleting schedule:", error);
      }
    }
  };

  const scheduleByDate = schedules.reduce((acc, schedule) => {
    const day = schedule.date.split("-")[2];
    if (!acc[day]) acc[day] = [];
    acc[day].push(schedule);
    return acc;
  }, {});

  return (
    <div>
      <h3>📅 ตารางเวรงานพนักงาน - {selectedBranch}</h3>
      <div>
        <label>📅 เลือกเดือน: </label>
        <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(selectedYear, i).toLocaleString("th-TH", { month: "long" })}
            </option>
          ))}
        </select>
        <label>📅 เลือกปี: </label>
        <input type="number" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} />
      </div>
      <h3>📌 ตารางงานของเดือน {new Date(selectedYear, selectedMonth - 1).toLocaleString("th-TH", { month: "long", year: "numeric" })}</h3>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>📅 วันที่</th>
            <th>👤 พนักงาน</th>
            <th>⏰ กะงาน</th>
            <th>🏢 สาขา</th>
            <th>🛠️ จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {[...Array(31)].map((_, i) => {
            const day = String(i + 1).padStart(2, "0");
            return (
              <tr key={day}>
                <td>{day}</td>
                <td colSpan="4">
                  {scheduleByDate[day] ? (
                    scheduleByDate[day].map((schedule) => (
                      <div key={schedule.id} style={{ marginBottom: "5px", borderBottom: "1px solid #ddd", paddingBottom: "5px" }}>
                        👤 {schedule.staffName} | ⏰ {schedule.shift} | 🏢 {schedule.branch}
                        <button onClick={() => deleteSchedule(schedule.id)} style={{ marginLeft: "10px", color: "red" }}>🗑️</button>
                      </div>
                    ))
                  ) : (
                    <p style={{ textAlign: "center", color: "#aaa" }}>ไม่มีเวรงาน</p>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default WorkSchedule;