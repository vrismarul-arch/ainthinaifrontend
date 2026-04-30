import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API from "../../../api/api";
import "./TripBanner.css";
import {
  MapPin,
  Heart,
  Share2,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import TripDetails from "./TripDetails";

const TripBanner = () => {
  const { id } = useParams();
  const [tour, setTour] = useState(null);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  // Helper to parse stringified JSON arrays
  const safeParse = (str) => {
    try {
      return typeof str === 'string' ? JSON.parse(str) : (str || []);
    } catch (e) {
      return [];
    }
  };

  useEffect(() => {
    if (!id) return;

    const fetchTour = async () => {
      try {
        const res = await API.get(`/api/tours/${id}`);
        const rawData = Array.isArray(res.data) ? res.data[0] : res.data;
        
        // Combine main image and gallery into one array for the modal
        const gallery = safeParse(rawData.gallery_images);
        const allImages = rawData.main_image ? [rawData.main_image, ...gallery] : gallery;

        setTour({
          ...rawData,
          allImages: allImages
        });
      } catch (err) {
        console.error("Fetch error in Banner:", err);
      }
    };

    fetchTour();
  }, [id]);

  const next = () => setIndex((index + 1) % tour?.allImages.length);
  const prev = () => setIndex((index - 1 + tour?.allImages.length) % tour?.allImages.length);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
  }, [open]);

  if (!tour) return null; // Or a skeleton loader

  return (
    <div className="trip-hero">
      <div className="trip-container">

        {/* HEADER - Properly gets Title, State, and District */}
        <div className="trip-header">
          <div>
            <h1 className="trip-title">{tour.title}</h1>

            <div className="trip-location">
              <MapPin size={16} />
              <span>
                {tour.district ? `${tour.district}, ` : ""}
                {tour.state || tour.place || "Location Details"}
              </span>
            </div>
          </div>

          <div className="trip-actions">
            <button className="icon-btn"><Share2 size={18} /></button>
            <button className="icon-btn"><Heart size={18} /></button>
          </div>
        </div>

        {/* GALLERY - Properly gets Main Image and Gallery Images */}
        <div className="trip-gallery">
          <div className="gallery-main" onClick={() => { setIndex(0); setOpen(true); }}>
            <img src={tour.main_image} alt="Main" />
          </div>

          <div className="gallery-grid">
            {/* Show first 3 images from the gallery array */}
            {tour.allImages.slice(1, 4).map((img, i) => (
              <img key={i} src={img} alt="" onClick={() => { setIndex(i + 1); setOpen(true); }} />
            ))}

            {/* Show 4th image with the "+More" overlay */}
            <div className="gallery-more" onClick={() => { setIndex(4); setOpen(true); }}>
              <img src={tour.allImages[4] || tour.allImages[0]} alt="" />
              <div className="overlay">
                <h3 className="text-white">+{Math.max(0, tour.allImages.length - 5)}</h3>
                <p>Photos & Videos</p>
              </div>
            </div>
          </div>
        </div>

        {/* DETAILS SECTION */}
        <TripDetails />

      </div>

      {/* MODAL - Uses the API Images */}
      {open && (
        <div className="image-modal">
          <button className="close-btn" onClick={() => setOpen(false)}>
            <X size={28} />
          </button>

          <button className="nav left" onClick={prev}>
            <ChevronLeft size={28} />
          </button>

          <img src={tour.allImages[index]} alt="slide" className="modal-img" />

          <button className="nav right" onClick={next}>
            <ChevronRight size={28} />
          </button>
        </div>
      )}
    </div>
  );
};

export default TripBanner;