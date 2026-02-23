import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SearchBar from "./SearchBar";

const Navbar = () => {
    const { user, logout, hasRole } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const closeMenu = () => setMenuOpen(false);

    // Role checks — a user can have multiple roles so we check each separately
    const isAdmin = hasRole("admin");
    const isSellerOnly = hasRole("seller") && !isAdmin; // seller but NOT admin

    // "Sell" and "My Ads" are only for sellers who are NOT admin or buyer-only
    // Admin manages via dashboard, buyers have nothing to sell
    const showSellerLinks = isSellerOnly;

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-logo">OLX</Link>

            <div className="navbar-center">
                <SearchBar />
            </div>

            {/* ── Desktop Nav ── */}
            <div className="navbar-actions">
                {user ? (
                    <>
                        {/* Admin: show only Admin Dashboard link */}
                        {isAdmin && (
                            <Link to="/admin" className="nav-link nav-admin">⚙️ Admin</Link>
                        )}

                        {/* Seller only (not admin, not buyer-only): show Sell + My Ads */}
                        {showSellerLinks && (
                            <>
                                <Link to="/sell" className="btn-sell">+ Sell</Link>
                                <Link to="/my-ads" className="nav-link">My Ads</Link>
                            </>
                        )}

                        {/* Profile + Logout visible to everyone */}
                        <Link to="/profile" className="nav-avatar-link">
                            {user.avatar
                                ? <img src={user.avatar} alt="avatar" className="nav-avatar" />
                                : <span className="nav-avatar-placeholder">{user.name?.[0]?.toUpperCase()}</span>
                            }
                        </Link>
                        <button onClick={handleLogout} className="btn-logout">Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-link">Login</Link>
                        <Link to="/register" className="btn-sell">Register</Link>
                    </>
                )}
            </div>

            {/* ── Mobile Hamburger ── */}
            <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
                {menuOpen ? "✕" : "☰"}
            </button>

            {/* ── Mobile Dropdown ── */}
            {menuOpen && (
                <div className="mobile-menu">
                    {user ? (
                        <>
                            {isAdmin && (
                                <Link to="/admin" onClick={closeMenu}>⚙️ Admin Dashboard</Link>
                            )}
                            {showSellerLinks && (
                                <>
                                    <Link to="/sell" onClick={closeMenu}>+ Sell</Link>
                                    <Link to="/my-ads" onClick={closeMenu}>My Ads</Link>
                                </>
                            )}
                            <Link to="/profile" onClick={closeMenu}>Profile</Link>
                            <button onClick={() => { handleLogout(); closeMenu(); }}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" onClick={closeMenu}>Login</Link>
                            <Link to="/register" onClick={closeMenu}>Register</Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;