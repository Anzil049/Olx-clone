const User = require("../models/User");
const bcrypt = require("bcryptjs");

// @route  GET /api/users/profile
// @access Private
const getProfile = async (req, res) => {
    // req.user already has the full user from protect middleware
    res.json(req.user);
};

// @route  PUT /api/users/profile
// @access Private
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        // Update only provided fields (partial update)
        user.name = req.body.name || user.name;
        user.phone = req.body.phone || user.phone;
        user.avatar = req.body.avatar || user.avatar;

        // If user wants to change password
        if (req.body.password) {
            user.password = await bcrypt.hash(req.body.password, 10);
        }

        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            avatar: user.avatar,
            roles: user.roles,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @route  PUT /api/users/add-role
// @access Private
// Allows a buyer to also become a seller (add role without losing existing role)
const addRole = async (req, res) => {
    const { role } = req.body; // role to add: "seller" or "buyer"

    if (!["buyer", "seller"].includes(role)) {
        return res.status(400).json({ message: "Invalid role. Choose buyer or seller." });
    }

    try {
        const user = await User.findById(req.user._id);

        // Only add role if user doesn't already have it
        if (user.roles.includes(role)) {
            return res.status(400).json({ message: `You already have the ${role} role` });
        }

        // $addToSet prevents duplicates automatically
        user.roles = [...user.roles, role];
        await user.save();

        res.json({ message: `${role} role added successfully`, roles: user.roles });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @route  GET /api/users  (Admin only)
// @access Private/Admin
const getAllUsers = async (req, res) => {
    try {
        // Exclude passwords from the response
        const users = await User.find().select("-password -invalidatedTokens").sort("-createdAt");
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @route  DELETE /api/users/:id  (Admin only)
// @access Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Prevent admin from deleting themselves
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: "Cannot delete your own account" });
        }

        await user.deleteOne();
        res.json({ message: "User deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getProfile, updateProfile, addRole, getAllUsers, deleteUser };