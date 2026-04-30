import React from "react";
import "./Decoration.css";
import dec from "./dec.png";

const Decoration = () => {
  return (
    <section className="decoration-section">
      <div className="decoration-content">
        <h2 className="decoration-title">
          Explore  AINTHINAI GOExperiences
        </h2>
        <p className="decoration-subtitle">
          Discover Mullai, Kurinji, Marutham, Neithal & Palai journeys
        </p>
      </div>

      <img src={dec} alt="Decorative pattern" className="decoration-image" />
    </section>
  );
};

export default Decoration;
