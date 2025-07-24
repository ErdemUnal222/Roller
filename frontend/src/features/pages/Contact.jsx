import React from 'react'; // Import React to use JSX and define a functional component

/**
 * Contact Component
 * Displays the contact information for the Roller Derby Hub platform.
 * This is a static page intended for user communication details.
 */
function Contact() {
  return (
    // Wrapper section for styling and semantic structure
    <section className="info-page">
      {/* Page heading */}
      <h1>Contact Us</h1>

      {/* Static contact details — could be replaced with dynamic content in the future */}
      <p>Email: support@rollerderbyhub.com</p>
      <p>Phone: +1 (555) 123-4567</p>

      {/* Additional message encouraging users to reach out */}
      <p>
        We’d love to hear from you. Whether it’s a partnership idea or feedback,
        drop us a line!
      </p>
    </section>
  );
}

export default Contact; // Export the component to be used in routes or layout
