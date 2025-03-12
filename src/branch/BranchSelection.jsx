import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../utils/firebase";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth"; // ตรวจสอบสถานะการล็อกอิน
import "./style/BranchSelection.css";

const BranchSelection = () => {
  const [branches, setBranches] = useState([]); // รายชื่อสาขา
  const [user, setUser] = useState(null); // ข้อมูลผู้ใช้
  const navigate = useNavigate();

  // ตรวจสอบสถานะผู้ใช้ที่ล็อกอิน
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // โหลดข้อมูลสาขาจาก Firestore
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

  // ฟังก์ชันสำหรับเลือกสาขา
  const handleSelectBranch = async (branch) => {
    if (!user) {
      console.error("❌ User not logged in");
      return;
    }

    try {
      await setDoc(doc(db, "users", user.uid), { selectedBranch: branch.id }, { merge: true });
      navigate("/dashboard"); // ✅ แก้ไขให้เป็น string
    } catch (error) {
      console.error("🔥 Error saving branch:", error);
    }
  };

  return (
    <div className="branch-selection-container">
      <h1>เลือกสาขา</h1>
      <div className="branch-grid">
        {branches.length > 0 ? (
          branches.map((branch) => (
            <div key={branch.id} className="branch-card" onClick={() => handleSelectBranch(branch)}>
              <img src={branch.image || "https://via.placeholder.com/150"} alt={branch.name} />
              <h3>{branch.name}</h3>
            </div>
          ))
        ) : (
          <p> กำลังโหลดรายชื่อสาขา...</p>
        )}
      </div>
    </div>
  );
};

export default BranchSelection;
