import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import Alert from "../components/Alert";

const CATEGORIES = ["Electronics", "Cars", "Mobiles", "Furniture", "Fashion", "Books", "Sports", "Other"];
const CONDITIONS = ["New", "Like New", "Good", "Fair"];

const SellPage = () => {
  const { createProduct, loading, error, success, clearMessages } = useProducts();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "", description: "", price: "",
    category: "", condition: "Good", location: "",
  });
  const [images,  setImages]  = useState([]); // File objects to upload
  const [preview, setPreview] = useState([]); // blob URLs for instant preview

  // Navigate away when product is created successfully
  useEffect(() => { if (success) navigate("/my-ads"); }, [success]);

  // Clean up messages when leaving page
  useEffect(() => () => clearMessages(), []);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 5); // max 5 images
    setImages(files);
    // Create preview URLs so user sees images before upload
    setPreview(files.map((f) => URL.createObjectURL(f)));
  };

  const removeImage = (index) => {
    setImages((prev)  => prev.filter((_, i) => i !== index));
    setPreview((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // FormData is required to send text + files in one request
    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) => formData.append(key, val));
    images.forEach((img) => formData.append("images", img)); // multer picks "images"

    await createProduct(formData);
  };

  return (
    <div className="sell-page">
      <h2>Post a New Ad</h2>
      <p className="page-subtitle">Fill in the details below to list your product</p>

      <Alert message={error}   type="error" />
      <Alert message={success} type="success" />

      <form className="sell-form" onSubmit={handleSubmit}>

        {/* Title */}
        <div className="form-group">
          <label>Ad Title *</label>
          <input
            name="title"
            placeholder="e.g. iPhone 13 Pro 256GB — Mint Condition"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        {/* Category + Condition side by side */}
        <div className="form-row">
          <div className="form-group">
            <label>Category *</label>
            <select name="category" value={form.category} onChange={handleChange} required>
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Condition *</label>
            <select name="condition" value={form.condition} onChange={handleChange}>
              {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="form-group">
          <label>Description *</label>
          <textarea
            name="description"
            placeholder="Describe your item — brand, age, defects, reason for selling..."
            value={form.description}
            onChange={handleChange}
            rows={4}
            required
          />
        </div>

        {/* Price + Location side by side */}
        <div className="form-row">
          <div className="form-group">
            <label>Price (₹) *</label>
            <input
              name="price"
              type="number"
              placeholder="0"
              value={form.price}
              onChange={handleChange}
              min="0"
              required
            />
          </div>
          <div className="form-group">
            <label>Location *</label>
            <input
              name="location"
              placeholder="City / Area"
              value={form.location}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Image Upload */}
        <div className="form-group">
          <label>Photos <span className="optional">(max 5)</span></label>
          <label className="upload-box">
            📷 Click to upload images
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImages}
              hidden
            />
          </label>

          {/* Preview selected images before submitting */}
          {preview.length > 0 && (
            <div className="preview-grid">
              {preview.map((src, i) => (
                <div key={i} className="preview-item">
                  <img src={src} alt={`preview ${i + 1}`} />
                  <button
                    type="button"
                    className="remove-img"
                    onClick={() => removeImage(i)}
                  >✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Posting your ad..." : "Post Ad"}
        </button>
      </form>
    </div>
  );
};

export default SellPage;