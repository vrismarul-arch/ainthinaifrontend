import { Layout, Avatar, Dropdown, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/api";
import "./Navbar.css";
import logo from "./logo.png";

const { Header } = Layout;

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setUser(null);
          return;
        }

        const res = await api.get("/api/users/profile");
        setUser(res.data);
      } catch (err) {
        console.error("Navbar profile error:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          setUser(null);
        }
      }
    };

    fetchUser();
  }, []);

  /* ================= LOGOUT FUNCTION ================= */
  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (err) {
      console.log("Logout API error:", err);
    }

    localStorage.removeItem("token");
    setUser(null);
    message.success("Logged out successfully");
    navigate("/");
  };

  /* ================= CHECK AUTH BEFORE ACTION ================= */
  const checkAuthAndNavigate = (path) => {
    const token = localStorage.getItem("token");
    
    if (!token || !user) {
      message.warning("Please login first");
      navigate("/login");
      return false;
    }
    
    navigate(path);
    return true;
  };

  /* ================= DROPDOWN ITEMS (ANTD v5) ================= */
  const getDropdownItems = () => {
    const token = localStorage.getItem("token");
    
    if (!token || !user) {
      // Return login option only
      return [
        {
          key: "login",
          label: "Login",
          onClick: () => navigate("/login"),
        },
      ];
    }
    
    // Return full menu for logged in users
    return [
      {
        key: "profile",
        label: "Profile",
        onClick: () => checkAuthAndNavigate("/profile"),
      },
      {
        key: "logout",
        label: "Logout",
        danger: true,
        onClick: handleLogout,
      },
    ];
  };

  return (
    <Header className="navbar">
      {/* LOGO */}
      <Link to="/" className="logo-link">
        <div className="logo">
          <img src={logo} alt="Logo" className="logo-image" />
        </div>
      </Link>

      {/* RIGHT ACTIONS */}
      <div className="right-actions">
        <Dropdown
          menu={{ items: getDropdownItems() }}
          placement="bottomRight"
          trigger={["click"]}
        >
          <Avatar
            size={40}
            style={{ cursor: "pointer" }}
            src={
              user?.profile_pic
                ? user.profile_pic
                : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
          />
        </Dropdown>
      </div>
    </Header>
  );
}