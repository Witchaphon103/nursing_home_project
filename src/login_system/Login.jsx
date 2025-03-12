import React, { useState, useEffect } from "react";
import { auth, db } from "../utils/firebase"; // นำเข้า Firestore
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore"; // ฟังก์ชันสำหรับบันทึกข้อมูล
import { useNavigate } from "react-router-dom";
import "./Login.css"; 

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // ถ้ามีคนล็อกอินอยู่แล้ว → ส่งไปหน้า Dashboard
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/dashboard");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const saveUserToFirestore = async (user) => {
    if (!user) return;
    
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: user.email,
          uid: user.uid,
          role: "employee", // ✅ กำหนด role เป็น "employee"
          createdAt: new Date().toISOString(),
        });
        console.log("✅ เพิ่มข้อมูลผู้ใช้ใหม่ใน Firestore พร้อมกำหนด role เป็น 'employee'");
      } else {
        console.log("📌 ผู้ใช้มีอยู่แล้วใน Firestore");
      }
    } catch (error) {
      console.error("❌ Error saving user data:", error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }

    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await saveUserToFirestore(user); // ✅ บันทึกข้อมูลพร้อมกำหนด role เป็น "employee"

      navigate("/dashboard"); // 📌 เปลี่ยนไปหน้า Dashboard
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        setErrorMessage("ไม่พบบัญชีผู้ใช้นี้");
      } else if (error.code === "auth/wrong-password") {
        setErrorMessage("รหัสผ่านไม่ถูกต้อง");
      } else if (error.code === "auth/invalid-email") {
        setErrorMessage("รูปแบบอีเมลไม่ถูกต้อง");
      } else {
        setErrorMessage("เกิดข้อผิดพลาด กรุณาลองใหม่");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>เข้าสู่ระบบ</h2>
      {errorMessage && <div className="error-message">{errorMessage}</div>}

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="อีเมล"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <input
          type="password"
          placeholder="รหัสผ่าน"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </button>
      </form>
    </div>
  );
};

export default Login;
