const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Helper — generate JWT token valid for 7 days
const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// @route  POST /api/auth/register
// @access Public
const register = async (req, res) => {
    const { name, email, password, roles } = req.body;
    try {
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: "Email already in use" });

        // Hash password in controller — explicit and easy to understand
        const hashedPassword = await bcrypt.hash(password, 10);

        // roles can be ["buyer"], ["seller"], or ["buyer","seller"]
        const user = await User.create({
            name, email,
            password: hashedPassword,
            roles: roles || ["buyer"], // default to buyer if not provided
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            roles: user.roles,
            token: generateToken(user._id),
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @route  POST /api/auth/login
// @access Public
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: "Invalid credentials" });

        // Compare plain password with stored hash
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            avatar: user.avatar,
            roles: user.roles,
            token: generateToken(user._id),
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @route  POST /api/auth/logout
// @access Private
// Strategy: add the token to a blacklist in the user document
const logout = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        // Save this token as invalidated so middleware rejects future requests with it
        await User.findByIdAndUpdate(req.user._id, {
            $push: { invalidatedTokens: token },
        });

        res.json({ message: "Logged out successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @route  GET /api/auth/me
// @access Private
const getMe = async (req, res) => {
    res.json(req.user); // req.user is set by the protect middleware
};

module.exports = { register, login, logout, getMe };