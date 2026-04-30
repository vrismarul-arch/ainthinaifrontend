import React from 'react';
import './CulturalImmersion.css';
import { Users, Landmark, HandHeart, Scroll, Compass, Leaf, Sparkles } from 'lucide-react';

const CulturalImmersion = () => {
 const cards = [
  {
    title: "Local Families as Hosts",
    desc: "You stay with stories, not strangers. Live with authentic Tamil families and experience true hospitality.",
    icon: <Users size={32} strokeWidth={1.5} />,
    type: "leaf-left",
    gradient: "gradient-1"
  },
  {
    title: "Heritage Activity-Based Travel",
    desc: "Farm work. Pottery. Bullock cart. Temple rituals. Hands-on experiences that connect you to traditions.",
    icon: <Landmark size={32} strokeWidth={1.5} />,
    type: "leaf-right",
    gradient: "gradient-2"
  },
  {
    title: "Real Village Economy Support",
    desc: "Every booking sustains local livelihood. 80% of your spend goes directly to village communities.",
    icon: <HandHeart size={32} strokeWidth={1.5} />,
    type: "leaf-left",
    gradient: "gradient-3"
  },
  {
    title: "Curated Tamil Experience Design",
    desc: "Each trip follows landscape philosophy. Authentic journeys designed by local cultural experts.",
    icon: <Scroll size={32} strokeWidth={1.5} />,
    type: "leaf-right",
    gradient: "gradient-4"
  }
];

  return (
    <div className="immersion-container">
      {/* Animated Background Elements */}
      <div className="bg-elements">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
      </div>

      {/* Background Watermark */}
      <div className="watermark">AINTHINAI</div>

      <header className="header-section">
        <div className="badge">
          <Sparkles size={16} />
          <span>Authentic Tamil Nadu</span>
        </div>
        <h1 className="main-title2">
          Not Tourism. <span className="highlight">Cultural Immersion.</span>
        </h1>
        <p className="subtitle">Step into the soul of Tamil Nadu — where every experience tells a story.</p>
      </header>

      <div className="grid-layout">
        {/* The Central Hub Ring */}
        <div className="center-hub">
          <div className="hub-ring">
            <div className="hub-pulse"></div>
            <div className="hub-content">
              <Leaf size={28} strokeWidth={1.2} />
              <span>CULTURAL<br />IMMERSION</span>
            </div>
          </div>
        </div>

        {/* The Four Cards */}
        {cards.map((card, index) => (
          <div key={index} className={`card ${card.type} ${card.gradient}`}>
            <div className="card-glow"></div>
            <div className="icon-wrapper">
              {card.icon}
              <div className="icon-bg"></div>
            </div>
            <h3 className="card-title">{card.title}</h3>
            <p className="card-desc">{card.desc}</p>
            <div className="card-footer">
              <span className="learn-more">Learn more →</span>
            </div>
          </div>
        ))}
      </div>

      {/* Decorative bottom element */}
      <div className="bottom-decoration">
        <div className="decoration-line"></div>
        <div className="decoration-dots"></div>
      </div>
    </div>
  );
};

export default CulturalImmersion;