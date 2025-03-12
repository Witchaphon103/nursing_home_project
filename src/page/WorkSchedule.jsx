import React, { useState, useEffect } from "react";
import { db, auth } from "../utils/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, getDoc } from "firebase/firestore";

const WorkSchedule = () => {
  const [staffList, setStaffList] = useState([]); // รายชื่อพนักงาน
  const [staffName, setStaffName] = useState(""); // พนักงานที่เลือก
  const [shift, setShift] = useState("");
  const [date, setDate] = useState("");
  const [branch, setBranch] = useState(""); // สาขาที่เลือก
  const [schedules, setSchedules] = useState([]);
  const [branches, setBranches] = useState([]); // รายชื่อสาขาทั้งหมด
  const [loading, setLoading] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState("ทั้งหมด");

  // ✅ โหลด `selectedBranch` ของพนักงานที่ล็อกอินจาก Firestore
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

  // ✅ โหลดรายชื่อพนักงานจาก Firestore
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const staffData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStaffList(staffData);
      } catch (error) {
        console.error("🔥 Error fetching staff:", error);
      }
    };

    fetchStaff();
  }, []);

  // ✅ โหลดข้อมูลสาขาทั้งหมดจาก Firestore
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "branches"));
        const branchList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBranches(branchList);
      } catch (error) {
        console.error("🔥 Error fetching branches:", error);
      }
    };

    fetchBranches();
  }, []);

  // ✅ โหลดตารางงานเฉพาะของสาขาที่เลือก
  useEffect(() => {
    fetchSchedules();
  }, [selectedBranch]);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      let q = query(collection(db, "workSchedules"));

      // ✅ กรองเฉพาะสาขาที่เลือก (ถ้าไม่ใช่ "ทั้งหมด")
      if (selectedBranch !== "ทั้งหมด") {
        q = query(q, where("branch", "==", selectedBranch));
      }

      const querySnapshot = await getDocs(q);
      const scheduleData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      setSchedules(scheduleData);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ เพิ่มตารางงาน
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

  // ✅ ลบตารางงาน
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

  return (
    <div>


      {/* ✅ เลือกสาขา */}
      <div>
        <label>🏢 เลือกสาขา: </label>
        <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
          <option value="ทั้งหมด">ทั้งหมด</option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
      </div>

      {/* ✅ ฟอร์มเพิ่มตารางงาน */}
      <form onSubmit={(e) => { e.preventDefault(); addSchedule(); }}>
        {/* ✅ เลือกพนักงานจาก dropdown */}
        <label>👤 เลือกพนักงาน:</label>
        <select value={staffName} onChange={(e) => setStaffName(e.target.value)}>
          <option value="">-- เลือกพนักงาน --</option>
          {staffList.map((staff) => (
            <option key={staff.id} value={staff.fullName}>
              {staff.fullName}
            </option>
          ))}
        </select>

        <input type="text" placeholder="⏰ กะงาน" value={shift} onChange={(e) => setShift(e.target.value)} />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

        {/* ✅ เลือกสาขา */}
        <label>🏢 สาขา:</label>
        <select value={branch} onChange={(e) => setBranch(e.target.value)}>
          <option value="">-- เลือกสาขา --</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        <button type="submit" disabled={loading}>{loading ? "⏳ กำลังเพิ่ม..." : "➕ เพิ่มตารางงาน"}</button>
      </form>

      {/* ✅ ตารางแสดงตารางงาน */}
      <h3>📌 ตารางงานของเดือน</h3>
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
          {schedules.map((schedule) => (
            <tr key={schedule.id}>
              <td>{schedule.date}</td>
              <td>{schedule.staffName}</td>
              <td>{schedule.shift}</td>
              <td>{branches.find((b) => b.id === schedule.branch)?.name || "N/A"}</td>
              <td><button onClick={() => deleteSchedule(schedule.id)}>🗑️</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WorkSchedule;
