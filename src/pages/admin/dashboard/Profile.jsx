import React, { useEffect, useState } from "react";
import API from "../../../api/api";

const Profile = () => {
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    API.get("/api/admin/profile")
      .then(res => setAdmin(res.data))
      .catch(err => console.error("Auth error:", err));
  }, []);

  if (!admin) return <div>Loading...</div>;

  return (
    <div style={{ padding: 40 }}>
      <h2>Admin Dashboard</h2>


      <p><strong>ID:</strong> {admin.id}</p>
      <p><strong>Name:</strong> {admin.name}</p>
      <p><strong>Email:</strong> {admin.email}</p>
      <p><strong>Phone:</strong> {admin.phone_number}</p> 
    </div>
  );
};

export default Profile;
