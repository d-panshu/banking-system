// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] Unhandled error:`, err);

  // Postgres-specific errors
  if (err.code) {
    switch (err.code) {
      case "23505": // unique_violation
        return res.status(409).json({ success: false, error: "Resource already exists" });
      case "23503": // foreign_key_violation
        return res.status(400).json({ success: false, error: "Referenced resource not found" });
      default:
        return res.status(500).json({ success: false, error: "Database error" });
    }
  }

  res.status(500).json({ success: false, error: "Internal server error" });
}

module.exports = errorHandler;
