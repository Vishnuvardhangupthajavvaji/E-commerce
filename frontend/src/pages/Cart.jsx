// frontend/src/pages/Cart.jsx

// ─────────────────────────────────────────────────────────────────
// FEATURES:
//   • Multi-select with checkboxes (Select All / deselect)
//   • Delete selected → single bulk API call
//   • Clear Cart → removes everything
//   • Quantity capsule (trash icon when qty=1)
//   • Sticky billing summary panel on desktop
//   • Clicking product → /products/:id
//   • Responsive: stacks on mobile
//
// STATE:
//   cart        → array of cart items from API
//   selectedIds → Set of cart item IDs that are checked
//
// FLOW:
//   Load → fetch cart items
//   Check items → selectedIds grows/shrinks
//   "Delete Selected" → bulk-delete API → reload
//   "Clear Cart"      → clear API → reload
//   Qty capsule       → update/remove API → reload
// ─────────────────────────────────────────────────────────────────

import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import CartItemCard from "../components/CartItemCard";
import ConfirmModal  from "../components/ConfirmModal";
import { CartContext } from "../context/CartContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faCartShopping,
  faShop,
  faBroom,
} from "@fortawesome/free-solid-svg-icons";

function Cart() {
  const [cart,        setCart]        = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [loading,     setLoading]     = useState(true);
  const [clearing,    setClearing]    = useState(false);
  const [modal,       setModal]       = useState(null);

  const { loadCartCount } = useContext(CartContext);
  const navigate          = useNavigate();
  // ── Derived totals (computed from state, no extra API call) ──
  // We recalculate these whenever `cart` changes
  const subtotal     = cart.reduce((sum, i) => sum + i.total_price, 0);
  const totalItems   = cart.reduce((sum, i) => sum + i.quantity, 0);
  const deliveryFee  = subtotal > 500 ? 0 : 49;   // free delivery above ₹500
  const grandTotal   = subtotal + deliveryFee;

  // ── Fetch cart ──
  const loadCart = () => {
    API.get("cart/")
      .then(res => setCart(res.data))
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCart(); }, []);

  // ── Update quantity ──
  const updateQty = (id, qty) => {
    if (qty <= 0) return;
    API.patch(`cart/update/${id}/`, { quantity: qty })
      .then(() => { loadCart(); loadCartCount(); });
  };

  // ── Remove single item ──
  const removeItem = (id) => {
    API.delete(`cart/remove/${id}/`)
      .then(() => {
        // Also remove from selectedIds if it was checked
        setSelectedIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        loadCart();
        loadCartCount();
      });
  };

  // ── Toggle one checkbox ──
  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      // If already in the set → remove; otherwise → add
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Select All / Deselect All ──
  const allSelected = cart.length > 0 && selectedIds.size === cart.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());           // deselect everything
    } else {
      setSelectedIds(new Set(cart.map(i => i.id))); // select everything
    }
  };

  // ── Delete selected items (bulk API) ──
  const deleteSelected = () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);

    // Single API call — much more efficient than a loop
    API.delete("cart/bulk-delete/", { data: { ids } })
      .then(() => {
        setSelectedIds(new Set());
        loadCart();
        loadCartCount();
      })
      .catch(err => console.log(err));
  };

  // ── Clear entire cart ──
  const clearCart = () => {
    setModal({
      title:   "Clear Cart",
      message: "This will remove all items from your cart. This can't be undone.",
      confirm: "Yes, clear it",
      danger:  true,
      onConfirm: () => {
        setModal(null);
        setClearing(true);
        API.delete("cart/clear/")
          .then(() => { setSelectedIds(new Set()); loadCart(); loadCartCount(); })
          .catch(err => console.log(err))
          .finally(() => setClearing(false));
      },
    });
  };

  // ─────────────────────────────────────────────
  // LOADING STATE
  // ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="container py-5">
        {[1, 2, 3].map(i => (
          <div key={i} className="cart-item-card placeholder-glow mb-3">
            <div className="placeholder" style={{ width: 80, height: 80, borderRadius: 8 }} />
            <div className="flex-grow-1 ps-3">
              <span className="placeholder col-6 d-block mb-2" />
              <span className="placeholder col-3 d-block mb-2" />
              <span className="placeholder col-4 d-block" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // EMPTY CART
  // ─────────────────────────────────────────────
  if (cart.length === 0) {
    return (
      <div className="cart-empty-state">
        <FontAwesomeIcon icon={faCartShopping} className="cart-empty-icon" />
        <h3>Your cart is empty</h3>
        <p>Looks like you haven't added anything yet.</p>
        <button className="btn cart-shop-btn" onClick={() => navigate("/products")}>
          <FontAwesomeIcon icon={faShop} className="me-2" />
          Start Shopping
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // MAIN RENDER
  // ─────────────────────────────────────────────
  return (
    <>
    <div className="cart-page">
      <div className="container py-4">

        {/* ── Page title row ── */}
        <div className="cart-page-header">
          <div>
            <h1 className="cart-page-title">
              <FontAwesomeIcon icon={faCartShopping} className="me-2" />
              Shopping Cart
            </h1>
            <p className="cart-page-subtitle">{totalItems} item{totalItems !== 1 ? "s" : ""} in your cart</p>
          </div>

          {/* Clear Cart button */}
          <button
            className="btn cart-clear-btn"
            onClick={clearCart}
            disabled={clearing}
          >
            <FontAwesomeIcon icon={faBroom} className="me-2" />
            {clearing ? "Clearing..." : "Clear Cart"}
          </button>
        </div>

        {/* ── Two-column layout: items left, summary right ── */}
        <div className="row g-4 align-items-start">

          {/* ── LEFT: Cart Items ── */}
          <div className="col-12 col-lg-8">

            {/* Select All + Delete Selected toolbar */}
            <div className="cart-toolbar">
              {/* Select All checkbox */}
              <label className="cart-select-all">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="me-2"
                />
                <span>Select All ({cart.length})</span>
              </label>

              {/* Delete Selected — only appears when something is checked */}
              {selectedIds.size > 0 && (
                <button className="btn cart-delete-selected-btn" onClick={deleteSelected}>
                  <FontAwesomeIcon icon={faTrash} className="me-2" />
                  Delete Selected ({selectedIds.size})
                </button>
              )}
            </div>

            {/* Cart item cards */}
            <div className="cart-items-list">
              {cart.map(item => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  updateQty={updateQty}
                  removeItem={removeItem}
                  isSelected={selectedIds.has(item.id)}
                  onToggleSelect={toggleSelect}
                />
              ))}
            </div>

          </div>

          {/* ── RIGHT: Billing Summary ── */}
          <div className="col-12 col-lg-4">
            <div className="cart-summary">

              <h2 className="cart-summary-title">Order Summary</h2>

              {/* Line items */}
              <div className="cart-summary-rows">
                <div className="cart-summary-row">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>

                <div className="cart-summary-row">
                  <span>Delivery</span>
                  <span className={deliveryFee === 0 ? "text-success fw-semibold" : ""}>
                    {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                  </span>
                </div>

                {deliveryFee > 0 && (
                  <p className="cart-free-delivery-note">
                    Add ₹{(500 - subtotal).toLocaleString("en-IN")} more for free delivery
                  </p>
                )}
              </div>

              <div className="cart-summary-divider" />

              <div className="cart-summary-total">
                <span>Total</span>
                <span>₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>

              <p className="cart-tax-note">Inclusive of all taxes</p>

              {/* Checkout button */}
              <button
                className="btn cart-checkout-btn"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout
              </button>

              {/* Continue shopping */}
              <button
                className="btn cart-continue-btn"
                onClick={() => navigate("/products")}
              >
                Continue Shopping
              </button>

            </div>
          </div>

        </div>
      </div>
    </div>

    {/* Confirm popup */}
    {modal && <ConfirmModal {...modal} onCancel={() => setModal(null)} />}
    </>
  );
}

export default Cart;