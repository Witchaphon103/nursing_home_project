import React, { useState, useEffect } from "react";
import { db } from "../utils/firebase";
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc, query, where } from "firebase/firestore";
import "./style/FinanceManagement.css";

const FinanceManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [type, setType] = useState("รายรับ");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("เงินสด");
  const [accountNumber, setAccountNumber] = useState(""); // ✅ เลขบัญชี
  const [accountName, setAccountName] = useState(""); // ✅ ชื่อบัญชี
  const [bankName, setBankName] = useState(""); // ✅ ธนาคาร
  const [status, setStatus] = useState("สำเร็จ"); // ✅ สถานะ
  const [loading, setLoading] = useState(false);
  const [editTransaction, setEditTransaction] = useState(null);

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "finance"));
      setTransactions(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("❌ Error fetching finance data: ", error);
    } finally {
      setLoading(false);
    }
  };

  const saveTransaction = async () => {
    if (!category || !amount || !date) {
      alert("⚠️ กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    setLoading(true);
    try {
      if (editTransaction) {
        const transactionRef = doc(db, "finance", editTransaction.id);
        await updateDoc(transactionRef, { type, category, amount, description, date, paymentMethod, accountNumber, accountName, bankName, status });
        alert("✅ อัปเดตข้อมูลสำเร็จ");
      } else {
        await addDoc(collection(db, "finance"), { type, category, amount, description, date, paymentMethod, accountNumber, accountName, bankName, status });
        alert("✅ บันทึกข้อมูลการเงินสำเร็จ");
      }
      resetForm();
      fetchFinanceData();
    } catch (error) {
      console.error("❌ Error saving finance data: ", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id) => {
    if (window.confirm("⚠️ คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?")) {
      try {
        await deleteDoc(doc(db, "finance", id));
        alert("🗑️ ลบข้อมูลสำเร็จ");
        fetchFinanceData();
      } catch (error) {
        console.error("❌ Error deleting finance data: ", error);
      }
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const transactionRef = doc(db, "finance", id);
      await updateDoc(transactionRef, { status: newStatus });
      setTransactions(transactions.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
    } catch (error) {
      console.error("❌ Error updating status: ", error);
    }
  };

  return (
    <div className="finance-container">
      <h3>📊 การจัดการการเงิน</h3>

      {/* ✅ ฟอร์มเพิ่มข้อมูลการเงิน */}
      <form onSubmit={(e) => { e.preventDefault(); saveTransaction(); }}>
        <label>ประเภท</label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="รายรับ">💰 รายรับ</option>
          <option value="รายจ่าย">💸 รายจ่าย</option>
        </select>

        <label>หมวดหมู่</label>
        <input type="text" placeholder="เช่น ค่าบริการ, เงินเดือน" value={category} onChange={(e) => setCategory(e.target.value)} />

        <label>จำนวนเงิน</label>
        <input type="number" placeholder="ใส่จำนวนเงิน" value={amount} onChange={(e) => setAmount(e.target.value)} />

        <label>คำอธิบาย</label>
        <textarea placeholder="รายละเอียดเพิ่มเติม" value={description} onChange={(e) => setDescription(e.target.value)} />

        <label>วันที่</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

        <label>💳 วิธีชำระเงิน</label>
        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
          <option value="เงินสด">เงินสด</option>
          <option value="โอนผ่านธนาคาร">โอนผ่านธนาคาร</option>
          <option value="บัตรเครดิต">บัตรเครดิต</option>
        </select>

        <label>🏦 ธนาคาร</label>
        <input type="text" placeholder="ชื่อธนาคาร" value={bankName} onChange={(e) => setBankName(e.target.value)} />

        <label>🔢 เลขบัญชี</label>
        <input type="text" placeholder="เลขบัญชี" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />

        <label>👤 ชื่อบัญชี</label>
        <input type="text" placeholder="ชื่อบัญชี" value={accountName} onChange={(e) => setAccountName(e.target.value)} />

        <button type="submit" disabled={loading}>
          {loading ? "⏳ กำลังบันทึก..." : editTransaction ? "💾 อัปเดตข้อมูล" : "📥 เพิ่มข้อมูล"}
        </button>
      </form>

      {/* ✅ รายการธุรกรรม */}
      <h3>📌 รายการธุรกรรม</h3>
      {transactions.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>ประเภท</th>
              <th>หมวดหมู่</th>
              <th>จำนวนเงิน</th>
              <th>วันที่</th>
              <th>วิธีชำระเงิน</th>
              <th>ธนาคาร</th>
              <th>เลขบัญชี</th>
              <th>ชื่อบัญชี</th>
              <th>สถานะ</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id}>
                <td>{t.type}</td>
                <td>{t.category}</td>
                <td>{t.amount}</td>
                <td>{t.date}</td>
                <td>{t.paymentMethod}</td>
                <td>{t.bankName || "-"}</td>
                <td>{t.accountNumber || "-"}</td>
                <td>{t.accountName || "-"}</td>
                <td>
                  <select value={t.status} onChange={(e) => updateStatus(t.id, e.target.value)}>
                    <option value="สำเร็จ">สำเร็จ</option>
                    <option value="รอดำเนินการ">รอดำเนินการ</option>
                  </select>
                </td>
                <td><button onClick={() => deleteTransaction(t.id)}>🗑️ ลบ</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>❌ ไม่มีข้อมูลการเงิน</p>
      )}
    </div>
  );
};

export default FinanceManagement;
