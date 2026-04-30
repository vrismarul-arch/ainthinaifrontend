import React, { useState, useEffect } from "react";
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
      
      // Parse gallery images for each tour
      const processedData = (res.data || []).map(tour => ({
        ...tour,
        galleryImages: parseGalleryImages(tour.gallery_images)
      }));
      
      setEvents(processedData);
      setFilteredEvents(processedData);
      
      // Initialize current image index for each tour
      const initialIndex = {};
      processedData.forEach(tour => {
        initialIndex[tour.id] = 0;
      });
      setCurrentImageIndex(initialIndex);
      
    } catch (err) {
      console.error("Error fetching tours:", err);
    }
  };

  // ===== Parse gallery images =====
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

  // ===== Get all images for a tour (main + gallery) =====
  const getAllImages = (tour) => {
    const images = [];
    
    if (tour.main_image) {
      images.push(tour.main_image);
    }
    
    if (tour.galleryImages && tour.galleryImages.length > 0) {
      images.push(...tour.galleryImages);
    }
    
    return images;
  };

  // ===== Handle next image =====
  const handleNextImage = (e, tourId, images) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => ({
      ...prev,
      [tourId]: (prev[tourId] + 1) % images.length
    }));
  };

  // ===== Handle prev image =====
  const handlePrevImage = (e, tourId, images) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => ({
      ...prev,
      [tourId]: (prev[tourId] - 1 + images.length) % images.length
    }));
  };

  // ===== Calculate duration =====
  const calculateDuration = (tour) => {
    // You can customize this based on your data
    // For now, check if duration exists in tour data
    if (tour.duration) return tour.duration;
    
    // Default duration based on category or return default
    return "1D / 0N";
  };

  // ===== Filter events by location ONLY =====
  const filterEventsByLocation = (searchLocation) => {
    if (!searchLocation || !events.length) return;

    console.log("🔍 Filtering by location:", searchLocation);

    let filtered = [...events];

    if (searchLocation) {
      filtered = filtered.filter(event => 
        event.place?.toLowerCase().includes(searchLocation.toLowerCase()) ||
        event.state?.toLowerCase().includes(searchLocation.toLowerCase()) ||
        event.district?.toLowerCase().includes(searchLocation.toLowerCase())
      );
    }

    console.log(`📍 Found ${filtered.length} events in ${searchLocation}`);
    applyFilters(filtered, selectedCategory);
  };

  // ===== Apply category filter =====
  const applyFilters = (eventsList, category) => {
    const filtered = category === "all"
      ? eventsList
      : eventsList.filter(e => e.category_id === category);
    
    setFilteredEvents(filtered);
  };

  // ===== Handle category change =====
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (searchFilters && searchFilters.location) {
      filterEventsByLocation(searchFilters.location);
    } else {
      applyFilters(events, category);
    }
  };

  // ===== Handle navigation with login check =====
  const handleNavigate = (path, requiresAuth = true) => {
    if (requiresAuth && !isLoggedIn) {
      message.warning("Please login to continue");
      navigate("/login", { state: { from: path } });
    } else {
      navigate(path);
    }
  };

  // ===== Handle wishlist with login check =====
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

  return (
    <div className="container">

      {/* Category filter */}
      <CategorySearch 
        setSelectedThinai={handleCategoryChange} 
        selectedCategory={selectedCategory}
      />

      <div className="heading-section">
        <div>
          <div className="heading-left">
            <h1 className="title">Camping Events</h1>
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
              onClick={() => handleNavigate(`/product/${data.id}`, true)}
            >

              <div className="card-image-wrapper">
                {/* Image Carousel */}
                <div className="image-carousel">
                  <img
                    src={allImages[currentIndex] || data.main_image || 'https://via.placeholder.com/300x200'}
                    alt={data.title}
                    className="main-event-image"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200';
                    }}
                  />
                  
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
                      
                      {/* Image Indicators */}
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

      {/* Explore More Button */}
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

      {/* No results message */}
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