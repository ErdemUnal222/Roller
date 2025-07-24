// Import necessary modules
import React from 'react';
import { Link } from 'react-router-dom'; // Used for internal navigation
import '/src/styles/main.scss'; // Import global styles

/**
 * Home Component
 * This is the landing page of the application.
 * It welcomes users and introduces them to the core features of the Roller Derby Hub.
 */
function Home() {
  return (
    <div className="home-page">
      {/* Hero Section - Acts as the visual introduction at the top of the page */}
      <section className="home-hero" role="banner" aria-labelledby="home-title">
        {/* Main heading for the page */}
        <h1 id="home-title" className="home-title">
          Welcome to the Roller Derby Hub
        </h1>

        {/* Subtitle describing the purpose of the platform */}
        <p className="home-subtitle">
          Discover, join, and organize dynamic roller derby events throughout the country.
        </p>

        {/* Call-to-action button that navigates to the events page */}
        <Link
          to="/events"
          className="home-cta-button"
          aria-label="Browse upcoming roller derby events"
        >
          Explore Events
        </Link>
      </section>

      {/* Why Join Section - Highlights key benefits of the platform */}
      <section className="home-section" aria-labelledby="why-join-title">
        <h2 id="why-join-title" className="section-title">Why Join Us?</h2>

        {/* Benefit Cards - Each card outlines one feature or advantage */}
        <div className="benefits-cards">
          <div className="benefit-card">
            <span className="icon" aria-hidden="true">•</span>
            <p>Browse and register for nearby matches and tournaments.</p>
          </div>
          <div className="benefit-card">
            <span className="icon" aria-hidden="true">•</span>
            <p>Create, promote, and manage your own roller derby events with ease.</p>
          </div>
          <div className="benefit-card">
            <span className="icon" aria-hidden="true">•</span>
            <p>Connect with fellow players, clubs, and organizers in the derby community.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
