import React, { useState, useEffect } from "react";
import "./NewAttractions.css";
import API from "../../../../api/api";
import { useNavigate } from "react-router-dom";

const NewAttractions = () => {

  const [tours, setTours] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchTours = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/tours");
      // Ensure we're setting an array even if response is unexpected
      const toursData = Array.isArray(res.data) ? res.data : [];
      setTours(toursData);
    } catch (err) {
      console.error("Error fetching tours:", err);
      setTours([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, []);

  // Ensure tours is always an array before slicing
  const toursArray = Array.isArray(tours) ? tours : [];
  const visibleCards = showAll ? toursArray : toursArray.slice(0, 3);

  if (loading) {
    return (
      <section className="ads-section">
        <div className="ads-header">
          <h2 className="ads-title1">New Attractions</h2>
        </div>
        <div className="loading-state">Loading attractions...</div>
      </section>
    );
  }

  if (visibleCards.length === 0) {
    return (
      <section className="ads-section">
        <div className="ads-header">
          <h2 className="ads-title1">New Attractions</h2>
        </div>
        <div className="empty-state">No attractions available at the moment.</div>
      </section>
    );
  }

  return (
    <section className="ads-section">

      {/* Header */}
      <div className="ads-header">
        <h2 className="ads-title1">New Attractions</h2>

        {!showAll && toursArray.length > 3 && (
          <span
            className="ads-viewmore-text"
            onClick={() => setShowAll(true)}
          >
            View More →
          </span>
        )}
      </div>

      {/* Cards */}
      <div className="ads-grid">
        {visibleCards.map((tour) => (
          <div
            key={tour.id || tour._id}
            className="ads-banner"
            onClick={() => navigate(`/product/${tour.id || tour._id}`)}
            style={{ cursor: "pointer" }}
          >
            <img
              src={tour.main_image}
              alt={tour.title}
              className="ads-image"
              onError={(e) => {
                e.target.src = "/fallback-image.jpg";
              }}
            />

            <div className="ads-overlay"></div>

            <div className="ads-content">
              <h3 className="ads-title">{tour.title}</h3>
              <p>{tour.place || tour.description}</p>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
};

export default NewAttractions;