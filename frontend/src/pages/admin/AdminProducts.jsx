// frontend/src/pages/admin/AdminProducts.jsx
// Route: /admin/products
//
// FEATURES:
//   • Search bar (live as you type — useEffect on search state)
//   • Category filter dropdown (from existing categories)
//   • Inline stock editor — click the stock number → edit in place
//   • Table with image thumbnail, name, category, price, stock, actions
//   • Stock colour coding: red (0), orange (<5), green (5+)
//   • Responsive: table scrolls horizontally on mobile
//   • Confirm before delete

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCirclePlus, faPen, faTrash,
  faCheck, faXmark, faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";

function AdminProducts() {
  const [products,      setProducts]      = useState([]);
  const [search,        setSearch]        = useState("");
  const [filterCat,     setFilterCat]     = useState("");
  const [categories,    setCategories]    = useState([]);
  const [loading,       setLoading]       = useState(true);
  // editingStock: { id, value } — which row is being inline-edited
  const [editingStock,  setEditingStock]  = useState(null);
  const navigate = useNavigate();

  // Fetch products whenever search or filter changes
  useEffect(() => {
    setLoading(true);
    API.get(`products/?search=${search}&category=${filterCat}`)
      .then(res => {
        setProducts(res.data);
        // Build unique category list from results for the filter dropdown
        const cats = [...new Set(res.data.map(p => p.category).filter(Boolean))];
        setCategories(cats);
      })
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
  }, [search, filterCat]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    await API.delete(`products/delete/${id}/`);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Save inline stock edit
  const saveStock = (id) => {
    const newStock = parseInt(editingStock.value);
    if (isNaN(newStock) || newStock < 0) return;
    API.patch(`products/update/${id}/`, { stock: newStock })
      .then(() => {
        setProducts(prev =>
          prev.map(p => p.id === id ? { ...p, stock: newStock } : p)
        );
        setEditingStock(null);
      });
  };

  // Stock badge colour
  const stockClass = (stock) => {
    if (stock === 0)   return "admin-stock-badge admin-stock-badge--out";
    if (stock < 5)     return "admin-stock-badge admin-stock-badge--low";
    return                    "admin-stock-badge admin-stock-badge--ok";
  };

  return (
    <div className="admin-overview">

      {/* ── Page header ── */}
      <div className="admin-page-header-row">
        <div>
          <h1 className="admin-page-title">Products</h1>
          <p className="admin-page-subtitle">{products.length} product{products.length !== 1 ? "s" : ""} found</p>
        </div>
        <Link to="/admin/products/add" className="btn admin-quick-btn">
          <FontAwesomeIcon icon={faCirclePlus} className="me-2" />
          Add Product
        </Link>
      </div>

      {/* ── Filters ── */}
      <div className="admin-filters">
        {/* Search */}
        <div className="admin-search-wrap">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="admin-search-icon" />
          <input
            className="admin-search-input"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Category filter */}
        <select
          className="admin-filter-select"
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* ── Table ── */}
      <div className="admin-table-wrap">
        <table className="admin-table admin-table--full">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array(5).fill(null).map((_, i) => (
                <tr key={i}>
                  {Array(6).fill(null).map((__, j) => (
                    <td key={j}>
                      <span className="placeholder-glow">
                        <span className="placeholder col-10" />
                      </span>
                    </td>
                  ))}
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-muted py-4">
                  No products found.
                </td>
              </tr>
            ) : (
              products.map(p => (
                <tr key={p.id}>
                  {/* Thumbnail */}
                  <td>
                    <img
                      src={p.product_picture}
                      alt={p.product_name}
                      className="admin-product-thumb"
                    />
                  </td>

                  {/* Name */}
                  <td>
                    <p className="admin-product-name">{p.product_name}</p>
                    {p.brand && <p className="admin-product-brand">{p.brand}</p>}
                  </td>

                  {/* Category */}
                  <td><span className="admin-tag">{p.category}</span></td>

                  {/* Price */}
                  <td className="admin-price">₹{Number(p.price).toLocaleString("en-IN")}</td>

                  {/* Stock — inline editable */}
                  <td>
                    {editingStock?.id === p.id ? (
                      <div className="admin-stock-edit">
                        <input
                          type="number"
                          min="0"
                          className="admin-stock-input"
                          value={editingStock.value}
                          onChange={e => setEditingStock({ id: p.id, value: e.target.value })}
                          autoFocus
                        />
                        <button className="admin-icon-btn admin-icon-btn--green" onClick={() => saveStock(p.id)} title="Save">
                          <FontAwesomeIcon icon={faCheck} />
                        </button>
                        <button className="admin-icon-btn" onClick={() => setEditingStock(null)} title="Cancel">
                          <FontAwesomeIcon icon={faXmark} />
                        </button>
                      </div>
                    ) : (
                      // Click to edit inline
                      <span
                        className={stockClass(p.stock)}
                        onClick={() => setEditingStock({ id: p.id, value: p.stock })}
                        title="Click to edit stock"
                        style={{ cursor: "pointer" }}
                      >
                        {p.stock}
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td>
                    <div className="admin-action-btns">
                      <Link to={`/admin/products/edit/${p.id}`} className="admin-icon-btn admin-icon-btn--amber" title="Edit">
                        <FontAwesomeIcon icon={faPen} />
                      </Link>
                      <button className="admin-icon-btn admin-icon-btn--red" onClick={() => handleDelete(p.id)} title="Delete">
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default AdminProducts;