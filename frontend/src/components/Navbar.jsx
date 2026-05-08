// frontend/src/components/Navbar.jsx
//
// NOTIFICATION BEHAVIOUR:
//   Desktop (≥992px) — hover on the bell wrap → panel appears.
//     Mouse leaving the wrap (bell + panel together) → panel closes.
//     X button always visible on every item.
//     markAllRead fires as soon as the panel opens.
//
//   Mobile/Tablet (<992px) — bell lives inside the hamburger menu.
//     Click the bell → slide-down panel (same style as desktop).
//     X always visible on every item.
//     Click bell again or outside → closes.
//
// ACCOUNT DROPDOWN:
//   Pure CSS :hover.  Gap bug fixed by:
//     1. top: 100% instead of calc(100% + 6px) — no physical dead zone.
//     2. padding-top: 8px on the menu — visual breathing room without gap.

import { Link, useNavigate }              from "react-router-dom";
import { useContext, useState, useRef,
         useEffect, useCallback }          from "react";
import { AuthContext }                     from "../context/AuthContext";
import { CartContext }                     from "../context/CartContext";
import { WishlistContext }                 from "../context/WishlistContext";
import { NotificationContext }             from "../context/NotificationContext";
import { FontAwesomeIcon }                 from "@fortawesome/react-fontawesome";
import {
  faShoppingCart, faBars, faTimes, faUser, faChevronDown,
  faHeart, faMagnifyingGlass, faRightFromBracket,
  faBell, faCheckDouble, faBoxOpen,
  faInfoCircle, faExclamationTriangle, faCheckCircle, faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartOutline }       from "@fortawesome/free-regular-svg-icons";

// ─────────────────────────────────────────────────────────────────
// Reusable NotifPanel — identical markup for desktop & mobile
// ─────────────────────────────────────────────────────────────────
function NotifPanel({ notifications, unreadCount, clearAll, removeNotification }) {
  const iconFor = type =>
    type === "order"   ? faBoxOpen :
    type === "success" ? faCheckCircle :
    type === "warning" ? faExclamationTriangle :
    faInfoCircle;

  return (
    <>
      <div className="nav-notif-header">
        <span className="nav-notif-title">
          Notifications
          {unreadCount > 0 && <span className="nav-notif-badge">{unreadCount}</span>}
        </span>
        {notifications.length > 0 && (
          <button className="nav-notif-clear-all" onClick={clearAll} title="Clear all">
            <FontAwesomeIcon icon={faCheckDouble} /> Clear all
          </button>
        )}
      </div>

      <div className="nav-notif-list">
        {notifications.length === 0 ? (
          <div className="nav-notif-empty">
            <FontAwesomeIcon icon={faBell} className="nav-notif-empty-icon" />
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map(n => (
            <div key={n.id} className={`nav-notif-item nav-notif-item--${n.type}`}>
              <span className="nav-notif-item-icon">
                <FontAwesomeIcon icon={iconFor(n.type)} />
              </span>
              <div className="nav-notif-item-body">
                <p className="nav-notif-item-msg">{n.message}</p>
                <p className="nav-notif-item-time">
                  {new Date(n.timestamp).toLocaleString("en-IN", {
                    day: "numeric", month: "short",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              </div>
              {/* X always visible — critical for touch devices */}
              <button
                className="nav-notif-item-remove nav-notif-item-remove--always"
                onClick={() => removeNotification(n.id)}
                title="Remove"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
}


// ─────────────────────────────────────────────────────────────────
// Main Navbar
// ─────────────────────────────────────────────────────────────────
function Navbar() {
  const { token, logout, user }   = useContext(AuthContext);
  const { cartCount }             = useContext(CartContext);
  const { wishlistedIds }         = useContext(WishlistContext);
  const {
    notifications, hasUnread, unreadCount,
    markAllRead, removeNotification, clearAll,
  }                               = useContext(NotificationContext);
  const navigate                  = useNavigate();
  const headerRef                 = useRef(null);   // measures total header height for mobile panel

  const [isOpen,      setIsOpen]      = useState(false);  // hamburger
  const [searchQuery, setSearchQuery] = useState("");

  // Desktop: hover-based
  const [desktopNotifOpen, setDesktopNotifOpen] = useState(false);
  const hoverTimer                              = useRef(null);

  // Mobile/Tablet: click-based
  const [mobileNotifOpen, setMobileNotifOpen] = useState(false);
  const mobileNotifRef                        = useRef(null);

  // Close mobile panel on outside click
  useEffect(() => {
    if (!mobileNotifOpen) return;
    const handleOutside = e => {
      if (mobileNotifRef.current && !mobileNotifRef.current.contains(e.target))
        setMobileNotifOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [mobileNotifOpen]);

  // Desktop hover handlers
  const handleBellEnter = useCallback(() => {
    clearTimeout(hoverTimer.current);
    setDesktopNotifOpen(true);
    markAllRead();
  }, [markAllRead]);

  const handleBellLeave = useCallback(() => {
    // 120ms grace period so cursor can travel from bell → panel
    hoverTimer.current = setTimeout(() => setDesktopNotifOpen(false), 120);
  }, []);

  // Mobile click handler
  const handleMobileBell = () => {
    const opening = !mobileNotifOpen;
    setMobileNotifOpen(opening);
    if (opening) {
      markAllRead();
      // Measure header height so the fixed panel appears right below it
      if (headerRef.current) {
        const h = headerRef.current.getBoundingClientRect().bottom;
        document.documentElement.style.setProperty('--mobile-notif-top', h + 'px');
      }
    }
  };

  const handleLogout = () => { logout(); navigate("/login"); setIsOpen(false); };
  const closeMenu    = () => setIsOpen(false);

  const handleSearch = e => {
    e.preventDefault();
    const q = searchQuery.trim();
    navigate(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
    closeMenu();
  };

  const wishlistCount = wishlistedIds?.size ?? 0;

  return (
    <header className="sticky-top" ref={headerRef}>

      {/* ═══════════════════ MAIN NAV ═══════════════════ */}
      <nav className="navbar navbar-dark navbar-3col">

        {/* COL 1 — Brand */}
        <Link className="navbar-brand navbar-brand-fixed" to="/" onClick={closeMenu}>
          🛒 JVVG Store
        </Link>

        {/* COL 2 — Desktop search */}
        <form onSubmit={handleSearch} className="d-none d-lg-flex navbar-search-middle">
          <div className="input-group">
            <input
              type="text"
              className="form-control nav-search-input"
              placeholder="Search products, brands and more..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Search"
            />
            <button type="submit" className="btn nav-search-btn" aria-label="Search">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>
          </div>
        </form>

        {/* COL 3 — Quick access */}
        <div className="navbar-quick-access">

          {/* ── DESKTOP-ONLY LINKS ── */}
          <div className="d-none d-lg-flex align-items-center gap-1">

            {/* Cart */}
            <Link className="nav-quick-btn position-relative" to="/cart">
              <FontAwesomeIcon icon={faShoppingCart} />
              <span className="nav-quick-label">Cart</span>
              {cartCount > 0 && token && <span className="nav-quick-badge">{cartCount}</span>}
            </Link>

            {/* Wishlist */}
            {token && (
              <Link className="nav-quick-btn position-relative" to="/wishlist">
                <FontAwesomeIcon icon={wishlistCount > 0 ? faHeart : faHeartOutline} />
                <span className="nav-quick-label">Wishlist</span>
                {wishlistCount > 0 && (
                  <span className="nav-quick-badge nav-quick-badge--heart">{wishlistCount}</span>
                )}
              </Link>
            )}

            {/* ── DESKTOP BELL (hover) ── */}
            {token && (
              <div
                className="nav-notif-wrap"
                onMouseEnter={handleBellEnter}
                onMouseLeave={handleBellLeave}
              >
                <button className="nav-quick-btn" aria-label="Notifications">
                  <FontAwesomeIcon icon={faBell} />
                  <span className="nav-quick-label">Alerts</span>
                  {hasUnread && <span className="nav-notif-dot" />}
                </button>

                {desktopNotifOpen && (
                  <div className="nav-notif-panel">
                    <NotifPanel
                      notifications={notifications}
                      unreadCount={unreadCount}
                      clearAll={clearAll}
                      removeNotification={removeNotification}
                    />
                  </div>
                )}
              </div>
            )}

            {/* ── ACCOUNT DROPDOWN (pure CSS hover, gap-free) ── */}
            {token ? (
              <div className="nav-dropdown">
                <button className="nav-quick-btn nav-dropdown-trigger">
                  <FontAwesomeIcon icon={faUser} />
                  <span className="nav-quick-label">
                    {user?.first_name || user?.username || "Account"}
                  </span>
                  <FontAwesomeIcon icon={faChevronDown} className="nav-chevron" />
                </button>

                <div className="nav-dropdown-menu">
                  <Link className="nav-dropdown-item" to="/profile" onClick={closeMenu}>
                    <FontAwesomeIcon icon={faUser} className="me-2" />My Profile
                  </Link>
                  <Link className="nav-dropdown-item" to="/orders" onClick={closeMenu}>
                    <FontAwesomeIcon icon={faBoxOpen} className="me-2" />My Orders
                  </Link>
                  {user?.is_staff && (
                    <Link className="nav-dropdown-item" to="/admin/products" onClick={closeMenu}>
                    <FontAwesomeIcon icon={faShieldHalved} className="me-2" />Admin Panel
                  </Link>
                  )}
                  <div className="nav-dropdown-divider" />
                  <button className="nav-dropdown-item nav-dropdown-item--danger" onClick={handleLogout}>
                    <FontAwesomeIcon icon={faRightFromBracket} className="me-2" />Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link className="btn nav-login-btn" to="/login">Login</Link>
            )}
          </div>

          {/* Hamburger — mobile/tablet */}
          <button
            className="navbar-toggler d-lg-none"
            type="button"
            onClick={() => setIsOpen(o => !o)}
            aria-label="Toggle navigation"
          >
            <FontAwesomeIcon
              icon={isOpen ? faTimes : faBars}
              style={{ color: "white", fontSize: "1.2rem" }}
            />
          </button>
        </div>
      </nav>

      {/* ═══════════════════ MOBILE SEARCH ROW ═══════════════════ */}
      <div className="d-lg-none mobile-search-row">
        <div className="px-3 py-2">
          <form onSubmit={handleSearch} className="d-flex">
            <div className="input-group">
              <input
                type="text"
                className="form-control nav-search-input"
                placeholder="Search products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                aria-label="Search"
              />
              <button type="submit" className="btn nav-search-btn" aria-label="Search">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ═══════════════════ MOBILE/TABLET HAMBURGER MENU ═══════════════════ */}
      <div className={`mobile-nav-menu ${isOpen ? "mobile-nav-menu--open" : ""}`}>
        <div className="px-3 py-2">
          <ul className="list-unstyled d-flex flex-row flex-wrap gap-1 mb-0">

            <li><Link className="nav-link px-2" to="/" onClick={closeMenu}>Home</Link></li>
            <li><Link className="nav-link px-2" to="/products" onClick={closeMenu}>Products</Link></li>

            <li>
              <Link className="nav-link px-2 position-relative" to="/cart" onClick={closeMenu}>
                <FontAwesomeIcon icon={faShoppingCart} className="me-1" />Cart
                {cartCount > 0 && token && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill cart-badge">
                    {cartCount}
                  </span>
                )}
              </Link>
            </li>

            {token ? (
              <>
                <li>
                  <Link className="nav-link px-2 position-relative" to="/wishlist" onClick={closeMenu}>
                    <FontAwesomeIcon icon={wishlistCount > 0 ? faHeart : faHeartOutline} className="me-1" />
                    Wishlist
                    {wishlistCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill cart-badge">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                </li>

                <li><Link className="nav-link px-2" to="/profile" onClick={closeMenu}>
                  <FontAwesomeIcon icon={faUser} className="me-1" />Profile
                </Link></li>

                <li><Link className="nav-link px-2" to="/orders" onClick={closeMenu}>
                  <FontAwesomeIcon icon={faBoxOpen} className="me-1" />Orders
                </Link></li>

                {/* ── MOBILE/TABLET BELL (click → slide-down) ── */}
                <li ref={mobileNotifRef} className="nav-notif-mobile-li">
                  <button
                    className="nav-link px-2 position-relative nav-notif-mobile-btn"
                    onClick={handleMobileBell}
                    aria-label="Notifications"
                  >
                    <FontAwesomeIcon icon={faBell} className="me-1" />
                    Alerts
                    {hasUnread && (
                      <span className="nav-notif-mobile-dot">{unreadCount}</span>
                    )}
                  </button>

                  {/* Slide-down panel — identical style to desktop */}
                  <div className={`nav-notif-panel--mobile ${mobileNotifOpen ? "nav-notif-panel--open" : ""}`}>
                    <NotifPanel
                      notifications={notifications}
                      unreadCount={unreadCount}
                      clearAll={clearAll}
                      removeNotification={removeNotification}
                    />
                  </div>
                </li>

                <li>
                  <button className="btn btn-outline-light btn-sm ms-1" onClick={handleLogout}>
                    <FontAwesomeIcon icon={faRightFromBracket} className="me-1" />Logout
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link className="btn btn-primary btn-sm ms-1" to="/login" onClick={closeMenu}>
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>

    </header>
  );
}

export default Navbar;