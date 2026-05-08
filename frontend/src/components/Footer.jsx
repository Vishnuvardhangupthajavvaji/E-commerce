// frontend/src/components/Footer.jsx

// ─────────────────────────────────────────────
// HOW FOOTER WORKS (Flow of Execution)
// ─────────────────────────────────────────────
// Footer is a static component placed at the bottom of every page.
// In App.jsx, it will sit below all <Routes>, so it always shows.
//
// Layout:
// - Desktop: 3 columns side by side (Bootstrap grid: col-md-4)
// - Tablet/Mobile: each column stacks vertically (default col behavior)
//
// We use Bootstrap's grid system — no custom CSS needed.
// ─────────────────────────────────────────────

import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faInstagram,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons"; // Brand icons (social media)
import {
  faEnvelope,
  faPhone,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";

function Footer() {
  return (
    // mt-auto: pushes footer to bottom if content is short
    // text-white: white text on dark background
    <footer id="site-footer" className="bg-dark text-white pt-5 pb-3">
      <div className="container">

        {/* ── TOP SECTION: 3 Columns ── */}
        <div className="row gy-4">

          {/* ── Column 1: Brand Info ── */}
          <div className="col-md-4">
            <h5 className="fw-bold mb-3">🛒 JVVG Store</h5>
            <p className="text-secondary" style={{ fontSize: "0.9rem" }}>
              Your one-stop destination for quality products at the best prices.
              We deliver happiness, one order at a time.
            </p>
            {/* Social media icons */}
            <div className="d-flex gap-3 mt-3">
              <a href="#" className="text-secondary fs-5" aria-label="Facebook">
                <FontAwesomeIcon icon={faFacebook} />
              </a>
              <a href="#" className="text-secondary fs-5" aria-label="Instagram">
                <FontAwesomeIcon icon={faInstagram} />
              </a>
              <a href="#" className="text-secondary fs-5" aria-label="Twitter">
                <FontAwesomeIcon icon={faTwitter} />
              </a>
            </div>
          </div>

          {/* ── Column 2: Quick Links ── */}
          <div className="col-md-4">
            <h6 className="fw-bold text-uppercase mb-3 text-primary">Quick Links</h6>
            <ul className="list-unstyled d-flex flex-column gap-2">
              {/* list-unstyled removes bullet points */}
              <li>
                <Link to="/" className="text-secondary text-decoration-none footer-link">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-secondary text-decoration-none footer-link">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-secondary text-decoration-none footer-link">
                  Cart
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-secondary text-decoration-none footer-link">
                  My Account
                </Link>
              </li>
            </ul>
          </div>

          {/* ── Column 3: Contact Info ── */}
          <div className="col-md-4">
            <h6 className="fw-bold text-uppercase mb-3 text-primary">Contact Us</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 text-secondary" style={{ fontSize: "0.9rem" }}>
              <li>
                <FontAwesomeIcon icon={faLocationDot} className="me-2 text-primary" />
                Hyderabad, Telangana, India
              </li>
              <li>
                <FontAwesomeIcon icon={faPhone} className="me-2 text-primary" />
                +91 98765 43210
              </li>
              <li>
                <FontAwesomeIcon icon={faEnvelope} className="me-2 text-primary" />
                support@jvvgstore.com
              </li>
            </ul>
          </div>

        </div>

        {/* ── DIVIDER LINE ── */}
        <hr className="border-secondary mt-4" />

        {/* ── BOTTOM: Copyright ── */}
        <div className="text-center text-secondary" style={{ fontSize: "0.85rem" }}>
          © {new Date().getFullYear()} JVVG Store. All rights reserved.
        </div>

      </div>
    </footer>
  );
}

export default Footer;