// frontend/src/pages/admin/AdminAddProduct.jsx

import { useState }         from "react";
import { useNavigate }      from "react-router-dom";
import API                  from "../../api/axios";
import CategoryComboBox     from "../../components/CategoryComboBox";
import { FontAwesomeIcon }  from "@fortawesome/react-fontawesome";
import {
  faArrowLeft, faCloudArrowUp,
  faXmark, faImage, faArrowLeft as faArrowLeftIcon,
} from "@fortawesome/free-solid-svg-icons";

// ─────────────────────────────────────────────────────────────
// MULTI-IMAGE UPLOAD LOGIC:
//
//   images state = [{ file: File, preview: string }]
//
//   The first image in the array is ALWAYS the cover photo.
//   It gets sent as both:
//     product_picture   → sets the main image on the Product row
//     product_images[0] → also saved as first ProductImage gallery row
//
//   Extra images (index 1+) go only into product_images[].
//
//   The admin can:
//     • Drag & drop or click to pick files (supports multi-select)
//     • Remove any image with ×
//     • Reorder by clicking ← to move an image one position left
//       (making it closer to being the cover)
// ─────────────────────────────────────────────────────────────

function AdminAddProduct() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    product_name: "",
    price:        "",
    category:     "",
    description:  "",
    brand:        "",
    color:        "",
    stock:        "0",
  });

  const [images,   setImages]   = useState([]);   // [{ file, preview }]
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const handleCategoryChange = (val) => {
    setForm({ ...form, category: val });
    if (errors.category) setErrors({ ...errors, category: null });
  };

  // Accept any number of image files, append to the list
  const addFiles = (fileList) => {
    const valid = Array.from(fileList).filter(f => f.type.startsWith("image/"));
    if (!valid.length) return;
    const entries = valid.map(file => ({ file, preview: URL.createObjectURL(file) }));
    setImages(prev => [...prev, ...entries]);
    if (errors.images) setErrors({ ...errors, images: null });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const removeImage = (idx) => {
    setImages(prev => {
      const next = [...prev];
      URL.revokeObjectURL(next[idx].preview);
      next.splice(idx, 1);
      return next;
    });
  };

  // Move one step left → promotes toward cover position
  const moveLeft = (idx) => {
    if (idx === 0) return;
    setImages(prev => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  };

  const validate = () => {
    const e = {};
    if (!form.product_name.trim()) e.product_name = "Product name is required";
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = "Valid price is required";
    if (!form.category.trim()) e.category = "Category is required";
    if (images.length === 0) e.images = "At least one image is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ve = validate();
    if (Object.keys(ve).length) { setErrors(ve); return; }

    setLoading(true);
    const data = new FormData();
    Object.keys(form).forEach(k => data.append(k, form[k]));

    // First image = main cover
    data.append("product_picture", images[0].file);
    // All images = gallery (backend saves all of them as ProductImage rows)
    images.forEach(img => data.append("product_images", img.file));

    try {
      await API.post("products/create/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/admin/products");
    } catch (err) {
      setErrors(err.response?.data || { non_field: "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-overview">

      {/* Header */}
      <div className="admin-page-header-row">
        <div>
          <button className="admin-back-btn" onClick={() => navigate("/admin/products")}>
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Back to Products
          </button>
          <h1 className="admin-page-title mt-2">Add New Product</h1>
        </div>
      </div>

      {errors.non_field && <div className="admin-alert admin-alert--error">{errors.non_field}</div>}

      <form onSubmit={handleSubmit}>
        <div className="row g-4">

          {/* ── LEFT: product fields ── */}
          <div className="col-12 col-lg-8">
            <div className="admin-panel">
              <div className="admin-panel-header">Product Details</div>
              <div className="admin-panel-body">

                <div className="admin-field">
                  <label className="admin-label">Product Name <span className="admin-required">*</span></label>
                  <input name="product_name" className={`admin-input ${errors.product_name ? "admin-input--error" : ""}`}
                    placeholder="e.g. Samsung Galaxy S24" value={form.product_name} onChange={handleChange} />
                  {errors.product_name && <p className="admin-field-error">{errors.product_name}</p>}
                </div>

                <div className="row g-3">
                  <div className="col-6">
                    <div className="admin-field">
                      <label className="admin-label">Price (₹) <span className="admin-required">*</span></label>
                      <input name="price" type="number" min="0" step="0.01"
                        className={`admin-input ${errors.price ? "admin-input--error" : ""}`}
                        placeholder="0.00" value={form.price} onChange={handleChange} />
                      {errors.price && <p className="admin-field-error">{errors.price}</p>}
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="admin-field">
                      <label className="admin-label">Stock Quantity</label>
                      <input name="stock" type="number" min="0" className="admin-input"
                        value={form.stock} onChange={handleChange} />
                    </div>
                  </div>
                </div>

                <div className="admin-field">
                  <label className="admin-label">Category <span className="admin-required">*</span></label>
                  <CategoryComboBox value={form.category} onChange={handleCategoryChange} />
                  {errors.category && <p className="admin-field-error">{errors.category}</p>}
                </div>

                <div className="row g-3">
                  <div className="col-6">
                    <div className="admin-field">
                      <label className="admin-label">Brand</label>
                      <input name="brand" className="admin-input" placeholder="e.g. Samsung"
                        value={form.brand} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="admin-field">
                      <label className="admin-label">Color</label>
                      <input name="color" className="admin-input" placeholder="e.g. Phantom Black"
                        value={form.color} onChange={handleChange} />
                    </div>
                  </div>
                </div>

                <div className="admin-field">
                  <label className="admin-label">Description</label>
                  <textarea name="description" className="admin-input admin-textarea" rows={5}
                    placeholder="Features, specifications..." value={form.description} onChange={handleChange} />
                </div>

              </div>
            </div>
          </div>

          {/* ── RIGHT: image uploader ── */}
          <div className="col-12 col-lg-4">
            <div className="admin-panel">
              <div className="admin-panel-header">
                Product Images <span className="admin-required">*</span>
                <span className="admin-panel-hint"> · first = cover</span>
              </div>
              <div className="admin-panel-body">

                {/* Drop zone */}
                <div
                  className={`admin-dropzone-multi ${dragOver ? "admin-dropzone-multi--over" : ""} ${errors.images ? "admin-dropzone-multi--error" : ""}`}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("img-input").click()}
                >
                  <FontAwesomeIcon icon={faCloudArrowUp} className="admin-dropzone-multi-icon" />
                  <p>Drag & drop or <span className="admin-dropzone-link">browse</span></p>
                  <p className="admin-dropzone-hint">PNG · JPG · WEBP — select multiple</p>
                </div>
                <input id="img-input" type="file" accept="image/*" multiple hidden
                  onChange={e => addFiles(e.target.files)} />

                {errors.images && <p className="admin-field-error mt-1">{errors.images}</p>}

                {/* Previews */}
                {images.length > 0 && (
                  <div className="admin-img-grid">
                    {images.map((img, idx) => (
                      <div
                        key={img.preview}
                        className={`admin-img-tile ${idx === 0 ? "admin-img-tile--cover" : ""}`}
                      >
                        <img src={img.preview} alt="" />
                        {idx === 0 && <span className="admin-img-cover-label">Cover</span>}

                        {/* Move left → towards cover */}
                        {idx > 0 && (
                          <button type="button" className="admin-img-btn admin-img-btn--left"
                            title="Move left" onClick={() => moveLeft(idx)}>‹</button>
                        )}

                        {/* Remove */}
                        <button type="button" className="admin-img-btn admin-img-btn--remove"
                          title="Remove" onClick={() => removeImage(idx)}>
                          <FontAwesomeIcon icon={faXmark} />
                        </button>
                      </div>
                    ))}

                    {/* Add more tile */}
                    <div className="admin-img-tile admin-img-tile--add"
                      onClick={() => document.getElementById("img-input").click()}>
                      <FontAwesomeIcon icon={faImage} />
                      <span>Add</span>
                    </div>
                  </div>
                )}

              </div>
            </div>

            <button type="submit" className="btn admin-quick-btn w-100 mt-3" disabled={loading}>
              {loading ? "Creating..." : "Create Product"}
            </button>
            <button type="button" className="btn admin-quick-btn admin-quick-btn--secondary w-100 mt-2"
              onClick={() => navigate("/admin/products")}>Cancel</button>
          </div>

        </div>
      </form>
    </div>
  );
}

export default AdminAddProduct;