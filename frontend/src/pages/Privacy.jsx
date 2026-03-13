import React from 'react'; // Import React to use JSX and define the component

/**
 * Privacy Component
 * Displays a brief privacy policy statement to inform users how their data is handled.
 * This is a static informational page.
 */
function Privacy() {
  return (
    // Main section container with a reusable CSS class for consistent styling
    <section className="info-page">
      {/* Main heading for the privacy policy */}
      <h1>Privacy Policy</h1>

      {/* Static informational text explaining the platform's data handling policy */}
      <p>
        We respect your privacy. Any personal information collected is used solely to improve
        your experience and is never shared without your consent. Read our full policy for details.
      </p>
    </section>
  );
}

export default Privacy; // Export the component so it can be used in routing
