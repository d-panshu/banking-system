const express = require("express");
const rateLimit = require("express-rate-limit");
const authController = require("../controllers/authController");
const validate = require("../middlewares/validate");
const { loginSchema } = require("../validations/schemas");

const router = express.Router();

// Max 5 login attempts per IP per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many login attempts. Please try again after 15 minutes.",
  },
});

router.post("/login", loginLimiter, validate(loginSchema), authController.login);

module.exports = router;
