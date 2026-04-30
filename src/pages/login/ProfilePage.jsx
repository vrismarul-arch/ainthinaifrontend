import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { message, Drawer, Input, Spin } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  CalendarOutlined,
  BookOutlined,
  EditOutlined,
  LogoutOutlined,
  SafetyOutlined
} from "@ant-design/icons";
import api from "../../api/api";
import "./ProfilePage.css";
import Navbar from "../../components/common/Navbar";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: ""
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/users/profile");
      setUser(res.data);
      setEditForm({
        name: res.data.name || "",
        email: res.data.email || "",
        phone: res.data.phone || ""
      });
    } catch (error) {
      message.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = async () => {
    try {
      setUpdating(true);
      const res = await api.put("/api/users/profile", editForm);

      if (res.data.success) {
        setUser({ ...user, ...editForm });
        message.success("Profile updated successfully");
        setDrawerOpen(false);
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    message.success("Logged out successfully");
    navigate("/login");
  };

  const goToMyBookings = () => {
    navigate("/my-bookings");
  };

  if (loading) {
    return (
      <div className="profile-wrapper">
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return <div>Failed to load profile</div>;
  }

  return (
    <>
      <Navbar />

      <div className="profile-wrapper">

        {/* HEADER */}
        <div className="profile-header">

          <div className="profile-avatar-wrapper">
            <img
              src={
                user.profile_pic ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt="Profile"
              className="profile-avatar"
            />
            {user.role === "admin" && (
              <div className="admin-badge">
                <SafetyOutlined />
              </div>
            )}
          </div>

          <div className="profile-header-info">
            <h2>{user.name}</h2>
            <p>{user.email}</p>
            {user.phone && <p><PhoneOutlined /> {user.phone}</p>}
            <span className={`role-badge ${user.role}`}>
              {user.role === "admin" ? "Administrator" : "Member"}
            </span>
          </div>

          {/* ✅ EDIT ICON IN HEADER */}
          <div className="header-edit-icon" onClick={() => setDrawerOpen(true)}>
            <EditOutlined />
          </div>

        </div>

        {/* STATS */}
        <div className="profile-stats">
          <div className="stat-card" onClick={goToMyBookings}>
            <BookOutlined />
            <div>
              <h4>My Bookings</h4>
              <p>View all your bookings</p>
            </div>
          </div>
        </div>

        {/* DETAILS */}
        <div className="profile-details">
          <h3>Profile Information</h3>

          <div className="details-grid">
            <p><UserOutlined /> {user.name}</p>
            <p><MailOutlined /> {user.email}</p>
            <p><PhoneOutlined /> {user.phone || "Not provided"}</p>
            <p><IdcardOutlined /> {user.id}</p>
            {user.created_at && (
              <p>
                <CalendarOutlined />
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* ACTION BUTTONS
        <div className="profile-actions">
          <button className="profile-btn" onClick={goToMyBookings}>
            <BookOutlined /> My Bookings
          </button>

          <button className="profile-btn logout-btn" onClick={handleLogout}>
            <LogoutOutlined /> Logout
          </button>
        </div> */}

        {/* ✅ DRAWER INSTEAD OF MODAL */}
        <Drawer
          title="Edit Profile"
          width={400}
          onClose={() => setDrawerOpen(false)}
          open={drawerOpen}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleEditProfile();
            }}
          >
            <div className="form-group">
              <label>Full Name</label>
              <Input
                prefix={<UserOutlined />}
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <Input
                prefix={<MailOutlined />}
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <Input
                prefix={<PhoneOutlined />}
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm({ ...editForm, phone: e.target.value })
                }
              />
            </div>

            <button
              type="submit"
              className="profile-btn"
              disabled={updating}
              style={{ marginTop: 20 }}
            >
              {updating ? <Spin size="small" /> : "Save Changes"}
            </button>
          </form>
        </Drawer>

      </div>
    </>
  );
};

export default ProfilePage;
