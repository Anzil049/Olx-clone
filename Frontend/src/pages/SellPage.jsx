import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/Alert";

const CATEGORIES = ["Electronics", "Cars", "Mobiles", "Furniture", "Fashion", "Books", "Sports", "Other"];
const CONDITIONS = ["New", "Like New", "Good", "Fair"];

const SellPage = () => {
    const { createProduct, loading, error, success, clearMessages } = useProducts();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ title: "", description: "", price: "", category: "", condition: "Good", location: "" });
    const [images, setImages] = useState([]);
    const [preview, setPreview] = useState([]);

    useEffect(() => { if (success) navigate("/my-ads"); }, [success]);
    useEffect(() => () => clearMessages(), []);

    // ── Phone Number Guard ──────────────────────────────────────────────────
    // If user has no phone number, block the form and ask them to add one first
    // This runs before rendering the form — no API call wasted
    const hasPhone = user?.phone && user.phone.trim() !== "";

    if (!hasPhone) {
        return (
            <div className="sell-page">
                <div className="phone-required-card">
                    <div className="phone-required-icon">📱</div>
                    <h2>Phone Number Required</h2>
                    <p>
                        Buyers need to contact you directly. Please add a phone number
                        to your profile before posting an ad.
                    </p>
                    {/* Take them straight to profile page */}
                    <Link to="/profile" className="btn-primary">
                        Go to Profile → Add Phone Number
                    </Link>
                    <p className="phone-note">
                        After adding your number, come back here to post your ad.
                    </p>
                </div>
            </div>
        );
    }
    // ────────────────────────────────────────────────────────────────────────

    const handleChange = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleImages = (e) => {
        const files = Array.from(e.target.files).slice(0, 5);
        setImages(files);
        setPreview(files.map((f) => URL.createObjectURL(f)));
    };

    const removeImage = (index) => {
        setImages((p) => p.filter((_, i) => i !== index));
        setPreview((p) => p.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.entries(form).forEach(([k, v]) => formData.append(k, v));
        images.forEach((img) => formData.append("images", img));
        await createProduct(formData);
    };

    return (
        <div className="sell-page">
            <h2>Post a New Ad</h2>
            <p className="page-subtitle">Fill in the details below to list your product</p>

            {/* Show current phone so user knows it's set */}
            <div className="phone-confirmed">
                ✅ Contact number: <strong>{user.phone}</strong>
                <Link to="/profile" className="change-phone-link">Change</Link>
            </div>

            <Alert message={error} type="error" />
            <Alert message={success} type="success" />

            <form className="sell-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Ad Title *</label>
                    <input
                        name="title"
                        placeholder="e.g. iPhone 13 Pro 256GB"
                        value={form.title}
                        onChange={handleChange}
                        required
                    />
                </div>

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

                <div className="form-group">
                    <label>Photos <span className="optional">(max 5)</span></label>
                    <label className="upload-box">
                        📷 Click to upload images
                        <input type="file" multiple accept="image/*" onChange={handleImages} hidden />
                    </label>
                    {preview.length > 0 && (
                        <div className="preview-grid">
                            {preview.map((src, i) => (
                                <div key={i} className="preview-item">
                                    <img src={src} alt={`preview ${i + 1}`} />
                                    <button type="button" className="remove-img" onClick={() => removeImage(i)}>✕</button>
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