import React, { useEffect, useState } from "react";
import { Card, Row, Col, Table, Spin } from "antd";
import {
  AppstoreOutlined,
  TagsOutlined,
  ShoppingCartOutlined,
  DollarOutlined
} from "@ant-design/icons";
import API from "../../../api/api";

const AdminDashboard = () => {

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    tours: 0,
    categories: 0,
    bookings: 0,
    revenue: 0
  });
  const [recentTours, setRecentTours] = useState([]);

  const fetchDashboard = async () => {
    try {
      const [toursRes, catRes] = await Promise.all([
        API.get("/api/tours"),
        API.get("/api/categories")
      ]);

      setStats({
        tours: toursRes.data.length || 0,
        categories: catRes.data.length || 0,
        bookings: 0, // connect when bookings API ready
        revenue: 0
      });

      setRecentTours((toursRes.data || []).slice(0, 5));

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const columns = [
    { title: "Title", dataIndex: "title" },
    { title: "Place", dataIndex: "place" },
    { title: "Price", dataIndex: "adult_price" }
  ];

  if (loading) return <Spin style={{ margin: 40 }} />;

  return (
    <div style={{ padding: 24 }}>

      <h2 style={{ marginBottom: 20 }}>Admin Dashboard</h2>

      {/* Stats */}
      <Row gutter={16}>

        <Col span={6}>
          <Card>
            <AppstoreOutlined style={{ fontSize: 28 }} />
            <h3>Total Tours</h3>
            <p>{stats.tours}</p>
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <TagsOutlined style={{ fontSize: 28 }} />
            <h3>Categories</h3>
            <p>{stats.categories}</p>
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <ShoppingCartOutlined style={{ fontSize: 28 }} />
            <h3>Bookings</h3>
            <p>{stats.bookings}</p>
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <DollarOutlined style={{ fontSize: 28 }} />
            <h3>Revenue</h3>
            <p>₹ {stats.revenue}</p>
          </Card>
        </Col>

      </Row>

      {/* Recent Tours */}
      <Card title="Recent Tours" style={{ marginTop: 24 }}>
        <Table
          rowKey="id"
          dataSource={recentTours}
          columns={columns}
          pagination={false}
        />
      </Card>

    </div>
  );
};

export default AdminDashboard;