import React from "react";
import "./AinthinaiSection.css";
import {
  Mountain,
  Leaf,
  Wheat,
  Waves,
  Sun
} from "lucide-react";
import mount from "./icon/moun.png";
import palai from './icon/palai.png';
import flower from './icon/flower.png';
import grass from './icon/grass.png';
import river from './icon/river.png'; // your top image
import landscape from "./down.png"; // your bottom image

const AinthinaiSection = () => {
  return (
    <section className="ainthinai-section">
      <div className="ainthinai-container">

        <h1 className="ainthinai-title">WHAT IS AINTHINAI?</h1>

        <p className="ainthinai-description">
          Ainthinai is not a tour brand. It is a revival of Tamil ecological wisdom.
        </p>

        <p className="ainthinai-description">
          Two thousand years ago, Tamil civilization classified life into five landscapes —
          each shaping food, music, occupation, architecture and emotion.
        </p>

        <div className="quote-box">
          “Travel here is not sightseeing. It is participation.”
        </div>

        

        <div className="landscape-icons">
          <div className="icon-item">
            <img src={mount} alt="Kurinji" className="icon-lo" />
            <p>Kurinji</p>
          </div>

          <div className="icon-item">
          <img src={flower} alt="Mullai" className="icon-lo"  />
            <p>Mullai</p>
          </div>

          <div className="icon-item">
            <img src={grass} alt="Marutham" className="icon-lo" />

            <p>Marutham</p>
          </div>

          <div className="icon-item">
            <img src={river} alt="Neithal" className="icon-lo" />
            <p>Neithal</p>
          </div>

          <div className="icon-item">
            <img src={palai} alt="Palai" className="icon-lo" />
            <p>Palai</p>
          </div>
        </div>

        <div className="bottom-image">
          <img src={landscape} alt="Ainthinai Landscapes" />
        </div>

      </div>
    </section>
  );
};

export default AinthinaiSection;
