const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    phone:    { type: String, default: "" },
    avatar:   { type: String, default: "" },

    // Array of roles — one user can be BOTH buyer AND seller
    // e.g. roles: ["buyer", "seller"]
    roles: {
      type: [String],
      enum: ["buyer", "seller", "admin"],
      default: ["buyer"], // everyone starts as a buyer
    },

    // Store invalidated tokens for logout (simple blacklist)
    invalidatedTokens: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);