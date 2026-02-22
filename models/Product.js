const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        category: {
            type: String,
            required: true,
            enum: ["Electronics", "Cars", "Mobiles", "Furniture", "Fashion", "Books", "Sports", "Other"],
        },
        images: [{ type: String }], // array of image URLs
        location: { type: String, required: true },
        condition: { type: String, enum: ["New", "Like New", "Good", "Fair"], default: "Good" },
        // Reference to the seller (User model)
        seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        isActive: { type: Boolean, default: true }, // admin can deactivate listings
        views: { type: Number, default: 0 }, // track how many times ad was viewed
    },
    { timestamps: true }
);

// Index for faster search queries on title and description
productSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Product", productSchema);