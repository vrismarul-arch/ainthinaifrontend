import React from "react";
import { Avatar, Dropdown } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  ProfileOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./topbar.css";

export default function Topbar({ collapsed, onToggleSidebar }) {
  const navigate = useNavigate();

  const profileMenu = [
    { key: "1", label: "Profile", icon: <ProfileOutlined /> },
    { key: "3", label: "Logout", icon: <LogoutOutlined />, danger: true },
  ];

  const handleMenuClick = ({ key }) => {
    if (key === "3") {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/admin/login", { replace: true });
    } else if (key === "1") {
      navigate("/admin/profile");
    }
  };

  return (
    <header className="topbar">
      {/* Toggle Button */}
      <div
        onClick={onToggleSidebar}
        style={{ cursor: "pointer", fontSize: 18 }}
      >
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </div>

      <h2 className="topbar-title">Admin Panel</h2>

      <Dropdown
        menu={{ items: profileMenu, onClick: handleMenuClick }}
        placement="bottomRight"
        trigger={["click"]}
      >
        <div style={{ cursor: "pointer" }}>
          <Avatar size="large" icon={<UserOutlined />} />
        </div>
      </Dropdown>
    </header>
  );
}