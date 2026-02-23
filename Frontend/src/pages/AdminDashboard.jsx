import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import Loader from "../components/Loader";
import Alert from "../components/Alert";

const CATEGORIES = ["", "Electronics", "Cars", "Mobiles", "Furniture", "Fashion", "Books", "Sports", "Other"];

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products,     setProducts]     = useState([]);
  const [stats,        setStats]        = useState({ total: 0, activeCount: 0, inactiveCount: 0 });
  const [loading,      setLoading]      = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // ID of product being acted on
  const [error,        setError]        = useState("");
  const [success,      setSuccess]      = useState("");
  const [pages,        setPages]        = useState(1);

  // Filter state
  const [filters, setFilters] = useState({
    search: "", category: "", status: "", sort: "-createdAt", page: 1,
  });

  // Fetch all products (admin sees everything — active + inactive)
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const clean = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ""));
      const res = await api.get("/products/admin/all", { params: clean });
      setProducts(res.data.products);
      setPages(res.data.pages);
      setStats({
        total:         res.data.total,
        activeCount:   res.data.activeCount,
        inactiveCount: res.data.inactiveCount,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Auto-clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);

  const setFilter = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));

  // Toggle a product between active and inactive
  const handleToggle = async (product) => {
    setActionLoading(product._id);
    try {
      const res = await api.put(`/products/admin/${product._id}/toggle`);
      setSuccess(res.data.message);
      // Update product in local state — no need to refetch everything
      setProducts((prev) =>
        prev.map((p) => p._id === product._id ? { ...p, isActive: res.data.isActive } : p)
      );
      // Update stats count
      setStats((prev) => ({
        ...prev,
        activeCount:   prev.activeCount   + (res.data.isActive ? 1 : -1),
        inactiveCount: prev.inactiveCount + (res.data.isActive ? -1 : 1),
      }));
    } catch (err) {
      setError(err.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  // Permanently delete a product
  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this product? This cannot be undone.")) return;
    setActionLoading(id);
    try {
      await api.delete(`/products/admin/${id}`);
      setSuccess("Product permanently deleted");
      // Remove from list immediately
      setProducts((prev) => prev.filter((p) => p._id !== id));
      setStats((prev) => ({ ...prev, total: prev.total - 1 }));
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="admin-page">

      {/* ── Header ── */}
      <div className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="admin-subtitle">Manage all product listings</p>
        </div>
        <div className="admin-user">
          <span>👤 {user?.name}</span>
          <span className="role-badge role-admin">admin</span>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-number">{stats.total}</p>
          <p className="stat-label">Total Listings</p>
        </div>
        <div className="stat-card stat-active">
          <p className="stat-number">{stats.activeCount}</p>
          <p className="stat-label">Active</p>
        </div>
        <div className="stat-card stat-inactive">
          <p className="stat-number">{stats.inactiveCount}</p>
          <p className="stat-label">Inactive</p>
        </div>
      </div>

      <Alert message={error}   type="error" />
      <Alert message={success} type="success" />

      {/* ── Filters ── */}
      <div className="admin-filters">
        <input
          placeholder="Search title..."
          value={filters.search}
          onChange={(e) => setFilter("search", e.target.value)}
          className="admin-search"
        />
        <select value={filters.category} onChange={(e) => setFilter("category", e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.filter(Boolean).map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={filters.status} onChange={(e) => setFilter("status", e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select value={filters.sort} onChange={(e) => setFilter("sort", e.target.value)}>
          <option value="-createdAt">Newest First</option>
          <option value="createdAt">Oldest First</option>
          <option value="-price">Price: High → Low</option>
          <option value="price">Price: Low → High</option>
        </select>
        <button className="btn-refresh" onClick={fetchProducts}>🔄 Refresh</button>
      </div>

      {/* ── Products Table ── */}
      {loading ? <Loader text="Loading listings..." /> : (
        <>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Seller</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Views</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="table-empty">No products found.</td>
                  </tr>
                ) : products.map((p) => (
                  <tr key={p._id} className={!p.isActive ? "row-inactive" : ""}>

                    {/* Product info */}
                    <td>
                      <div className="table-product">
                        <img
                          src={p.images?.[0] || "/placeholder.jpg"}
                          alt={p.title}
                          className="table-img"
                        />
                        <div>
                          <p className="table-title">{p.title}</p>
                          <p className="table-location">📍 {p.location}</p>
                        </div>
                      </div>
                    </td>

                    {/* Seller info */}
                    <td>
                      <p className="table-seller-name">{p.seller?.name || "—"}</p>
                      <p className="table-seller-email">{p.seller?.email}</p>
                      <p className="table-seller-phone">{p.seller?.phone || "No phone"}</p>
                    </td>

                    <td><span className="badge">{p.category}</span></td>

                    <td className="table-price">₹{p.price?.toLocaleString("en-IN")}</td>

                    <td className="table-views">👁 {p.views}</td>

                    {/* Status badge */}
                    <td>
                      <span className={`status-badge ${p.isActive ? "status-active" : "status-inactive"}`}>
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td>
                      <div className="action-buttons">
                        {/* View — opens product page in new tab */}
                        <button
                          className="btn-action btn-view-sm"
                          onClick={() => navigate(`/product/${p._id}`)}
                          title="View listing"
                        >
                          👁 View
                        </button>

                        {/* Toggle active/inactive */}
                        <button
                          className={`btn-action ${p.isActive ? "btn-deactivate" : "btn-activate"}`}
                          onClick={() => handleToggle(p)}
                          disabled={actionLoading === p._id}
                          title={p.isActive ? "Deactivate listing" : "Activate listing"}
                        >
                          {actionLoading === p._id ? "..." : p.isActive ? "⛔ Deactivate" : "✅ Activate"}
                        </button>

                        {/* Hard delete */}
                        <button
                          className="btn-action btn-delete-sm"
                          onClick={() => handleDelete(p._id)}
                          disabled={actionLoading === p._id}
                          title="Permanently delete"
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="pagination">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={p === filters.page ? "page-btn active" : "page-btn"}
                  onClick={() => setFilters((prev) => ({ ...prev, page: p }))}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;