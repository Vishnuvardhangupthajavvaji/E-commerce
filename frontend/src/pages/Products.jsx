// frontend/src/pages/Products.jsx

// ─────────────────────────────────────────────────────────────────
// FIX in this version:
//
//   BUG: Category bar changed URL but products didn't reload.
//
//   ROOT CAUSE: The useEffect dependency array was [searchQuery]
//   only. categoryParam was missing from it. So when the URL
//   changed from /products to /products?category=Electronics,
//   categoryParam updated but the effect didn't re-run because
//   React only watches what's in the dependency array.
//
//   FIX: Change to [searchQuery, categoryParam] so the effect
//   re-runs whenever EITHER URL param changes.
//
//   WHY useSearchParams works here:
//   useSearchParams() from React Router returns a live object
//   that reflects the current URL. When CategoryBar calls
//   navigate("/products?category=Electronics"), React Router
//   updates the URL AND triggers a re-render of Products.jsx,
//   which re-reads the params. The effect then sees the changed
//   dependency and fires.
// ─────────────────────────────────────────────────────────────────

import { useEffect, useState, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../api/axios";
import ProductCard from "../components/ProductCard";
import { CartContext } from "../context/CartContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUpWideShort,
  faArrowDownWideShort,
  faBoxOpen,
} from "@fortawesome/free-solid-svg-icons";

// ── Skeleton placeholder card ──────────────────────────────────
function SkeletonCard() {
  return (
    <div className="col-6 col-sm-6 col-md-4 col-lg-3 mb-4">
      <div className="card h-100 border-0 shadow-sm">
        <div className="placeholder-glow" style={{ height: "185px", background: "#e0e0e0", borderRadius: "8px 8px 0 0" }}>
          <span className="placeholder w-100 h-100 d-block" style={{ borderRadius: "8px 8px 0 0" }} />
        </div>
        <div className="card-body placeholder-glow">
          <span className="placeholder col-8 mb-2 d-block" />
          <span className="placeholder col-4 mb-3 d-block" />
          <span className="placeholder col-12 d-block" style={{ height: "34px", borderRadius: "4px" }} />
        </div>
      </div>
    </div>
  );
}

// ── Main Products component ────────────────────────────────────
function Products() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [sortBy,   setSortBy]   = useState("default");
  const [toast,    setToast]    = useState("");

  const [searchParams]  = useSearchParams();
  const searchQuery     = searchParams.get("search")   || "";
  const categoryParam   = searchParams.get("category") || "";

  const { loadCartCount } = useContext(CartContext);
  const navigate          = useNavigate();

  // ── THE FIX: both searchQuery AND categoryParam in the array ──
  // This effect re-runs whenever either URL param changes.
  useEffect(() => {
    setLoading(true);
    const url = `products/?search=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(categoryParam)}`;
    API.get(url)
      .then(res => setProducts(res.data))
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
  }, [searchQuery, categoryParam]);  // ← FIXED: was [searchQuery] only

  // Sort derived from state — no extra API call needed
  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === "low")  return a.price - b.price;
    if (sortBy === "high") return b.price - a.price;
    return 0;
  });

  const addToCart = (id) => {
    API.post("cart/add/", { product_id: id, quantity: 1 })
      .then(() => { loadCartCount(); showToast("✓ Added to cart!"); })
      .catch(() => showToast("Please login to add to cart"));
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  // Build a readable heading from what's active
  const pageHeading = categoryParam
    ? `${categoryParam}`
    : searchQuery
      ? `Results for "${searchQuery}"`
      : "All Products";

  const skeletons = Array(8).fill(null);

  return (
    <div className="products-page">

      {/* Header strip */}
      <div className="products-header">
        <div className="container">
          <div className="products-header-inner">
            <div>
              <h1 className="products-page-title">{pageHeading}</h1>
              {!loading && (
                <p className="products-count">
                  {sortedProducts.length} product{sortedProducts.length !== 1 ? "s" : ""} found
                </p>
              )}
            </div>

            {/* Sort controls */}
            <div className="sort-controls">
              <span className="sort-label">Sort by:</span>
              <button className={`sort-btn ${sortBy === "default" ? "active" : ""}`} onClick={() => setSortBy("default")}>
                Default
              </button>
              <button className={`sort-btn ${sortBy === "low" ? "active" : ""}`} onClick={() => setSortBy("low")}>
                <FontAwesomeIcon icon={faArrowUpWideShort} className="me-1" />Price: Low
              </button>
              <button className={`sort-btn ${sortBy === "high" ? "active" : ""}`} onClick={() => setSortBy("high")}>
                <FontAwesomeIcon icon={faArrowDownWideShort} className="me-1" />Price: High
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product grid */}
      <div className="container py-4">
        <div className="row">
          {loading
            ? skeletons.map((_, i) => <SkeletonCard key={i} />)
            : sortedProducts.map(p => (
                <div key={p.id} className="col-6 col-sm-6 col-md-4 col-lg-3 mb-4">
                  <ProductCard
                    product={p}
                    addToCart={addToCart}
                    onClick={() => navigate(`/products/${p.id}`)}
                  />
                </div>
              ))
          }
        </div>

        {/* Empty state */}
        {!loading && sortedProducts.length === 0 && (
          <div className="products-empty">
            <FontAwesomeIcon icon={faBoxOpen} className="products-empty-icon" />
            <h4>No products found</h4>
            <p>Try a different search or browse all products</p>
            <button className="btn btn-primary mt-2" onClick={() => navigate("/products")}>
              View All Products
            </button>
          </div>
        )}
      </div>

      {/* Toast */}
      <div className={`cart-toast ${toast ? "cart-toast--visible" : ""}`}>
        {toast}
      </div>

    </div>
  );
}

export default Products;