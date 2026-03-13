import React from 'react'; // Import React to define a functional component using JSX

/**
 * Terms Component
 * A static page that displays the platform's terms of service.
 * This helps users understand the rules and conditions they must follow.
 */
function Terms() {
  return (
    // Main content section styled using a shared CSS class
    <section className="info-page">
      {/* Main title for the Terms of Service page */}
      <h1>Terms of Service</h1>

      {/* Static text outlining basic platform usage rules */}
      <p>
        By using this platform, you agree to our terms: respectful conduct, no spam, and
        compliance with local laws. Violations may result in account restrictions.
      </p>
    </section>
  );
}

export default Terms; // Export the component for use in routing/navigation
