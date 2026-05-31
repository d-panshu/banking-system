const pool = require("../config/db");

/**
 * Get balance for an account by accountId.
 */
async function getBalance(accountId) {
  const result = await pool.query(
    "SELECT balance FROM accounts WHERE id = $1",
    [accountId]
  );
  return result.rows[0] || null;
}

/**
 * Deposit amount into an account using a transaction with a row-level lock
 * (SELECT ... FOR UPDATE) to prevent race conditions on concurrent deposits.
 *
 * Returns the updated balance.
 */
async function deposit(accountId, amount) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Lock the row so concurrent requests queue up instead of racing
    const lockResult = await client.query(
      "SELECT balance FROM accounts WHERE id = $1 FOR UPDATE",
      [accountId]
    );

    if (!lockResult.rows[0]) {
      throw new Error("Account not found");
    }

    const updateResult = await client.query(
      `UPDATE accounts
       SET balance = balance + $1, updated_at = NOW()
       WHERE id = $2
       RETURNING balance`,
      [amount, accountId]
    );

    const newBalance = updateResult.rows[0].balance;

    // Record the transaction in the audit trail
    await client.query(
      `INSERT INTO transactions (account_id, type, amount, balance_after)
       VALUES ($1, 'deposit', $2, $3)`,
      [accountId, amount, newBalance]
    );

    await client.query("COMMIT");
    return parseFloat(newBalance);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { getBalance, deposit };
