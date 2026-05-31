require("dotenv").config();
const pool = require("../src/config/db");

async function migrate() {
  const client = await pool.connect();
  try {
    console.log("Running migrations...");

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id          SERIAL PRIMARY KEY,
        email       VARCHAR(255) UNIQUE NOT NULL,
        pin_hash    VARCHAR(255) NOT NULL,
        created_at  TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id          SERIAL PRIMARY KEY,
        user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        balance     NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
        created_at  TIMESTAMPTZ DEFAULT NOW(),
        updated_at  TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id              SERIAL PRIMARY KEY,
        account_id      INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
        type            VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
        amount          NUMERIC(15, 2) NOT NULL,
        balance_after   NUMERIC(15, 2) NOT NULL,
        created_at      TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    console.log("Migrations complete.");
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  } finally {
    client.release();
  }
}

migrate();
