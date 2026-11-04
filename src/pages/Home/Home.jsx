import React, { useState, useRef } from 'react'
import Hero from './banner/Hero'
import Eventcard from './banner/components/Eventcard'
import './Home.css'
import Decoration from './banner/components/Decoration'
import NewAttractions from './banner/components/NewAttractions'
// import InterestingDestinations from './banner/components/InterestingDestinations'
import HowItWorks from './banner/components/HowItWorks'
// import HappinessSection from './banner/components/HappinessSection'
import AinthinaiSection from './banner/components/AinthinaiSection'
import CulturalImmersion from './banner/CulturalImmersion'
import Footer from '../../components/common/Footer/Footer'

const Home = () => {
  const [searchFilters, setSearchFilters] = useState(null);
  const eventsRef = useRef(null);

  const handleSearch = (filters) => {
    setSearchFilters(filters);
    
    // Scroll to events section after search
    setTimeout(() => {
      if (eventsRef.current) {
        eventsRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  };

  return (
    <div>
      {/* Pass handleSearch to Hero component which contains GlassSearch */}
      <Hero onSearch={handleSearch} />

      {/* Add ref to Eventcard section for scrolling */}
      <div ref={eventsRef}>
        <Eventcard searchFilters={searchFilters} />
      </div>
      
      <AinthinaiSection />
      <Decoration />
      <NewAttractions />
      <CulturalImmersion />
      {/* <HappinessSection /> */}
      {/* <InterestingDestinations /> */}
      <HowItWorks />
      <Footer />
    </div>
  )
}

export default Home