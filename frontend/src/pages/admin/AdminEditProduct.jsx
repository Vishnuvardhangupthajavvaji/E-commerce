// frontend/src/pages/admin/AdminEditProduct.jsx

import { useEffect, useState }    from "react";
import { useParams, useNavigate } from "react-router-dom";
import API                        from "../../api/axios";
import CategoryComboBox           from "../../components/CategoryComboBox";
import { FontAwesomeIcon }        from "@fortawesome/react-fontawesome";
import { faArrowLeft, faXmark, faImage, faCloudArrowUp } from "@fortawesome/free-solid-svg-icons";

function AdminEditProduct() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    product_name: "", price: "", category: "",
    description: "", brand: "", color: "", stock: "0",
  });

  // Images already saved on the server
  // Shape: [{ id, image (absolute URL), order }]
  const [savedImages, setSavedImages] = useState([]);

  // New images picked but not uploaded yet
  // Shape: [{ file, preview }]
  const [newImages,  setNewImages]  = useState([]);

  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(true);
  const [saved,    setSaved]    = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    API.get(`products/${id}/`)
      .then(res => {
        const p = res.data;
        setForm({
          product_name: p.product_name || "",
          price:        String(p.price)  || "",
          category:     p.category     || "",
          description:  p.description  || "",
          brand:        p.brand        || "",
          color:        p.color        || "",
          stock:        String(p.stock) || "0",
        });
        setSavedImages(p.images || []);
      })
      .catch(err => console.log(err))
      .finally(() => setFetching(false));
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const addNewFiles = (fileList) => {
    const valid = Array.from(fileList).filter(f => f.type.startsWith("image/"));
    setNewImages(prev => [...prev, ...valid.map(f => ({ file: f, preview: URL.createObjectURL(f) }))]);
  };

  // Delete a saved image immediately via API (no need to save the form)
  const deleteSavedImage = async (imgId) => {
    try {
      await API.delete(`products/images/${imgId}/`);
      setSavedImages(prev => prev.filter(i => i.id !== imgId));
    } catch {
      alert("Failed to delete image");
    }
  };

  const removeNewImage = (idx) => {
    setNewImages(prev => {
      const next = [...prev];
      URL.revokeObjectURL(next[idx].preview);
      next.splice(idx, 1);
      return next;
    });
  };

  const validate = () => {
    const e = {};
    if (!form.product_name.trim()) e.product_name = "Required";
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = "Valid price required";
    if (!form.category.trim()) e.category = "Required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ve = validate();
    if (Object.keys(ve).length) { setErrors(ve); return; }

    setLoading(true);
    const data = new FormData();
    Object.keys(form).forEach(k => data.append(k, form[k]));

    // Tell backend which saved images to KEEP (all others get deleted)
    data.append("existing_image_ids", savedImages.map(i => i.id).join(","));

    // Add new images
    newImages.forEach(img => data.append("product_images", img.file));

    try {
      await API.patch(`products/update/${id}/`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSaved(true);
      setTimeout(() => navigate("/admin/products"), 1200);
    } catch (err) {
      setErrors(err.response?.data || { non_field: "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="admin-overview">
      <div className="placeholder-glow d-flex flex-column gap-3">
        {[...Array(5)].map((_, i) => (
          <span key={i} className="placeholder d-block" style={{ height: 40, borderRadius: 6 }} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="admin-overview">

      <div className="admin-page-header-row">
        <div>
          <button className="admin-back-btn" onClick={() => navigate("/admin/products")}>
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />Back to Products
          </button>
          <h1 className="admin-page-title mt-2">Edit Product</h1>
        </div>
      </div>

      {saved && <div className="admin-alert admin-alert--success">✓ Saved! Redirecting...</div>}
      {errors.non_field && <div className="admin-alert admin-alert--error">{errors.non_field}</div>}

      <form onSubmit={handleSubmit}>
        <div className="row g-4">

          {/* ── LEFT: fields ── */}
          <div className="col-12 col-lg-8">
            <div className="admin-panel">
              <div className="admin-panel-header">Product Details</div>
              <div className="admin-panel-body">

                <div className="admin-field">
                  <label className="admin-label">Product Name <span className="admin-required">*</span></label>
                  <input name="product_name" className={`admin-input ${errors.product_name ? "admin-input--error" : ""}`}
                    value={form.product_name} onChange={handleChange} />
                  {errors.product_name && <p className="admin-field-error">{errors.product_name}</p>}
                </div>

                <div className="row g-3">
                  <div className="col-6">
                    <div className="admin-field">
                      <label className="admin-label">Price (₹) <span className="admin-required">*</span></label>
                      <input name="price" type="number" min="0" step="0.01"
                        className={`admin-input ${errors.price ? "admin-input--error" : ""}`}
                        value={form.price} onChange={handleChange} />
                      {errors.price && <p className="admin-field-error">{errors.price}</p>}
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="admin-field">
                      <label className="admin-label">Stock</label>
                      <input name="stock" type="number" min="0" className="admin-input"
                        value={form.stock} onChange={handleChange} />
                    </div>
                  </div>
                </div>

                <div className="admin-field">
                  <label className="admin-label">Category <span className="admin-required">*</span></label>
                  <CategoryComboBox value={form.category}
                    onChange={val => { setForm(f => ({...f, category: val})); }} />
                  {errors.category && <p className="admin-field-error">{errors.category}</p>}
                </div>

                <div className="row g-3">
                  <div className="col-6">
                    <div className="admin-field">
                      <label className="admin-label">Brand</label>
                      <input name="brand" className="admin-input" value={form.brand || ""} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="admin-field">
                      <label className="admin-label">Color</label>
                      <input name="color" className="admin-input" value={form.color || ""} onChange={handleChange} />
                    </div>
                  </div>
                </div>

                <div className="admin-field">
                  <label className="admin-label">Description</label>
                  <textarea name="description" className="admin-input admin-textarea" rows={5}
                    value={form.description || ""} onChange={handleChange} />
                </div>

              </div>
            </div>
          </div>

          {/* ── RIGHT: images ── */}
          <div className="col-12 col-lg-4">
            <div className="admin-panel">
              <div className="admin-panel-header">
                Images
                <span className="admin-panel-hint"> · {savedImages.length + newImages.length} total</span>
              </div>
              <div className="admin-panel-body">

                {/* Saved images */}
                {savedImages.length > 0 && (
                  <>
                    <p className="admin-img-section-label">Saved — click × to delete instantly</p>
                    <div className="admin-img-grid">
                      {savedImages.map((img, idx) => (
                        <div key={img.id}
                          className={`admin-img-tile ${idx === 0 ? "admin-img-tile--cover" : ""}`}>
                          <img src={img.image} alt="" />
                          {idx === 0 && <span className="admin-img-cover-label">Cover</span>}
                          <button type="button" className="admin-img-btn admin-img-btn--remove"
                            onClick={() => deleteSavedImage(img.id)} title="Delete">
                            <FontAwesomeIcon icon={faXmark} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* New staged images */}
                {newImages.length > 0 && (
                  <>
                    <p className="admin-img-section-label mt-3">To be added on save</p>
                    <div className="admin-img-grid">
                      {newImages.map((img, idx) => (
                        <div key={img.preview} className="admin-img-tile admin-img-tile--new">
                          <img src={img.preview} alt="" />
                          <button type="button" className="admin-img-btn admin-img-btn--remove"
                            onClick={() => removeNewImage(idx)}>
                            <FontAwesomeIcon icon={faXmark} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Add more drop zone */}
                <div
                  className={`admin-dropzone-multi admin-dropzone-multi--compact mt-3 ${dragOver ? "admin-dropzone-multi--over" : ""}`}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); addNewFiles(e.dataTransfer.files); }}
                  onClick={() => document.getElementById("edit-img-input").click()}
                >
                  <FontAwesomeIcon icon={faImage} className="me-2" />
                  Click or drag to add more images
                </div>
                <input id="edit-img-input" type="file" accept="image/*" multiple hidden
                  onChange={e => addNewFiles(e.target.files)} />

              </div>
            </div>

            <button type="submit" className="btn admin-quick-btn w-100 mt-3" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button type="button" className="btn admin-quick-btn admin-quick-btn--secondary w-100 mt-2"
              onClick={() => navigate("/admin/products")}>Cancel</button>
          </div>

        </div>
      </form>
    </div>
  );
}

export default AdminEditProduct;