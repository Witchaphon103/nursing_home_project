import React, { useState, useEffect } from "react";
import { db } from "../utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import "../Dashboard.css"; 

const SelectPatient = () => {
  const { branch } = useParams();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      const querySnapshot = await getDocs(collection(db, `patients_${branch}`));
      setPatients(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchPatients();
  }, [branch]);

  return (
    <div className="dashboard-container">
      <div className="main-content">
        <h1>Select a Patient in {branch}</h1>
        <ul>
          {patients.length > 0 ? (
            patients.map((patient) => (
              <li key={patient.id} onClick={() => navigate(`/patient-detail/${branch}/${patient.id}`)}>
                {patient.name} (Age: {patient.age})
              </li>
            ))
          ) : (
            <p>No patients found.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default SelectPatient;
