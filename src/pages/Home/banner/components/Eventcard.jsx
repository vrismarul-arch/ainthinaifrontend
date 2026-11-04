import React, { useState, useEffect, useRef, useCallback } from "react";
import "./Eventcard.css";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MapPin,
  Heart,
  Zap,
  Compass,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import CategorySearch from "./CategorySearch";
import API from "../../../../api/api";
import { message } from "antd";

const Eventcard = ({ searchFilters }) => {

  const navigate = useNavigate();
  const location = useLocation();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [liked, setLiked] = useState(null);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [visibleCount, setVisibleCount] = useState(8);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // State for image carousel
  const [currentImageIndex, setCurrentImageIndex] = useState({});

  // ===== Check if user is logged in =====
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  // ===== Fetch tours =====
  useEffect(() => {
    fetchTours();
  }, []);

  // ===== Check for search results from navigation =====
  useEffect(() => {
    if (location.state?.searchResults) {
      const searchResults = location.state.searchResults;
      setEvents(searchResults.tours || []);
      applyFilters(searchResults.tours || [], selectedCategory);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // ===== Apply search filters when they change (LOCATION ONLY) =====
  useEffect(() => {
    if (searchFilters && searchFilters.location) {
      filterEventsByLocation(searchFilters.location);
    } else {
      applyFilters(events, selectedCategory);
    }
  }, [searchFilters, events, selectedCategory]);

  const fetchTours = async () => {
    try {
      const res = await API.get("/api/tours");
      
      const processedData = (res.data || []).map(tour => ({
        ...tour,
        galleryImages: parseGalleryImages(tour.gallery_images)
      }));
      
      setEvents(processedData);
      setFilteredEvents(processedData);
      
      const initialIndex = {};
      processedData.forEach(tour => {
        initialIndex[tour.id] = 0;
      });
      setCurrentImageIndex(initialIndex);
      
    } catch (err) {
      console.error("Error fetching tours:", err);
    }
  };

  const parseGalleryImages = (galleryImages) => {
    if (!galleryImages) return [];
    try {
      if (typeof galleryImages === 'string') {
        const parsed = JSON.parse(galleryImages);
        return Array.isArray(parsed) ? parsed : [];
      }
      return Array.isArray(galleryImages) ? galleryImages : [];
    } catch (e) {
      console.error("Error parsing gallery images:", e);
      return [];
    }
  };

  const getAllImages = (tour) => {
    const images = [];
    if (tour.main_image) images.push(tour.main_image);
    if (tour.galleryImages && tour.galleryImages.length > 0) {
      images.push(...tour.galleryImages);
    }
    return images;
  };

  const handleNextImage = (e, tourId, images) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => ({
      ...prev,
      [tourId]: (prev[tourId] + 1) % images.length
    }));
  };

  const handlePrevImage = (e, tourId, images) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => ({
      ...prev,
      [tourId]: (prev[tourId] - 1 + images.length) % images.length
    }));
  };

  const calculateDuration = (tour) => {
    if (tour.duration) return tour.duration;
    return "1D / 0N";
  };

  const filterEventsByLocation = (searchLocation) => {
    if (!searchLocation || !events.length) return;

    let filtered = [...events];

    if (searchLocation) {
      filtered = filtered.filter(event => 
        event.place?.toLowerCase().includes(searchLocation.toLowerCase()) ||
        event.state?.toLowerCase().includes(searchLocation.toLowerCase()) ||
        event.district?.toLowerCase().includes(searchLocation.toLowerCase())
      );
    }

    applyFilters(filtered, selectedCategory);
  };

  const applyFilters = (eventsList, category) => {
    const filtered = category === "all"
      ? eventsList
      : eventsList.filter(e => e.category_id === category);
    
    setFilteredEvents(filtered);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (searchFilters && searchFilters.location) {
      filterEventsByLocation(searchFilters.location);
    } else {
      applyFilters(events, category);
    }
  };

  const handleNavigate = (path, requiresAuth = true) => {
    if (requiresAuth && !isLoggedIn) {
      message.warning("Please login to continue");
      navigate("/login", { state: { from: path } });
    } else {
      navigate(path);
    }
  };

  const handleWishlistClick = (e, eventId) => {
    e.stopPropagation();
    
    if (!isLoggedIn) {
      message.warning("Please login to add items to wishlist");
      navigate("/login", { state: { from: "/wishlist" } });
      return;
    }
    
    setLiked(liked === eventId ? null : eventId);
    if (liked !== eventId) {
      message.success("Added to wishlist");
    } else {
      message.info("Removed from wishlist");
    }
  };

  // ===== PARALLAX HANDLER =====
  const handleParallaxMove = useCallback((e, cardId) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    
    // Calculate mouse position relative to card (0 to 1)
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    // Convert to -1 to 1 range for movement
    const moveX = (x - 0.5) * 2;
    const moveY = (y - 0.5) * 2;
    
    // Find the image inside this card
    const img = card.querySelector('.main-event-image');
    if (img) {
      // Apply smooth transform - image moves opposite to cursor for depth
      // translate values: up to 8px movement
      img.style.transform = `scale(1.12) translate(${moveX * -8}px, ${moveY * -8}px)`;
    }
    
    // Also move the card slightly for a 3D tilt effect
    card.style.transform = `translateY(-10px) perspective(1000px) rotateX(${moveY * 2}deg) rotateY(${moveX * -2}deg)`;
  }, []);

  const handleParallaxLeave = useCallback((e) => {
    const card = e.currentTarget;
    const img = card.querySelector('.main-event-image');
    if (img) {
      img.style.transform = 'scale(1) translate(0, 0)';
    }
    card.style.transform = 'translateY(0) perspective(1000px) rotateX(0) rotateY(0)';
  }, []);

  return (
    <div className="container">

      <div className="heading-section">
        <div>
          <div className="heading-left">
            <h1 className="title">
              Exploring the pride of Tamil Heritage
              <br />
              <span className="title-tamil">தமிழ் மரபின் பெருமைக்கான தேடல்</span>
            </h1>
            <Compass size={22} />
          </div>
          <p className="heading-subtitle">
            {filteredEvents.length} adventures found
            {searchFilters?.location && ` in ${searchFilters.location}`}
          </p>
        </div>
      </div>

      <div className="event-grid">

        {filteredEvents.slice(0, visibleCount).map((data) => {
          const allImages = getAllImages(data);
          const currentIndex = currentImageIndex[data.id] || 0;
          const duration = calculateDuration(data);
          const hasMultipleImages = allImages.length > 1;
          
          return (
            <div
              key={data.id}
              className="event-card-container"
              onMouseMove={(e) => handleParallaxMove(e, data.id)}
              onMouseLeave={handleParallaxLeave}
              onClick={() => handleNavigate(`/product/${data.id}`, true)}
            >

              <div className="card-image-wrapper">
                {/* Image Carousel */}
                <div className="image-carousel">
                  <div className="parallax-layer">
                    <img
                      src={allImages[currentIndex] || data.main_image || 'https://via.placeholder.com/300x200'}
                      alt={data.title}
                      className="main-event-image"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200';
                      }}
                    />
                  </div>
                  
                  {/* Carousel Navigation Buttons */}
                  {hasMultipleImages && (
                    <>
                      <button 
                        className="carousel-nav carousel-prev"
                        onClick={(e) => handlePrevImage(e, data.id, allImages)}
                        aria-label="Previous image"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button 
                        className="carousel-nav carousel-next"
                        onClick={(e) => handleNextImage(e, data.id, allImages)}
                        aria-label="Next image"
                      >
                        <ChevronRight size={16} />
                      </button>
                      
                      <div className="carousel-indicators">
                        {allImages.map((_, idx) => (
                          <span 
                            key={idx} 
                            className={`indicator ${idx === currentIndex ? 'active' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentImageIndex(prev => ({
                                ...prev,
                                [data.id]: idx
                              }));
                            }}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Badge */}
                <div className="badge-top-left">
                  <Zap size={14} fill="#ffcc00" color="#ffcc00" />
                </div>

                {/* Wishlist Button */}
                <button
                  className={`wishlist-btn ${liked === data.id ? "active" : ""}`}
                  onClick={(e) => handleWishlistClick(e, data.id)}
                  aria-label="Add to wishlist"
                >
                  <Heart
                    size={18}
                    fill={liked === data.id ? "#e63946" : "none"}
                    color={liked === data.id ? "#e63946" : "white"}
                  />
                </button>

                {/* Duration Tag */}
                <div className="duration-tag">{duration}</div>
              </div>

              <div className="card-content">
                <h3 className="event-title">{data.title}</h3>

                {data.category_name && (
                  <div className="category-tag">
                    {data.category_name}
                  </div>
                )}

                <div className="location-row">
                  <MapPin size={14} />
                  <span>
                    {data.place || 'Unknown Location'}
                    {data.state ? `, ${data.state}` : ''}
                  </span>
                </div>

                <div className="price-footer">
                  <div className="price-info">
                    <span className="price-label">From</span>
                    <span className="amount">
                      ₹{Number(data.adult_price || 0).toLocaleString('en-IN')}
                    </span>
                    <span className="per-person">/person</span>
                  </div>

                  <button
                    className="book-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigate(`/product/${data.id}`, true);
                    }}
                  >
                    BOOK
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {visibleCount < filteredEvents.length && (
        <div className="explore-more-wrapper">
          <button
            className="explore-more-btn"
            onClick={() => setVisibleCount(prev => prev + 4)}
          >
            Explore More
          </button>
        </div>
      )}

      {filteredEvents.length === 0 && (
        <div className="no-results">
          <h3>No events found</h3>
          <p>Try adjusting your search location or category</p>
        </div>
      )}
    </div>
  );
};

export default Eventcard;