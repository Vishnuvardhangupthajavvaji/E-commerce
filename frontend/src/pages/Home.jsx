// frontend/src/pages/Home.jsx

// ─────────────────────────────────────────────────────────────────
// WHAT'S NEW vs original:
//
// 1. Hero banner — a welcoming full-width banner at the top
//    replacing the plain <h3> text heading
//
// 2. Responsive product grid:
//    Mobile  (< 576px)  → 2 cards per row  (col-6)
//    Tablet  (576-991px)→ 2-3 cards per row (col-sm-6 col-md-4)
//    Desktop (992px+)   → 3-4 cards per row (col-lg-3)
//
// 3. ProductCard now navigates to /products/:id on click
//    (we add an onClick wrapper here — ProductCard itself stays dumb)
//
// 4. Section titles use the .section-title CSS class (accent left border)
//
// 5. Skeleton loading placeholders while API fetches data
//    — better UX than a blank screen
//
// FLOW OF EXECUTION:
//   Component mounts
//     → loading = true → show skeleton cards
//     → Two API calls fire in parallel (featured + all products)
//     → Both resolve → loading = false → show real cards
//     → User clicks a card → navigate to /products/:id
// ─────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import ProductCard from "../components/ProductCard";

// ── Skeleton Card ──────────────────────────────────────────────
// Shows a grey pulsing placeholder while products are loading.
// This is a pure UI component — no props needed, no logic.
// Bootstrap's "placeholder" and "placeholder-glow" classes
// create the animated shimmer effect automatically.
function SkeletonCard() {
  return (
    <div className="col-6 col-sm-6 col-md-4 col-lg-3 mb-4">
      <div className="card h-100 border-0 shadow-sm">
        {/* Grey box where the image will be */}
        <div
          className="placeholder-glow"
          style={{ height: "200px", background: "#e0e0e0", borderRadius: "8px 8px 0 0" }}
        >
          <span className="placeholder w-100 h-100 d-block" style={{ borderRadius: "8px 8px 0 0" }} />
        </div>
        <div className="card-body placeholder-glow">
          <span className="placeholder col-8 mb-2 d-block" />
          <span className="placeholder col-4 mb-3 d-block" />
          <span className="placeholder col-12 d-block" style={{ height: "36px", borderRadius: "4px" }} />
        </div>
      </div>
    </div>
  );
}

// ── Home Component ─────────────────────────────────────────────
function Home() {
  const [featured,  setFeatured]  = useState([]);
  const [remaining, setRemaining] = useState([]);
  const [loading,   setLoading]   = useState(true);  // tracks API loading state

  const navigate = useNavigate();

  useEffect(() => {
    // Fire both API calls at the same time using Promise.all
    // Promise.all waits for BOTH to finish before continuing
    Promise.all([
      API.get("products/featured/"),
      API.get("products/"),
    ])
      .then(([featuredRes, allRes]) => {
        setFeatured(featuredRes.data);
        setRemaining(allRes.data);
      })
      .catch(err => console.log(err))
      .finally(() => setLoading(false)); // runs whether success or error
  }, []);

  // When user clicks a product card → go to detail page
  const handleCardClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  // Array of 4 skeleton cards for the loading state
  const skeletons = Array(4).fill(null);

  return (
    <>
      {/* ═══════════════════════════════════════════════
          HERO BANNER
          Uses .hero-banner class from index.css
          Padding scales with screen via CSS media queries
          ═══════════════════════════════════════════════ */}
      <div className="hero-banner mx-0">
        <div className="container">
          {/*
            fs-1 → very large on desktop
            We override with media query in CSS for mobile
          */}
          <h1 className="hero-title">Welcome to JVVG Store</h1>
          <p className="hero-subtitle">
            Discover amazing products at unbeatable prices
          </p>
          <button
            className="hero-btn"
            onClick={() => navigate("/products")}
          >
            Shop Now →
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          MAIN CONTENT
          ═══════════════════════════════════════════════ */}
      <div className="container py-4">

        {/* ── Featured Products Section ── */}
        <h2 className="section-title">⭐ Featured Products</h2>

        <div className="row">
          {loading
            ? skeletons.map((_, i) => <SkeletonCard key={i} />)
            : featured.map(p => (
                <div
                  key={p.id}
                  className="col-6 col-sm-6 col-md-4 col-lg-3 mb-4"
                  // Wrap in a div to control grid columns independently
                  // of what ProductCard renders internally
                >
                  <ProductCard
                    product={p}
                    onClick={() => handleCardClick(p.id)}
                  />
                </div>
              ))
          }
        </div>

        {/* ── All Products Section ── */}
        <h2 className="section-title mt-4">🛍️ All Products</h2>

        <div className="row">
          {loading
            ? skeletons.map((_, i) => <SkeletonCard key={i} />)
            : remaining.map(p => (
                <div
                  key={p.id}
                  className="col-6 col-sm-6 col-md-4 col-lg-3 mb-4"
                >
                  <ProductCard
                    product={p}
                    onClick={() => handleCardClick(p.id)}
                  />
                </div>
              ))
          }
        </div>

        {/* Empty state — if no products exist at all */}
        {!loading && remaining.length === 0 && (
          <div className="text-center py-5 text-muted">
            <p style={{ fontSize: "3rem" }}>📦</p>
            <p>No products available yet.</p>
          </div>
        )}

      </div>
    </>
  );
}

export default Home;