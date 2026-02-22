const express = require("express");
const router = express.Router();
const {
  getProfile, updateProfile, addRole, getAllUsers, deleteUser,
} = require("../controllers/userController");
const { protect, roleOnly } = require("../middleware/authMiddleware");

// All user routes require login
router.get("/profile",    protect, getProfile);
router.put("/profile",    protect, updateProfile);

// Let a user add a new role to themselves (e.g. buyer becomes buyer+seller)
router.put("/add-role",   protect, addRole);

// Admin-only routes
router.get("/",           protect, roleOnly("admin"), getAllUsers);
router.delete("/:id",     protect, roleOnly("admin"), deleteUser);

module.exports = router;