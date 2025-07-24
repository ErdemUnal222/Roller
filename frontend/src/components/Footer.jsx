// /src/components/Footer.jsx

// Import React and useState hook to manage the newsletter input state
import React, { useState } from 'react';

// Import social media icons from react-icons (Font Awesome)
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaGithub } from 'react-icons/fa';

// Import the Link component for internal navigation using React Router
import { Link } from 'react-router-dom';

// Import global SCSS styles for consistent layout and theme
import "/src/styles/main.scss";

/**
 * Footer Component
 * 
 * This component is displayed at the bottom of the website.
 * It contains:
 * - A newsletter subscription form
 * - Important navigation links
 * - Social media icons
 * 
 * The goal is to improve engagement, accessibility, and provide quick access to legal or informational pages.
 */
function Footer() {
  // Store the email input value using React state
  const [email, setEmail] = useState('');

  /**
   * Handles the newsletter form submission.
   * This is a mock function (no actual backend connection).
   */
  const handleSubscribe = (e) => {
    e.preventDefault(); // Prevent default form behavior (page reload)
    if (email.trim()) {
      if (import.meta.env.DEV) {
        console.log(`Subscribed: ${email}`); // Only log in development
      }      setEmail(''); // Clear input field
      alert('Thanks for subscribing!'); // Feedback message for the user
    }
  };

  return (
    <footer
      className="app-footer"
      role="contentinfo" // Accessibility: defines this as footer content
      aria-labelledby="footer-heading"
    >
      <div className="footer-container">

        {/* === TOP SECTION === */}
        <div className="footer-top">

          {/* === Newsletter Signup === */}
          <div className="footer-newsletter">
            <h2 id="footer-heading">Stay in the loop</h2>
            <p id="newsletter-desc">
              Get the latest roller derby updates directly to your inbox.
            </p>

            {/* Newsletter form */}
            <form onSubmit={handleSubscribe}>
              {/* Hidden label for screen readers */}
              <label htmlFor="newsletter-email" className="visually-hidden">
                Email address
              </label>
              <input
                type="email"
                id="newsletter-email"
                placeholder="Enter your email"
                aria-describedby="newsletter-desc" // For screen readers
                value={email}
                onChange={(e) => setEmail(e.target.value)} // Update state on change
                required
              />
              <button type="submit">Subscribe</button>
            </form>
          </div>

          {/* === Quick Navigation Links === */}
          <div className="footer-links">
            <h2>Quick Links</h2>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
        </div>

        {/* === BOTTOM SECTION === */}
        <div className="footer-bottom">
          {/* Copyright */}
          <p className="footer-copy">
            {new Date().getFullYear()} Roller Derby Hub. All rights reserved.
          </p>

          {/* Social Media Links */}
          <div className="footer-social">
            {/* All links open in a new tab and are labeled for accessibility */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <FaFacebook />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
            >
              <FaTwitter />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
            >
              <FaYoutube />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <FaGithub />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Export the Footer component so it can be reused in the app
export default Footer;
