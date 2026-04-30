import React, { useState, useEffect } from "react";
import "./CategorySearch.css";
import API from "../../../../api/api";

import {
  MapPin,
  SlidersHorizontal,
  X
} from "lucide-react";

export default function CategorySearch({ setSelectedThinai }) {

  const [categories, setCategories] = useState([]);
  const [active, setActive] = useState("all");
  const [isMobile, setIsMobile] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  // ✅ Fetch categories from backend
  useEffect(() => {
    fetchCategories();

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await API.get("/api/categories");

      // add ALL option
      setCategories([
        { id: "all", name: "All", image: null },
        ...data
      ]);

    } catch (err) {
      console.error(err);
    }
  };

  const handleClick = (id) => {
    setActive(id);
    setSelectedThinai(id);
  };

  return (
    <>
      <div className="elite-category-wrapper">

        <div className="category-scroll-container align-center">
          {categories.map(cat => (
            <div
              key={cat.id}
              className={`category-card ${active === cat.id ? "active" : ""}`}
              onClick={() => handleClick(cat.id)}
            >
              <div className="category-icon">

                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    style={{
                      width: 26,
                      height: 26,
                      objectFit: "cover",
                      borderRadius: 6
                    }}
                  />
                ) : (
                  <MapPin size={22} />
                )}

              </div>

              <span className="category-label">
                {cat.name}
              </span>

            </div>
          ))}
        </div>

        {/* <div className="filter-section">
          <button
            className="filter-btn"
            onClick={() => setShowDrawer(true)}
          >
            <SlidersHorizontal size={18} />
            <span>Filter</span>
          </button>
        </div> */}

      </div>
{/* 
      {isMobile && (
        <div className={`mobile-drawer ${showDrawer ? "open" : ""}`}>
          <div className="drawer-header">
            <h3>Filters</h3>
            <X size={22} onClick={() => setShowDrawer(false)} />
          </div>

          <div className="drawer-body">
            <p>Add filters here</p>
          </div>
        </div>
      )} */}

      {isMobile && showDrawer && (
        <div
          className="drawer-overlay"
          onClick={() => setShowDrawer(false)}
        />
      )}
    </>
  );
}