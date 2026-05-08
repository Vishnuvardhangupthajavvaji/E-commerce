// frontend/src/components/ProductCard.jsx
//
// HOVER SLIDESHOW — MECHANISM:
//
//   All images are stacked absolutely inside the wrapper.
//   A CSS @keyframes animation fades each one in and out.
//   animation-play-state: paused  → no animation by default
//   .product-card:hover → animation-play-state: running
//
//   Each image gets:
//     animation-duration: totalDuration  (same for all)
//     animation-delay:    idx * perImage  (offset so they take turns)
//
//   Result: images cycle one at a time, left to right, ONLY on hover.
//   Mouse leaves → pauses instantly, no jarring flash.
//
//   If product has only one image → no animation, just a plain img.

import { useContext }      from "react";
import { useNavigate }     from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faStarHalfStroke, faCartShopping, faHeart } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarEmpty, faHeart as faHeartEmpty }    from "@fortawesome/free-regular-svg-icons";
import { WishlistContext } from "../context/WishlistContext";
import { AuthContext }     from "../context/AuthContext";

function StarRating({ rating = 4 }) {
  return (
    <span className="product-stars">
      {[1,2,3,4,5].map(s => {
        if (rating >= s)       return <FontAwesomeIcon key={s} icon={faStar} />;
        if (rating >= s - 0.5) return <FontAwesomeIcon key={s} icon={faStarHalfStroke} />;
        return                        <FontAwesomeIcon key={s} icon={faStarEmpty} />;
      })}
    </span>
  );
}

// Seconds each image stays visible during the slideshow
const PER_IMAGE_S = 1.4;

function ProductCard({ product, addToCart, onClick }) {
  const { isWishlisted, toggleWishlist } = useContext(WishlistContext);
  const { token }                        = useContext(AuthContext);
  const navigate                         = useNavigate();

  const wishlisted = isWishlisted(product.id);

  // Build the complete ordered image list:
  //   product_picture        → always first (cover)
  //   product.images[].image → gallery extras from ProductImage table
  // Deduplicate: if the first gallery image URL matches product_picture,
  //   don't show it twice.
  const allImages = (() => {
    const cover   = product.product_picture;
    const extras  = (product.images || []).map(i => i.image);
    if (!extras.length)        return [cover];
    if (extras[0] === cover)   return extras;          // gallery already starts with cover
    return [cover, ...extras];
  })();

  const count       = allImages.length;
  const hasMultiple = count > 1;
  // Only extra images (count-1) participate in the animation cycle

  const handleWishlist = (e) => {
    e.stopPropagation();
    if (!token) { navigate("/login"); return; }
    toggleWishlist(product.id);
  };

  return (
    <div
      className="product-card"
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
    >
      <div className="product-card-img-wrapper">

        {hasMultiple ? (
          /* ── SLIDESHOW ── */
          <div className="product-card-slideshow">
            {allImages.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={`${product.product_name} ${idx + 1}`}
                className="product-card-slide"
                style={idx === 0 ? {} : {
                  // index 0 = cover, no animation (CSS handles it)
                  // index 1+ = extra images, staggered by their slot
                  // delay is (idx - 1) because index 0 has no slot in the cycle
                  animationDuration: `${(count - 1) * PER_IMAGE_S}s`,
                  animationDelay:    `${(idx - 1) * PER_IMAGE_S}s`,
                }}
              />
            ))}
            {/* Dot strip */}
            <div className="product-card-dots">
              {allImages.map((_, idx) => (
                <span
                  key={idx}
                  className="product-card-dot"
                  style={idx === 0 ? {} : {
                    animationDuration: `${(count - 1) * PER_IMAGE_S}s`,
                    animationDelay:    `${(idx - 1) * PER_IMAGE_S}s`,
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          /* ── SINGLE IMAGE ── */
          <img
            src={allImages[0]}
            className="product-card-img"
            alt={product.product_name}
          />
        )}

        {product.category && (
          <span className="product-card-badge">{product.category}</span>
        )}

        <button
          className={`product-wishlist-btn ${wishlisted ? "product-wishlist-btn--active" : ""}`}
          onClick={handleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <FontAwesomeIcon icon={wishlisted ? faHeart : faHeartEmpty} />
        </button>
      </div>

      <div className="product-card-body">
        {product.brand && <p className="product-brand">{product.brand}</p>}
        <h6 className="product-name">{product.product_name}</h6>
        <div className="product-meta-row">
          <StarRating rating={4} />
          <span className="product-price">₹{product.price}</span>
        </div>
        {addToCart && (
          <button
            className="btn product-cart-btn"
            onClick={(e) => { e.stopPropagation(); addToCart(product.id); }}
          >
            <FontAwesomeIcon icon={faCartShopping} className="me-2" />
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}

export default ProductCard;