import Navbar from "../../../components/common/Navbar";
import GlassSearch from "./components/GlassSearch";
import "./Hero.css";
import tick from "./tick.png";
import { useEffect, useState } from "react";

export default function Hero({ onSearch }) { // Add onSearch prop

  const messages = [
    "Verified Private Campsites",
    "Verified Family Campsites",
    "Verified Highest Rated Campsites"
  ];

  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);

      setTimeout(() => {
        setIndex((prev) => (prev + 1) % messages.length);
        setFade(true);
      }, 300);

    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="hero">
      
      <Navbar />

      <div className="hero-content">

        <h3 className="sub-title">Not just trips.
</h3>

        <h1 className="main-title">
         Travel Through Tamil Civilization.
        </h1>
        <h5 className="hero-subtitle">Live the five ancient landscapes of Tamil Nadu — Mullai, Kurinji, Marutham, Neithal & Palai.
        </h5>
        {/* <div className={`verified ${fade ? "fade-in" : "fade-out"}`}>
          <img src={tick} alt="Verified" />
          {messages[index]}
        </div> */}

        {/* Pass onSearch prop to GlassSearch */}
        <GlassSearch onSearch={onSearch} />

      </div>

    </section>
  );
}