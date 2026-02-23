import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import Alert from "../components/Alert";

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { fetchProductById, current: product, loading, error, deleteProduct } = useProducts();
    const { user } = useAuth();
    const [activeImg, setActiveImg] = useState(0); // which thumbnail is selected

    // Load product when page opens or ID changes
    useEffect(() => {
        setActiveImg(0); // reset image on new product
        fetchProductById(id);
    }, [id]);

    if (loading) return <Loader />;
    if (error) return <div className="container"><Alert message={error} /></div>;
    if (!product) return null;

    const isOwner = user?._id === product.seller?._id;
    const isAdmin = user?.roles?.includes("admin");

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this ad?")) return;
        await deleteProduct(id);
        navigate("/");
    };

    return (
        <div className="detail-page">

            {/* ── Image Gallery ── */}
            <div className="gallery">
                <img
                    src={product.images?.[activeImg] || "/placeholder.jpg"}
                    alt={product.title}
                    className="main-image"
                />
                {product.images?.length > 1 && (
                    <div className="thumbnail-row">
                        {product.images.map((src, i) => (
                            <img
                                key={i}
                                src={src}
                                alt={`view ${i + 1}`}
                                className={i === activeImg ? "thumb active" : "thumb"}
                                onClick={() => setActiveImg(i)} // click thumbnail to change main image
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Product Info ── */}
            <div className="detail-info">
                <h1 className="detail-title">{product.title}</h1>
                <p className="detail-price">₹{product.price.toLocaleString("en-IN")}</p>

                <div className="detail-badges">
                    <span className="badge">{product.condition}</span>
                    <span className="badge">{product.category}</span>
                    <span className="badge">👁 {product.views} views</span>
                </div>

                <div className="detail-section">
                    <h3>Description</h3>
                    <p>{product.description}</p>
                </div>

                <div className="detail-section">
                    <h3>Location</h3>
                    <p>📍 {product.location}</p>
                </div>

                {/* ── Seller Info ── */}
                <div className="seller-card">
                    <div className="seller-avatar-wrap">
                        {product.seller?.avatar
                            ? <img src={product.seller.avatar} alt="seller" />
                            : <span>{product.seller?.name?.[0]?.toUpperCase()}</span>
                        }
                    </div>
                    <div>
                        <p className="seller-name">{product.seller?.name}</p>
                        <p className="seller-label">Seller</p>
                    </div>
                </div>

                {/* Contact — only show to logged-in users */}
                {user ? (
                    <a href={`tel:${product.seller?.phone}`} className="btn-contact">
                        📞 Contact Seller
                    </a>
                ) : (
                    <button className="btn-contact" onClick={() => navigate("/login")}>
                        🔒 Login to See Contact
                    </button>
                )}

                {/* Edit/Delete — only for owner or admin */}
                {(isOwner || isAdmin) && (
                    <div className="owner-actions">
                        <button className="btn-danger" onClick={handleDelete}>
                            🗑 Delete Ad
                        </button>
                    </div>
                )}

                <Link to="/" className="back-link">← Back to listings</Link>
            </div>
        </div>
    );
};

export default ProductDetail;