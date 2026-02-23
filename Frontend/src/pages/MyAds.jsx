import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import Loader from "../components/Loader";
import Alert from "../components/Alert";

const MyAds = () => {
  const { myAds, loading, error, success, fetchMyProducts, deleteProduct } = useProducts();
  const navigate = useNavigate();

  // Fetch user's own ads when page loads
  useEffect(() => { fetchMyProducts(); }, []);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this ad?")) {
      deleteProduct(id);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="my-ads-page">
      <div className="page-header">
        <h2>My Ads <span className="count">({myAds.length})</span></h2>
        <Link to="/sell" className="btn-primary">+ Post New Ad</Link>
      </div>

      <Alert message={error}   type="error" />
      <Alert message={success} type="success" />

      {myAds.length === 0 ? (
        <div className="empty-state">
          <p>📭 You haven't posted any ads yet.</p>
          <Link to="/sell" className="btn-primary">Post Your First Ad</Link>
        </div>
      ) : (
        <div className="my-ads-list">
          {myAds.map((ad) => (
            <div key={ad._id} className="my-ad-card">
              <img
                src={ad.images?.[0] || "/placeholder.jpg"}
                alt={ad.title}
                className="my-ad-img"
              />
              <div className="my-ad-info">
                <h3>{ad.title}</h3>
                <p className="my-ad-price">₹{ad.price.toLocaleString("en-IN")}</p>
                <p className="my-ad-meta">📍 {ad.location} · {ad.category}</p>
                {/* Active/inactive status set by admin */}
                <span className={`ad-status ${ad.isActive ? "active" : "inactive"}`}>
                  {ad.isActive ? "✅ Active" : "❌ Inactive"}
                </span>
              </div>
              <div className="my-ad-actions">
                <button
                  className="btn-view"
                  onClick={() => navigate(`/product/${ad._id}`)}
                >
                  View
                </button>
                <button
                  className="btn-danger"
                  onClick={() => handleDelete(ad._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAds;