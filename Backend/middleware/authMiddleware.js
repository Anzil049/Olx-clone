const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes — verify token and attach user to req
const protect = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // "Bearer <token>"

    if (!token) return res.status(401).json({ message: "Not authorized, no token" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");

        if (!user) return res.status(401).json({ message: "User not found" });

        // Check if this token was invalidated (user logged out)
        if (user.invalidatedTokens.includes(token)) {
            return res.status(401).json({ message: "Token is no longer valid, please login again" });
        }

        req.user = user; // attach user to every protected request
        next();
    } catch {
        res.status(401).json({ message: "Token invalid or expired" });
    }
};

// Role guard — checks if user's roles array includes any allowed role
// Usage: roleOnly("seller", "admin")
const roleOnly = (...allowedRoles) => (req, res, next) => {
    // Check if user has at least one of the required roles
    const hasRole = allowedRoles.some((role) => req.user.roles.includes(role));
    if (!hasRole) {
        return res.status(403).json({ message: `Access denied. Required: ${allowedRoles.join(" or ")}` });
    }
    next();
};

module.exports = { protect, roleOnly };