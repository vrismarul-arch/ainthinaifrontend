import React, { useState } from "react";
import API from "../../api/api";
import "./AdminLogin.css";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      window.location.href = "/admin/dashboard";
    } catch {
      alert("Login failed");
    }
  };

  return (
    <div className="split-screen">
      {/* Left Side: Image */}
      <div className="left-side">
        <div className="overlay">
          <h1>Welcome Back</h1>
          <p>Manage your platform with ease and precision.</p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="right-side">
        <div className="form-wrapper">
          <h2>Admin Login</h2>
          <p className="subtitle">Enter your details to access the dashboard</p>
          
          <form onSubmit={login}>
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="admin@example.com"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="login-btn">Sign In</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;