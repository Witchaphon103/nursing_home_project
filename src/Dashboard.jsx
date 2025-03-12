import React, { useEffect, useState } from "react";
import { auth, db } from "./utils/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, doc, getDocs, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css"; // ไฟล์ CSS

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [branches, setBranches] = useState([]); // รายชื่อสาขา
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/"); // ถ้าไม่มีการล็อกอิน ให้ไปที่หน้า Login
      } else {
        setUser(currentUser);

        // ดึงข้อมูลสาขาที่ผู้ใช้เลือก
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists() && userDoc.data().selectedBranch) {
          setSelectedBranch(userDoc.data().selectedBranch);
        }

        // ดึงรายชื่อสาขาทั้งหมดจาก Firestore
        const branchSnapshot = await getDocs(collection(db, "branches"));
        const branchList = branchSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBranches(branchList);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // ฟังก์ชันสำหรับเลือกสาขา
  const handleSelectBranch = async (branchId) => {
    if (!user) return;

    try {
      await setDoc(doc(db, "users", user.uid), { selectedBranch: branchId }, { merge: true });
      setSelectedBranch(branchId);
      navigate(`/branch/${branchId}`); // เปลี่ยนไปที่หน้าสาขาที่เลือก
    } catch (error) {
      console.error("Error updating branch:", error);
    }
  };

  return (
    <div className="main-content">
      <div className="dashboard-content">
        <h2>📊 ข้อมูลของสาขา</h2>

        {/* รายชื่อสาขาทั้งหมด */}
        <h3>เลือกสาขาของคุณ:</h3>
        <div className="branch-grid">
          {branches.length > 0 ? (
            branches.map((branch) => (
              <div key={branch.id} className="branch-card" onClick={() => handleSelectBranch(branch.id)}>
                <img src={branch.image || "https://via.placeholder.com/150"} alt={branch.name} />
                <h4>{branch.name}</h4>
              </div>
            ))
          ) : (
            <p> กำลังโหลดรายชื่อสาขา...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
