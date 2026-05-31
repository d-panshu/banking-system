const { Pool } = require("pg");

const pool = new Pool({
  host:     process.env.DB_HOST     || "localhost",
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || "banking_db",
  user:     process.env.DB_USER     || "banking_user",
  password: process.env.DB_PASSWORD || "banking_pass",
});

pool.on("error", (err) => {
  console.error("Unexpected database error:", err.message);
});

module.exports = pool;
