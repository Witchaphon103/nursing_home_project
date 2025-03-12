import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../utils/firebase";

const Logout = () => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User Logged Out");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Logout;
