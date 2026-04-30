import React from "react";
import "./HappinessSection.css";
import dec from "./left.png";

const stats = [
    {
        id: 1,
        icon: "https://cdn-icons-png.flaticon.com/512/3064/3064197.png",
        number: "2000+",
        label: "Verified Locations listed",
    },
    {
        id: 2,
        icon: "https://cdn-icons-png.flaticon.com/512/1828/1828884.png",
        number: "4.9/5",
        label: "Customer Ratings",
    },
    {
        id: 3,
        icon: "https://cdn-icons-png.flaticon.com/512/190/190411.png",
        number: "12+ Years",
        label: "Camping Experience",
    },
    {
        id: 4,
        icon: "https://cdn-icons-png.flaticon.com/512/854/854878.png",
        number: "16000",
        label: "Camper Hosted",
    },
];

const HappinessSection = () => {
    return (
        <section className="happiness">
            <div className="happiness-container">

                <h2 className="happiness-title">
                    We care about your <span>Happiness 😊</span>
                </h2>

                <div className="happiness-grid">
                    {stats.map((item) => (
                        <div className="happiness-card" key={item.id}>
                            <img
                                src={item.icon}
                                alt={item.label}
                                className="happiness-icon"
                            />
                            <h3>{item.number}</h3>
                            <p>{item.label}</p>
                        </div>
                    ))}
                </div>

                {/* Decorative Image */}
                <img
                    src={dec}
                    alt="Decorative pattern"
                    className="decoration-left"
                />

            </div>
        </section>
    );
};

export default HappinessSection;
