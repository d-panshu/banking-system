// src/controllers/authController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

async function login(req, res, next) {
  try {
    const { email, pin } = req.body;

    const user = await userModel.findByEmail(email);

    // Use a constant-time comparison regardless of whether user exists
    // to prevent user enumeration via timing attacks
    const pinToCheck = user ? user.pin_hash : "$2b$10$invalidhashforconstanttime00000000";
    const isValid = await bcrypt.compare(pin, pinToCheck);

    if (!user || !isValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or PIN",
      });
    }

    const token = jwt.sign(
      {
        userId:    user.user_id,
        email:     user.email,
        accountId: user.account_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    return res.status(200).json({
      success: true,
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { login };
