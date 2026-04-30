import React from "react";
import "./InterestingDestinations.css";
import bgrght from  './dec.png'
const destinations = [
  {
    id: 1,
    name: "Kodaikanal",
    price: "₹ 486 onwards",
    gridClass: "card-normal",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: 2,
    name: "Ooty",
    price: "₹ 1,500 onwards",
    gridClass: "card-tall",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: 3,
    name: "Thanjavur",
    price: "₹ 1,699 onwards",
    gridClass: "card-normal",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80" // Brihadeeswarar Temple
  },
  {
    id: 4,
    name: "Rameswaram",
    price: "₹ 1,999 onwards",
    gridClass: "card-tall",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80" // Brihadeeswarar Temple
  },
  {
    id: 5,
    name: "Ramanathapuram",
    price: "₹ 1,999 onwards",
    gridClass: "card-normal",
 image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=80",  },
  {
    id: 6,
    name: "Yercaud",
    price: "₹ 680 onwards",
    gridClass: "card-normal",
    image:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: 7,
    name: "Kolukkumalai",
    price: "₹ 1,999 onwards",
    gridClass: "card-normal",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: 8,
    name: "Wayanad",
    price: "₹ 2,099 onwards",
    gridClass: "card-normal",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80" // Brihadeeswarar Temple
  }
];
const InterestingDestinations = () => {
  return (
    <section className="destinations-section">
      <div className="destinations-container">
        <h2 className="destinations-heading">Interesting Destinations 📍</h2>
        <div className="destinations-grid">
          {destinations.map((item) => (
            <div key={item.id} className={`destination-card ${item.gridClass}`}>
              <img src={item.image} alt={item.name} className="destination-image" />
              <div className="destination-overlay"></div>
              <div className="destination-info">
                <h3 className="destination-name">{item.name}</h3>
                <div className="price-wrapper">
                    <span className="destination-price">{item.price}</span>
                    <span className="destination-person">/Person</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <img src={bgrght} alt="Decorative pattern" className="decoration-image" />
    </section>
  );
};

export default InterestingDestinations;