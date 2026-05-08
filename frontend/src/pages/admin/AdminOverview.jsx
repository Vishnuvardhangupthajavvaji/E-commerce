// frontend/src/pages/admin/AdminOverview.jsx

import { useEffect, useState } from "react";
import { useNavigate }         from "react-router-dom";
import API                     from "../../api/axios";
import { FontAwesomeIcon }     from "@fortawesome/react-fontawesome";
import {
  faBoxesStacked, faUsers, faTriangleExclamation,
  faBan, faCartShopping, faCirclePlus,
  faArrowTrendUp, faTags, faBoxOpen,
  faIndianRupeeSign, faClock, faCalendarDay,
} from "@fortawesome/free-solid-svg-icons";

// ── Stat card ────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color, onClick }) {
  return (
    <div
      className={`admin-stat-card admin-stat-card--${color} ${onClick ? "admin-stat-card--clickable" : ""}`}
      onClick={onClick}
    >
      <div className="admin-stat-icon"><FontAwesomeIcon icon={icon} /></div>
      <div className="admin-stat-body">
        <p className="admin-stat-label">{label}</p>
        <p className="admin-stat-value">{value}</p>
        {sub && <p className="admin-stat-sub">{sub}</p>}
      </div>
    </div>
  );
}

// ── Chart — bar + line combo ─────────────────────────────────
function RevenueChart({ data }) {
  const [hovered, setHovered] = useState(null);

  if (!data || data.length === 0) {
    return <p className="overview-chart-empty">No data for this period yet.</p>;
  }

  const maxRevenue = Math.max(...data.map(d => d.revenue), 1);
  const maxOrders  = Math.max(...data.map(d => d.orders),  1);
  const totalRev   = data.reduce((s, d) => s + d.revenue, 0);
  const totalOrd   = data.reduce((s, d) => s + d.orders,  0);
  const fmt        = n => Number(n).toLocaleString("en-IN");

  return (
    <div>
      {/* Summary row */}
      <div className="overview-chart-summary">
        <div className="overview-chart-summary-item">
          <span className="overview-chart-summary-dot overview-chart-summary-dot--bar" />
          <span>Revenue: <strong>₹{fmt(totalRev)}</strong></span>
        </div>
        <div className="overview-chart-summary-item">
          <span className="overview-chart-summary-dot overview-chart-summary-dot--line" />
          <span>Orders: <strong>{totalOrd}</strong></span>
        </div>
      </div>

      {/* Chart area */}
      <div className="overview-chart-area">
        {/* Y-axis labels */}
        <div className="overview-chart-yaxis">
          {[100, 75, 50, 25, 0].map(pct => (
            <span key={pct} className="overview-chart-ylabel">
              ₹{fmt(Math.round(maxRevenue * pct / 100))}
            </span>
          ))}
        </div>

        {/* Bars */}
        <div className="overview-chart-bars">
          {data.map((d, i) => {
            const barH   = maxRevenue > 0 ? (d.revenue / maxRevenue) * 100 : 0;
            const dotH   = maxOrders  > 0 ? (d.orders  / maxOrders)  * 100 : 0;
            const isHov  = hovered === i;
            return (
              <div
                key={i}
                className="overview-chart-col"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Tooltip */}
                {isHov && (
                  <div className="overview-chart-tooltip">
                    <strong>{d.label}</strong>
                    <span>₹{fmt(d.revenue)}</span>
                    <span>{d.orders} order{d.orders !== 1 ? "s" : ""}</span>
                  </div>
                )}
                <div className="overview-chart-bar-wrap">
                  <div
                    className="overview-chart-bar"
                    style={{ height: `${Math.max(barH, d.revenue > 0 ? 3 : 0)}%` }}
                  />
                  {/* Order dot on top of bar */}
                  <div
                    className="overview-chart-order-dot"
                    style={{ bottom: `${dotH}%` }}
                  />
                </div>
                <span className="overview-chart-label">{d.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Status badge ─────────────────────────────────────────────
function StatusBadge({ status }) {
  return (
    <span className={`order-status-badge order-status-badge--${status}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

// ── Main ─────────────────────────────────────────────────────
const PERIODS = [
  { key: "revenue_daily",     label: "Daily",     sub: "Last 7 days" },
  { key: "revenue_weekly",    label: "Weekly",    sub: "Last 8 weeks" },
  { key: "revenue_monthly",   label: "Monthly",   sub: "Last 12 months" },
  { key: "revenue_quarterly", label: "Quarterly", sub: "Last 6 quarters" },
  { key: "revenue_yearly",    label: "Yearly",    sub: "Last 5 years" },
];

function AdminOverview() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [period,  setPeriod]  = useState("revenue_daily");
  const navigate              = useNavigate();

  useEffect(() => {
    API.get("users/admin/stats/")
      .then(res => setStats(res.data))
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="admin-overview">
      <div className="admin-overview-skeleton">
        {Array(8).fill(null).map((_, i) => (
          <div key={i} className="admin-stat-card placeholder-glow">
            <span className="placeholder w-100" style={{ height: 80, borderRadius: 8 }} />
          </div>
        ))}
      </div>
    </div>
  );

  const fmt        = n => Number(n).toLocaleString("en-IN");
  const chartData  = stats[period] || [];
  const periodMeta = PERIODS.find(p => p.key === period);

  return (
    <div className="admin-overview">

      <div className="admin-page-header">
        <h1 className="admin-page-title">Dashboard Overview</h1>
        <p className="admin-page-subtitle">Welcome back. Here's what's happening in your store.</p>
      </div>

      {/* ── Orders row ── */}
      <p className="overview-section-label">Orders</p>
      <div className="admin-stats-grid">
        <StatCard icon={faBoxOpen}         label="Total Orders"   value={fmt(stats.total_orders)}         color="blue"   onClick={() => navigate("/admin/orders")} />
        <StatCard icon={faIndianRupeeSign} label="Total Revenue"  value={`₹${fmt(stats.total_revenue)}`} sub="from delivered orders" color="green" />
        <StatCard icon={faClock}           label="Pending Orders" value={fmt(stats.pending_orders)}       color="amber"  onClick={() => navigate("/admin/orders")} />
        <StatCard icon={faCalendarDay}     label="Orders Today"   value={fmt(stats.orders_today)}         color="orange" onClick={() => navigate("/admin/orders")} />
      </div>

      {/* ── Store row ── */}
      <p className="overview-section-label mt-4">Store</p>
      <div className="admin-stats-grid">
        <StatCard icon={faBoxesStacked}        label="Total Products"   value={fmt(stats.total_products)}   color="blue"   onClick={() => navigate("/admin/products")} />
        <StatCard icon={faUsers}               label="Registered Users" value={fmt(stats.total_users)}      color="green"  onClick={() => navigate("/admin/users")} />
        <StatCard icon={faCartShopping}        label="Cart Items"       value={fmt(stats.total_cart_items)} color="amber" />
        <StatCard icon={faTriangleExclamation} label="Low Stock (< 5)"  value={fmt(stats.low_stock)}        color="orange" onClick={() => navigate("/admin/products")} />
        <StatCard icon={faBan}                 label="Out of Stock"     value={fmt(stats.out_of_stock)}     color="red"    onClick={() => navigate("/admin/products")} />
      </div>

      {/* ── Revenue Chart ── */}
      <div className="row g-4 mt-2">
        <div className="col-12">
          <div className="admin-panel">
            <div className="admin-panel-header d-flex justify-content-between align-items-center flex-wrap gap-2">
              <span>
                <FontAwesomeIcon icon={faArrowTrendUp} className="me-2" />
                Revenue & Orders — {periodMeta?.sub}
              </span>

              {/* Period switcher */}
              <div className="overview-period-tabs">
                {PERIODS.map(p => (
                  <button
                    key={p.key}
                    className={`overview-period-tab ${period === p.key ? "overview-period-tab--active" : ""}`}
                    onClick={(e) => { e.currentTarget.blur(); setPeriod(p.key); }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="admin-panel-body">
              <RevenueChart data={chartData} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent Orders + Category breakdown ── */}
      <div className="row g-4 mt-1">

        <div className="col-12 col-lg-7">
          <div className="admin-panel h-100">
            <div className="admin-panel-header d-flex justify-content-between align-items-center">
              <span><FontAwesomeIcon icon={faBoxOpen} className="me-2" />Recent Orders</span>
              <button className="overview-see-all-btn" onClick={() => navigate("/admin/orders")}>
                See all →
              </button>
            </div>
            <div className="admin-panel-body p-0">
              {!stats.recent_orders?.length ? (
                <p className="text-muted p-3">No orders yet.</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr><th>#</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {stats.recent_orders.map(o => (
                      <tr key={o.id} style={{ cursor: "pointer" }} onClick={() => navigate(`/orders/${o.id}`)}>
                        <td className="admin-order-link">#{o.id}</td>
                        <td>{o.full_name}</td>
                        <td className="admin-order-total">₹{fmt(o.total_amount)}</td>
                        <td><StatusBadge status={o.status} /></td>
                        <td className="admin-order-date">
                          {new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="admin-panel h-100">
            <div className="admin-panel-header">
              <FontAwesomeIcon icon={faTags} className="me-2" />Products by Category
            </div>
            <div className="admin-panel-body">
              {stats.categories.length === 0 ? (
                <p className="text-muted">No categories found.</p>
              ) : (
                <table className="admin-table">
                  <thead><tr><th>Category</th><th style={{ textAlign: "right" }}>Products</th></tr></thead>
                  <tbody>
                    {stats.categories.map(cat => (
                      <tr key={cat.category}>
                        <td>{cat.category || "—"}</td>
                        <td style={{ textAlign: "right" }}>
                          <span className="admin-count-badge">{cat.count}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* ── Quick Actions ── */}
      <div className="row g-4 mt-1">
        <div className="col-12 col-lg-4">
          <div className="admin-panel">
            <div className="admin-panel-header">
              <FontAwesomeIcon icon={faArrowTrendUp} className="me-2" />Quick Actions
            </div>
            <div className="admin-panel-body d-flex flex-column gap-2">
              <button className="btn admin-quick-btn" onClick={() => navigate("/admin/products/add")}>
                <FontAwesomeIcon icon={faCirclePlus} className="me-2" />Add New Product
              </button>
              <button className="btn admin-quick-btn admin-quick-btn--secondary" onClick={() => navigate("/admin/orders")}>
                <FontAwesomeIcon icon={faBoxOpen} className="me-2" />Manage Orders
              </button>
              <button className="btn admin-quick-btn admin-quick-btn--secondary" onClick={() => navigate("/admin/products")}>
                <FontAwesomeIcon icon={faBoxesStacked} className="me-2" />Manage Products
              </button>
              <button className="btn admin-quick-btn admin-quick-btn--secondary" onClick={() => navigate("/admin/users")}>
                <FontAwesomeIcon icon={faUsers} className="me-2" />Manage Users
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default AdminOverview;