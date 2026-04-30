import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(prev => !prev);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar collapsed={collapsed} />

      <div style={{ flex: 1 }}>
        <Topbar collapsed={collapsed} onToggleSidebar={toggleSidebar} />
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}