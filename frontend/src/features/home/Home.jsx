import { Link } from 'react-router-dom';
import '../../styles/_home.scss';

export default function Home() {
  return (
    <main className="home-page">
      {/* Hero Section */}
      <section className="home-hero">
        <h1 className="home-title">Roll with the Best</h1>
        <p className="home-subtitle">
          Connect with derby players, discover events, and shop exclusive gear.
        </p>
        <Link to="/events" className="home-cta-button">Browse Events</Link>
      </section>

      {/* Platform Features Section */}
      <section className="home-section">
        <h2 className="section-title">Explore the Platform</h2>
        <div className="benefits-cards">
          <div className="benefit-card">
            <span className="icon">📅</span>
            <p>Find and register for upcoming roller derby matches and community events.</p>
          </div>
          <div className="benefit-card">
            <span className="icon">🛍️</span>
            <p>Visit our shop for exclusive derby merchandise and essential gear.</p>
          </div>
          <div className="benefit-card">
            <span className="icon">💬</span>
            <p>Connect with clubs, players, and event organizers directly on the platform.</p>
          </div>
        </div>

        <div className="home-links">
          <Link to="/events" className="home-cta-button">Explore Events</Link>
          <Link to="/shop" className="home-cta-button">Visit Shop</Link>
        </div>
      </section>
    </main>
  );
}
