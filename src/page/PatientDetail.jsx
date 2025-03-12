import React, { useState, useEffect } from "react";
import { db } from "../utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams } from "react-router-dom";
import "./../Dashboard.css"; 

const PatientDetail = () => {
  const { branch, patientId } = useParams();
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    const fetchPatientDetail = async () => {
      const docRef = doc(db, `patients_${branch}`, patientId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setPatient(docSnap.data());
      } else {
        console.log("No such document!");
      }
    };
    fetchPatientDetail();
  }, [branch, patientId]);

  return (
    <div className="dashboard-container">
      <div className="main-content">
        <h1>Patient Detail</h1>
        {patient ? (
          <div>
            <h2>{patient.name}</h2>
            <p>Age: {patient.age}</p>
            <p>Medical Conditions: {patient.medicalConditions}</p>
            <p>Medication Schedule: {patient.medicineSchedule}</p>
            <p>Health Records: {patient.healthRecords}</p>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
};

export default PatientDetail;
