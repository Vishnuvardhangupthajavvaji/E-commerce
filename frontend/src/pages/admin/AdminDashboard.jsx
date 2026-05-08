// frontend/src/pages/admin/AdminDashboard.jsx
//
// DYNAMIC SIDEBAR POSITIONING — HOW IT WORKS:
//
//   We watch 3 real DOM elements with ResizeObserver:
//     1. <header class="sticky-top">  → the navbar
//     2. <nav id="category-bar">      → the pills bar under navbar
//     3. <footer id="site-footer">    → the page footer
//
//   On every resize of any of them:
//     topOffset    = navbar.clientHeight + categoryBar.clientHeight
//     footerHeight = footer.clientHeight   ← clientHeight excludes margin-top
//                                            so the mt-5 on footer is ignored
//
//   We set two CSS variables on the sidebar element:
//     --sidebar-top:    topOffset px
//     --sidebar-height: calc(100vh - topOffset - footerHeight)
//
//   The sidebar CSS reads these:
//     top:    var(--sidebar-top)
//     height: var(--sidebar-height)
//
//   WHY clientHeight and not getBoundingClientRect().height?
//     getBoundingClientRect().height includes CSS margins.
//     clientHeight is the box height only (padding + content), no margin.
//     The footer has mt-5 (margin-top: 3rem) which we must NOT subtract
//     from the sidebar height — otherwise a gap appears equal to the margin.

import { Link, Outlet, useLocation, useNavigate }  from "react-router-dom";
import { useState, useContext, useEffect, useRef }  from "react";
import { AuthContext }    from "../../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGauge, faBoxesStacked, faCirclePlus,
  faUsers, faBars, faBoxOpen,
  faRightFromBracket, faShop,
} from "@fortawesome/free-solid-svg-icons";

const NAV_ITEMS = [
  { label: "Overview",    icon: faGauge,        to: "/admin" },
  { label: "Products",    icon: faBoxesStacked, to: "/admin/products" },
  { label: "Add Product", icon: faCirclePlus,   to: "/admin/products/add" },
  { label: "Users",       icon: faUsers,        to: "/admin/users" },
  { label: "Orders",      icon: faBoxOpen,      to: "/admin/orders" },
];

function AdminDashboard() {
  const location                = useLocation();
  const navigate                = useNavigate();
  const { logout }              = useContext(AuthContext);
  const [sideOpen, setSideOpen] = useState(false);
  const sidebarRef              = useRef(null);

  useEffect(() => {
    // Find the three elements we need to measure.
    // Called inside the effect so we always get the latest DOM.
    const getEls = () => ({
      navbar:      document.querySelector("header.sticky-top"),
      categoryBar: document.getElementById("category-bar"),
      footer:      document.getElementById("site-footer"),
    });

    const update = () => {
      if (!sidebarRef.current) return;
      const { navbar, categoryBar, footer } = getEls();

      // Use getBoundingClientRect() so we measure where each element
      // actually ends in the viewport RIGHT NOW (accounts for scroll position).
      //
      // navbar is sticky-top → its bottom is always at navH pixels from top.
      // categoryBar is NOT sticky → when scrolled past, its bottom goes negative.
      //   Math.max(0, ...) clamps it so we never get a negative top offset.
      const navBottom = navbar      ? navbar.getBoundingClientRect().bottom      : 0;
      const catBottom = categoryBar ? categoryBar.getBoundingClientRect().bottom : 0;

      // topOffset = the lowest point of the two sticky/scrolling headers
      // When category bar has scrolled away, catBottom < 0 → clamped to 0
      // so sidebar top = just below navbar.
      const topOffset = Math.max(navBottom, Math.max(0, catBottom));

      // Only subtract footer height when visible in viewport
      let footerVisible = 0;
      if (footer) {
        const rect = footer.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          footerVisible = Math.max(0, window.innerHeight - rect.top);
        }
      }

      sidebarRef.current.style.setProperty("--sidebar-top",
        `${topOffset}px`);
      sidebarRef.current.style.setProperty("--sidebar-height",
        `calc(100vh - ${topOffset}px - ${footerVisible}px)`);
    };

    // Fire immediately on mount
    update();

    // Watch all three for any dimension change
    const ro = new ResizeObserver(update);
    const { navbar, categoryBar, footer } = getEls();
    if (navbar)      ro.observe(navbar);
    if (categoryBar) ro.observe(categoryBar);
    if (footer)      ro.observe(footer);

    // Also catch viewport resizes and scroll events.
    // Scroll matters because footer visibility changes as user scrolls down.
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
    };
  }, []);

  const handleLogout = () => { logout(); navigate("/login"); };

  const isActive = (to) => {
    if (to === "/admin") return location.pathname.endsWith("/admin");
    const endpoint = to.split("/");
    // console.log(`${location.pathname}  ==>  ${endpoint[endpoint.length - 2]}/${endpoint[endpoint.length - 1]}`)
    // console.log(`${location.pathname.endsWith(endpoint[endpoint.length - 2]+"/"+endpoint[endpoint.length - 1])}`)
    return location.pathname.endsWith(`${endpoint[endpoint.length - 2]}/${endpoint[endpoint.length - 1]}`);
  }

  const SidebarContent = () => (
    <div className="admin-sidebar-inner">
      <div className="admin-sidebar-brand">
        <span className="admin-sidebar-brand-icon">🛒</span>
        <span className="admin-sidebar-brand-name">Admin Panel</span>
      </div>

      <nav className="admin-sidebar-nav">
        {NAV_ITEMS.map(item => (
          <Link
            key={item.to}
            to={item.to}
            className={`admin-nav-link ${isActive(item.to) ? "admin-nav-link--active" : ""}`}
            onClick={() => setSideOpen(false)}
          >
            <FontAwesomeIcon icon={item.icon} className="admin-nav-icon" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <Link to="/" className="admin-footer-link" onClick={() => setSideOpen(false)}>
          <FontAwesomeIcon icon={faShop} className="me-2" />View Store
        </Link>
        <button className="admin-footer-link admin-footer-logout" onClick={handleLogout}>
          <FontAwesomeIcon icon={faRightFromBracket} className="me-2" />Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="admin-layout">

      {/* ── DESKTOP SIDEBAR ── */}
      <aside
        ref={sidebarRef}
        className="admin-sidebar d-none d-lg-flex"
        style={{
          // Fallback values before ResizeObserver fires on first render.
          // 130px is a safe estimate for navbar + category bar.
          "--sidebar-top":    "130px",
          "--sidebar-height": "calc(100vh - 130px)",
        }}
      >
        <SidebarContent />
      </aside>

      {/* ── MOBILE OVERLAY SIDEBAR ── */}
      {sideOpen && (
        <div className="admin-sidebar-overlay" onClick={() => setSideOpen(false)}>
          <aside
            className="admin-sidebar admin-sidebar--mobile"
            onClick={e => e.stopPropagation()}
          >
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div className="admin-content">
        <div className="admin-topbar d-lg-none">
          <button className="admin-topbar-toggle" onClick={() => setSideOpen(true)}>
            <FontAwesomeIcon icon={faBars} />
          </button>
          <span className="admin-topbar-title">
            {NAV_ITEMS.find(i => isActive(i.to))?.label || "Admin"}
          </span>
        </div>
        <div className="admin-page-body">
          <Outlet />
        </div>
      </div>

    </div>
  );
}

export default AdminDashboard;