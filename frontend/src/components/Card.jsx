// /src/components/Card.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import "/src/styles/main.scss"; // Import global SCSS styles

/**
 * Reusable Card Component
 * 
 * This component is designed to be flexible and accessible. It can be used
 * to display different types of content, such as:
 * - Events
 * - Products
 * - User profiles
 * 
 * Props:
 * - image: (string) Image URL to display on top of the card.
 * - title: (string) The main title of the card. Required for accessibility and structure.
 * - description: (string) Optional short description displayed below the title.
 * - link: (string) Optional route path. If provided, a link button is shown.
 * - altText: (string) Optional alternative text for the image (for screen readers). If not provided, title is used.
 * - footer: (JSX Element) Optional element (e.g., buttons, tags) rendered at the bottom of the card.
 */
function Card({ image, title, description, link, altText, footer }) {
  return (
    <article
      className="card"
      role="region"
      aria-labelledby={`card-title-${title?.replace(/\s+/g, '-').toLowerCase()}`}
      tabIndex="0" // Makes the card focusable for keyboard navigation
    >
      {/* Render image only if the image prop is provided */}
      {image && (
        <img
          src={image}
          alt={altText || title} // Use altText for accessibility, fallback to title
          className="card-image"
        />
      )}

      <div className="card-body">
        {/* Title section with unique ID used for accessibility */}
        <h3
          id={`card-title-${title?.replace(/\s+/g, '-').toLowerCase()}`} // Creates an accessible ID
          className="card-title"
        >
          {title}
        </h3>

        {/* Display description if it exists */}
        {description && (
          <p className="card-description">{description}</p>
        )}

        {/* Display "View Details" link if the `link` prop is provided */}
        {link && (
          <Link
            to={link} // Navigate to the provided route
            className="card-link"
            aria-label={`View more details about ${title}`} // Accessibility label for screen readers
          >
            View Details →
          </Link>
        )}

        {/* Render optional footer content (passed in as JSX) */}
        {footer}
      </div>
    </article>
  );
}

export default Card;
