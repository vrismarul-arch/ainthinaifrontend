import React, { useState, useEffect, useRef } from "react";
import { DatePicker, InputNumber, Button, Drawer, Divider, Modal } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../../api/api";
import "antd/dist/reset.css";
import "./TripDetails.css";
import dayjs from "dayjs";

/* ── Page Loader Component ── */
const PageLoader = () => (
  <div className="page-loader">
    <div className="loader-inner">
      <div className="loader-logo">
        <div className="loader-icon">
          <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M30 5C16.2 5 5 16.2 5 30s11.2 25 25 25 25-11.2 25-25S43.8 5 30 5z"
              stroke="#654039"
              strokeWidth="2"
              fill="none"
              className="loader-circle"
            />
            <path
              d="M20 30c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10"
              stroke="#654039"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="loader-arc"
            />
            <circle cx="30" cy="30" r="4" fill="#654039" className="loader-dot" />
          </svg>
        </div>
        <div className="loader-bars">
          <span></span><span></span><span></span><span></span><span></span>
        </div>
      </div>
      <p className="loader-text">Loading your adventure...</p>
    </div>
  </div>
);

const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [tour, setTour] = useState(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState("Basic Details");
  const [expandedDesc, setExpandedDesc] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const openDayDetails = (dayObj) => {
    setSelectedDay(dayObj);
    setIsModalOpen(true);
  };

  const toggleReadMore = (id) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const sections = {
    "Basic Details": useRef(null),
    "Activities": useRef(null),
    "Food": useRef(null),
    "Itinerary": useRef(null),
    "Things To Know": useRef(null),
    "Location": useRef(null),
  };

  /* ── FETCH TOUR ── */
  useEffect(() => {
    if (!id) return;
    const fetchTour = async () => {
      try {
        const res = await API.get(`/api/tours/${id}`);
        setTour(res.data);
        // Small delay so loader feels intentional
        setTimeout(() => {
          setIsLoading(false);
          setTimeout(() => setPageReady(true), 50);
        }, 600);
      } catch (err) {
        console.error("Error fetching tour:", err);
        setIsLoading(false);
        setPageReady(true);
      }
    };
    fetchTour();
  }, [id]);

  /* ── MOBILE DETECTION ── */
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 992);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  /* ── SCROLL SPY ── */
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;
      for (const [tab, ref] of Object.entries(sections)) {
        if (ref.current) {
          const { offsetTop, offsetHeight } = ref.current;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveTab(tab);
            break;
          }
        }
      }
    };
    if (isMobile) {
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [isMobile, sections]);

  const scrollToSection = (tab) => {
    const section = sections[tab].current;
    if (section) {
      window.scrollTo({ top: section.offsetTop - 80, behavior: "smooth" });
      setActiveTab(tab);
    }
  };

  const handleBooking = (fromDrawer = false) => {
    navigate(`/product/${id}/booking`, {
      state: {
        adultCount: adults,
        childCount: children,
        totalPrice: total,
        tourTitle: tour.title,
      },
    });
    if (fromDrawer) setDrawerVisible(false);
  };

  const openBookingDrawer = () => setDrawerVisible(true);

  if (isLoading) return <PageLoader />;
  if (!tour) return <PageLoader />;

  const adultPrice = Number(tour.adult_price || 0);
  const childPrice = Number(tour.child_price || 0);
  const total = adults * adultPrice + children * childPrice;

  const truncateText = (text, maxLength) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  const BookingForm = ({ inDrawer = false }) => (
    <>
      <div className="price-info">
        <div>
          ₹ {adultPrice.toLocaleString()} <span>/ Adult</span>
        </div>
        <div>
          ₹ {childPrice.toLocaleString()} <span>/ Child (From 4 to 10 years)</span>
        </div>
      </div>

      <hr className="card-divider" />

      <label>Adults</label>
      <InputNumber
        min={1}
        max={10}
        value={adults}
        onChange={(val) => setAdults(val || 1)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <label>Children (Age 5-12)</label>
      <InputNumber
        min={0}
        max={5}
        value={children}
        onChange={(val) => setChildren(val || 0)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <div className="total-row">
        <h3>Total Amount</h3>
        <div className="total-price">₹ {total.toLocaleString()}</div>
      </div>

      <Button
        size="large"
        block
        className="book-btn"
        onClick={() => handleBooking(inDrawer)}
      >
        {inDrawer ? "CONFIRM BOOKING" : "BOOK NOW"}
      </Button>
      <h4 style={{ width: "100%", marginTop: 10 }}>
        Advance / Partial payment is non-refundable / non-transferable
      </h4>
    </>
  );

  return (
    <div className={`trip-page ${pageReady ? "page-enter" : ""}`}>
      {/* TABS */}
      <nav className="tabs">
        {Object.keys(sections).map((tab) => (
          <span
            key={tab}
            onClick={() => scrollToSection(tab)}
            className={activeTab === tab ? "active" : ""}
          >
            {tab}
          </span>
        ))}
      </nav>

      {/* MAIN LAYOUT */}
      <div className="trip-layout">
        {/* LEFT */}
        <section className="left-content">

          {/* BASIC DETAILS */}
          <div ref={sections["Basic Details"]} className="section-fade" style={{ "--delay": "0s" }}>
            <h1 className="trip-title">{tour.title}</h1>
            <div className="description-container">
              <p className="description">
                {expandedDesc ? tour.description : truncateText(tour.description, 250)}
              </p>
              {tour.description?.length > 250 && (
                <button
                  className="read-more-btn"
                  onClick={() => setExpandedDesc(!expandedDesc)}
                >
                  {expandedDesc ? "Show Less" : "Read More"}
                </button>
              )}
            </div>
          </div>

          <Divider />

          {/* ACTIVITIES */}
          <div ref={sections["Activities"]} className="section-fade" style={{ "--delay": "0.1s" }}>
            <h2>Activities</h2>
            <div className="feature-grid">
              {tour.activities?.map((item) => (
                <div key={item.id} className="feature-card">
                  <img src={item.image} alt={item.title} loading="lazy" />
                  <p>{item.title}</p>
                </div>
              ))}
            </div>
          </div>
          <Divider />

          {/* FOOD */}
          <div ref={sections["Food"]} className="section-fade" style={{ "--delay": "0.15s" }}>
            <h2>Food</h2>
            <div className="feature-grid">
              {tour.food?.map((item) => (
                <div key={item.id} className="feature-card">
                  <img src={item.image} alt={item.title} loading="lazy" />
                  <p>{item.title}</p>
                </div>
              ))}
            </div>
          </div>
          <Divider />

          {/* ITINERARY */}
          <div ref={sections["Itinerary"]} className="itinerary-section section-fade" style={{ "--delay": "0.2s" }}>
            <div className="itinerary-header">
              <h2 className="section-title">Itinerary</h2>
              <Button
                type="primary"
                size="small"
                className="itinerary-details-btn"
                onClick={() => setIsModalOpen(true)}
              >
                Itinerary Details
              </Button>
            </div>

            {tour?.itinerary?.map((dayObj) => (
              <div key={dayObj?.day} className="itinerary-day">
                <div className="day-column">
                  <div className="day-circle">Day {dayObj?.day}</div>
                </div>
                <div className="timeline-column">
                  <div className="day-header">
                    <h4>Day {dayObj?.day} Plan</h4>
                  </div>
                  <div className="timeline-line">
                    {dayObj?.activities?.map((_, index) => (
                      <span key={index} className="timeline-dot"></span>
                    ))}
                  </div>
                  <div className="activities-row">
                    {dayObj?.activities?.map((act) => (
                      <div key={act?._id || act?.id} className="activity-card">
                        <div className="activity-period">{act?.period || "Time"}</div>
                        <div className="activity-title">
                          {act?.title
                            ? act.title.length > 18
                              ? act.title.substring(0, 18) + "..."
                              : act.title
                            : "No Title"}
                        </div>
                        <div className="activity-icon">
                          <img
                            src={
                              act?.images && act.images.length > 0
                                ? act.images[0]
                                : "https://cdn-icons-png.flaticon.com/512/684/684908.png"
                            }
                            alt={act?.title || "activity"}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <Modal
              title="Full Itinerary Details"
              open={isModalOpen}
              onCancel={() => setIsModalOpen(false)}
              footer={null}
              width={750}
            >
              <div className="modal-itinerary">
                {tour?.itinerary?.map((dayObj) => (
                  <div key={dayObj?.day} className="modal-day">
                    <h4>Day {dayObj?.day}</h4>
                    {dayObj?.activities?.map((act) => (
                      <div key={act?._id || act?.id} className="modal-activity-item">
                        <div className="modal-time">{act?.period || ""}</div>
                        <div className="modal-content">
                          <h4>{act?.title || "No Title"}</h4>
                          <p>{act?.description || "No description available."}</p>
                          {act?.images && act.images.length > 0 && (
                            <img src={act.images[0]} alt={act?.title} className="modal-image" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </Modal>
          </div>

          <Divider />

          {/* THINGS TO KNOW */}
          <div ref={sections["Things To Know"]} className="things-section section-fade" style={{ "--delay": "0.25s" }}>
            <h2 className="section-title">Things To Know</h2>
            <div className="feature-grid">
              {tour.things_to_know?.map((item) => {
                const isExpanded = expandedItems[item.id];
                const shortText =
                  item.description?.length > 120
                    ? item.description.slice(0, 120) + "..."
                    : item.description;
                return (
                  <div key={item.id} className="feature-card">
                    <h4 className="feature-title">{item.title}</h4>
                    <p className="feature-description">
                      {isExpanded ? item.description : shortText}
                    </p>
                    {item.description?.length > 120 && (
                      <button className="read-more-btn" onClick={() => toggleReadMore(item.id)}>
                        {isExpanded ? "Read Less" : "Read More"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <Divider />

          {/* LOCATION */}
          <div ref={sections["Location"]} className="map-section section-fade" style={{ "--delay": "0.3s" }}>
            <h2 className="section-title">Location</h2>
            {tour.location && (
              <div className="map-container">
                <iframe
                  src={tour.location}
                  title="Google Map"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            )}
          </div>
        </section>

        {/* RIGHT BOOKING CARD */}
        <aside className="booking-card desktop-only">
          <BookingForm />
        </aside>
      </div>

      {/* MOBILE BOTTOM BAR */}
      {isMobile && (
        <div className="mobile-booking-bar">
          <div className="mobile-price-preview">
            Total: <span>₹ {total.toLocaleString()}</span>
          </div>
          <Button onClick={openBookingDrawer}>BOOK NOW</Button>
        </div>
      )}

      {/* MOBILE DRAWER */}
      <Drawer
        title="Book Your Tour"
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        placement="bottom"
        height="500px"
        closable={true}
      >
        <BookingForm inDrawer={true} />
      </Drawer>
    </div>
  );
};

export default TripDetails;