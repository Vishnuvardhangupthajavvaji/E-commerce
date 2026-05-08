// frontend/src/pages/Orders.jsx
// Route: /orders (ProtectedRoute)
// Shows all past orders for the logged-in user.

import { useEffect, useState }   from "react";
import { Link }                  from "react-router-dom";
import API                       from "../api/axios";
import { FontAwesomeIcon }       from "@fortawesome/react-fontawesome";
import {
  faBoxOpen, faSpinner, faChevronRight,
  faMoneyBillWave, faCreditCard,
} from "@fortawesome/free-solid-svg-icons";

const STATUS_COLOR = {
  placed:           "placed",
  confirmed:        "confirmed",
  shipped:          "shipped",
  out_for_delivery: "out_for_delivery",
  delivered:        "delivered",
  cancelled:        "cancelled",
};

function Orders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("orders/my/")
      .then(res => setOrders(res.data))
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="container py-5 text-center">
      <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: "2rem", color: "var(--primary)" }} />
    </div>
  );

  return (
    <div className="container py-4">
      <h1 className="orders-page-title">
        <FontAwesomeIcon icon={faBoxOpen} className="me-2" />
        My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="orders-empty">
          <div className="orders-empty-icon">📦</div>
          <h3>No orders yet</h3>
          <p>You haven't placed any orders. Start shopping!</p>
          <Link to="/products" className="btn auth-submit-btn mt-2" style={{ width: "auto", padding: "0.6rem 2rem" }}>
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <Link key={order.id} to={`/orders/${order.id}`} className="order-card-link">
              <div className="order-summary-card">

                {/* Top row: order id + status */}
                <div className="order-summary-top">
                  <div>
                    <span className="order-summary-id">Order #{order.id}</span>
                    <span className="order-summary-date">
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className={`order-status-badge order-status-badge--${STATUS_COLOR[order.status] || "placed"}`}>
                      {order.status.replace(/_/g, " ")}
                    </span>
                    <FontAwesomeIcon icon={faChevronRight} style={{ color: "var(--text-muted)", fontSize: "0.8rem" }} />
                  </div>
                </div>

                {/* Items preview */}
                <div className="order-summary-items">
                  {order.items.slice(0, 3).map(item => (
                    <div key={item.id} className="order-summary-item">
                      <img
                        src={item.image || "/placeholder.png"}
                        alt={item.name}
                        className="order-summary-img"
                      />
                      <span className="order-summary-item-name">{item.name}</span>
                      <span className="order-summary-item-qty">×{item.quantity}</span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <span className="order-summary-more">+{order.items.length - 3} more</span>
                  )}
                </div>

                {/* Bottom row: payment + total */}
                <div className="order-summary-bottom">
                  <span className="order-summary-payment">
                    <FontAwesomeIcon
                      icon={order.payment_method === "cod" ? faMoneyBillWave : faCreditCard}
                      className="me-1"
                    />
                    {order.payment_method === "cod" ? "Cash on Delivery" : "Razorpay"}
                  </span>
                  <span className="order-summary-total">₹{order.total_amount}</span>
                </div>

              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;