import React from "react";
import { useSelector } from "react-redux";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const { userInfo } = useSelector((state) => state.auth);

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h1 className="dashboard-title">Welcome, {userInfo?.first_name} 👋</h1>
        <p className="dashboard-subtitle">Glad to have you here!</p>
      </div>
    </div>
  );
};

export default Dashboard;