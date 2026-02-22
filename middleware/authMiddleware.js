const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes — only logged-in users can access
const protect = async (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1]; // "Bearer <token>"

  if (!token) return res.status(401).json({ message: "Not authorized, no token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user to request (excluding password)
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch {
    res.status(401).json({ message: "Token invalid or expired" });
  }
};

// Role-based access — e.g., adminOnly middleware
const roleOnly = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

module.exports = { protect, roleOnly };