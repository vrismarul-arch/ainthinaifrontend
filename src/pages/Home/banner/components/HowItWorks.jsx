import React from "react";
import "./HowItWorks.css";

const steps = [
  {
    id: 1,
    title: "Solo Travellers",
    description:
      "Solo traveler? Join any of our scheduled events or camps—no minimum group size required!",
    image: "https://cdn-icons-png.flaticon.com/512/4140/4140048.png",
  },
  {
    id: 2,
    title: "Group Traveller",
    description:
      "Group of 2 or more? Book most campsites on any date you choose.",
    image: "https://cdn-icons-png.flaticon.com/512/1946/1946429.png",
  },
  {
    id: 3,
    title: "All-Inclusive Camping",
    description:
      "All experiences include camping stay, gear, activities, and meals.",
    image: "https://cdn-icons-png.flaticon.com/512/854/854878.png",
  },
  {
    id: 4,
    title: "Instant Confirmation",
    description:
      "Get instant confirmation with exact location and host contact upon booking.",
    image: "https://cdn-icons-png.flaticon.com/512/561/561127.png",
  },
];

const HowItWorks = () => {
  return (
    <section className="howitworks">

      <div className="container">
        <h2 className="section-title">
          How it Works With Exoticamp? 🏕️
        </h2>

        <div className="cards-container">
          {steps.map((item) => (
            <div className="card" key={item.id}>
              <img src={item.image} alt={item.title} className="card-icon" />
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>  
  );
};

export default HowItWorks;
