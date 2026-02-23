import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/Alert";

const Profile = () => {
    const { user, loading, error, updateProfile, addRole, clearError } = useAuth();
    const [form, setForm] = useState({ name: "", phone: "", password: "" });
    const [success, setSuccess] = useState("");

    // Pre-fill form with current user data when available
    useEffect(() => {
        if (user) {
            setForm({ name: user.name || "", phone: user.phone || "", password: "" });
        }
    }, [user]);

    useEffect(() => () => clearError(), []); // clear error on page leave

    const handleChange = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = { name: form.name, phone: form.phone };
        // Only include password if user typed a new one
        if (form.password) data.password = form.password;

        const ok = await updateProfile(data);
        if (ok) {
            setSuccess("Profile updated successfully!");
            setForm((prev) => ({ ...prev, password: "" })); // clear password field
        }
    };

    const handleAddRole = async (role) => {
        if (!window.confirm(`Add "${role}" role to your account?`)) return;
        const msg = await addRole(role);
        if (msg) setSuccess(msg);
    };

    return (
        <div className="profile-page">
            <h2>My Profile</h2>

            <Alert message={error} type="error" />
            <Alert message={success} type="success" />

            {/* ── Current Roles ── */}
            <div className="roles-section">
                <h3>Your Roles</h3>
                <div className="roles-display">
                    {user?.roles?.map((r) => (
                        <span key={r} className={`role-badge role-${r}`}>
                            {r === "buyer" ? "🛒" : r === "seller" ? "🏷️" : "⚙️"} {r}
                        </span>
                    ))}
                </div>

                {/* Offer to upgrade to seller if not already */}
                {!user?.roles?.includes("seller") && (
                    <button className="btn-add-role" onClick={() => handleAddRole("seller")}>
                        🏷️ Become a Seller — Start posting ads
                    </button>
                )}
                {/* Offer to add buyer role if only a seller */}
                {!user?.roles?.includes("buyer") && (
                    <button className="btn-add-role" onClick={() => handleAddRole("buyer")}>
                        🛒 Add Buyer Role
                    </button>
                )}
            </div>

            {/* ── Update Profile Form ── */}
            <form className="profile-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Full Name</label>
                    <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Phone Number</label>
                    <input
                        name="phone"
                        type="tel"
                        placeholder="+91 99999 99999"
                        value={form.phone}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label>
                        New Password{" "}
                        <span className="optional">(leave blank to keep current)</span>
                    </label>
                    <input
                        name="password"
                        type="password"
                        placeholder="New password..."
                        value={form.password}
                        onChange={handleChange}
                    />
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                </button>
            </form>
        </div>
    );
};

export default Profile;