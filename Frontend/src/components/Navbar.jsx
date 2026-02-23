import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SearchBar from "./SearchBar";

const Navbar = () => {
    const { user, logout, hasRole } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false); // controls mobile menu

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const closeMenu = () => setMenuOpen(false);

    return (
        <nav className="navbar">
            {/* Logo */}
            <Link to="/" className="navbar-logo">OLX</Link>

            {/* Search — hidden on mobile, shown via CSS */}
            <div className="navbar-center">
                <SearchBar />
            </div>

            {/* Desktop Nav Links */}
            <div className="navbar-actions">
                {user ? (
                    <>
                        {/* Sell button only visible to sellers and admins */}
                        {(hasRole("seller") || hasRole("admin")) && (
                            <Link to="/sell" className="btn-sell">+ Sell</Link>
                        )}
                        <Link to="/my-ads" className="nav-link">My Ads</Link>
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

            {/* Mobile Hamburger Button */}
            <button
                className="hamburger"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
            >
                {menuOpen ? "✕" : "☰"}
            </button>

            {/* Mobile Dropdown Menu */}
            {menuOpen && (
                <div className="mobile-menu">
                    {user ? (
                        <>
                            {(hasRole("seller") || hasRole("admin")) && (
                                <Link to="/sell" onClick={closeMenu}>+ Sell</Link>
                            )}
                            <Link to="/my-ads" onClick={closeMenu}>My Ads</Link>
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