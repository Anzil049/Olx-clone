import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import useProductFilters from "../hooks/useProductFilters";

const CATEGORIES = [
    "Electronics", "Cars", "Mobiles",
    "Furniture", "Fashion", "Books", "Sports", "Other",
];

const Home = () => {
    const [searchParams] = useSearchParams();
    const { list, loading, pages } = useProducts();
    const { filters, setFilter, setPage } = useProductFilters();

    // If user searched from Navbar, the URL will have ?search=...
    // Pick that up and apply it as a filter
    useEffect(() => {
        const q = searchParams.get("search");
        if (q) setFilter("search", q);
    }, [searchParams]);

    return (
        <div className="home-page">

            {/* ── Category Filter Buttons ── */}
            <div className="category-bar">
                <button
                    className={!filters.category ? "cat-btn active" : "cat-btn"}
                    onClick={() => setFilter("category", "")}
                >
                    All
                </button>
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        className={filters.category === cat ? "cat-btn active" : "cat-btn"}
                        onClick={() => setFilter("category", cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* ── Sort + Price Range ── */}
            <div className="filter-bar">
                <select
                    value={filters.sort}
                    onChange={(e) => setFilter("sort", e.target.value)}
                >
                    <option value="-createdAt">Newest First</option>
                    <option value="price">Price: Low → High</option>
                    <option value="-price">Price: High → Low</option>
                </select>
                <input
                    type="number"
                    placeholder="Min ₹"
                    onChange={(e) => setFilter("minPrice", e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Max ₹"
                    onChange={(e) => setFilter("maxPrice", e.target.value)}
                />
            </div>

            {/* ── Product Grid ── */}
            {loading ? (
                <Loader text="Fetching ads..." />
            ) : (
                <>
                    <div className="product-grid">
                        {list.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                    {list.length === 0 && (
                        <div className="empty-state">
                            <p>😔 No products found. Try a different search or category.</p>
                        </div>
                    )}
                </>
            )}

            {/* ── Pagination ── */}
            {pages > 1 && (
                <div className="pagination">
                    {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                        <button
                            key={p}
                            className={p === filters.page ? "page-btn active" : "page-btn"}
                            onClick={() => setPage(p)}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;