// frontend/src/pages/OrderDetail.jsx
// Route: /orders/:id
//
// Shows full order info:
//   - Success/failed banner (from ?success=1 or ?failed=1 in URL)
//   - Order items with images
//   - Delivery tracking timeline
//   - Shipping address
//   - Payment info
//   - Cancel button (if order is cancellable)

import { useEffect, useState }        from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import API                             from "../api/axios";
import { FontAwesomeIcon }             from "@fortawesome/react-fontawesome";
import {
  faCheckCircle, faCircleXmark, faSpinner,
  faBoxOpen, faTruck, faLocationDot,
  faMoneyBillWave, faCreditCard, faBan,
  faClockRotateLeft, faCircleCheck,
  faHouse, faBoxArchive, faPersonWalking,
} from "@fortawesome/free-solid-svg-icons";

// Timeline steps in order
const STATUS_STEPS = [
  { key: "placed",           label: "Order Placed",      icon: faBoxOpen },
  { key: "confirmed",        label: "Confirmed",         icon: faCircleCheck },
  { key: "shipped",          label: "Shipped",           icon: faBoxArchive },
  { key: "out_for_delivery", label: "Out for Delivery",  icon: faPersonWalking },
  { key: "delivered",        label: "Delivered",         icon: faHouse },
];

const STATUS_ORDER = STATUS_STEPS.map(s => s.key);

function OrderDetail() {
  const { id }             = useParams();
  const [searchParams]     = useSearchParams();
  const isSuccess          = searchParams.get("success") === "1";
  const isFailed           = searchParams.get("failed")  === "1";

  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    API.get(`orders/${id}/`)
      .then(res => setOrder(res.data))
      .catch(() => setError("Order not found."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(true);
    try {
      await API.post(`orders/${id}/cancel/`);
      const res = await API.get(`orders/${id}/`);
      setOrder(res.data);
    } catch (err) {
      alert(err.response?.data?.error || "Could not cancel order.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return (
    <div className="container py-5 text-center">
      <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: "2rem", color: "var(--primary)" }} />
    </div>
  );

  if (error) return (
    <div className="container py-5 text-center">
      <p className="text-danger">{error}</p>
      <Link to="/orders" className="btn btn-outline-secondary mt-2">My Orders</Link>
    </div>
  );

  const isCancelled   = order.status === "cancelled";
  const isDelivered   = order.status === "delivered";
  const canCancel     = !isCancelled && !isDelivered;

  // Find where we are in the timeline
  const currentStepIdx = isCancelled ? -1 : STATUS_ORDER.indexOf(order.status);

  return (
    <div className="container py-4">

      {/* ── Success / Failed banner ── */}
      {isSuccess && (
        <div className="order-banner order-banner--success">
          <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
          Order placed successfully! A confirmation email has been sent.
        </div>
      )}
      {isFailed && (
        <div className="order-banner order-banner--failed">
          <FontAwesomeIcon icon={faCircleXmark} className="me-2" />
          Payment failed. Your order was not confirmed. Please try again.
        </div>
      )}

      {/* ── Header ── */}
      <div className="order-detail-header">
        <div>
          <h2 className="order-detail-title">Order #{order.id}</h2>
          <p className="order-detail-date">
            Placed on {new Date(order.created_at).toLocaleDateString("en-IN", {
              day: "numeric", month: "long", year: "numeric",
              hour: "2-digit", minute: "2-digit",
            })}
          </p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <span className={`order-status-badge order-status-badge--${order.status}`}>
            {order.status.replace(/_/g, " ")}
          </span>
          {canCancel && (
            <button
              className="btn order-cancel-btn"
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling
                ? <FontAwesomeIcon icon={faSpinner} spin />
                : <><FontAwesomeIcon icon={faBan} className="me-1" />Cancel</>
              }
            </button>
          )}
        </div>
      </div>

      <div className="row g-4 mt-1">

        {/* ── LEFT column ── */}
        <div className="col-12 col-lg-8">

          {/* Tracking Timeline */}
          <div className="order-card">
            <div className="order-card-header">
              <FontAwesomeIcon icon={faTruck} className="me-2" />
              Order Tracking
            </div>
            <div className="order-card-body">
              {isCancelled ? (
                <div className="order-cancelled-notice">
                  <FontAwesomeIcon icon={faBan} className="me-2" />
                  This order was cancelled.
                </div>
              ) : (
                <div className="order-timeline">
                  {STATUS_STEPS.map((step, idx) => {
                    const done    = idx <= currentStepIdx;
                    const active  = idx === currentStepIdx;
                    // Find the history entry for this step
                    const histEntry = order.history?.find(h => h.status === step.key);

                    return (
                      <div key={step.key} className={`order-timeline-step ${done ? "done" : ""} ${active ? "active" : ""}`}>
                        <div className="order-timeline-icon">
                          <FontAwesomeIcon icon={step.icon} />
                        </div>
                        {idx < STATUS_STEPS.length - 1 && (
                          <div className={`order-timeline-line ${idx < currentStepIdx ? "done" : ""}`} />
                        )}
                        <div className="order-timeline-label">
                          <p className="order-timeline-name">{step.label}</p>
                          {histEntry && (
                            <p className="order-timeline-time">
                              {new Date(histEntry.timestamp).toLocaleDateString("en-IN", {
                                day: "numeric", month: "short",
                                hour: "2-digit", minute: "2-digit",
                              })}
                            </p>
                          )}
                          {histEntry?.note && (
                            <p className="order-timeline-note">{histEntry.note}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="order-card mt-3">
            <div className="order-card-header">
              <FontAwesomeIcon icon={faBoxOpen} className="me-2" />
              Items ({order.items.length})
            </div>
            <div className="order-card-body p-0">
              {order.items.map(item => (
                <div key={item.id} className="order-item-row">
                  <img
                    src={item.image || "/placeholder.png"}
                    alt={item.name}
                    className="order-item-img"
                  />
                  <div className="order-item-info">
                    <p className="order-item-name">{item.name}</p>
                    <p className="order-item-meta">Qty: {item.quantity} × ₹{item.price}</p>
                  </div>
                  <p className="order-item-subtotal">₹{item.subtotal}</p>
                </div>
              ))}
              <div className="order-grand-total">
                <span>Total</span>
                <span>₹{order.total_amount}</span>
              </div>
            </div>
          </div>

        </div>

        {/* ── RIGHT column ── */}
        <div className="col-12 col-lg-4">

          {/* Shipping Address */}
          <div className="order-card">
            <div className="order-card-header">
              <FontAwesomeIcon icon={faLocationDot} className="me-2" />
              Shipping Address
            </div>
            <div className="order-card-body">
              <p className="order-address-name">{order.full_name}</p>
              <p className="order-address-line">{order.phone}</p>
              <p className="order-address-line">{order.address}</p>
              <p className="order-address-line">
                {order.city}, {order.state} — {order.pincode}
              </p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="order-card mt-3">
            <div className="order-card-header">
              <FontAwesomeIcon icon={faCreditCard} className="me-2" />
              Payment
            </div>
            <div className="order-card-body">
              <div className="order-payment-row">
                <span>Method</span>
                <span className="d-flex align-items-center gap-1">
                  <FontAwesomeIcon
                    icon={order.payment_method === "cod" ? faMoneyBillWave : faCreditCard}
                  />
                  {order.payment_method === "cod" ? "Cash on Delivery" : "Razorpay"}
                </span>
              </div>
              <div className="order-payment-row">
                <span>Status</span>
                <span className={`order-pay-status order-pay-status--${order.payment_status}`}>
                  {order.payment_status}
                </span>
              </div>
              {order.razorpay_payment_id && (
                <div className="order-payment-row">
                  <span>Payment ID</span>
                  <span className="order-pay-id">{order.razorpay_payment_id}</span>
                </div>
              )}
              <div className="order-payment-row order-payment-row--total">
                <span>Amount Paid</span>
                <span>₹{order.total_amount}</span>
              </div>
            </div>
          </div>

          {/* Status History */}
          <div className="order-card mt-3">
            <div className="order-card-header">
              <FontAwesomeIcon icon={faClockRotateLeft} className="me-2" />
              Activity Log
            </div>
            <div className="order-card-body p-0">
              {order.history.map((h, i) => (
                <div key={i} className="order-history-row">
                  <div className="order-history-dot" />
                  <div>
                    <p className="order-history-status">{h.status.replace(/_/g, " ")}</p>
                    {h.note && <p className="order-history-note">{h.note}</p>}
                    <p className="order-history-time">
                      {new Date(h.timestamp).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <div className="mt-4">
        <Link to="/orders" className="order-back-link">← Back to My Orders</Link>
      </div>

    </div>
  );
}

export default OrderDetail;