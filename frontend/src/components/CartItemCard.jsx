// frontend/src/components/CartItemCard.jsx

// ─────────────────────────────────────────────────────────────────
// LAYOUT (one card):
//
//  ┌────────────────────────────────────────────────────────┐
//  │ ☐  [Product Image]  Product Name        ₹ price        │
//  │                     Brand · Category                   │
//  │                     Unit price: ₹ X                    │
//  │                     [🗑 / ─]  qty  [+]    Total: ₹ Y   │
//  └────────────────────────────────────────────────────────┘
//
// QUANTITY CAPSULE:
//   qty === 1 → left button shows 🗑 (trash icon)  → clicking removes item
//   qty  > 1 → left button shows −  → clicking decrements
//   Right button always shows +
//
// CHECKBOX:
//   Top-left of image area
//   Controlled by `isSelected` prop from parent Cart.jsx
//   Calls `onToggleSelect(item.id)` when changed
//
// PRODUCT CLICK:
//   Clicking the image or product name navigates to /products/:id
// ─────────────────────────────────────────────────────────────────

import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";

function CartItemCard({ item, updateQty, removeItem, isSelected, onToggleSelect }) {
  const navigate = useNavigate();

  const goToProduct = () => navigate(`/products/${item.product.id}`);

  return (
    <div className={`cart-item-card ${isSelected ? "cart-item-card--selected" : ""}`}>

      {/* ── Image + Checkbox column ── */}
      <div className="cart-item-img-col">

        {/* Checkbox — top-left corner of image area */}
        <input
          type="checkbox"
          className="cart-item-checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(item.id)}
          // Stop click from bubbling to the image/navigate handler
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select ${item.product.product_name}`}
        />

        {/* Product image — clickable → detail page */}
        <img
          src={item.product.product_picture}
          alt={item.product.product_name}
          className="cart-item-img"
          onClick={goToProduct}
        />
      </div>

      {/* ── Product info column ── */}
      <div className="cart-item-info">

        {/* Product name — clickable */}
        <p className="cart-item-name" onClick={goToProduct}>
          {item.product.product_name}
        </p>

        {/* Unit price */}
        <p className="cart-item-unit-price">
          Unit price: <strong>₹{item.product.price.toLocaleString("en-IN")}</strong>
        </p>

        {/* ── Bottom row: Quantity capsule + Total price ── */}
        <div className="cart-item-bottom-row">

          {/* Quantity capsule */}
          <div className="qty-capsule">

            {/* Left button: trash when qty=1, minus otherwise */}
            <button
              className={`qty-capsule-btn qty-capsule-btn--left ${item.quantity === 1 ? "qty-capsule-btn--danger" : ""}`}
              onClick={() =>
                item.quantity === 1
                  ? removeItem(item.id)          // delete when qty is 1
                  : updateQty(item.id, item.quantity - 1)  // decrement
              }
              aria-label={item.quantity === 1 ? "Remove item" : "Decrease quantity"}
            >
              <FontAwesomeIcon icon={item.quantity === 1 ? faTrash : faMinus} />
            </button>

            {/* Quantity number */}
            <span className="qty-capsule-value">{item.quantity}</span>

            {/* Right button: always plus */}
            <button
              className="qty-capsule-btn qty-capsule-btn--right"
              onClick={() => updateQty(item.id, item.quantity + 1)}
              aria-label="Increase quantity"
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>

          </div>

          {/* Item total price */}
          <p className="cart-item-total">
            ₹{item.total_price.toLocaleString("en-IN")}
          </p>

        </div>
      </div>

    </div>
  );
}

export default CartItemCard;