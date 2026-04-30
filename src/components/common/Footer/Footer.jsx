// src/components/Footer/Footer.jsx
import "./Footer.css";
import {
  FacebookFilled,
  InstagramFilled,
  YoutubeFilled,
  PhoneFilled,
  MailFilled,
  EnvironmentFilled,
  CompassFilled,
  CoffeeOutlined,
  CameraOutlined,
  CarOutlined,
  BankOutlined,
  FieldTimeOutlined,
  ShopOutlined,
  TrophyOutlined,
  FireOutlined,
  CloudOutlined,
  SunOutlined
} from "@ant-design/icons";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">

        {/* BRAND */}
        <div className="footer-col footer-brand">
          <img src="/logo.png" alt="Ainthinai Go Logo" className="footer-logo" />
          
          <p className="footer-desc">
            <em>"யாதும் ஊரே யாவரும் கேளிர்"</em><br />
            (Every place is our home, everyone is our kin)
          </p>
          
          <p className="footer-desc">
            Discover the soul of Tamil Nadu with Ainthinai Go — 
            from the misty Nilgiris to the shores of Kanyakumari, 
            ancient temples to vibrant festivals. We craft authentic 
            travel experiences rooted in Tamil culture and hospitality.
          </p>

          <div className="social-icons">
            <FacebookFilled />
            <InstagramFilled />
            <YoutubeFilled />
          </div>
        </div>

        {/* DESTINATIONS */}
        <div className="footer-col">
          <h4>அமைவிடங்கள் <span>Destinations</span></h4>
          <ul className="footer-links">
            <li><CompassFilled className="link-icon" /> Kodaikanal</li>
            <li><SunOutlined className="link-icon" /> Kanyakumari</li>
            <li><CloudOutlined className="link-icon" /> Ooty</li>
            <li><BankOutlined className="link-icon" /> Madurai</li>
            <li><FireOutlined className="link-icon" /> Rameswaram</li>
            <li><TrophyOutlined className="link-icon" /> Kanchipuram</li>
            <li><CompassFilled className="link-icon" /> Kolli Hills</li>
            <li><CloudOutlined className="link-icon" /> Yercaud</li>
          </ul>
        </div>

        {/* TOUR TYPES */}
        <div className="footer-col">
          <h4>பயணங்கள் <span>Experiences</span></h4>
          <ul className="footer-links">
            <li><CameraOutlined className="link-icon" /> Heritage Walks</li>
            <li><CoffeeOutlined className="link-icon" /> Food Trails</li>
            <li><CompassFilled className="link-icon" /> Trekking Expeditions</li>
            <li><CarOutlined className="link-icon" /> Road Trips</li>
            <li><TrophyOutlined className="link-icon" /> Festival Tours</li>
            <li><SunOutlined className="link-icon" /> Beach Getaways</li>
            <li><BankOutlined className="link-icon" /> Temple Tours</li>
            <li><ShopOutlined className="link-icon" /> Farm Stays</li>
          </ul>
        </div>

        {/* CONTACT */}
        <div className="footer-col">
          <h4>தொடர்புக்கு <span>Contact Us</span></h4>
          <h5>AINTHINAI GO TRAVELS</h5>
          
          <p>
            <EnvironmentFilled className="icon" />
            No. 47, North Chithirai Street,<br />
            Madurai - 625001,<br />
            Tamil Nadu, India
          </p>
          
          <p className="contact-line">
            <PhoneFilled className="icon" />
            +91 98456 78901
          </p>
          
          <p className="contact-line">
            <PhoneFilled className="icon" />
            +91 85246 89012 (24/7 Helpline)
          </p>
          
          <p className="contact-line">
            <MailFilled className="icon" />
            explore@ainthinaigo.com
          </p>
          
          <p className="contact-line">
            <FieldTimeOutlined className="icon" />
            Mon - Sun: 8:00 AM - 8:00 PM IST
          </p>
        </div>

      </div>

      

      <div className="footer-bottom">
        <p>© 2026 Ainthinai Go. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.</p>
        <p>
          <span className="tamil-text">தமிழர் திருவிழா</span> | 
          Crafted with ❤️ in Madurai | <strong>Vrism</strong>
        </p>
      </div>
    </footer>
  );
}