import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/Alert";

const Register = () => {
  const { register, loading, error, token, clearError } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", email: "", password: "",
    roles: ["buyer"], // default role
  });

  useEffect(() => { if (token) navigate("/"); }, [token]);
  useEffect(() => () => clearError(), []);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Toggle a role in the roles array (add or remove)
  const toggleRole = (role) => {
    setForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role) // uncheck → remove
        : [...prev.roles, role],               // check → add
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.roles.length === 0) {
      alert("Please select at least one role.");
      return;
    }
    await register(form);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">OLX</div>
        <h2>Create Account 🎉</h2>
        <p className="auth-subtitle">Join OLX — Buy or Sell anything</p>

        <Alert message={error} type="error" />

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              name="name"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              name="password"
              type="password"
              placeholder="Minimum 6 characters"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Role selection — user can pick both buyer AND seller */}
          <div className="form-group">
            <label>I want to:</label>
            <div className="role-checkboxes">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.roles.includes("buyer")}
                  onChange={() => toggleRole("buyer")}
                />
                🛒 Buy products
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.roles.includes("seller")}
                  onChange={() => toggleRole("seller")}
                />
                🏷️ Sell products
              </label>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;