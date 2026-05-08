// frontend/src/pages/Checkout.jsx
//
// TWO MODES:
//   1. Cart mode   — normal flow, loads items from cart API
//   2. Buy Now mode — arrives with location.state.buyNow, skips cart
//
// In both modes, user can adjust quantities before placing order.
// Sends POST /api/orders/place/ with address + optional items array.

import { useEffect, useState, useContext }   from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API                          from "../api/axios";
import { NotificationContext }      from "../context/NotificationContext";
import { FontAwesomeIcon }          from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt, faShoppingBag, faTruck,
  faShieldAlt, faSpinner, faPlus, faMinus, faTrash,
} from "@fortawesome/free-solid-svg-icons";

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
];

function Checkout() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { addNotification } = useContext(NotificationContext);

  // buyNow is set when coming from the Buy Now button on ProductDetail
  const buyNowData = location.state?.buyNow || null;
  const isBuyNow   = !!buyNowData;

  // items state: [{product_id, product_name, price, image, quantity}]
  const [items, setItems] = useState(
    isBuyNow ? [{ ...buyNowData }] : []
  );

  const [form, setForm] = useState({
    full_name: "", phone: "", address: "",
    city: "", state: "", pincode: "",
  });
  const [errors,     setErrors]     = useState({});
  const [loading,    setLoading]    = useState(!isBuyNow); // no load needed for buyNow
  const [submitting, setSubmitting] = useState(false);
  const [serverErr,  setServerErr]  = useState("");

  // Load cart + profile (only in cart mode)
  useEffect(() => {
    if (isBuyNow) {
      // Still load profile to pre-fill address
      API.get("users/me/")
        .then(res => {
          const u = res.data;
          setForm(f => ({
            ...f,
            full_name: u.username || `${u.first_name || ""} ${u.last_name || ""}`.trim(),
            phone:     u.phone   || "",
            address:   u.address || "",
            city:      u.city    || "",
            state:     u.state   || "",
            pincode:   u.pincode || "",
          }));
        })
        .catch(() => {});
      return;
    }

    // Cart mode
    Promise.all([API.get("cart/"), API.get("users/me/")])
      .then(([cartRes, meRes]) => {
        const cartItems = cartRes.data.map(ci => ({
          product_id:   ci.product.id,
          product_name: ci.product.product_name,
          price:        Number(ci.product.price),
          image:        ci.product.product_picture,
          quantity:     ci.quantity,
          stock:        ci.product.stock ?? 999,  // ← stock limit for + button
        }));
        setItems(cartItems);
        const u = meRes.data;
        setForm(f => ({
          ...f,
          full_name: u.full_name || `${u.first_name || ""} ${u.last_name || ""}`.trim(),
          phone:     u.phone   || "",
          address:   u.address || "",
          city:      u.city    || "",
          state:     u.state   || "",
          pincode:   u.pincode || "",
        }));
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // ── Quantity helpers ──────────────────────────────────────────
  const changeQty = (index, delta) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      const newQty = item.quantity + delta;
      if (newQty < 1) return item;                          // can't go below 1
      if (newQty > (item.stock ?? 999)) return item;        // can't exceed stock
      return { ...item, quantity: newQty };
    }));
  };

  const removeItem = (index) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // ── Totals ────────────────────────────────────────────────────
  const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  // ── Validation ────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.full_name.trim())  e.full_name = "Full name is required.";
    if (!form.phone.trim())      e.phone     = "Phone number is required.";
    if (!form.address.trim())    e.address   = "Address is required.";
    if (!form.city.trim())       e.city      = "City is required.";
    if (!form.state)             e.state     = "State is required.";
    if (!/^\d{6}$/.test(form.pincode.trim())) e.pincode = "Enter a valid 6-digit pincode.";
    return e;
  };

  // ── Place Order ───────────────────────────────────────────────
  const handleSubmit = async () => {
    if (items.length === 0) { setServerErr("Add at least one item."); return; }
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setServerErr("");
    setSubmitting(true);

    const payload = {
      ...form,
      payment_method: "cod",
    };

    // Buy Now: pass items array so backend skips the cart
    if (isBuyNow) {
      payload.items = items.map(item => ({
        product_id: item.product_id,
        quantity:   item.quantity,
      }));
    }
    // Cart mode: no items array — backend reads from cart

    try {
      const res = await API.post("orders/place/", payload);
      const orderId = res.data.order.id;
      const orderTotal = total.toLocaleString("en-IN");
      addNotification(
        `Order #${orderId} placed! ₹${orderTotal} — Cash on Delivery. We'll confirm it soon.`,
        "order"
      );
      navigate(`/orders/${orderId}?success=1`);
    } catch (err) {
      setServerErr(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const set = field => e => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(er => ({ ...er, [field]: "" }));
  };

  // ── Loading state ─────────────────────────────────────────────
  if (loading) return (
    <div className="checkout-page">
      <div className="container py-5 text-center">
        <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: "2rem", color: "var(--accent)" }} />
      </div>
    </div>
  );

  if (!loading && items.length === 0 && !isBuyNow) return (
    <div className="checkout-page">
      <div className="container py-5 text-center">
        <p style={{ fontSize: "1.1rem", color: "var(--text-muted)" }}>Your cart is empty.</p>
        <button className="btn btn-primary mt-3" onClick={() => navigate("/")}>Browse Products</button>
      </div>
    </div>
  );

  return (
    <div className="checkout-page">
      <div className="container py-4">

        <h2 className="checkout-title mb-4">
          <FontAwesomeIcon icon={faShoppingBag} className="me-2" />
          {isBuyNow ? "Buy Now — Checkout" : "Checkout"}
        </h2>

        <div className="row g-4">

          {/* ── Left: Address form ── */}
          <div className="col-12 col-lg-7">
            <div className="checkout-card">
              <h5 className="checkout-card-title">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                Shipping Address
              </h5>

              {serverErr && <div className="checkout-error-banner">{serverErr}</div>}

              <div className="row g-3 mt-1">

                <div className="col-12">
                  <label className="checkout-label">Full Name <span className="text-danger">*</span></label>
                  <input className={`checkout-input ${errors.full_name ? "checkout-input--error" : ""}`}
                    value={form.full_name} onChange={set("full_name")} placeholder="Name" />
                  {errors.full_name && <p className="checkout-field-error">{errors.full_name}</p>}
                </div>

                <div className="col-12">
                  <label className="checkout-label">Phone Number <span className="text-danger">*</span></label>
                  <input className={`checkout-input ${errors.phone ? "checkout-input--error" : ""}`}
                    value={form.phone} onChange={set("phone")} placeholder="9876543210" maxLength={10} />
                  {errors.phone && <p className="checkout-field-error">{errors.phone}</p>}
                </div>

                <div className="col-12">
                  <label className="checkout-label">Address <span className="text-danger">*</span></label>
                  <textarea className={`checkout-input checkout-textarea ${errors.address ? "checkout-input--error" : ""}`}
                    value={form.address} onChange={set("address")}
                    placeholder="House/Flat No., Street, Area" rows={3} />
                  {errors.address && <p className="checkout-field-error">{errors.address}</p>}
                </div>

                <div className="col-6">
                  <label className="checkout-label">City <span className="text-danger">*</span></label>
                  <input className={`checkout-input ${errors.city ? "checkout-input--error" : ""}`}
                    value={form.city} onChange={set("city")} placeholder="Hyderabad" />
                  {errors.city && <p className="checkout-field-error">{errors.city}</p>}
                </div>

                <div className="col-6">
                  <label className="checkout-label">Pincode <span className="text-danger">*</span></label>
                  <input className={`checkout-input ${errors.pincode ? "checkout-input--error" : ""}`}
                    value={form.pincode} onChange={set("pincode")} placeholder="500001" maxLength={6} />
                  {errors.pincode && <p className="checkout-field-error">{errors.pincode}</p>}
                </div>

                <div className="col-12">
                  <label className="checkout-label">State <span className="text-danger">*</span></label>
                  <select className={`checkout-input ${errors.state ? "checkout-input--error" : ""}`}
                    value={form.state} onChange={set("state")}>
                    <option value="">Select state</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.state && <p className="checkout-field-error">{errors.state}</p>}
                </div>

              </div>

              {/* Payment method */}
              <div className="checkout-payment-section mt-4">
                <h5 className="checkout-card-title mb-3">
                  <FontAwesomeIcon icon={faTruck} className="me-2" />
                  Payment Method
                </h5>
                <div className="checkout-cod-badge">
                  <FontAwesomeIcon icon={faTruck} className="me-2" />
                  Cash on Delivery (COD)
                  <span className="checkout-cod-note">Pay when your order arrives</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Order summary with quantity controls ── */}
          <div className="col-12 col-lg-5">
            <div className="checkout-summary-card">
              <h5 className="checkout-card-title mb-3">Order Summary</h5>

              <div className="checkout-items-list">
                {items.map((item, index) => (
                  <div key={index} className="checkout-item-row">
                    <img
                      src={item.image}
                      alt={item.product_name}
                      className="checkout-item-img"
                    />
                    <div className="checkout-item-info">
                      <p className="checkout-item-name">{item.product_name}</p>
                      <p className="checkout-item-unit-price">₹{Number(item.price).toLocaleString("en-IN")} each</p>

                      {/* Quantity controls */}
                      <div className="checkout-qty-row">
                        <button
                          className="checkout-qty-btn"
                          onClick={() => changeQty(index, -1)}
                          disabled={item.quantity <= 1}
                        >
                          <FontAwesomeIcon icon={faMinus} />
                        </button>
                        <span className="checkout-qty-value">{item.quantity}</span>
                        <button
                          className="checkout-qty-btn"
                          onClick={() => changeQty(index, +1)}
                          disabled={item.quantity >= (item.stock ?? 999)}
                        >
                          <FontAwesomeIcon icon={faPlus} />
                        </button>

                        {/* Remove button — only show if more than 1 item */}
                        {items.length > 1 && (
                          <button
                            className="checkout-qty-btn checkout-qty-btn--remove"
                            onClick={() => removeItem(index)}
                            title="Remove item"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        )}
                      </div>

                      {/* Stock limit hint — inside info div so it's below qty row */}
                      {item.quantity >= (item.stock ?? 999) && (
                        <p className="checkout-stock-max">Max stock reached</p>
                      )}
                    </div>

                    <p className="checkout-item-price">
                      ₹{(Number(item.price) * item.quantity).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>

              <div className="checkout-totals">
                <div className="checkout-total-row">
                  <span>Subtotal</span>
                  <span>₹{total.toLocaleString("en-IN")}</span>
                </div>
                <div className="checkout-total-row">
                  <span>Delivery</span>
                  <span className="text-success fw-semibold">Free</span>
                </div>
                <div className="checkout-total-row checkout-grand-total">
                  <span>Total</span>
                  <span>₹{total.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <button
                className="btn checkout-place-btn w-100 mt-3"
                onClick={handleSubmit}
                disabled={submitting || items.length === 0}
              >
                {submitting
                  ? <><FontAwesomeIcon icon={faSpinner} spin className="me-2" />Placing Order...</>
                  : "Place Order (COD)"
                }
              </button>

              <p className="checkout-secure-note mt-2">
                <FontAwesomeIcon icon={faShieldAlt} className="me-1" />
                Your information is safe and secure
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Checkout;