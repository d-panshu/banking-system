require("dotenv").config();
const express = require("express");

const authRoutes    = require("./routes/authRoutes");
const accountRoutes = require("./routes/accountRoutes");
const errorHandler  = require("./middlewares/errorHandler");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ success: true, status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth",    authRoutes);
app.use("/api/account", accountRoutes);

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` });
});

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Banking API running on port ${PORT}`);
});

module.exports = app;
