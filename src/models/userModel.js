// src/models/userModel.js
const pool = require("../config/db");

/**
 * Find a user (with their account) by email.
 * Returns null if not found.
 */
async function findByEmail(email) {
  const result = await pool.query(
    `SELECT u.id AS user_id, u.email, u.pin_hash,
            a.id AS account_id, a.balance
     FROM users u
     JOIN accounts a ON a.user_id = u.id
     WHERE u.email = $1`,
    [email]
  );
  return result.rows[0] || null;
}

module.exports = { findByEmail };
