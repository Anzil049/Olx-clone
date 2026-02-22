const Product = require("../models/Product");

// @route  GET /api/products
// @desc   Get all products with search, filter, sort, pagination
// @access Public
const getProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort = "-createdAt", page = 1, limit = 12 } = req.query;

    const query = { isActive: true };

    // Full-text search on title + description (requires text index)
    if (search) query.$text = { $search: search };
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate("seller", "name phone avatar") // join seller info
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  GET /api/products/:id
// @access Public
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("seller", "name phone email avatar");
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Increment view count each time product is fetched
    product.views += 1;
    await product.save();

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  POST /api/products
// @access Private (sellers only)
const createProduct = async (req, res) => {
  try {
    const { title, description, price, category, location, condition } = req.body;
    // req.files comes from multer upload middleware
    const images = req.files?.map((f) => f.path) || [];

    const product = await Product.create({
      title, description, price, category, location, condition, images,
      seller: req.user._id, // set seller from authenticated user
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  PUT /api/products/:id
// @access Private (owner or admin)
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Only seller who posted or admin can update
    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  DELETE /api/products/:id
// @access Private (owner or admin)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    await product.deleteOne();
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  GET /api/products/my
// @access Private — get current user's own listings
const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id }).sort("-createdAt");
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getMyProducts };