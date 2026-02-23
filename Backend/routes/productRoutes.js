const express = require("express");
const router  = express.Router();
const {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct, getMyProducts,
  adminGetAllProducts, adminToggleProduct, adminDeleteProduct,
} = require("../controllers/productController");
const { protect, roleOnly } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// ── Public ────────────────────────────────────────────────────────────────────
router.get("/",    getProducts);

// ── Admin only — must come BEFORE "/:id" so "/admin/all" isn't treated as an ID
router.get   ("/admin/all",        protect, roleOnly("admin"), adminGetAllProducts);
router.put   ("/admin/:id/toggle", protect, roleOnly("admin"), adminToggleProduct);
router.delete("/admin/:id",        protect, roleOnly("admin"), adminDeleteProduct);

// ── Authenticated ─────────────────────────────────────────────────────────────
router.get("/my",  protect, getMyProducts);
router.get("/:id", getProduct);

// ── Seller / Admin ────────────────────────────────────────────────────────────
router.post    ("/",    protect, roleOnly("seller", "admin"), upload.array("images", 5), createProduct);
router.put     ("/:id", protect, updateProduct);
router.delete  ("/:id", protect, deleteProduct);

module.exports = router;