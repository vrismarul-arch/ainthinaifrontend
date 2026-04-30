import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import LocationCard from "./LocationCard";
import GuestCard from "./GuestCard";
import API from "../../../../api/api";
import "./GlassSearch.css";

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="7" stroke="white" strokeWidth="2" fill="none"/>
    <line x1="16.5" y1="16.5" x2="22" y2="22" stroke="white" strokeWidth="2"/>
  </svg>
);

export default function GlassSearch({ onSearch }) {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [dates, setDates] = useState({ checkIn: "", checkOut: "" });
  const [guests, setGuests] = useState({ adults: 1, children: 0 });
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locations, setLocations] = useState([]);
  const [allTours, setAllTours] = useState([]);
  const [categories, setCategories] = useState([]);

  const ref = useRef(null);

  // Fetch all tours on component mount
  useEffect(() => {
    fetchAllTours();
    fetchCategories();
  }, []);

  const fetchAllTours = async () => {
    try {
      setLoading(true);
      const response = await API.get("/api/tours");
      
      if (response.data && Array.isArray(response.data)) {
        console.log("Fetched tours:", response.data);
        setAllTours(response.data);
        
        // Extract unique locations with all their data
        const locationMap = new Map();
        
        response.data.forEach(tour => {
          const locationName = tour.place || tour.title || 'Unknown Location';
          
          if (locationName && locationName.trim() !== '') {
            if (!locationMap.has(locationName)) {
              locationMap.set(locationName, {
                name: locationName,
                category_name: tour.category_name || 'Uncategorized',
                category_id: tour.category_id,
                state: tour.state || 'Tamil Nadu',
                district: tour.district || '',
                tourCount: 1,
                tours: [tour],
                prices: {
                  adult: tour.adult_price,
                  child: tour.child_price
                },
                images: tour.main_image,
                description: tour.description,
                id: tour.id
              });
            } else {
              const existing = locationMap.get(locationName);
              existing.tourCount += 1;
              existing.tours.push(tour);
            }
          }
        });
        
        const uniqueLocations = Array.from(locationMap.values());
        console.log("Processed locations:", uniqueLocations);
        setLocations(uniqueLocations);
      }
    } catch (err) {
      console.error('Error fetching tours:', err);
      setError('Failed to load locations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await API.get("/api/categories");
      if (response.data && Array.isArray(response.data)) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleSearch = async () => {
    if (!location) {
      alert('Please select a location');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Find the selected location data
      const selectedLocationData = locations.find(loc => loc.name === location);
      
      // Filter tours based on selected location
      const filteredTours = allTours.filter(tour => 
        (tour.place && tour.place.toLowerCase().includes(location.toLowerCase())) ||
        (tour.title && tour.title.toLowerCase().includes(location.toLowerCase()))
      );

      // Prepare search results data - ONLY location is used for filtering
      const searchResults = {
        tours: filteredTours,
        searchParams: {
          location,
          locationData: selectedLocationData,
          // dates and guests are NOT included in filtering
        }
      };

      console.log('Search results (location only):', searchResults);

      // Call the onSearch callback with ONLY location information
      if (onSearch) {
        onSearch({
          location: location, // Only pass location for filtering
          // dates and guests are NOT passed for filtering
        });
      }

      setActive(null);
      
    } catch (err) {
      console.error('Error searching tours:', err);
      setError('Failed to search tours. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setActive(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const totalGuests = guests.adults + guests.children;

  const handleLocationSelect = (locationData) => {
    setLocation(locationData.name);
    setActive("dates");
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="elite-wrapper">
      {error && (
        <div className="error-message">
          {error}
          <button onClick={fetchAllTours} className="retry-btn">Retry</button>
        </div>
      )}
      
      <div ref={ref} className={`elite-search ${active ? "expanded" : ""}`}>

        {/* LOCATION */}
        <div
          className={`elite-block ${active === "loc" ? "active" : ""}`}
          onClick={() => setActive("loc")}
        >
          <span className="block-label">Location</span>
          <span className="block-value">
            {location || "Where are you going?"}
          </span>

          {active === "loc" && (
            <div className="elite-pop">
              <LocationCard
                locations={locations}
                onSelect={handleLocationSelect}
                loading={loading}
                categories={categories}
              />
            </div>
          )}
        </div>

        <div className="divider" />

        {/* DATES */}
        <div
          className={`elite-block ${active === "dates" ? "active" : ""} ${!location ? 'disabled' : ''}`}
          onClick={() => location && setActive("dates")}
        >
          <span className="block-label">Dates</span>
          <span className="block-value">
            {dates.checkIn && dates.checkOut
              ? `${formatDate(dates.checkIn)} — ${formatDate(dates.checkOut)}`
              : "Add dates"}
          </span>

          {active === "dates" && (
            <div className="elite-pop">
              <div className="date-card">
                <div className="date-input-group">
                  <label>Check-in</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={dates.checkIn}
                    onChange={(e) =>
                      setDates({ ...dates, checkIn: e.target.value, checkOut: '' })
                    }
                  />
                </div>
                
                {dates.checkIn && (
                  <div className="date-input-group">
                    <label>Check-out</label>
                    <input
                      type="date"
                      min={dates.checkIn}
                      value={dates.checkOut}
                      onChange={(e) =>
                        setDates({ ...dates, checkOut: e.target.value })
                      }
                    />
                  </div>
                )}

                <button 
                  className="continue-btn"
                  onClick={() => dates.checkIn && dates.checkOut && setActive("guests")}
                  disabled={!dates.checkIn || !dates.checkOut}
                >
                  Continue to Guests →
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="divider" />

        {/* GUESTS */}
        <div
          className={`elite-block ${active === "guests" ? "active" : ""} ${!dates.checkIn || !dates.checkOut ? 'disabled' : ''}`}
          onClick={() => (dates.checkIn && dates.checkOut) && setActive("guests")}
        >
          <span className="block-label">Guests</span>
          <span className="block-value">
            {totalGuests} guest{totalGuests > 1 && "s"}
          </span>

          {active === "guests" && (
            <div className="elite-pop">
              <GuestCard
                values={guests}
                onChange={setGuests}
                onClose={() => setActive(null)}
                onApply={() => setActive(null)}
              />
            </div>
          )}
        </div>

        {/* SEARCH BUTTON */}
        <button 
          className="elite-search-btn" 
          onClick={handleSearch}
          disabled={loading || !location || !dates.checkIn || !dates.checkOut}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Searching...
            </>
          ) : (
            <>
              <SearchIcon />
              Search
            </>
          )}
        </button>

      </div>
    </div>
  );
}