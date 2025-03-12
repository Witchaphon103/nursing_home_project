import React, { createContext, useState, useEffect } from "react";
import { auth, db } from "../utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// สร้าง Context สำหรับ Auth
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [userRole, setUserRole] = useState(null); // Role ของผู้ใช้
  const [loading, setLoading] = useState(true); // ตรวจสอบสถานะโหลด

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // ดึงข้อมูล Role และ Branch จาก Firestore
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setSelectedBranch(data.selectedBranch || null);
          setUserRole(data.role || "employee"); // ค่าเริ่มต้นเป็น employee
        } else {
          setSelectedBranch(null);
          setUserRole(null);
        }
      } else {
        setUser(null);
        setSelectedBranch(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, selectedBranch, userRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
