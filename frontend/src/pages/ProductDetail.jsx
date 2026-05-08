// frontend/src/pages/ProductDetail.jsx

// ─────────────────────────────────────────────────────────────────
// LAYOUT:
//
//  ┌─────────────────────────────────────────────────┐
//  │  [← Back]                                       │
//  ├──────────────────────┬──────────────────────────┤
//  │  [Main Image]        │  Product Name            │
//  │                      │  Brand | Category        │
//  │  [img][img][img]     │  ★★★★☆  (4.0)          │
//  │  (thumbnail row)     │  ₹ 49,999                │
//  │                      │  Color: Blue             │
//  │                      │  Stock: In Stock ✓        │
//  │                      │  [Add to Cart]           │
//  │                      │  [Buy Now]  (disabled)   │
//  ├──────────────────────┴──────────────────────────┤
//  │  Description                                    │
//  │  <full text>                                    │
//  ├─────────────────────────────────────────────────┤
//  │  Customer Comments (max 5)                      │
//  │  [comment box — only for logged-in users]       │
//  │  [comment card] [comment card] ...              │
//  └─────────────────────────────────────────────────┘
//
// FLOW:
//   URL: /products/42
//   → useParams() gets id = "42"
//   → Two API calls: product detail + comments
//   → selectedImage state tracks which thumbnail is shown large
//   → Comment form only renders if token exists
//   → On submit: POST comment → refresh comments
//   → Sliding window enforced on backend (max 5)
// ─────────────────────────────────────────────────────────────────

import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { AuthContext }     from "../context/AuthContext";
import { CartContext }     from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faStarHalfStroke,
  faCartShopping,
  faBolt,
  faArrowLeft,
  faCheckCircle,
  faTimesCircle,
  faTrash,
  faUser,
  faTag,
  faPalette,
  faIndustry,
  faHeart,
  faPlus,
  faMinus,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarEmpty, faHeart as faHeartEmpty } from "@fortawesome/free-regular-svg-icons";


// ── Star Rating display component ─────────────────────────────
function StarRating({ rating = 4, size = "1rem" }) {
  return (
    <span style={{ color: "var(--accent)", fontSize: size, letterSpacing: "2px" }}>
      {[1,2,3,4,5].map(s => {
        if (rating >= s)       return <FontAwesomeIcon key={s} icon={faStar} />;
        if (rating >= s - 0.5) return <FontAwesomeIcon key={s} icon={faStarHalfStroke} />;
        return                        <FontAwesomeIcon key={s} icon={faStarEmpty} />;
      })}
    </span>
  );
}


// ── Main component ─────────────────────────────────────────────
function ProductDetail() {
  const { id }    = useParams();     // reads the :id from the URL
  const navigate  = useNavigate();
  const { token, user }              = useContext(AuthContext);
  const { loadCartCount }            = useContext(CartContext);
  const { isWishlisted, toggleWishlist } = useContext(WishlistContext);

  const [product,       setProduct]       = useState(null);
  const [comments,      setComments]      = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [commentText,   setCommentText]   = useState("");
  const [loading,       setLoading]       = useState(true);
  const [addingToCart,  setAddingToCart]  = useState(false);
  const [cartMsg,       setCartMsg]       = useState("");
  const [submitting,    setSubmitting]    = useState(false);
  const [quantity,      setQuantity]      = useState(1);

  // ── Fetch product + comments on mount ──
  useEffect(() => {
    setLoading(true);
    Promise.all([
      API.get(`products/${id}/`),
      API.get(`comments/?product=${id}`),
    ])
      .then(([prodRes, commRes]) => {
        setProduct(prodRes.data);
        setSelectedImage(prodRes.data.product_picture);
        setComments(commRes.data);
      })
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
  }, [id]);

  const fetchComments = () => {
    API.get(`comments/?product=${id}`)
      .then(res => setComments(res.data));
  };

  // ── Add to Cart ──
  const handleAddToCart = () => {
    if (!token) { navigate("/login"); return; }
    setAddingToCart(true);
    API.post("cart/add/", { product_id: id, quantity })
      .then(() => {
        loadCartCount();
        setCartMsg(`✓ ${quantity} item${quantity > 1 ? "s" : ""} added to cart!`);
        setTimeout(() => setCartMsg(""), 2500);
      })
      .catch(() => setCartMsg("Something went wrong"))
      .finally(() => setAddingToCart(false));
  };

  // ── Submit comment ──
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    API.post("comments/add/", { product: id, text: commentText.trim() })
      .then(() => {
        setCommentText("");
        fetchComments();
      })
      .catch(err => console.log(err))
      .finally(() => setSubmitting(false));
  };

  // ── Delete own comment ──
  const handleDeleteComment = (commentId) => {
    API.delete(`comments/${commentId}/`)
      .then(fetchComments)
      .catch(err => console.log(err));
  };

  // ─────────────────────────────────────────────
  // LOADING STATE
  // ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-md-5">
            <div className="placeholder-glow">
              <span className="placeholder d-block w-100" style={{ height: "400px", borderRadius: "12px" }} />
            </div>
            <div className="d-flex gap-2 mt-3">
              {[1,2,3].map(i => (
                <span key={i} className="placeholder d-block" style={{ width: "80px", height: "80px", borderRadius: "8px" }} />
              ))}
            </div>
          </div>
          <div className="col-md-7 placeholder-glow d-flex flex-column gap-3">
            <span className="placeholder col-8" style={{ height: "2rem" }} />
            <span className="placeholder col-4" style={{ height: "1rem" }} />
            <span className="placeholder col-3" style={{ height: "2.5rem" }} />
            <span className="placeholder col-6" style={{ height: "1rem" }} />
            <span className="placeholder col-12" style={{ height: "48px" }} />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-5 text-center">
        <h3>Product not found.</h3>
        <button className="btn btn-primary mt-3" onClick={() => navigate("/products")}>
          Back to Products
        </button>
      </div>
    );
  }

  // Build full image list from cover + gallery extras
  const allImages = (() => {
    const cover  = product.product_picture;
    const extras = (product.images || []).map(i => i.image);
    if (!extras.length)      return [cover];
    if (extras[0] === cover) return extras;
    return [cover, ...extras];
  })();

  const inStock  = product.stock > 0;
  const wishlisted  = isWishlisted(product.id);

  // ── Wishlist toggle ──
  const handleWishlistToggle = async () => {
    if (!token) { navigate("/login"); return; }
    const newState = await toggleWishlist(product.id);
    // newState is true (added) or false (removed)
  };

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="detail-page">
      <div className="container py-4">

        {/* ── Back button ── */}
        <button
          className="detail-back-btn mb-4"
          onClick={() => navigate(-1)}   // go back one page in history
        >
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Back
        </button>

        {/* ════════════════════════════════════════
            TOP SECTION: Images + Product Info
            ════════════════════════════════════════ */}
        <div className="row g-4 mb-5">

          {/* ── Left Column: Images ── */}
          <div className="col-12 col-md-5">

            {/* Main large image */}
            <div className="detail-main-img-wrapper">
              <img
                src={selectedImage}
                alt={product.product_name}
                className="detail-main-img"
              />
            </div>

            {/* Thumbnail row */}
            {/*
              Even with one image, we show the thumbnail strip.
              When you add multiple images to the backend, each will
              appear here. Clicking a thumbnail swaps the main image.
            */}
            {/* Scrollable thumbnail strip */}
            <div className="detail-thumbnails">
              {allImages.map((img, i) => (
                <div
                  key={i}
                  className={`detail-thumb ${selectedImage === img ? "active" : ""}`}
                  onClick={() => setSelectedImage(img)}
                >
                  <img src={img} alt={`View ${i + 1}`} />
                </div>
              ))}
            </div>

          </div>

          {/* ── Right Column: Product Info ── */}
          <div className="col-12 col-md-7">
            <div className="detail-info">

              {/* Category + Brand tags */}
              <div className="detail-tags">
                {product.category && (
                  <span className="detail-tag">
                    <FontAwesomeIcon icon={faTag} className="me-1" />
                    {product.category}
                  </span>
                )}
                {product.brand && (
                  <span className="detail-tag detail-tag--secondary">
                    <FontAwesomeIcon icon={faIndustry} className="me-1" />
                    {product.brand}
                  </span>
                )}
              </div>

              {/* Product name */}
              <h1 className="detail-title">{product.product_name}</h1>

              {/* Star rating + review count */}
              <div className="detail-rating-row">
                <StarRating rating={4} size="0.95rem" />
                <span className="detail-rating-text">4.0 · 128 reviews</span>
              </div>

              {/* Price */}
              <div className="detail-price">₹{product.price.toLocaleString("en-IN")}</div>
              <p className="detail-price-note">Inclusive of all taxes. Free delivery.</p>

              {/* Color (if available) */}
              {product.color && (
                <div className="detail-attribute">
                  <FontAwesomeIcon icon={faPalette} className="me-2 text-muted" />
                  <span className="detail-attr-label">Color:</span>
                  <span className="detail-attr-value">{product.color}</span>
                </div>
              )}

              {/* Stock status */}
              <div className="detail-attribute">
                <FontAwesomeIcon
                  icon={inStock ? faCheckCircle : faTimesCircle}
                  className={`me-2 ${inStock ? "text-success" : "text-danger"}`}
                />
                <span className={`detail-stock ${inStock ? "in-stock" : "out-of-stock"}`}>
                  {inStock ? `In Stock ` : "Out of Stock"} {product.stock > 100 ? ` ` : <>  <span className="detail-stock out-of-stock">{product.stock} left</span> </>}
                </span>
              </div>

              {/* Divider */}
              <hr className="detail-divider" />

              {/* ── Quantity selector ── */}
              {inStock && (
                <div className="detail-qty-row">
                  <span className="detail-qty-label">Quantity</span>
                  <div className="detail-qty-controls">
                    <button
                      className="detail-qty-btn"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                    >
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                    <span className="detail-qty-value">{quantity}</span>
                    <button
                      className="detail-qty-btn"
                      onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                      disabled={quantity >= product.stock}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </div>
                  {quantity >= product.stock && (
                    <span className="detail-qty-max">Max stock reached</span>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="detail-actions">

                <button
                  className="btn detail-btn-cart"
                  onClick={handleAddToCart}
                  disabled={addingToCart || !inStock}
                >
                  <FontAwesomeIcon icon={faCartShopping} className="me-2" />
                  {addingToCart ? "Adding..." : "Add to Cart"}
                </button>

                <button
                  className="btn detail-btn-buy"
                  onClick={() => {
                    if (!token) { navigate("/login"); return; }
                    navigate("/checkout", {
                      state: {
                        buyNow: {
                          product_id:   product.id,
                          product_name: product.product_name,
                          price:        product.price,
                          image:        product.product_picture,
                          quantity,
                        }
                      }
                    });
                  }}
                  disabled={!inStock}
                >
                  <FontAwesomeIcon icon={faBolt} className="me-2" />
                  Buy Now
                </button>

              </div>

              {/* ── Wishlist button — full width, below the two action buttons ── */}
              <button
                className={`btn detail-btn-wishlist ${wishlisted ? "detail-btn-wishlist--active" : ""}`}
                onClick={handleWishlistToggle}
              >
                <FontAwesomeIcon
                  icon={wishlisted ? faHeart : faHeartEmpty}
                  className="me-2"
                />
                {wishlisted ? "Saved to Wishlist" : "Add to Wishlist"}
              </button>

              {/* Cart feedback message */}
              {cartMsg && (
                <div className="detail-cart-msg">{cartMsg}</div>
              )}

            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════
            DESCRIPTION SECTION
            ════════════════════════════════════════ */}
        {product.description && (
          <div className="detail-section mb-5">
            <h2 className="detail-section-title">Product Description</h2>
            <p className="detail-description">{product.description}</p>
          </div>
        )}

        {/* ════════════════════════════════════════
            COMMENTS SECTION
            ════════════════════════════════════════ */}
        <div className="detail-section">
          <h2 className="detail-section-title">
            Customer Reviews
            <span className="comment-count-badge">{comments.length}/5</span>
          </h2>

          {/* ── Comment form (only for logged-in users) ── */}
          {token ? (
            <form className="comment-form" onSubmit={handleCommentSubmit}>
              <div className="comment-form-header">
                <span className="comment-form-avatar">
                  <FontAwesomeIcon icon={faUser} />
                </span>
                <span className="comment-form-username">
                  {user?.username || "You"}
                </span>
              </div>
              <textarea
                className="comment-textarea"
                placeholder="Share your thoughts about this product..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                rows={3}
                maxLength={500}
              />
              <div className="comment-form-footer">
                <span className="comment-char-count">
                  {commentText.length}/500
                </span>
                <button
                  type="submit"
                  className="btn comment-submit-btn"
                  disabled={submitting || !commentText.trim()}
                >
                  {submitting ? "Posting..." : "Post Review"}
                </button>
              </div>
            </form>
          ) : (
            /* Prompt non-logged-in users to login */
            <div className="comment-login-prompt">
              <p>
                <button
                  className="comment-login-link"
                  onClick={() => navigate("/login")}
                >
                  Login
                </button>
                {" "}to leave a review
              </p>
            </div>
          )}

          {/* ── Comment list ── */}
          <div className="comments-list mt-4">
            {comments.length === 0 ? (
              <p className="no-comments">No reviews yet. Be the first!</p>
            ) : (
              comments.map(c => (
                <div key={c.id} className="comment-card">
                  <div className="comment-card-header">
                    <span className="comment-avatar">
                      {/* First letter of username as avatar */}
                      {c.username?.[0]?.toUpperCase() || "U"}
                    </span>
                    <div className="comment-meta">
                      <span className="comment-username">{c.username}</span>
                      <span className="comment-date">{c.created_at}</span>
                    </div>
                    {/* Delete button — only for the comment owner */}
                    {user?.username === c.username && (
                      <button
                        className="comment-delete-btn"
                        onClick={() => handleDeleteComment(c.id)}
                        title="Delete your comment"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    )}
                  </div>
                  <p className="comment-text">{c.text}</p>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default ProductDetail;