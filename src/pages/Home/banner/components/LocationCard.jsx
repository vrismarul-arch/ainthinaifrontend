import React, { useState, useEffect } from 'react';

export default function LocationCard({ locations = [], onSelect, loading, categories = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Update filtered locations when locations prop changes
  useEffect(() => {
    setFilteredLocations(locations);
  }, [locations]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    let filtered = locations;
    
    // Apply category filter first
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(location => 
        location.category_name && location.category_name.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    // Then apply search filter
    filtered = filtered.filter(location => 
      location.name.toLowerCase().includes(term) || 
      (location.category_name && location.category_name.toLowerCase().includes(term)) ||
      (location.state && location.state.toLowerCase().includes(term)) ||
      (location.district && location.district.toLowerCase().includes(term))
    );
    
    setFilteredLocations(filtered);
    setShowAll(false);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    setSearchTerm('');
    
    let filtered = locations;
    if (category !== 'all') {
      filtered = locations.filter(location => 
        location.category_name && location.category_name.toLowerCase() === category.toLowerCase()
      );
    }
    setFilteredLocations(filtered);
    setShowAll(false);
  };

  const handleSelect = (location) => {
    onSelect(location);
    setSearchTerm('');
    setFilteredLocations(locations);
    setShowAll(false);
    setSelectedCategory('all');
  };

  const handleShowAll = () => {
    setShowAll(true);
  };

  // Get unique categories from locations
  const uniqueCategories = ['all', ...new Set(locations.map(l => l.category_name).filter(Boolean))];

  // Get displayed locations based on showAll state
  const displayedLocations = showAll 
    ? filteredLocations 
    : filteredLocations.slice(0, 5);

  const hasMoreLocations = filteredLocations.length > 5;

  if (loading) {
    return (
      <div className="location-card loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading destinations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="location-card">
     

      {/* Category Filters */}
      {uniqueCategories.length > 1 && (
        <div className="category-filters">
          {uniqueCategories.map((category, index) => (
            <button
              key={index}
              className={`category-filter ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => handleCategoryFilter(category)}
            >
              {category === 'all' ? 'All' : category}
            </button>
          ))}
        </div>
      )}
      
      {/* Search Input */}
      <div className="location-search">
        <input
          type="text"
          placeholder="Search destinations..."
          value={searchTerm}
          onChange={handleSearch}
          className="location-search-input"
          autoFocus
        />
        {searchTerm && (
          <button 
            className="clear-search"
            onClick={() => {
              setSearchTerm('');
              handleCategoryFilter(selectedCategory);
            }}
          >
            ✕
          </button>
        )}
      </div>
      
      {filteredLocations.length === 0 ? (
        <div className="no-locations">
          {searchTerm ? (
            <>
              <p>No destinations found for "{searchTerm}"</p>
              <button 
                className="clear-search-btn"
                onClick={() => {
                  setSearchTerm('');
                  handleCategoryFilter('all');
                }}
              >
                Clear search
              </button>
            </>
          ) : (
            <>
              <p>No destinations available</p>
              <small>Check back later for new tours</small>
            </>
          )}
        </div>
      ) : (
        <>
          <div className={`locations-list ${showAll ? 'show-all' : ''}`}>
            {displayedLocations.map((location, index) => (
              <button
                key={index}
                className="location-item"
                onClick={() => handleSelect(location)}
              >
                <div className="location-info">
                  <span className="location-name">
                    {location.name.split('').map((char, i) => {
                      // Highlight matching text
                      const startIndex = location.name.toLowerCase().indexOf(searchTerm.toLowerCase());
                      if (searchTerm && i >= startIndex && i < startIndex + searchTerm.length) {
                        return <span key={i} className="highlight">{char}</span>;
                      }
                      return char;
                    })}
                  </span>
                  
                  <div className="location-meta">
                    {location.category_name && (
                      <span className="location-category">{location.category_name}</span>
                    )}
                    {location.tourCount > 1 && (
                      <span className="location-tour-count">{location.tourCount} tours</span>
                    )}
                  </div>

                  {(location.state || location.district) && (
                    <span className="location-region">
                      {[location.district, location.state].filter(Boolean).join(', ')}
                    </span>
                  )}
                </div>
                <span className="location-icon">→</span>
              </button>
            ))}
          </div>

          {/* Show More/Less Button */}
          {hasMoreLocations && !showAll && (
            <button className="show-more-btn" onClick={handleShowAll}>
              Show {filteredLocations.length - 5} more locations
              <span className="show-more-icon">↓</span>
            </button>
          )}

          {showAll && hasMoreLocations && (
            <button className="show-less-btn" onClick={() => setShowAll(false)}>
              Show less
              <span className="show-less-icon">↑</span>
            </button>
          )}

          {/* Search results count */}
          {searchTerm && (
            <div className="search-results-count">
              Found {filteredLocations.length} {filteredLocations.length === 1 ? 'place' : 'places'}
            </div>
          )}
        </>
      )}
    </div>
  );
}