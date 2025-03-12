import React, { useState, useEffect, useContext } from "react";
import { db } from "../utils/firebase";
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc, orderBy, query, where, serverTimestamp, Timestamp } from "firebase/firestore";
import { AuthContext } from "../context/AuthContext"; // ใช้ AuthContext เพื่อตรวจสอบ role

const NutritionManagement = () => {
  const { userRole } = useContext(AuthContext); // ดึง role ของผู้ใช้ที่ล็อกอินอยู่
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedPatientName, setSelectedPatientName] = useState("");
  const [meal, setMeal] = useState("");
  const [allergy, setAllergy] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [nutritionData, setNutritionData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editMeal, setEditMeal] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "patients"));
        const patientList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPatients(patientList);
      } catch (error) {
        console.error("🔥 Error fetching patients:", error);
      }
    };

    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      fetchMeals();
    } else {
      setNutritionData([]);
    }
  }, [selectedPatient]);

  const fetchMeals = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "meals"),
        where("patientId", "==", selectedPatient),
        orderBy("dateTime", "desc")
      );

      const querySnapshot = await getDocs(q);
      const meals = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setNutritionData(meals);
    } catch (error) {
      console.error("❌ Error fetching meals: ", error);
    } finally {
      setLoading(false);
    }
  };

  const saveMeal = async () => {
    if (!selectedPatient || !meal || !date || !time) {
      alert("⚠️ กรุณาเลือกผู้ป่วยและกรอกข้อมูลให้ครบ");
      return;
    }

    setLoading(true);
    try {
      const dateTime = Timestamp.fromDate(new Date(`${date}T${time}:00`));
      if (editMeal) {
        // แก้ไขมื้ออาหาร
        const mealRef = doc(db, "meals", editMeal.id);
        await updateDoc(mealRef, { patientId: selectedPatient, patientName: selectedPatientName, meal, allergy, dateTime, notes });
        alert("✅ แก้ไขข้อมูลมื้ออาหารสำเร็จ");
      } else {
        // เพิ่มมื้ออาหารใหม่
        const docRef = await addDoc(collection(db, "meals"), {
          patientId: selectedPatient,
          patientName: selectedPatientName,
          meal,
          allergy,
          dateTime,
          notes,
          createdAt: serverTimestamp(),
        });
        setNutritionData([
          { id: docRef.id, patientId: selectedPatient, patientName: selectedPatientName, meal, allergy, dateTime, notes },
          ...nutritionData,
        ]);
        alert("✅ เพิ่มมื้ออาหารสำเร็จ");
      }

      resetForm();
      fetchMeals();
    } catch (error) {
      console.error("❌ Error saving meal: ", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteMeal = async (id) => {
    if (window.confirm("⚠️ คุณแน่ใจหรือไม่ว่าต้องการลบมื้อนี้?")) {
      try {
        await deleteDoc(doc(db, "meals", id));
        setNutritionData(nutritionData.filter((meal) => meal.id !== id));
        alert("🗑️ ลบมื้ออาหารสำเร็จ");
      } catch (error) {
        console.error("❌ Error deleting meal: ", error);
      }
    }
  };

  const editMealData = (mealData) => {
    setMeal(mealData.meal);
    setAllergy(mealData.allergy);
    setDate(mealData.dateTime.toDate().toISOString().split("T")[0]);
    setTime(mealData.dateTime.toDate().toISOString().split("T")[1].slice(0, 5));
    setNotes(mealData.notes);
    setEditMeal(mealData);
    setShowForm(true);
  };

  const resetForm = () => {
    setMeal("");
    setAllergy("");
    setDate("");
    setTime("");
    setNotes("");
    setEditMeal(null);
    setShowForm(false);
  };

  return (
    <div>
      <h3>🍽️ การจัดการโภชนาการ</h3>

      <label>👤 เลือกผู้ป่วย:</label>
      <select
        value={selectedPatient}
        onChange={(e) => {
          const patientId = e.target.value;
          setSelectedPatient(patientId);
          const patientName = patients.find((p) => p.id === patientId)?.name || "";
          setSelectedPatientName(patientName);
        }}
      >
        <option value="">-- กรุณาเลือก --</option>
        {patients.map((patient) => (
          <option key={patient.id} value={patient.id}>
            {patient.name} (อายุ {patient.age} ปี)
          </option>
        ))}
      </select>

      {(userRole === "admin" || userRole === "nutritionist" || userRole === "owner") && (
        <button onClick={() => setShowForm(true)}>➕ เพิ่มมื้ออาหาร</button>
      )}

      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); saveMeal(); }}>
          <input type="text" placeholder="🍛 ชื่อมื้ออาหาร" value={meal} onChange={(e) => setMeal(e.target.value)} />
          <input type="text" placeholder="🚨 อาหารที่แพ้ (ถ้ามี)" value={allergy} onChange={(e) => setAllergy(e.target.value)} />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          <textarea placeholder="📝 บันทึกเพิ่มเติม" value={notes} onChange={(e) => setNotes(e.target.value)}></textarea>
          <button type="submit">{editMeal ? "✏️ แก้ไขข้อมูล" : "➕ เพิ่มมื้ออาหาร"}</button>
          <button type="button" onClick={resetForm}>❌ ยกเลิก</button>
        </form>
      )}

      <h4>📌 รายการมื้ออาหารของ {selectedPatientName || "..."}</h4>
      {nutritionData.map((data) => (
        <div key={data.id}>
          <p>{data.meal} - {data.dateTime.toDate().toLocaleDateString()}</p>
          {(userRole === "admin" || userRole === "nutritionist" || userRole === "owner") && (
            <>
              <button onClick={() => editMealData(data)}>✏️ แก้ไข</button>
              <button onClick={() => deleteMeal(data.id)}>🗑️ ลบ</button>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default NutritionManagement;
