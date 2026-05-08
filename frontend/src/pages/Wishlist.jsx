// frontend/src/pages/Wishlist.jsx

// ─────────────────────────────────────────────────────────────────
// FIX: No longer maintains its own local `items` state.
// Reads directly from WishlistContext.items — the single source
// of truth. When toggleWishlist() updates context.items, this
// component re-renders automatically via React's reactivity.
//
// This is why "add to wishlist" now reflects instantly:
//   Heart clicked → toggleWishlist() → context.items updated
//   → React re-renders ALL consumers of context (including this page)
//   → New item appears without reload or separate fetch
// ─────────────────────────────────────────────────────────────────

import { useContext, useState } from "react";
import { useNavigate }         from "react-router-dom";
import { WishlistContext }     from "../context/WishlistContext";
import { CartContext }         from "../context/CartContext";
import API                    from "../api/axios";
import { FontAwesomeIcon }    from "@fortawesome/react-fontawesome";
import {
  faHeart, faCartShopping, faShop, faTrash,
} from "@fortawesome/free-solid-svg-icons";

function Wishlist() {
  // ✅ Read directly from context — no local items state needed
  const { items, toggleWishlist, loading } = useContext(WishlistContext);
  const { loadCartCount }                  = useContext(CartContext);
  const navigate                           = useNavigate();
  const [toast, setToast]                  = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  const handleRemove = async (productId) => {
    // toggleWishlist updates context.items → this component re-renders
    // automatically — no manual setItems needed
    await toggleWishlist(productId);
    showToast("Removed from wishlist");
  };

  const handleAddToCart = (productId) => {
    API.post("cart/add/", { product_id: productId, quantity: 1 })
      .then(() => { loadCartCount(); showToast("✓ Added to cart!"); })
      .catch(() => showToast("Failed to add to cart"));
  };

  // ── Loading skeleton ──
  if (loading) return (
    <div className="container py-5">
      <div className="row">
        {Array(4).fill(null).map((_, i) => (
          <div key={i} className="col-6 col-md-4 col-lg-3 mb-4">
            <div className="wishlist-card placeholder-glow">
              <div className="wishlist-card-img-wrapper">
                <span className="placeholder w-100 h-100 d-block" />
              </div>
              <div className="wishlist-card-body">
                <span className="placeholder col-10 d-block mb-2" />
                <span className="placeholder col-5 d-block mb-3" />
                <span className="placeholder col-12 d-block" style={{ height: 36, borderRadius: 6 }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Empty state ──
  if (items.length === 0) return (
    <div className="wishlist-empty">
      <div className="wishlist-empty-icon-wrap">
        <FontAwesomeIcon icon={faHeart} />
      </div>
      <h3 className="wishlist-empty-title">Your wishlist is empty</h3>
      <p className="wishlist-empty-sub">Save items you love and come back to them anytime.</p>
      <button className="btn wishlist-shop-btn" onClick={() => navigate("/products")}>
        <FontAwesomeIcon icon={faShop} className="me-2" />
        Browse Products
      </button>
    </div>
  );

  return (
    <div className="wishlist-page">
      <div className="container py-4">

        {/* Header */}
        <div className="wishlist-header">
          <div>
            <h1 className="wishlist-title">
              <FontAwesomeIcon icon={faHeart} className="wishlist-title-icon" />
              My Wishlist
            </h1>
            <p className="wishlist-subtitle">
              {items.length} saved item{items.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Grid */}
        <div className="row">
          {items.map(({ id, product }) => (
            <div key={id} className="col-6 col-sm-6 col-md-4 col-lg-3 mb-4">
              <div className="wishlist-card">

                <div
                  className="wishlist-card-img-wrapper"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <img
                    src={product.product_picture}
                    alt={product.product_name}
                    className="wishlist-card-img"
                  />
                  <button
                    className="wishlist-remove-btn"
                    onClick={e => { e.stopPropagation(); handleRemove(product.id); }}
                    title="Remove from wishlist"
                    aria-label="Remove from wishlist"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>

                <div className="wishlist-card-body">
                  <p
                    className="wishlist-product-name"
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    {product.product_name}
                  </p>
                  <p className="wishlist-product-price">
                    ₹{Number(product.price).toLocaleString("en-IN")}
                  </p>
                  <button
                    className="btn wishlist-add-cart-btn"
                    onClick={() => handleAddToCart(product.id)}
                  >
                    <FontAwesomeIcon icon={faCartShopping} className="me-2" />
                    Add to Cart
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`cart-toast ${toast ? "cart-toast--visible" : ""}`}>
        {toast}
      </div>
    </div>
  );
}

export default Wishlist;