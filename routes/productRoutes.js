const express = require("express");
const router = express.Router();

const {
    getProducts, getProduct, createProduct, updateProduct, deleteProduct, getMyProducts,
} = require("../controllers/productController");
const { protect, roleOnly } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Public routes
router.get("/", getProducts);
router.get("/my", protect, getMyProducts);      // must be before /:id
router.get("/:id", getProduct);

// Protected routes — sellers/admins only
router.post("/", protect, roleOnly("seller", "admin"), upload.array("images", 5), createProduct);
router.put("/:id", protect, updateProduct);
router.delete("/:id", protect, deleteProduct);

module.exports = router;