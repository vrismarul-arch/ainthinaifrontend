import React, { useEffect, useState, useCallback, useMemo } from "react";
import { 
  message, Drawer, Spin, Image, Tag, Empty, Statistic, 
  Card, Row, Col, Button, Tooltip, Badge, Tabs, Descriptions,
  Divider, Typography, Space, Alert, Progress, Table
} from "antd";
import {
  ReloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  DollarOutlined,
  CalendarOutlined,
  FileTextOutlined,
  SafetyOutlined,
  IdcardOutlined,
  GlobalOutlined,
  HeartOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  MedicineBoxOutlined,
  CoffeeOutlined,
  HomeOutlined,
  CarOutlined,
  CheckSquareOutlined,
  DownloadOutlined,
  FileImageOutlined,
  FilePdfOutlined
} from "@ant-design/icons";
import API from "../../../api/api";
import "./AdminBookings.css";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tourDetails, setTourDetails] = useState({});
  const [selectedTour, setSelectedTour] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loadingTours, setLoadingTours] = useState({});
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingDrawerOpen, setBookingDrawerOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  // Helper function to parse JSON fields
  const parseJsonField = useCallback((field) => {
    if (!field) return null;
    try {
      return typeof field === 'string' ? JSON.parse(field) : field;
    } catch {
      return field;
    }
  }, []);

  // Helper function to safely format ID for display
  const formatIdForDisplay = useCallback((id) => {
    if (!id) return 'N/A';
    return String(id).substring(0, 8) + '...';
  }, []);

  // Helper function to get traveler count
  const getTravelerCount = useCallback((travelers) => {
    if (!travelers) return 0;
    let count = 0;
    if (travelers.adults && Array.isArray(travelers.adults)) {
      count += travelers.adults.length;
    }
    if (travelers.children && Array.isArray(travelers.children)) {
      count += travelers.children.length;
    }
    return count;
  }, []);

  // Get status badge color and icon
  const getStatusConfig = useCallback((status) => {
    switch (status?.toLowerCase()) {
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
  }, []);

  // Helper function to get file icon based on URL
  const getFileIcon = useCallback((url) => {
    if (!url) return <FileImageOutlined />;
    const extension = url.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return <FileImageOutlined style={{ color: '#52c41a' }} />;
    } else if (extension === 'pdf') {
      return <FilePdfOutlined style={{ color: '#f5222d' }} />;
    }
    return <FileTextOutlined />;
  }, []);

  // Helper function to safely render travelers
  const renderTravelers = useCallback((booking) => {
    if (!booking) {
      return <Empty description="No travelers data" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }

    const travelerElements = [];

    // Add primary traveler first
    if (booking.primary_traveler) {
      travelerElements.push(
        <Card key="primary" size="small" className="traveler-card" style={{ marginBottom: 10, borderLeft: '3px solid gold' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
              <Badge status="success" />
              <Text strong>Primary Traveler</Text>
              <Tag color="gold">Primary</Tag>
            </Space>
            <Descriptions size="small" column={2}>
              <Descriptions.Item label="Name">{booking.primary_traveler.name || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Email">{booking.primary_traveler.email || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Mobile">
                {booking.primary_traveler.countryCode || ''} {booking.primary_traveler.mobile || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Nationality">{booking.primary_traveler.nationality || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Residence" span={2}>{booking.primary_traveler.residence || 'N/A'}</Descriptions.Item>
            </Descriptions>
          </Space>
        </Card>
      );
    }

    // Add additional adults if they exist
    if (booking.travelers?.adults && Array.isArray(booking.travelers.adults) && booking.travelers.adults.length > 0) {
      booking.travelers.adults.forEach((adult, index) => {
        travelerElements.push(
          <Card key={`adult-${index}`} size="small" className="traveler-card" style={{ marginBottom: 10 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <Badge status="processing" />
                <Text strong>Adult {index + 1}</Text>
              </Space>
              <Descriptions size="small" column={2}>
                <Descriptions.Item label="Name">{adult.name || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Age">{adult.age || 'N/A'}</Descriptions.Item>
                {adult.aadhaar && (
                  <Descriptions.Item label="Aadhaar" span={2}>{adult.aadhaar}</Descriptions.Item>
                )}
              </Descriptions>
            </Space>
          </Card>
        );
      });
    }

    // Add children if they exist
    if (booking.travelers?.children && Array.isArray(booking.travelers.children) && booking.travelers.children.length > 0) {
      booking.travelers.children.forEach((child, index) => {
        travelerElements.push(
          <Card key={`child-${index}`} size="small" className="traveler-card" style={{ marginBottom: 10 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <Badge status="warning" />
                <Text strong>Child {index + 1}</Text>
              </Space>
              <Descriptions size="small" column={2}>
                <Descriptions.Item label="Name">{child.name || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Age">{child.age || 'N/A'}</Descriptions.Item>
                {child.aadhaar && (
                  <Descriptions.Item label="Aadhaar" span={2}>{child.aadhaar}</Descriptions.Item>
                )}
              </Descriptions>
            </Space>
          </Card>
        );
      });
    }

    if (travelerElements.length > 0) {
      return travelerElements;
    }

    return <Empty description="No additional travelers" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }, []);

  // Helper function to render documents
  const renderDocuments = useCallback((documents) => {
    if (!documents || documents.length === 0) {
      return <Empty description="No documents uploaded" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }

    return (
      <Row gutter={[16, 16]}>
        {documents.map((doc, index) => {
          const isImage = doc.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
          return (
            <Col xs={24} sm={12} md={8} key={index}>
              <Card size="small" className="document-card">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Space>
                    {getFileIcon(doc.url)}
                    <Text strong>{doc.type?.toUpperCase().replace('_', ' ')}</Text>
                  </Space>
                  {isImage ? (
                    <div className="document-preview">
                      <Image
                        src={doc.url}
                        alt={doc.type}
                        style={{ maxHeight: 100, objectFit: 'cover' }}
                        preview={{
                          visible: false,
                          onVisibleChange: (visible) => {
                            if (visible) {
                              setPreviewImage(doc.url);
                              setPreviewVisible(true);
                            }
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="document-placeholder">
                      <FileTextOutlined style={{ fontSize: 48, color: '#999' }} />
                    </div>
                  )}
                  <Space>
                    <Button
                      type="link"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => window.open(doc.url, '_blank')}
                    >
                      View
                    </Button>
                    <Button
                      type="link"
                      size="small"
                      icon={<DownloadOutlined />}
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = doc.url;
                        link.download = doc.url.split('/').pop();
                        link.click();
                      }}
                    >
                      Download
                    </Button>
                  </Space>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                  </Text>
                </Space>
              </Card>
            </Col>
          );
        })}
      </Row>
    );
  }, [getFileIcon]);

  // Fetch tour details for multiple tour IDs
  const fetchTourDetails = useCallback(async (tourIds) => {
    const tourDetailsMap = {};
    const errors = [];

    for (const tourId of tourIds) {
      try {
        setLoadingTours(prev => ({ ...prev, [tourId]: true }));
        const url = `/api/tours/${String(tourId)}`;
        const res = await API.get(url);

        // Parse JSON string fields
        const tourData = {
          ...res.data,
          amenities: parseJsonField(res.data.amenities),
          activities: parseJsonField(res.data.activities),
          food: parseJsonField(res.data.food),
          things_to_know: parseJsonField(res.data.things_to_know),
          gallery_images: parseJsonField(res.data.gallery_images)
        };

        tourDetailsMap[tourId] = tourData;
      } catch (err) {
        console.error(`Error fetching tour ${tourId}:`, err);
        errors.push({ tourId, error: err.response?.data?.message || err.message });
        tourDetailsMap[tourId] = {
          title: `Tour (ID: ${tourId?.substring(0, 8)}...)`,
          adult_price: 0,
          child_price: 0,
          error: true,
          errorMessage: err.response?.data?.message || "Failed to load"
        };
      } finally {
        setLoadingTours(prev => ({ ...prev, [tourId]: false }));
      }
    }

    if (errors.length > 0) {
      console.warn("Tour fetch errors:", errors);
    }

    setTourDetails(prevDetails => ({
      ...prevDetails,
      ...tourDetailsMap
    }));
  }, [parseJsonField]);

  // Fetch all bookings
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get("/api/bookings/admin/all");

      const bookingsData = Array.isArray(res.data) ? res.data :
        (res.data?.bookings ? res.data.bookings : []);

      // Parse JSON fields in each booking
      const processedBookings = bookingsData.map(booking => ({
        ...booking,
        identity_details: parseJsonField(booking.identity_details),
        language_preference: parseJsonField(booking.language_preference)
      }));

      setBookings(processedBookings);

      // Fetch tour details for each unique tour_id
      const uniqueTourIds = [...new Set(bookingsData.map(b => b.tour_id).filter(id => id))];
      if (uniqueTourIds.length > 0) {
        await fetchTourDetails(uniqueTourIds);
      }

    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(err.response?.data?.message || "Failed to fetch bookings");
      message.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, [fetchTourDetails, parseJsonField]);

  // Update booking status
  const updateBookingStatus = useCallback(async (bookingId, newStatus) => {
    try {
      setUpdatingStatus(prev => ({ ...prev, [bookingId]: true }));
      await API.put(`/api/bookings/admin/${bookingId}/status`, { status: newStatus });
      message.success(`Booking status updated to ${newStatus}`);

      setBookings(prev => prev.map(booking =>
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      ));
    } catch (err) {
      console.error("Error updating status:", err);
      message.error("Failed to update status");
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [bookingId]: false }));
    }
  }, []);

  // Handle booking click to open details drawer
  const handleBookingClick = useCallback((booking) => {
    setSelectedBooking(booking);
    setBookingDrawerOpen(true);
  }, []);

  // Close drawers
  const closeBookingDrawer = useCallback(() => {
    setBookingDrawerOpen(false);
    setSelectedBooking(null);
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Memoized stats
  const bookingStats = useMemo(() => ({
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    totalRevenue: bookings.reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0),
    totalPaid: bookings.reduce((sum, b) => sum + parseFloat(b.paid_amount || 0), 0),
    withInsurance: bookings.filter(b => !b.emergency_info?.travellingWithoutInsurance).length,
    withoutInsurance: bookings.filter(b => b.emergency_info?.travellingWithoutInsurance).length,
    international: bookings.filter(b => b.primary_traveler?.nationality !== 'India').length,
    domestic: bookings.filter(b => b.primary_traveler?.nationality === 'India').length
  }), [bookings]);

  if (loading) {
    return (
      <div className="admin-bookings">
        <div className="loading-container">
          <Spin size="large" />
          <p>Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-bookings">
        <div className="error-container">
          <h3>Error Loading Bookings</h3>
          <p>{error}</p>
          <Button type="primary" onClick={fetchBookings} icon={<ReloadOutlined />}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-bookings">
      {/* Header Section */}
      <div className="bookings-header">
        <Title level={2}>Booking Management</Title>
        <Button
          type="primary"
          onClick={fetchBookings}
          icon={<ReloadOutlined />}
          className="refresh-button"
        >
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card total">
            <Statistic title="Total Bookings" value={bookingStats.total} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card pending">
            <Statistic title="Pending" value={bookingStats.pending} prefix={<ClockCircleOutlined />} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card confirmed">
            <Statistic title="Confirmed" value={bookingStats.confirmed} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card completed">
            <Statistic title="Completed" value={bookingStats.completed} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card cancelled">
            <Statistic title="Cancelled" value={bookingStats.cancelled} prefix={<CloseCircleOutlined />} valueStyle={{ color: '#f5222d' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card revenue">
            <Statistic title="Total Revenue" value={bookingStats.totalRevenue} prefix="₹" precision={2} valueStyle={{ color: '#722ed1' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card paid">
            <Statistic title="Total Paid" value={bookingStats.totalPaid} prefix="₹" precision={2} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card insurance">
            <Statistic title="With Insurance" value={bookingStats.withInsurance} prefix={<SafetyOutlined />} valueStyle={{ color: '#13c2c2' }} />
          </Card>
        </Col>
      </Row>

      {/* Bookings Table */}
      {bookings.length === 0 ? (
        <div className="empty-state">
          <Empty description="No bookings found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      ) : (
        <div className="table-container">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Primary Traveler</th>
                <th>Tour</th>
                <th>Travelers</th>
                <th>Dates</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <BookingRow
                  key={booking.id}
                  booking={booking}
                  tourDetails={tourDetails}
                  loadingTours={loadingTours}
                  updatingStatus={updatingStatus}
                  onBookingClick={handleBookingClick}
                  onUpdateStatus={updateBookingStatus}
                  getTravelerCount={getTravelerCount}
                  formatIdForDisplay={formatIdForDisplay}
                  getStatusConfig={getStatusConfig}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Booking Details Drawer */}
      <BookingDetailsDrawer
        booking={selectedBooking}
        open={bookingDrawerOpen}
        onClose={closeBookingDrawer}
        tourDetails={tourDetails[selectedBooking?.tour_id]}
        renderTravelers={renderTravelers}
        renderDocuments={renderDocuments}
        formatIdForDisplay={formatIdForDisplay}
        getStatusConfig={getStatusConfig}
        parseJsonField={parseJsonField}
        previewImage={previewImage}
        previewVisible={previewVisible}
        setPreviewImage={setPreviewImage}
        setPreviewVisible={setPreviewVisible}
      />
    </div>
  );
};

// Booking Row Component
const BookingRow = React.memo(({
  booking,
  tourDetails,
  loadingTours,
  updatingStatus,
  onBookingClick,
  onUpdateStatus,
  getTravelerCount,
  formatIdForDisplay,
  getStatusConfig
}) => {
  const travelerCount = getTravelerCount(booking.travelers);
  const tourDetail = tourDetails[booking.tour_id];
  const isUpdating = updatingStatus[booking.id];
  const statusConfig = getStatusConfig(booking.status);

  const totalAmount = parseFloat(booking.total_amount || 0);
  const paidAmount = parseFloat(booking.paid_amount || 0);
  const paymentPercentage = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

  return (
    <tr className={booking.status ? `status-${booking.status.toLowerCase()}` : ''}>
      <td className="booking-id-cell">
        <Tooltip title={booking.id}>
          <span className="booking-id">{formatIdForDisplay(booking.id)}</span>
        </Tooltip>
        <div className="booking-id-full">
          <small>ID: {booking.id}</small>
        </div>
      </td>

      <td className="customer-cell">
        <div className="customer-info">
          <div className="customer-name">
            <UserOutlined /> {booking.primary_traveler?.name || 'N/A'}
          </div>
          <div className="customer-email">
            <MailOutlined /> {booking.primary_traveler?.email || 'N/A'}
          </div>
          <div className="customer-phone">
            <PhoneOutlined /> {booking.primary_traveler?.countryCode || ''} {booking.primary_traveler?.mobile || 'N/A'}
          </div>
          <div className="customer-nationality">
            <GlobalOutlined /> {booking.primary_traveler?.nationality || 'N/A'}
          </div>
        </div>
      </td>

      <td className="tour-cell">
        <div className="tour-info">
          <div className="tour-title">
            {booking.tour_title || 'Unknown Tour'}
          </div>
          {tourDetail && !tourDetail.error && (
            <Tag color="blue">{tourDetail.category_name || 'Tour'}</Tag>
          )}
        </div>
      </td>

      <td className="traveler-cell">
        <div className="traveler-info">
          <div className="traveler-count">
            <span>Adults: {booking.adult_count || 0}</span>
            <span>Children: {booking.child_count || 0}</span>
          </div>
          <div className="traveler-total">
            <small>Total: {travelerCount}</small>
          </div>
          <Button
            type="link"
            size="small"
            onClick={() => onBookingClick(booking)}
          >
            View Details
          </Button>
        </div>
      </td>

      <td className="dates-cell">
        <div className="dates-info">
          <div><CalendarOutlined /> In: {booking.check_in ? new Date(booking.check_in).toLocaleDateString() : 'N/A'}</div>
          <div><CalendarOutlined /> Out: {booking.check_out ? new Date(booking.check_out).toLocaleDateString() : 'N/A'}</div>
          {booking.check_in && booking.check_out && (
            <Tag color="purple">
              {Math.ceil((new Date(booking.check_out) - new Date(booking.check_in)) / (1000 * 60 * 60 * 24))} nights
            </Tag>
          )}
        </div>
      </td>

      <td className="amount-cell">
        <div className="amount-info">
          <div className="total-amount">₹ {totalAmount.toLocaleString()}</div>
          <div className="paid-amount">Paid: ₹ {paidAmount.toLocaleString()}</div>
          <Tag color={booking.payment_type === 'full' ? 'green' : 'orange'}>
            {booking.payment_type === 'full' ? 'Full' : 'Partial'}
          </Tag>
          <Progress percent={paymentPercentage} size="small" showInfo={false} />
        </div>
      </td>

      <td className="status-cell">
        <Tag icon={statusConfig.icon} color={statusConfig.color} className="status-tag">
          {statusConfig.text}
        </Tag>
        {booking.emergency_info?.travellingWithoutInsurance ? (
          <Tag color="red" className="insurance-tag">No Insurance</Tag>
        ) : (
          <Tag color="green" className="insurance-tag">Insured</Tag>
        )}
      </td>

      <td className="actions-cell">
        <div className="action-buttons">
          <select
            className="status-select"
            value={booking.status || 'pending'}
            onChange={(e) => onUpdateStatus(booking.id, e.target.value)}
            disabled={isUpdating}
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          {isUpdating && <Spin size="small" />}
          <Tooltip title="View Full Details">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => onBookingClick(booking)}
              size="small"
            />
          </Tooltip>
        </div>
      </td>
    </tr>
  );
});

// Booking Details Drawer Component
const BookingDetailsDrawer = ({ 
  booking, 
  open, 
  onClose, 
  tourDetails, 
  renderTravelers, 
  renderDocuments,
  formatIdForDisplay, 
  getStatusConfig, 
  parseJsonField,
  previewImage,
  previewVisible,
  setPreviewImage,
  setPreviewVisible
}) => {
  if (!booking) return null;

  const statusConfig = getStatusConfig(booking.status);
  const totalAmount = parseFloat(booking.total_amount || 0);
  const paidAmount = parseFloat(booking.paid_amount || 0);
  const pendingAmount = totalAmount - paidAmount;
  const identityDetails = booking.identity_details || {};
  const languagePref = booking.travel_info?.languagePreference || [];

  return (
    <Drawer
      title={
        <Space>
          <FileTextOutlined />
          <span>Booking Details - {formatIdForDisplay(booking.id)}</span>
          <Tag icon={statusConfig.icon} color={statusConfig.color}>{statusConfig.text}</Tag>
        </Space>
      }
      placement="right"
      onClose={onClose}
      open={open}
      width={900}
      className="booking-drawer"
    >
      <div className="drawer-content">
        <Tabs defaultActiveKey="1" className="booking-tabs">
          {/* Tab 1: Primary Traveler Info */}
          <TabPane 
            tab={<span><UserOutlined />Primary Traveler</span>} 
            key="1"
          >
            <Card className="detail-card">
              <Descriptions title="Personal Information" bordered column={2} size="small">
                <Descriptions.Item label="Full Name" span={2}>{booking.primary_traveler?.name || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Email">{booking.primary_traveler?.email || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Mobile">
                  {booking.primary_traveler?.countryCode || ''} {booking.primary_traveler?.mobile || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Nationality">{booking.primary_traveler?.nationality || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Country of Residence" span={2}>{booking.primary_traveler?.residence || 'N/A'}</Descriptions.Item>
              </Descriptions>
            </Card>

            <Card className="detail-card" title="Stay Information" style={{ marginTop: 16 }}>
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Check-in Date">
                  {booking.check_in ? new Date(booking.check_in).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'long', year: 'numeric'
                  }) : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Check-out Date">
                  {booking.check_out ? new Date(booking.check_out).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'long', year: 'numeric'
                  }) : 'N/A'}
                </Descriptions.Item>
                {booking.check_in && booking.check_out && (
                  <Descriptions.Item label="Duration" span={2}>
                    {Math.ceil((new Date(booking.check_out) - new Date(booking.check_in)) / (1000 * 60 * 60 * 24))} nights
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </TabPane>

          {/* Tab 2: Identity Verification */}
          <TabPane 
            tab={<span><IdcardOutlined />Identity</span>} 
            key="2"
          >
            <Card className="detail-card">
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Identity Type" span={2}>
                  <Tag color="blue">{booking.identity_type || 'N/A'}</Tag>
                </Descriptions.Item>
              </Descriptions>

              {booking.primary_traveler?.nationality === 'India' ? (
                // Indian Traveler Identity
                <Descriptions title="Indian ID Details" bordered column={2} size="small" style={{ marginTop: 16 }}>
                  <Descriptions.Item label="ID Number" span={2}>{identityDetails?.idNumber || 'N/A'}</Descriptions.Item>
                </Descriptions>
              ) : (
                // International Traveler Identity
                <>
                  <Descriptions title="Passport Details" bordered column={2} size="small" style={{ marginTop: 16 }}>
                    <Descriptions.Item label="Passport Number">{identityDetails?.passportNumber || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Issuing Country">{identityDetails?.passportIssuingCountry || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Expiry Date" span={2}>
                      {identityDetails?.passportExpiryDate ? new Date(identityDetails.passportExpiryDate).toLocaleDateString() : 'N/A'}
                    </Descriptions.Item>
                  </Descriptions>

                  <Descriptions title="Visa Details" bordered column={2} size="small" style={{ marginTop: 16 }}>
                    <Descriptions.Item label="Visa Type">{identityDetails?.visaType || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Visa Number">{identityDetails?.visaNumber || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Expiry Date" span={2}>
                      {identityDetails?.visaExpiryDate ? new Date(identityDetails.visaExpiryDate).toLocaleDateString() : 'N/A'}
                    </Descriptions.Item>
                  </Descriptions>
                </>
              )}
            </Card>
          </TabPane>

          {/* Tab 3: Travel Information */}
          <TabPane 
            tab={<span><GlobalOutlined />Travel Info</span>} 
            key="3"
          >
            <Card className="detail-card">
              <Descriptions title="Travel Plans" bordered column={2} size="small">
                <Descriptions.Item label="Arrival in India">
                  {booking.travel_info?.arrivalDate ? new Date(booking.travel_info.arrivalDate).toLocaleDateString() : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Departure from India">
                  {booking.travel_info?.departureDate ? new Date(booking.travel_info.departureDate).toLocaleDateString() : 'N/A'}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions title="Preferences" bordered column={2} size="small" style={{ marginTop: 16 }}>
                <Descriptions.Item label="Accommodation">
                  <Tag color="purple">{booking.travel_info?.accommodationPreference || 'N/A'}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Dietary Preference">
                  <Tag color="green">{booking.travel_info?.dietaryPreference || 'N/A'}</Tag>
                </Descriptions.Item>
                {booking.travel_info?.dietaryDetails && (
                  <Descriptions.Item label="Dietary Details" span={2}>{booking.travel_info.dietaryDetails}</Descriptions.Item>
                )}
                <Descriptions.Item label="Languages" span={2}>
                  {languagePref.length > 0 ? languagePref.map((lang, idx) => (
                    <Tag key={idx} color="blue">{lang}</Tag>
                  )) : 'N/A'}
                </Descriptions.Item>
              </Descriptions>

              {(booking.travel_info?.medicalConditions || booking.travel_info?.physicalLimitations) && (
                <Descriptions title="Health Information" bordered column={2} size="small" style={{ marginTop: 16 }}>
                  {booking.travel_info?.medicalConditions && (
                    <Descriptions.Item label="Medical Conditions" span={2}>{booking.travel_info.medicalConditions}</Descriptions.Item>
                  )}
                  {booking.travel_info?.physicalLimitations && (
                    <Descriptions.Item label="Physical Limitations" span={2}>{booking.travel_info.physicalLimitations}</Descriptions.Item>
                  )}
                </Descriptions>
              )}
            </Card>
          </TabPane>

          {/* Tab 4: Emergency & Insurance */}
          <TabPane 
            tab={<span><SafetyOutlined />Emergency</span>} 
            key="4"
          >
            <Card className="detail-card">
              <Alert
                message={booking.emergency_info?.travellingWithoutInsurance ? "Travelling Without Insurance" : "Insurance Provided"}
                type={booking.emergency_info?.travellingWithoutInsurance ? "warning" : "success"}
                showIcon
                style={{ marginBottom: 16 }}
              />

              <Descriptions title="Emergency Contact" bordered column={2} size="small">
                <Descriptions.Item label="Contact Name">{booking.emergency_info?.contactName || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Relationship">{booking.emergency_info?.relationship || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Contact Number" span={2}>
                  {booking.emergency_info?.contactCountryCode || ''} {booking.emergency_info?.contactNumber || 'N/A'}
                </Descriptions.Item>
              </Descriptions>

              {!booking.emergency_info?.travellingWithoutInsurance && (
                <Descriptions title="Insurance Details" bordered column={2} size="small" style={{ marginTop: 16 }}>
                  <Descriptions.Item label="Provider">{booking.emergency_info?.insuranceProvider || 'N/A'}</Descriptions.Item>
                  <Descriptions.Item label="Policy Number">{booking.emergency_info?.policyNumber || 'N/A'}</Descriptions.Item>
                  <Descriptions.Item label="Valid Until" span={2}>
                    {booking.emergency_info?.insuranceValidUntil ? new Date(booking.emergency_info.insuranceValidUntil).toLocaleDateString() : 'N/A'}
                  </Descriptions.Item>
                </Descriptions>
              )}
            </Card>
          </TabPane>

          {/* Tab 5: Additional Travelers */}
          <TabPane 
            tab={<span><UserOutlined />Travelers</span>} 
            key="5"
          >
            <Card className="detail-card">
              <Statistic
                title="Total Travelers"
                value={(booking.adult_count || 0) + (booking.child_count || 0)}
                suffix={`(Adults: ${booking.adult_count || 0}, Children: ${booking.child_count || 0})`}
              />
              <Divider />
              {renderTravelers(booking)}
            </Card>
          </TabPane>

          {/* Tab 6: Documents */}
          <TabPane 
            tab={<span><FileTextOutlined />Documents</span>} 
            key="6"
          >
            <Card className="detail-card">
              {renderDocuments(booking.documents)}
            </Card>
          </TabPane>

          {/* Tab 7: Payment Details */}
          <TabPane 
            tab={<span><DollarOutlined />Payment</span>} 
            key="7"
          >
            <Card className="detail-card">
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic title="Total Amount" value={totalAmount} prefix="₹" precision={2} />
                </Col>
                <Col span={8}>
                  <Statistic title="Paid Amount" value={paidAmount} prefix="₹" precision={2} valueStyle={{ color: '#52c41a' }} />
                </Col>
                <Col span={8}>
                  <Statistic title="Pending" value={pendingAmount} prefix="₹" precision={2} valueStyle={{ color: '#faad14' }} />
                </Col>
              </Row>
              
              <Progress percent={totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0} status="active" style={{ marginTop: 16 }} />

              <Descriptions bordered column={2} size="small" style={{ marginTop: 16 }}>
                <Descriptions.Item label="Payment Type">
                  <Tag color={booking.payment_type === 'full' ? 'green' : 'orange'}>
                    {booking.payment_type === 'full' ? 'Full Payment' : 'Partial Payment (30% Advance)'}
                  </Tag>
                </Descriptions.Item>
                {booking.payment_id && (
                  <Descriptions.Item label="Payment ID" span={2}>{booking.payment_id}</Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </TabPane>

          {/* Tab 8: Consents */}
          <TabPane 
            tab={<span><CheckSquareOutlined />Consents</span>} 
            key="8"
          >
            <Card className="detail-card">
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Information Accurate">
                  {booking.consent?.infoAccurate ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag>}
                </Descriptions.Item>
                <Descriptions.Item label="Acknowledge Rural Environment">
                  {booking.consent?.acknowledgeRuralEnvironment ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag>}
                </Descriptions.Item>
                <Descriptions.Item label="Follow Local Guidelines">
                  {booking.consent?.agreeFollowGuidelines ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag>}
                </Descriptions.Item>
                <Descriptions.Item label="Accept Terms & Conditions">
                  {booking.consent?.acceptTerms ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag>}
                </Descriptions.Item>
                <Descriptions.Item label="Emergency Medical Consent">
                  {booking.consent?.consentEmergencyMedical ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag>}
                </Descriptions.Item>
                <Descriptions.Item label="Photography Consent">
                  {booking.consent?.consentPhotography ? <Tag color="green">Yes</Tag> : <Tag color="orange">No</Tag>}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </TabPane>

          {/* Tab 9: Tour Details */}
          {tourDetails && (
            <TabPane 
              tab={<span><HomeOutlined />Tour</span>} 
              key="9"
            >
              <Card className="detail-card">
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label="Tour Title">{booking.tour_title || 'N/A'}</Descriptions.Item>
                  <Descriptions.Item label="Tour ID">{booking.tour_id || 'N/A'}</Descriptions.Item>
                </Descriptions>

                {tourDetails && !tourDetails.error && (
                  <>
                    <Divider />
                    <Descriptions bordered column={2} size="small">
                      <Descriptions.Item label="Category">{tourDetails.category_name || 'N/A'}</Descriptions.Item>
                      <Descriptions.Item label="Place">{tourDetails.place || 'N/A'}</Descriptions.Item>
                      <Descriptions.Item label="State">{tourDetails.state || 'N/A'}</Descriptions.Item>
                      <Descriptions.Item label="District">{tourDetails.district || 'N/A'}</Descriptions.Item>
                    </Descriptions>

                    <Row gutter={16} style={{ marginTop: 16 }}>
                      <Col span={12}>
                        <Statistic title="Adult Price" value={tourDetails.adult_price || 0} prefix="₹" precision={2} />
                      </Col>
                      <Col span={12}>
                        <Statistic title="Child Price" value={tourDetails.child_price || 0} prefix="₹" precision={2} />
                      </Col>
                    </Row>
                  </>
                )}
              </Card>
            </TabPane>
          )}
        </Tabs>
      </div>

      {/* Image Preview Modal */}
      <Image
        style={{ display: 'none' }}
        preview={{
          visible: previewVisible,
          onVisibleChange: (visible) => setPreviewVisible(visible),
          src: previewImage
        }}
      />
    </Drawer>
  );
};

export default AdminBookings;