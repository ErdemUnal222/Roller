import React from 'react'; // Import the React library to enable JSX and component functionality

/**
 * About Component
 * Displays an informational section about the Roller Derby Hub platform.
 * This is a simple static page with no dynamic logic.
 */
function About() {
  return (
    // Main section wrapper for accessibility and layout
    <section className="info-page">
      {/* Main heading for the About page */}
      <h1>About Us</h1>

      {/* Description paragraph explaining the platform's purpose */}
      <p>
        Welcome to Roller Derby Hub — your go-to platform for connecting with derby players,
        clubs, and event organizers across the world. We’re passionate about the sport and
        building a thriving, inclusive community around it.
      </p>
    </section>
  );
}

export default About; // Export the component for use in routing or layout
