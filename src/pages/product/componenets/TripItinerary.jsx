    import React, { useState } from "react";
import { Button, Modal } from "antd";
import "./TripItinerary.css";

const TripItinerary = ({ itinerary }) => {
  const [selectedDay, setSelectedDay] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openDayDetails = (dayObj) => {
    setSelectedDay(dayObj);
    setIsModalOpen(true);
  };

  return (
    <div className="itinerary-wrapper">
      <h2 className="section-title">Trip Itinerary</h2>

      {itinerary?.map((dayObj) => (
        <div key={dayObj.day} className="itinerary-day">
          {/* LEFT DAY COLUMN */}
          <div className="day-column">
            <div className="day-circle">Day {dayObj.day}</div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="timeline-column">

            {/* HEADER */}
            <div className="day-header">
              <h4>Day {dayObj.day} Plan</h4>
              <Button
                type="primary"
                size="small"
                onClick={() => openDayDetails(dayObj)}
              >
                View Details
              </Button>
            </div>

            {/* DOT LINE */}
            <div className="timeline-line">
              {dayObj.activities?.map((_, index) => (
                <span key={index} className="timeline-dot"></span>
              ))}
            </div>

            {/* ACTIVITIES PREVIEW */}
            <div className="activities-row">
              {dayObj.activities?.map((act) => (
                <div key={act.id} className="activity-card">
                  <div className="activity-period">{act.period}</div>
                  <div className="activity-title">
                    {act.title.length > 18
                      ? act.title.substring(0, 18) + "..."
                      : act.title}
                  </div>

                  <div className="activity-icon">
                    <img
                      src={
                        act.images && act.images.length > 0
                          ? act.images[0]
                          : "https://cdn-icons-png.flaticon.com/512/684/684908.png"
                      }
                      alt={act.title}
                    />
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      ))}

      {/* MODAL */}
      <Modal
        title={`Day ${selectedDay?.day} Detailed Plan`}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={750}
      >
        <div className="modal-itinerary">
          {selectedDay?.activities?.map((act) => (
            <div key={act.id} className="modal-activity-item">

              <div className="modal-time">
                {act.period}
              </div>

              <div className="modal-content">
                <h4>{act.title}</h4>
                <p>{act.description}</p>

                {act.images && act.images.length > 0 && (
                  <img
                    src={act.images[0]}
                    alt={act.title}
                    className="modal-image"
                  />
                )}
              </div>

            </div>
          ))}
        </div>
      </Modal>

    </div>
  );
};

export default TripItinerary;
