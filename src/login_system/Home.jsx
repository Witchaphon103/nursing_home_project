import React, { useState, useEffect } from "react";
import { auth } from "../utils/firebase"; 
import { onAuthStateChanged } from "firebase/auth";
import { Link } from "react-router-dom"; // ใช้ Link จาก React Router
import Login from "./Login"; 
import Logout from "./Logout"; // นำเข้า Logout
import './Home.css'; 

const Home = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="home-container">
      <div className="home-content">
        <h2>Welcome to the Nursing Home Management System</h2>
        {user ? (
          <div>
            <h3>Welcome, {user.email}</h3>

            {/* ลิงก์ไปยังหน้าต่างๆ */}
            <div>
              <Link to="/elderly-info">
                <button>Manage Elderly Information</button>
              </Link>
              {/* เพิ่มลิงก์ไปยังหน้าอื่นๆ เช่น Health Records, Medicine Schedule ฯลฯ */}
            </div>
            
            <Logout /> {/* แสดงปุ่ม Logout */}
          </div>
        ) : (
          <div>
            <Login /> {/* แสดงฟอร์ม Login เมื่อผู้ใช้ยังไม่ได้ล็อกอิน */}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
