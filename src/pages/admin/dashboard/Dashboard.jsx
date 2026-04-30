import React, { useEffect, useState, useMemo } from "react";
import { Card, Row, Col, Table, Spin, Empty, Statistic, Tag, Button, Avatar, Space } from "antd";
import { Line, Pie } from "@ant-design/plots";
import API from "../../../api/api";
import { 
  RiseOutlined, 
  WalletOutlined, 
  ShoppingOutlined, 
  CalendarOutlined,
  DollarOutlined,
  GlobalOutlined,
  UserOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CompassOutlined
} from "@ant-design/icons";
import "./Dashboard.css";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [tours, setTours] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const safeArray = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.bookings)) return data.bookings;
    return [];
  };

  const fetchDashboardData = async () => {
    try {
      const [bookingRes, tourRes, categoryRes] = await Promise.all([
        API.get("/api/bookings/admin/all"),
        API.get("/api/tours"),
        API.get("/api/categories"),
      ]);

      setBookings(safeArray(bookingRes.data));
      setTours(safeArray(tourRes.data));
      setCategories(safeArray(categoryRes.data));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ---------- Analytics ----------
  const analytics = useMemo(() => {
    const totalRevenue = bookings.reduce(
      (sum, b) => sum + Number(b?.paid_amount || 0),
      0
    );

    const avgValue = bookings.length > 0 ? totalRevenue / bookings.length : 0;

    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    const todayBookings = bookings.filter(
      (b) => new Date(b.booking_date).toDateString() === today
    ).length;

    const yesterdayBookings = bookings.filter(
      (b) => new Date(b.booking_date).toDateString() === yesterday
    ).length;

    const bookingGrowth = yesterdayBookings > 0 
      ? ((todayBookings - yesterdayBookings) / yesterdayBookings) * 100 
      : 0;

    const statusCount = bookings.reduce((acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, {});

    const monthlyRevenue = bookings
      .filter(b => new Date(b.booking_date).getMonth() === new Date().getMonth())
      .reduce((sum, b) => sum + Number(b?.paid_amount || 0), 0);

    const popularTours = bookings.reduce((acc, b) => {
      acc[b.tour_title] = (acc[b.tour_title] || 0) + 1;
      return acc;
    }, {});

    const topTour = Object.entries(popularTours)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return {
      totalRevenue,
      avgValue,
      todayBookings,
      yesterdayBookings,
      bookingGrowth,
      statusCount,
      monthlyRevenue,
      topTour,
      totalTours: tours.length,
      totalCategories: categories.length
    };
  }, [bookings, tours, categories]);

  // ---------- Revenue grouped by day ----------
  const revenueMap = {};
  bookings.forEach((b) => {
    const date = new Date(b.booking_date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    revenueMap[date] = (revenueMap[date] || 0) + Number(b.paid_amount || 0);
  });

  const revenueData = Object.keys(revenueMap)
    .map((date) => ({
      date,
      value: revenueMap[date],
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-7);

  const lineConfig = {
    data: revenueData,
    xField: "date",
    yField: "value",
    smooth: true,
    color: "#8B4513",
    area: {
      style: {
        fill: "l(270) 0:#ffffff 0.5:#f5e6d3 1:#8B4513",
      },
    },
    point: {
      size: 5,
      shape: "circle",
      style: {
        fill: "#8B4513",
        stroke: "#ffffff",
        lineWidth: 2,
      },
    },
    line: {
      style: {
        stroke: "#5D3A1A",
        lineWidth: 3,
      },
    },
    tooltip: {
      formatter: (datum) => {
        return { name: "Revenue", value: `₹ ${datum.value.toLocaleString()}` };
      },
    },
    yAxis: {
      label: {
        formatter: (v) => `₹ ${v}`,
        style: {
          fill: "#5C5C5C",
          fontFamily: "Poppins, sans-serif",
        },
      },
      grid: {
        line: {
          style: {
            stroke: "#E8E8E8",
            lineWidth: 1,
            lineDash: [4, 4],
          },
        },
      },
    },
    xAxis: {
      label: {
        style: {
          fill: "#5C5C5C",
          fontFamily: "Poppins, sans-serif",
        },
      },
      line: {
        style: {
          stroke: "#D4B48C",
        },
      },
    },
  };

  const pieData = Object.keys(analytics.statusCount).map((key) => ({
    type: key.charAt(0).toUpperCase() + key.slice(1),
    value: analytics.statusCount[key],
  }));

  const pieConfig = {
    data: pieData,
    angleField: "value",
    colorField: "type",
    radius: 0.8,
    label: {
      type: "outer",
      content: "{name}: {percentage}",
      style: {
        fill: "#5C5C5C",
        fontSize: 12,
        fontFamily: "Poppins, sans-serif",
      },
    },
    interactions: [{ type: "element-active" }],
    color: ['#8B4513', '#A0522D', '#CD853F', '#D2B48C', '#F4E6D3'],
    legend: {
      position: 'bottom',
      itemName: {
        style: {
          fill: '#5C5C5C',
          fontFamily: "Poppins, sans-serif",
        },
      },
    },
  };

  const columns = [
    { 
      title: "Booking ID", 
      dataIndex: "id",
      key: "id",
      render: (id) => <span className="booking-id">#{id}</span>
    },
    { 
      title: "Tour", 
      dataIndex: "tour_title",
      key: "tour_title",
      render: (title) => <span className="tour-title">{title}</span>
    },
    { 
      title: "Customer", 
      dataIndex: "customer_name",
      key: "customer_name",
      render: (name) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} className="brown-avatar" />
          <span className="customer-name">{name || 'N/A'}</span>
        </Space>
      )
    },
    {
      title: "Amount",
      dataIndex: "paid_amount",
      key: "paid_amount",
      render: (amt) => <span className="amount">₹ {amt?.toLocaleString() || 0}</span>,
    },
    { 
      title: "Status", 
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colors = {
          confirmed: 'confirmed',
          pending: 'pending',
          cancelled: 'cancelled',
          completed: 'completed'
        };
        return <Tag className={`status-tag ${colors[status?.toLowerCase()] || ''}`}>{status}</Tag>;
      }
    },
    {
      title: "Date",
      dataIndex: "booking_date",
      key: "booking_date",
      render: (date) => (
        <span className="date-text">
          {new Date(date).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </span>
      )
    }
  ];

  // Custom formatter for numbers
  const formatNumber = (value) => {
    return value?.toLocaleString() || '0';
  };

  if (loading)
    return (
      <div className="loading-container">
        <Spin size="large" tip="Loading dashboard..." className="brown-spinner" />
      </div>
    );

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Travel Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back to your travel management console</p>
        </div>
        <div className="header-actions">
          <Button className="brown-btn-outline" icon={<CompassOutlined />}>
            Export Report
          </Button>
          <Button className="brown-btn-primary">
            View All
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" bordered={false}>
            <Statistic
              title={<span className="stat-title">TOTAL BOOKINGS</span>}
              value={bookings.length}
              valueStyle={{ 
                color: '#4A4A4A', 
                fontSize: '28px', 
                fontWeight: 600,
                fontFamily: 'Poppins, sans-serif'
              }}
              prefix={<ShoppingOutlined className="stat-icon" />}
            />
            <div className="stat-footer">
              <span className="stat-label">Active reservations</span>
              <span className="stat-value brown-text">{formatNumber(bookings.length)}</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" bordered={false}>
            <Statistic
              title={<span className="stat-title">TOTAL REVENUE</span>}
              value={analytics.totalRevenue}
              valueStyle={{ 
                color: '#4A4A4A', 
                fontSize: '28px', 
                fontWeight: 600,
                fontFamily: 'Poppins, sans-serif'
              }}
              prefix={<DollarOutlined className="stat-icon" />}
              suffix="₹"
            />
            <div className="stat-footer">
              <span className="stat-label">This month</span>
              <span className="stat-value brown-text">₹ {formatNumber(analytics.monthlyRevenue)}</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" bordered={false}>
            <Statistic
              title={<span className="stat-title">AVG. BOOKING</span>}
              value={analytics.avgValue.toFixed(2)}
              valueStyle={{ 
                color: '#4A4A4A', 
                fontSize: '28px', 
                fontWeight: 600,
                fontFamily: 'Poppins, sans-serif'
              }}
              prefix={<WalletOutlined className="stat-icon" />}
              suffix="₹"
            />
            <div className="stat-footer">
              <span className="stat-label">Per booking</span>
              <span className="stat-value brown-text">↑ 12.5%</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" bordered={false}>
            <Statistic
              title={<span className="stat-title">TODAY'S BOOKINGS</span>}
              value={analytics.todayBookings}
              valueStyle={{ 
                color: '#4A4A4A', 
                fontSize: '28px', 
                fontWeight: 600,
                fontFamily: 'Poppins, sans-serif'
              }}
              prefix={<CalendarOutlined className="stat-icon" />}
            />
            <div className="stat-footer">
              <span className="stat-label">vs yesterday</span>
              <span className={`stat-value ${analytics.bookingGrowth >= 0 ? 'positive' : 'negative'}`}>
                {analytics.bookingGrowth >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                {Math.abs(analytics.bookingGrowth).toFixed(1)}%
              </span>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Secondary Stats */}
      <Row gutter={[24, 24]} style={{ marginTop: 8 }}>
        <Col xs={24} sm={8}>
          <Card className="mini-stat-card" bordered={false}>
            <Space align="center">
              <GlobalOutlined className="mini-stat-icon" />
              <div>
                <div className="mini-stat-label">Active Tours</div>
                <div className="mini-stat-value">{formatNumber(analytics.totalTours)}</div>
              </div>
            </Space>
          </Card>
        </Col>
        
        <Col xs={24} sm={8}>
          <Card className="mini-stat-card" bordered={false}>
            <Space align="center">
              <RiseOutlined className="mini-stat-icon" />
              <div>
                <div className="mini-stat-label">Top Tour</div>
                <div className="mini-stat-value">{analytics.topTour}</div>
              </div>
            </Space>
          </Card>
        </Col>
        
        <Col xs={24} sm={8}>
          <Card className="mini-stat-card" bordered={false}>
            <Space align="center">
              <UserOutlined className="mini-stat-icon" />
              <div>
                <div className="mini-stat-label">Categories</div>
                <div className="mini-stat-value numbertxt">{formatNumber(analytics.totalCategories)}</div>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card 
            title={<span className="chart-title">Revenue Trend</span>} 
            bordered={false}
            className="chart-card"
            extra={<Tag className="brown-tag">Last 7 days</Tag>}
          >
            <div className="chart-container">
              <Line {...lineConfig} />
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card 
            title={<span className="chart-title">Booking Distribution</span>} 
            bordered={false}
            className="chart-card"
          >
            <div className="chart-container">
              <Pie {...pieConfig} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Bookings Table */}
      <Card 
        title={
          <div className="table-title">
            <span>Recent Bookings</span>
            <Tag className="brown-tag">Latest Updates</Tag>
          </div>
        }
        bordered={false}
        className="table-card"
        extra={<Button type="text" className="brown-link">View All →</Button>}
        style={{ marginTop: 24 }}
      >
        {bookings.length === 0 ? (
          <Empty description="No bookings found" className="brown-empty" />
        ) : (
          <Table
            columns={columns}
            dataSource={bookings.slice(0, 5)}
            rowKey="id"
            pagination={false}
            className="custom-table"
          />
        )}
      </Card>
    </div>
  );
};

export default Dashboard;