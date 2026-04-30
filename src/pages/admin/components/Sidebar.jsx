import { Layout, Menu } from "antd";
import {
  AppstoreOutlined,
  CalculatorTwoTone,
  DashboardFilled,
  SlidersFilled,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import "./sidebar.css";

const { Sider } = Layout;

export default function Sidebar({ collapsed }) {
  const location = useLocation();

  const menuConfig = [
    {
      key: "dashboard-group",
      label: "Dashboard",
      icon: <DashboardFilled />,
      children: [
        { key: "/admin/dashboard", label: "Dashboard" },
      ],
    },
    {
      key: "tours-group",
      label: "Tours Management",
      icon: <AppstoreOutlined />,
      children: [
        { key: "/admin/categories", label: "Categories" },
        { key: "/admin/booking", label: "Bookings" },
        { key: "/admin/tours", label: "Tours" },
        { key: "/admin/amenities", label: "Amenities" },
      ],
    },
    {
      key: "settings-group",
      label: "Bookings Management",
      icon: <CalculatorTwoTone />,
      children: [
                { key: "/admin/booking", label: "Bookings" },

      ],
    },
  ];

  const renderMenuItems = (items) =>
    items.map((item) =>
      item.children
        ? {
            key: item.key,
            icon: item.icon,
            label: item.label,
            children: renderMenuItems(item.children),
          }
        : {
            key: item.key,
            label: <Link to={item.key}>{item.label}</Link>,
          }
    );

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      trigger={null}
      width={260}
      theme="light"
      className="shadow-md min-h-screen"
    >
      <img src="/logo.png" alt="Logo" className="logo-sidebar" />

      {!collapsed && <div className="sidebar-heading">MAIN MENU</div>}

      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        defaultOpenKeys={["dashboard-group"]}
        items={renderMenuItems(menuConfig)}
      />
    </Sider>
  );
}