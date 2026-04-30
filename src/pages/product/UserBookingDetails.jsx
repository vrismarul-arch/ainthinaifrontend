import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  message, Card, Row, Col, Tag, Spin, Button, Descriptions,
  Empty, Badge, Statistic, Image, Tabs, Tooltip, Timeline, Divider
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  MailOutlined,
  IdcardOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  PictureOutlined,
  CoffeeOutlined,
  CarryOutOutlined,
  SafetyOutlined,
  StarOutlined,
  PhoneOutlined,
  GlobalOutlined,
  MedicineBoxOutlined,
  FileProtectOutlined,
  TeamOutlined,
  SolutionOutlined,
  HeartOutlined,
  CameraOutlined,
  AlertOutlined,
  CheckSquareOutlined
} from "@ant-design/icons";
import API from "../../api/api";
import "./UserBookingDetails.css";
import Navbar from "../../components/common/Navbar";

const { TabPane } = Tabs;

const BRAND = "#654039";

const UserBookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [tourDetails, setTourDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingTour, setLoadingTour] = useState(false);
  const [error, setError] = useState(null);

  const parseJsonField = useCallback((field) => {
    if (!field) return [];
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  }, []);

  const getStatusConfig = useCallback((status) => {
    switch (status?.toLowerCase()) {
      case "pending":   return { color: "orange", icon: <ClockCircleOutlined />, text: "Pending" };
      case "confirmed": return { color: "blue",   icon: <CheckCircleOutlined />, text: "Confirmed" };
      case "completed": return { color: "green",  icon: <CheckCircleOutlined />, text: "Completed" };
      case "cancelled": return { color: "red",    icon: <CloseCircleOutlined />, text: "Cancelled" };
      default:          return { color: "default", icon: null, text: status || "Unknown" };
    }
  }, []);

  const fetchTourDetails = useCallback(async (tourId) => {
    if (!tourId) return;
    try {
      setLoadingTour(true);
      const res = await API.get(`/api/tours/${String(tourId)}`);
      setTourDetails({
        ...res.data,
        amenities:      parseJsonField(res.data.amenities),
        activities:     parseJsonField(res.data.activities),
        food:           parseJsonField(res.data.food),
        things_to_know: parseJsonField(res.data.things_to_know),
        gallery_images: parseJsonField(res.data.gallery_images),
      });
    } catch (err) {
      console.error("Error fetching tour details:", err);
    } finally {
      setLoadingTour(false);
    }
  }, [parseJsonField]);

  const fetchBookingDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get(`/api/bookings/${id}`);
      if (res.data.success && res.data.data) {
        setBooking(res.data.data);
        if (res.data.data.tour_id) await fetchTourDetails(res.data.data.tour_id);
      } else {
        setError("Booking not found");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch booking details");
      message.error("Failed to load booking details");
    } finally {
      setLoading(false);
    }
  }, [id, fetchTourDetails]);

  useEffect(() => { fetchBookingDetails(); }, [fetchBookingDetails]);

  const formatDate = (dateString, includeTime = true) => {
    if (!dateString) return "N/A";
    const options = includeTime
      ? { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }
      : { day: "2-digit", month: "long", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-IN", options);
  };

  const getDuration = () => {
    if (booking?.check_in && booking?.check_out) {
      const diff = Math.ceil(
        Math.abs(new Date(booking.check_out) - new Date(booking.check_in)) / (1000 * 60 * 60 * 24)
      );
      return `${diff} night${diff > 1 ? "s" : ""}`;
    }
    return null;
  };

  /* ── Shared styles ── */
  const sectionCard = {
    borderRadius: 16,
    marginBottom: 24,
    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
    border: "1px solid #f0ebe9",
    overflow: "hidden",
  };

  const labelStyle = { color: "#888", fontSize: 13, marginBottom: 2 };
  const valueStyle = { color: "#1a1a1a", fontSize: 15, fontWeight: 600 };

  const InfoRow = ({ icon, label, value, tag }) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderBottom: "1px dashed #f0ebe9" }}>
      <span style={{ color: BRAND, fontSize: 16, marginTop: 2 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={labelStyle}>{label}</div>
        {tag ? tag : <div style={valueStyle}>{value || "N/A"}</div>}
      </div>
    </div>
  );

  const SectionTitle = ({ icon, title }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 20px", background: "#fff7f6", borderBottom: "2px solid #f0ebe9" }}>
      <span style={{ color: BRAND, fontSize: 18 }}>{icon}</span>
      <span style={{ fontWeight: 700, fontSize: 16, color: BRAND }}>{title}</span>
    </div>
  );

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16 }}>
          <Spin size="large" />
          <p style={{ color: "#888" }}>Loading booking details...</p>
        </div>
      </>
    );
  }

  if (error || !booking) {
    return (
      <>
        <Navbar />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <Empty description={error || "Booking not found"} image={Empty.PRESENTED_IMAGE_SIMPLE} />
          <Button type="primary" onClick={() => navigate("/my-bookings")} icon={<ArrowLeftOutlined />} style={{ marginTop: 16, background: BRAND, border: "none" }}>
            Back to My Bookings
          </Button>
        </div>
      </>
    );
  }

  const statusConfig = getStatusConfig(booking.status);
  const totalAmount   = parseFloat(booking.total_amount || 0);
  const paidAmount    = parseFloat(booking.paid_amount || 0);
  const pendingAmount = totalAmount - paidAmount;
  const duration      = getDuration();

  const pt = booking.primary_traveler || {};
  const ti = booking.travel_info || {};
  const ei = booking.emergency_info || {};
  const cs = booking.consent || {};
  const id_details = booking.identity_details || {};

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 1200, margin: "90px auto 40px", padding: "0 20px" }}>

        {/* ── BACK BUTTON ── */}
        <Button
          type="link"
          onClick={() => navigate("/my-bookings")}
          icon={<ArrowLeftOutlined />}
          style={{ color: BRAND, fontWeight: 600, marginBottom: 16, paddingLeft: 0 }}
        >
          Back to My Bookings
        </Button>

        {/* ── STATUS BANNER ── */}
        <div style={{
          background: `linear-gradient(135deg, ${BRAND} 0%, #8b5a52 100%)`,
          borderRadius: 16, padding: "20px 28px", marginBottom: 24,
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12
        }}>
          <div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, marginBottom: 4 }}>Booking ID</div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 22 }}>#{booking.id}</div>
            <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, marginTop: 4 }}>{booking.tour_title}</div>
          </div>
          <Tag icon={statusConfig.icon} color={statusConfig.color} style={{ fontSize: 15, padding: "6px 18px", borderRadius: 30, fontWeight: 600 }}>
            {statusConfig.text}
          </Tag>
        </div>

        <Row gutter={[24, 0]}>

          {/* ══════════════════════════════════════════════════════
              LEFT COLUMN
          ══════════════════════════════════════════════════════ */}
          <Col xs={24} lg={14}>

            {/* ── 1. PRIMARY TRAVELER ── */}
            <div style={sectionCard}>
              <SectionTitle icon={<UserOutlined />} title="Primary Traveler" />
              <div style={{ padding: "16px 20px" }}>
                <InfoRow icon={<UserOutlined />}    label="Full Name"            value={pt.name} />
                <InfoRow icon={<MailOutlined />}    label="Email"                value={pt.email} />
                <InfoRow icon={<PhoneOutlined />}   label="Mobile"               value={`${pt.countryCode || ""} ${pt.mobile || ""}`} />
                <InfoRow icon={<GlobalOutlined />}  label="Nationality"          value={pt.nationality} />
                <InfoRow icon={<EnvironmentOutlined />} label="Country of Residence" value={pt.residence} />
              </div>
            </div>

            {/* ── 2. IDENTITY VERIFICATION ── */}
            <div style={sectionCard}>
              <SectionTitle icon={<IdcardOutlined />} title="Identity Verification" />
              <div style={{ padding: "16px 20px" }}>
                <InfoRow icon={<SolutionOutlined />} label="ID Type"
                  tag={
                    <Tag color="blue" style={{ marginTop: 2, textTransform: "capitalize" }}>
                      {booking.identity_type || "N/A"}
                    </Tag>
                  }
                />
                {id_details.idNumber && (
                  <InfoRow icon={<IdcardOutlined />} label="ID Number" value={id_details.idNumber} />
                )}
                {id_details.passportNumber && (
                  <InfoRow icon={<IdcardOutlined />} label="Passport Number" value={id_details.passportNumber} />
                )}
                {id_details.passportIssuingCountry && (
                  <InfoRow icon={<GlobalOutlined />} label="Issuing Country" value={id_details.passportIssuingCountry} />
                )}
                {id_details.passportExpiryDate && (
                  <InfoRow icon={<CalendarOutlined />} label="Passport Expiry" value={formatDate(id_details.passportExpiryDate, false)} />
                )}
                {/* Documents */}
                {booking.documents?.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={labelStyle}>Uploaded Documents</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                      {booking.documents.map((doc, i) => (
                        <Tag key={i} color="green" icon={<FileProtectOutlined />}>
                          {doc.document_type?.replace(/_/g, " ").toUpperCase()} — {formatDate(doc.uploaded_at, false)}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── 3. TRAVEL INFORMATION ── */}
            <div style={sectionCard}>
              <SectionTitle icon={<CalendarOutlined />} title="Travel Information" />
              <div style={{ padding: "16px 20px" }}>
                <InfoRow icon={<CalendarOutlined />}    label="Arrival Date in India"       value={formatDate(ti.arrivalDate, false)} />
                <InfoRow icon={<CalendarOutlined />}    label="Departure Date from India"   value={formatDate(ti.departureDate, false)} />
                <InfoRow icon={<CarryOutOutlined />}    label="Accommodation Preference"
                  tag={<Tag color="blue" style={{ marginTop: 2, textTransform: "capitalize" }}>{ti.accommodationPreference || "N/A"}</Tag>}
                />
                <InfoRow icon={<CoffeeOutlined />}      label="Dietary Preference"
                  tag={<Tag color="orange" style={{ marginTop: 2, textTransform: "capitalize" }}>{ti.dietaryPreference || "N/A"}</Tag>}
                />
                {ti.dietaryDetails && (
                  <InfoRow icon={<InfoCircleOutlined />} label="Dietary Details" value={ti.dietaryDetails} />
                )}
                <InfoRow icon={<GlobalOutlined />}      label="Language Preference"
                  tag={
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                      {(ti.languagePreference || []).map((lang, i) => (
                        <Tag key={i} color="purple">{lang}</Tag>
                      ))}
                    </div>
                  }
                />
                {ti.medicalConditions && (
                  <InfoRow icon={<MedicineBoxOutlined />} label="Medical Conditions" value={ti.medicalConditions} />
                )}
                {ti.physicalLimitations && (
                  <InfoRow icon={<AlertOutlined />} label="Physical Limitations" value={ti.physicalLimitations} />
                )}
              </div>
            </div>

            {/* ── 4. EMERGENCY CONTACT & INSURANCE ── */}
            <div style={sectionCard}>
              <SectionTitle icon={<SafetyOutlined />} title="Safety & Emergency Information" />
              <div style={{ padding: "16px 20px" }}>
                <div style={{ fontWeight: 600, color: "#555", marginBottom: 8, fontSize: 13, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Emergency Contact
                </div>
                <InfoRow icon={<UserOutlined />}  label="Contact Name"   value={ei.contactName} />
                <InfoRow icon={<HeartOutlined />} label="Relationship"   value={ei.relationship} />
                <InfoRow icon={<PhoneOutlined />} label="Contact Number" value={`${ei.contactCountryCode || ""} ${ei.contactNumber || ""}`} />

                <Divider style={{ margin: "12px 0" }} />

                <div style={{ fontWeight: 600, color: "#555", marginBottom: 8, fontSize: 13, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Travel Insurance
                </div>
                {ei.travellingWithoutInsurance ? (
                  <Tag color="red" icon={<CloseCircleOutlined />} style={{ fontSize: 13, padding: "4px 12px" }}>
                    Travelling Without Insurance
                  </Tag>
                ) : (
                  <>
                    <InfoRow icon={<FileProtectOutlined />} label="Insurance Provider" value={ei.insuranceProvider} />
                    <InfoRow icon={<IdcardOutlined />}       label="Policy Number"      value={ei.policyNumber} />
                    <InfoRow icon={<CalendarOutlined />}    label="Valid Until"         value={formatDate(ei.insuranceValidUntil, false)} />
                  </>
                )}
              </div>
            </div>

            {/* ── 5. DECLARATIONS & CONSENT ── */}
            <div style={sectionCard}>
              <SectionTitle icon={<CheckSquareOutlined />} title="Declarations & Consent" />
              <div style={{ padding: "16px 20px" }}>
                {[
                  { key: "infoAccurate",               label: "Information is accurate and complete" },
                  { key: "acknowledgeRuralEnvironment", label: "Acknowledged rural/outdoor environment" },
                  { key: "agreeFollowGuidelines",      label: "Agreed to follow local cultural & safety guidelines" },
                  { key: "acceptTerms",                label: "Accepted Terms & Conditions and Cancellation Policy" },
                  { key: "consentEmergencyMedical",    label: "Consented to emergency medical assistance" },
                  { key: "consentPhotography",         label: "Consented to photography & media usage (optional)" },
                ].map(item => (
                  <div key={item.key} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 0", borderBottom: "1px dashed #f0ebe9"
                  }}>
                    {cs[item.key]
                      ? <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 16 }} />
                      : <CloseCircleOutlined style={{ color: "#ff4d4f", fontSize: 16 }} />}
                    <span style={{ fontSize: 14, color: cs[item.key] ? "#333" : "#aaa" }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── 6. ADDITIONAL TRAVELERS ── */}
            <div style={sectionCard}>
              <SectionTitle icon={<TeamOutlined />} title="All Travelers" />
              <div style={{ padding: "16px 20px" }}>
                <Tabs defaultActiveKey="primary">

                  {/* Primary Traveler Tab */}
                  <TabPane tab={<span><UserOutlined /> Primary</span>} key="primary">
                    <Card size="small" style={{ borderRadius: 12, border: `2px solid ${BRAND}`, background: "#fff7f6" }}>
                      <Badge.Ribbon text="Primary Contact" color={BRAND}>
                        <div style={{ paddingTop: 8 }}>
                          <Row gutter={[16, 12]}>
                            <Col xs={24} sm={12}>
                              <div style={labelStyle}>Full Name</div>
                              <div style={valueStyle}>{pt.name || "N/A"}</div>
                            </Col>
                            <Col xs={24} sm={12}>
                              <div style={labelStyle}>Email</div>
                              <div style={valueStyle}>{pt.email || "N/A"}</div>
                            </Col>
                            <Col xs={24} sm={12}>
                              <div style={labelStyle}>Mobile</div>
                              <div style={valueStyle}>{pt.countryCode} {pt.mobile}</div>
                            </Col>
                            <Col xs={24} sm={12}>
                              <div style={labelStyle}>Nationality</div>
                              <div style={valueStyle}>{pt.nationality || "N/A"}</div>
                            </Col>
                            <Col xs={24} sm={12}>
                              <div style={labelStyle}>Country of Residence</div>
                              <div style={valueStyle}>{pt.residence || "N/A"}</div>
                            </Col>
                          </Row>
                        </div>
                      </Badge.Ribbon>
                    </Card>
                  </TabPane>

                  {/* Adults Tab */}
                  <TabPane tab={<span><UserOutlined /> Adults ({booking.adult_count || 0})</span>} key="adults">
                    {booking.travelers?.adults?.length > 0 ? (
                      <Row gutter={[16, 16]}>
                        {booking.travelers.adults.map((adult, i) => (
                          <Col xs={24} sm={12} md={8} key={i}>
                            <Card size="small" style={{ borderRadius: 12, border: "1px solid #e5e7eb" }}>
                              <Badge status="success" text={<strong>Adult {i + 2}</strong>} />
                              <div style={{ marginTop: 10 }}>
                                <div style={labelStyle}>Name</div>
                                <div style={valueStyle}>{adult.name || "N/A"}</div>
                                <div style={{ ...labelStyle, marginTop: 8 }}>Age</div>
                                <div style={valueStyle}>{adult.age || "N/A"}</div>
                                {adult.aadhaar && (
                                  <>
                                    <div style={{ ...labelStyle, marginTop: 8 }}>Aadhaar</div>
                                    <Tooltip title={adult.aadhaar}>
                                      <div style={valueStyle}>{adult.aadhaar.slice(0, 4)}••••{adult.aadhaar.slice(-4)}</div>
                                    </Tooltip>
                                  </>
                                )}
                              </div>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    ) : (
                      <Empty description="No additional adult travelers" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    )}
                  </TabPane>

                  {/* Children Tab */}
                  <TabPane tab={<span>Children ({booking.child_count || 0})</span>} key="children">
                    {booking.travelers?.children?.length > 0 ? (
                      <Row gutter={[16, 16]}>
                        {booking.travelers.children.map((child, i) => (
                          <Col xs={24} sm={12} md={8} key={i}>
                            <Card size="small" style={{ borderRadius: 12, border: "1px solid #e5e7eb" }}>
                              <Badge status="warning" text={<strong>Child {i + 1}</strong>} />
                              <div style={{ marginTop: 10 }}>
                                <div style={labelStyle}>Name</div>
                                <div style={valueStyle}>{child.name || "N/A"}</div>
                                <div style={{ ...labelStyle, marginTop: 8 }}>Age</div>
                                <div style={valueStyle}>{child.age || "N/A"}</div>
                                {child.aadhaar && (
                                  <>
                                    <div style={{ ...labelStyle, marginTop: 8 }}>Aadhaar</div>
                                    <Tooltip title={child.aadhaar}>
                                      <div style={valueStyle}>{child.aadhaar.slice(0, 4)}••••{child.aadhaar.slice(-4)}</div>
                                    </Tooltip>
                                  </>
                                )}
                              </div>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    ) : (
                      <Empty description="No children travelers" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    )}
                  </TabPane>
                </Tabs>
              </div>
            </div>

          </Col>

          {/* ══════════════════════════════════════════════════════
              RIGHT COLUMN — sticky summary
          ══════════════════════════════════════════════════════ */}
          <Col xs={24} lg={10}>
            <div style={{ position: "sticky", top: 90 }}>

              {/* ── BOOKING SUMMARY ── */}
              <div style={sectionCard}>
                <SectionTitle icon={<FileTextOutlined />} title="Booking Summary" />
                <div style={{ padding: "16px 20px" }}>
                  <InfoRow icon={<CalendarOutlined />} label="Booking Date"  value={formatDate(booking.booking_date)} />
                  <InfoRow icon={<ClockCircleOutlined />} label="Created At" value={formatDate(booking.created_at)} />
                  <InfoRow icon={<CalendarOutlined />} label="Check-in"  value={formatDate(booking.check_in, false)} />
                  <InfoRow icon={<CalendarOutlined />} label="Check-out" value={formatDate(booking.check_out, false)} />
                  {duration && (
                    <InfoRow icon={<CarryOutOutlined />} label="Duration"
                      tag={<Tag color="blue" style={{ marginTop: 2 }}>{duration}</Tag>}
                    />
                  )}
                  <InfoRow icon={<TeamOutlined />} label="Guests"
                    value={`${booking.adult_count || 0} Adult${booking.adult_count !== 1 ? "s" : ""}${booking.child_count > 0 ? `, ${booking.child_count} Child${booking.child_count !== 1 ? "ren" : ""}` : ""}`}
                  />
                </div>
              </div>

              {/* ── PAYMENT SUMMARY ── */}
              <div style={sectionCard}>
                <SectionTitle icon={<DollarOutlined />} title="Payment Summary" />
                <div style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <span style={{ color: "#555" }}>Payment Type</span>
                    <Tag color={booking.payment_type === "full" ? "green" : "orange"} style={{ fontSize: 13, padding: "4px 12px" }}>
                      {booking.payment_type === "full" ? "Full Payment" : booking.payment_type === "partial" ? "Partial Payment" : booking.payment_type || "N/A"}
                    </Tag>
                  </div>

                  <Row gutter={[12, 12]}>
                    <Col span={8}>
                      <div style={{ background: "#f9f9f9", borderRadius: 12, padding: "14px 12px", textAlign: "center", border: "1px solid #eee" }}>
                        <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>Total</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "#333" }}>₹{totalAmount.toLocaleString()}</div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ background: "#f6ffed", borderRadius: 12, padding: "14px 12px", textAlign: "center", border: "1px solid #b7eb8f" }}>
                        <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>Paid</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "#52c41a" }}>₹{paidAmount.toLocaleString()}</div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ background: "#fffbe6", borderRadius: 12, padding: "14px 12px", textAlign: "center", border: "1px solid #ffe58f" }}>
                        <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>Pending</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "#faad14" }}>₹{pendingAmount.toLocaleString()}</div>
                      </div>
                    </Col>
                  </Row>

                  {pendingAmount > 0 && (
                    <div style={{ marginTop: 16, background: "#fff7f6", borderRadius: 10, padding: "12px 16px", border: `1px solid ${BRAND}` }}>
                      <div style={{ fontSize: 13, color: BRAND, fontWeight: 600 }}>
                        Balance Due: ₹{pendingAmount.toLocaleString()}
                      </div>
                      <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
                        Please complete your payment before check-in.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── TOUR DETAILS (collapsed) ── */}
              <div style={sectionCard}>
                <SectionTitle icon={<EnvironmentOutlined />} title="Tour Details" />
                {loadingTour ? (
                  <div style={{ padding: 24, textAlign: "center" }}><Spin /></div>
                ) : tourDetails ? (
                  <Tabs defaultActiveKey="basic" style={{ padding: "0 16px 16px" }}>
                    <TabPane tab={<span><InfoCircleOutlined /> Info</span>} key="basic">
                      <InfoRow icon={<EnvironmentOutlined />} label="Tour Name"  value={tourDetails.title} />
                      <InfoRow icon={<EnvironmentOutlined />} label="Location"   value={`${tourDetails.place || ""}, ${tourDetails.district || ""}, ${tourDetails.state || ""}`} />
                      <InfoRow icon={<TagsIcon />}            label="Category"
                        tag={<Tag color="blue" style={{ marginTop: 2 }}>{tourDetails.category_name || "N/A"}</Tag>}
                      />
                      {tourDetails.description && (
                        <div style={{ marginTop: 12 }}>
                          <div style={labelStyle}>Description</div>
                          <div style={{ fontSize: 14, color: "#555", lineHeight: 1.6, marginTop: 4 }}>
                            {tourDetails.description.length > 200
                              ? tourDetails.description.slice(0, 200) + "..."
                              : tourDetails.description}
                          </div>
                        </div>
                      )}
                    </TabPane>

                    {tourDetails.activities?.length > 0 && (
                      <TabPane tab={<span><StarOutlined /> Activities</span>} key="activities">
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, paddingTop: 8 }}>
                          {tourDetails.activities.map((item, i) => (
                            <Tag key={i} color="orange">{typeof item === "object" ? item.title : item}</Tag>
                          ))}
                        </div>
                      </TabPane>
                    )}

                    {tourDetails.food?.length > 0 && (
                      <TabPane tab={<span><CoffeeOutlined /> Food</span>} key="food">
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, paddingTop: 8 }}>
                          {tourDetails.food.map((item, i) => (
                            <Tag key={i} color="purple">{typeof item === "object" ? item.title : item}</Tag>
                          ))}
                        </div>
                      </TabPane>
                    )}

                    {tourDetails.main_image && (
                      <TabPane tab={<span><PictureOutlined /> Images</span>} key="images">
                        <Image src={tourDetails.main_image} alt="Tour" style={{ width: "100%", borderRadius: 10, objectFit: "cover", maxHeight: 200 }} />
                      </TabPane>
                    )}

                    {tourDetails.location && (
                      <TabPane tab={<span><EnvironmentOutlined /> Map</span>} key="map">
                        <iframe
                          src={tourDetails.location} title="Tour Location"
                          width="100%" height="220"
                          style={{ border: 0, borderRadius: 8 }}
                          allowFullScreen loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      </TabPane>
                    )}
                  </Tabs>
                ) : (
                  <div style={{ padding: 20 }}>
                    <Empty description="Tour details not available" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  </div>
                )}
              </div>

            </div>
          </Col>
        </Row>
      </div>
    </>
  );
};

// Tiny helper since antd doesn't export TagsIcon
const TagsIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
    <path d="M21.41 11.58l-9-9A2 2 0 0011 2H4a2 2 0 00-2 2v7a2 2 0 00.59 1.42l9 9a2 2 0 002.82 0l7-7a2 2 0 000-2.84zM7 9a2 2 0 110-4 2 2 0 010 4z"/>
  </svg>
);

export default UserBookingDetails;