import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  message, Table, Tag, Button, Spin, Empty, Card, 
  Space, Tooltip, Badge 
} from "antd";
import { 
  EyeOutlined, 
  CalendarOutlined, 
  UserOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined
} from "@ant-design/icons";
import API from "../../api/api";
import "./MyBookings.css";
import Navbar from "../../components/common/Navbar";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Get status configuration
  const getStatusConfig = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending':
        return { color: 'orange', icon: <ClockCircleOutlined />, text: 'Pending' };
      case 'confirmed':
        return { color: 'blue', icon: <CheckCircleOutlined />, text: 'Confirmed' };
      case 'completed':
        return { color: 'green', icon: <CheckCircleOutlined />, text: 'Completed' };
      case 'cancelled':
        return { color: 'red', icon: <CloseCircleOutlined />, text: 'Cancelled' };
      default:
        return { color: 'default', icon: null, text: status || 'Unknown' };
    }
  };

  // Fetch user bookings
  const fetchMyBookings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/bookings/my-bookings");
      
      console.log("My bookings response:", res.data);
      
      if (res.data.success && res.data.bookings) {
        setBookings(res.data.bookings);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      message.error("Failed to load your bookings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyBookings();
  }, [fetchMyBookings]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Table columns
  const columns = [
    {
      title: 'Booking ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <span className="booking-id">#{id}</span>,
    },
    {
      title: 'Tour',
      dataIndex: 'tour_title',
      key: 'tour_title',
      render: (title) => title || 'Unknown Tour',
    },
    {
      title: 'Dates',
      key: 'dates',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <div><CalendarOutlined /> Check-in: {formatDate(record.check_in)}</div>
          <div><CalendarOutlined /> Check-out: {formatDate(record.check_out)}</div>
        </Space>
      ),
    },
    {
      title: 'Travelers',
      key: 'travelers',
      render: (_, record) => (
        <span>
          <UserOutlined /> {record.adult_count || 0} Adults, {record.child_count || 0} Children
        </span>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount) => <span className="amount">₹ {parseFloat(amount || 0).toLocaleString()}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const config = getStatusConfig(status);
        return <Tag icon={config.icon} color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Tooltip title="View Details">
          <Button 
            type="primary" 
            icon={<EyeOutlined />} 
            onClick={() => navigate(`/booking/${record.id}`)}
            size="small"
          />
        </Tooltip>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="my-bookings">
        <div className="loading-container">
          <Spin size="large" />
          <p>Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <><Navbar />
    <div className="my-bookings">
      <div className="bookings-header">
        <h1>My Bookings</h1>
        <Button type="primary" onClick={fetchMyBookings}>
          Refresh
        </Button>
      </div>

      {bookings.length === 0 ? (
        <Card className="empty-card">
          <Empty
            description="You haven't made any bookings yet"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
          <Button type="primary" onClick={() => navigate('/tours')}>
            Browse Tours
          </Button>
        </Card>
      ) : (
        <Table
          columns={columns}
          dataSource={bookings}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          className="bookings-table"
          expandable={{
            expandedRowRender: (record) => (
              <div className="expanded-details">
                <h4>Travelers Details</h4>
                {record.travelers?.adults?.length > 0 && (
                  <div className="travelers-section">
                    <h5>Adults:</h5>
                    {record.travelers.adults.map((adult, idx) => (
                      <div key={idx} className="traveler-detail">
                        {adult.name} (Age: {adult.age})
                        {adult.aadhaar && ` - Aadhaar: ${adult.aadhaar}`}
                      </div>
                    ))}
                  </div>
                )}
                {record.travelers?.children?.length > 0 && (
                  <div className="travelers-section">
                    <h5>Children:</h5>
                    {record.travelers.children.map((child, idx) => (
                      <div key={idx} className="traveler-detail">
                        {child.name} (Age: {child.age})
                        {child.aadhaar && ` - Aadhaar: ${child.aadhaar}`}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ),
          }}
        />
      )}
    </div>
    </>
    
  );
};

export default MyBookings;