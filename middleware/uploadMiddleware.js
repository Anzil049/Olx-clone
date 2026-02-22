const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary with env credentials
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

// Store uploaded images directly to Cloudinary
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "olx-clone", // Cloudinary folder name
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [{ width: 800, height: 600, crop: "limit" }], // resize on upload
    },
});

// Allow up to 5 images per product
const upload = multer({ storage, limits: { files: 5 } });

module.exports = upload;